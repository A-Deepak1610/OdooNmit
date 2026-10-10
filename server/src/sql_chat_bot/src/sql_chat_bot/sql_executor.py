"""Safe SQL parsing, validation, and execution against TiDB Cloud MySQL using sqlglot and SQLAlchemy."""

import datetime
import decimal
import re
import uuid
from typing import Any, Dict, List, Set, Tuple

import sqlglot
from sqlglot import exp
from sqlalchemy import Engine, text

import os
from urllib.parse import quote_plus
from dotenv import load_dotenv
from sqlalchemy import Engine, create_engine, text
from pathlib import Path

# Explicit allowlist of approved CampusMitra platform tables
APPROVED_TABLES: Set[str] = {
    "users",
    "organizations",
    "user_roles",
    "support_tickets",
    "support_messages",
    "elections",
    "election_candidates",
    "election_votes",
    "notifications",
    "events",
    "bookings",
    "payments",
    "announcements",
    "membership_applications",
}

# Block access to any sensitive authentication or secret columns
SENSITIVE_COLUMNS: Set[str] = {
    "passwordhash",
    "password",
    "token",
    "secret",
    "apikey",
    "api_key",
    "razorpaysignature",
    "googleid",
}

# Unsafe SQL functions or commands
UNSAFE_FUNCTIONS: Set[str] = {
    "sleep",
    "benchmark",
    "load_file",
    "sys_eval",
    "sys_exec",
    "get_lock",
    "release_lock",
}

MAX_ROW_LIMIT = 100
STATEMENT_TIMEOUT_MS = 5000

_engine: Engine | None = None


def get_engine() -> Engine:
    """Create and reuse the TiDB SQLAlchemy engine."""
    global _engine

    if _engine is None:
        server_root = Path(__file__).resolve().parents[4]
        load_dotenv(server_root / ".env")

        host = os.environ["TIDB_HOST"]
        port = os.getenv("TIDB_PORT", "4000")
        user = os.environ["TIDB_USER"]
        password = os.environ["TIDB_PASSWORD"]
        database = os.environ["TIDB_DATABASE"]

        url = (
            f"mysql+pymysql://{quote_plus(user)}:"
            f"{quote_plus(password)}@{host}:{port}/{database}"
        )

        _engine = create_engine(
            url,
            pool_pre_ping=True,
            pool_recycle=300,
            connect_args={"ssl": {}},
        )

    return _engine


def sanitize_error_message(error_str: str) -> str:
    """Strip database hostnames, credentials, and internal paths from error messages."""
    cleaned = re.sub(r"://[^@]+@", "://***:***@", error_str)
    cleaned = re.sub(r"gateway\d+\.[^:\s/]+", "[tidb-host]", cleaned)
    cleaned = re.sub(r"File \".*?\", line \d+", "", cleaned)
    return cleaned.strip()


def serialize_value(val: Any) -> Any:
    """Convert database values into JSON-serializable types."""
    if isinstance(val, (datetime.datetime, datetime.date)):
        return val.isoformat()
    if isinstance(val, datetime.time):
        return val.strftime("%H:%M:%S")
    if isinstance(val, decimal.Decimal):
        return float(val) if val % 1 else int(val)
    if isinstance(val, uuid.UUID):
        return str(val)
    if isinstance(val, bytes):
        return val.decode("utf-8", errors="replace")
    return val


def validate_and_prepare_sql(raw_sql: str) -> str:
    """
    Parse and strictly validate a SQL statement using sqlglot with MySQL dialect.
    Ensures:
      1. Exactly one statement.
      2. Must be a SELECT statement.
      3. No writes, DDL, transactions, or unsafe functions.
      4. All referenced tables are in APPROVED_TABLES allowlist.
      5. No sensitive columns are accessed.
      6. No wildcard * on tables with sensitive columns.
      7. Enforces a maximum limit of 100 rows.
    """
    cleaned_sql = raw_sql.strip().rstrip(";")
    if not cleaned_sql:
        raise ValueError("Empty SQL statement provided.")

    try:
        parsed_statements = sqlglot.parse(cleaned_sql, read="mysql")
    except Exception as e:
        raise ValueError(f"SQL parsing failed: {sanitize_error_message(str(e))}")

    if len(parsed_statements) != 1:
        raise ValueError("Multiple SQL statements are strictly rejected. Only a single statement is permitted.")

    statement = parsed_statements[0]
    if statement is None:
        raise ValueError("Could not parse a valid SQL expression.")

    # 1. Statement must be a SELECT expression
    if not isinstance(statement, exp.Select):
        raise ValueError("Only read-only SELECT queries are allowed.")

    # 2. Reject modifying statements or DDL anywhere in the AST
    forbidden_types = (
        exp.Insert,
        exp.Update,
        exp.Delete,
        exp.Drop,
        exp.Alter,
        exp.Create,
        exp.Command,
        exp.TruncateTable,
        exp.Merge,
        exp.Into,
        exp.Set,
        exp.Show,
        exp.Kill,
        exp.Transaction,
        exp.Commit,
        exp.Rollback,
    )
    for node in statement.walk():
        if isinstance(node, forbidden_types):
            raise ValueError(f"Operation '{type(node).__name__}' is strictly forbidden.")

    # 3. Reject unsafe function calls
    for func in statement.find_all(exp.Anonymous, exp.Func):
        if func.name.lower() in UNSAFE_FUNCTIONS:
            raise ValueError(f"Function '{func.name}' is prohibited for safety.")

    # 4. Check tables against explicit allowlist
    referenced_tables: Set[str] = set()
    for tbl in statement.find_all(exp.Table):
        tbl_name = tbl.name.lower()
        referenced_tables.add(tbl_name)
        if tbl_name not in APPROVED_TABLES:
            raise ValueError(f"Access to table '{tbl.name}' is not allowed.")

    if not referenced_tables:
        raise ValueError("Query must reference an approved database table.")

    # 5. Check columns for sensitive fields
    for col in statement.find_all(exp.Column):
        col_name = col.name.lower()
        if col_name in SENSITIVE_COLUMNS:
            raise ValueError(f"Access to sensitive column '{col.name}' is prohibited.")

    # 6. Reject wildcard (*) projections on tables containing sensitive fields (e.g. users)
    # Note: COUNT(*) is an aggregate count and is permitted.
    has_projected_star = any(
        isinstance(node, exp.Star) and not isinstance(node.parent, exp.Count)
        for node in statement.find_all(exp.Star)
    )
    if has_projected_star and "users" in referenced_tables:
        raise ValueError("Wildcard SELECT (*) projection is not permitted on the 'users' table. Please specify columns explicitly.")

    # 7. Enforce row limit (max 100 rows)
    limit_clause = statement.args.get("limit")
    if limit_clause is None:
        statement = statement.limit(MAX_ROW_LIMIT)
    else:
        try:
            curr_limit = int(limit_clause.expression.this)
            if curr_limit > MAX_ROW_LIMIT or curr_limit < 1:
                statement.set("limit", exp.Limit(expression=exp.Literal.number(MAX_ROW_LIMIT)))
        except Exception:
            statement.set("limit", exp.Limit(expression=exp.Literal.number(MAX_ROW_LIMIT)))

    return statement.sql(dialect="mysql")


def execute_sql(sql_query: str, engine: Engine) -> Tuple[List[Dict[str, Any]], str]:
    """
    Validate, sanitize, and execute SQL query using SQLAlchemy with statement timeout.
    Returns (results, validated_sql).
    """
    validated_sql = validate_and_prepare_sql(sql_query)

    try:
        with engine.connect() as conn:
            # Set statement execution timeout
            try:
                conn.execute(text(f"SET SESSION max_execution_time = {STATEMENT_TIMEOUT_MS}"))
            except Exception:
                pass

            result_proxy = conn.execute(text(validated_sql))
            keys = list(result_proxy.keys())
            rows = result_proxy.fetchall()

            results: List[Dict[str, Any]] = []
            for row in rows:
                row_dict: Dict[str, Any] = {}
                for k, v in zip(keys, row):
                    # Redundant safety guard: strip sensitive keys
                    if k.lower() in SENSITIVE_COLUMNS:
                        continue
                    row_dict[k] = serialize_value(v)
                results.append(row_dict)

            return results, validated_sql

    except ValueError:
        raise
    except Exception as e:
        safe_msg = sanitize_error_message(str(e))
        raise RuntimeError(f"Database query execution error: {safe_msg}")

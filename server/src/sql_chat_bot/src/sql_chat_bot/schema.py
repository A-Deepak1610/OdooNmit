
"""Read schema.prisma and index database schema in ChromaDB."""

import os
import re
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings

# Resolve server root:
# schema.py -> sql_chat_bot -> src/sql_chat_bot -> src -> server
SERVER_ROOT = Path(__file__).resolve().parents[4]
PRISMA_SCHEMA_PATH = SERVER_ROOT / "prisma" / "schema.prisma"

# Load the shared server/.env file
load_dotenv(SERVER_ROOT / ".env")

DEFAULT_CHROMA_DIR = (
    Path(__file__).resolve().parents[2] / "data" / "chroma"
)
CHROMA_PERSIST_DIR = os.getenv(
    "CHROMA_PERSIST_DIR", str(DEFAULT_CHROMA_DIR)
)

COLLECTION_NAME = "campusmitra_schema"
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

EXCLUDED_TABLES = {
    "_prisma_migrations",
    "refresh_tokens",
}

EXCLUDED_COLUMNS = {
    "passwordhash",
    "password",
    "token",
    "secret",
    "apikey",
    "api_key",
    "razorpaysignature",
    "googleid",
    "refreshtoken",
}

_embeddings: Optional[HuggingFaceEmbeddings] = None
_vector_store: Optional[Chroma] = None


def remove_comments(schema: str) -> str:
    """Remove Prisma line comments while preserving quoted strings."""
    lines = []

    for line in schema.splitlines():
        # Prisma schema comments begin with //.
        # Avoid stripping // inside quoted strings.
        in_string = False
        escaped = False
        result = []
        i = 0

        while i < len(line):
            char = line[i]

            if char == '"' and not escaped:
                in_string = not in_string

            if (
                not in_string
                and char == "/"
                and i + 1 < len(line)
                and line[i + 1] == "/"
            ):
                break

            result.append(char)

            if char == "\\" and not escaped:
                escaped = True
            else:
                escaped = False

            i += 1

        lines.append("".join(result))

    return "\n".join(lines)


def parse_attributes(value: str, attribute: str) -> Optional[str]:
    """Extract a quoted argument from @map or @@map."""
    match = re.search(
        rf'{re.escape(attribute)}\s*\(\s*"([^"]+)"\s*\)',
        value,
    )
    return match.group(1) if match else None


def parse_schema_file() -> List[Document]:
    """Parse Prisma models into documents describing actual SQL names."""
    if not PRISMA_SCHEMA_PATH.exists():
        raise FileNotFoundError(
            f"Prisma schema not found: {PRISMA_SCHEMA_PATH}"
        )

    schema = remove_comments(
        PRISMA_SCHEMA_PATH.read_text(encoding="utf-8")
    )

    # Match model blocks. This is intentionally a small parser for
    # ordinary Prisma model declarations, not a full Prisma grammar.
    model_pattern = re.compile(
        r"(?m)^\s*model\s+(\w+)\s*\{(.*?)^\s*\}",
        re.DOTALL,
    )

    documents: List[Document] = []
    model_names = set()

    for match in model_pattern.finditer(schema):
        model_name = match.group(1)
        body = match.group(2)
        model_names.add(model_name)

        table_name = parse_attributes(body, "@@map") or model_name

        if table_name.lower() in EXCLUDED_TABLES:
            continue

        columns = []
        relations = []

        for raw_line in body.splitlines():
            line = raw_line.strip()

            if not line or line.startswith("@@"):
                continue

            # Ignore block attributes and non-field declarations.
            parts = line.split()
            if len(parts) < 2:
                continue

            field_name = parts[0]
            field_type = parts[1]

            # Skip malformed declarations and unsupported field names.
            if not re.fullmatch(r"\w+", field_name):
                continue

            # Skip relation fields temporarily; resolve them below.
            base_type = field_type.rstrip("?[]")

            if base_type in model_names or field_type.endswith("[]"):
                relations.append(line)
                continue

            # Skip fields that contain sensitive information.
            if field_name.lower() in EXCLUDED_COLUMNS:
                continue

            if any(
                sensitive in field_name.lower()
                for sensitive in (
                    "password",
                    "secret",
                    "token",
                    "apikey",
                    "credential",
                )
            ):
                continue

            sql_column = parse_attributes(line, "@map") or field_name

            description = f"{sql_column} ({field_type})"

            if re.search(r"@id\b", line):
                description += " [PRIMARY KEY]"

            if re.search(r"@unique\b", line):
                description += " [UNIQUE]"

            if re.search(r"@default\s*\(", line):
                description += " [HAS DEFAULT]"

            columns.append(description)

        # A second pass resolves relation fields, including models
        # declared later in the file.
        for raw_line in body.splitlines():
            line = raw_line.strip()
            parts = line.split()

            if len(parts) < 2 or line.startswith("@@"):
                continue

            field_name, field_type = parts[0], parts[1]
            related_model = field_type.rstrip("?[]")

            if related_model not in model_names:
                continue

            if related_model.lower() in EXCLUDED_TABLES:
                continue

            relation_match = re.search(
                r"@relation\s*\((.*?)\)",
                line,
            )

            relation_details = ""
            if relation_match:
                relation_args = relation_match.group(1)

                fields_match = re.search(
                    r"fields\s*:\s*\[([^\]]+)\]",
                    relation_args,
                )
                references_match = re.search(
                    r"references\s*:\s*\[([^\]]+)\]",
                    relation_args,
                )

                if fields_match and references_match:
                    local_fields = fields_match.group(1).strip()
                    referenced_fields = (
                        references_match.group(1).strip()
                    )
                    relation_details = (
                        f"; local fields [{local_fields}] reference "
                        f"[{referenced_fields}]"
                    )

            relations.append(
                f"{field_name} -> model {related_model}"
                f"{relation_details}"
            )

        content = (
            f"Prisma model: {model_name}\n"
            f"Database table: {table_name}\n"
            f"Columns:\n"
            + (
                "\n".join(f"- {column}" for column in columns)
                if columns
                else "- No non-sensitive scalar columns found"
            )
            + "\nRelationships:\n"
            + (
                "\n".join(f"- {relation}" for relation in relations)
                if relations
                else "- No model relationships declared"
            )
        )

        documents.append(
            Document(
                page_content=content,
                metadata={
                    "model_name": model_name,
                    "table_name": table_name,
                },
            )
        )

    if not documents:
        raise ValueError(
            "No Prisma models were parsed. Check schema.prisma."
        )

    return documents


def get_embeddings() -> HuggingFaceEmbeddings:
    """Initialize and cache the embedding model."""
    global _embeddings

    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL_NAME
        )

    return _embeddings


def get_vector_store(force_refresh: bool = False) -> Chroma:
    """Load ChromaDB and index Prisma models if needed."""
    global _vector_store

    if _vector_store is not None and not force_refresh:
        return _vector_store

    persist_path = Path(CHROMA_PERSIST_DIR).resolve()
    persist_path.mkdir(parents=True, exist_ok=True)

    vector_store = Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=get_embeddings(),
        persist_directory=str(persist_path),
    )

    if force_refresh:
        existing = vector_store.get()
        ids = existing.get("ids", [])

        if ids:
            vector_store.delete(ids=ids)

    if force_refresh or vector_store._collection.count() == 0:
        documents = parse_schema_file()

        # Deterministic IDs make refreshes and updates easier to manage.
        ids = [
            f"table:{doc.metadata['table_name']}"
            for doc in documents
        ]

        vector_store.add_documents(
            documents=documents,
            ids=ids,
        )

    _vector_store = vector_store
    return _vector_store


def retrieve_relevant_schema(
    query: str,
    k: int = 5,
) -> List[Document]:
    """Retrieve schema documents relevant to a question."""
    if not query.strip():
        return []

    vector_store = get_vector_store()
    return vector_store.similarity_search(query, k=k)


def refresh_schema_index() -> Chroma:
    """Rebuild the schema index after schema.prisma changes."""
    return get_vector_store(force_refresh=True)

from .schema import refresh_schema_index

if __name__ == "__main__":
    refresh_schema_index()
    print("Schema index rebuilt successfully")
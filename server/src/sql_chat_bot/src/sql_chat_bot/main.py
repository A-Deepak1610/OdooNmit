"""FastAPI application for RAG-based SQL Chatbot on TiDB Cloud MySQL."""

import os
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

import jwt
from dotenv import find_dotenv, load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from sql_chat_bot.chain import run_sql_chat_pipeline
    from sql_chat_bot.schema import get_vector_store
    from sql_chat_bot.sql_executor import sanitize_error_message
except ImportError:
    from .chain import run_sql_chat_pipeline
    from .schema import get_vector_store
    from .sql_executor import sanitize_error_message

load_dotenv(find_dotenv())

JWT_ACCESS_SECRET = os.getenv("JWT_ACCESS_SECRET", "")
REQUIRE_AUTH = os.getenv("SQL_CHATBOT_REQUIRE_AUTH", "false").lower() in ("true", "1", "yes")


# Lifespan event to warm up vector store on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize ChromaDB schema index on startup
    try:
        get_vector_store()
    except Exception as e:
        print(f"[SQL Chatbot] Warning: Initial schema warmup encountered: {e}")
    yield


app = FastAPI(
    title="CampusMitra SQL Chatbot API",
    description="RAG-based natural language SQL query engine for platform super admins",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request & Response Models
class ChatRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        example="How many users are registered?",
        description="The administrator's natural-language question",
    )


class ChatResponse(BaseModel):
    question: str
    original_question: Optional[str] = None
    corrected_question: Optional[str] = None
    sql: str
    answer: str
    results: List[Dict[str, Any]]


# --- Authentication Integration Point ---
async def verify_admin_user(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """
    Super Admin Authentication Integration Point:
    Validates JWT access tokens signed with JWT_ACCESS_SECRET from the Node.js backend.
    Ensures the user holds the 'ADMIN' role.

    Set SQL_CHATBOT_REQUIRE_AUTH=true in .env to strictly enforce token verification in production.
    """
    if not authorization:
        if REQUIRE_AUTH:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required. Authorization header missing.",
            )
        return None

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format. Must be 'Bearer <token>'.",
        )

    token = authorization.split(" ")[1]
    if not JWT_ACCESS_SECRET:
        if REQUIRE_AUTH:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="JWT_ACCESS_SECRET is not configured on the server.",
            )
        return None

    try:
        payload = jwt.decode(token, JWT_ACCESS_SECRET, algorithms=["HS256"])
        roles = payload.get("roles", [])
        active_role = payload.get("activeRole", "")
        if "ADMIN" not in roles and active_role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Only users with the ADMIN role can use the SQL chatbot.",
            )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token has expired. Please refresh your session.",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )


@app.get("/health", tags=["System"])
def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "sql-chat-bot",
        "model": "openai/gpt-oss-20b",
        "database": "TiDB Cloud MySQL",
    }


@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
def chat_endpoint(
    req: ChatRequest,
    current_admin: Optional[Dict[str, Any]] = Depends(verify_admin_user),
):
    """
    Process a natural language question, retrieve schema via ChromaDB,
    generate and validate read-only SQL, execute against TiDB, and return explanation.
    """
    try:
        result = run_sql_chat_pipeline(req.question)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except RuntimeError as e:
        safe_msg = sanitize_error_message(str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=safe_msg,
        )
    except Exception as e:
        safe_msg = sanitize_error_message(str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {safe_msg}",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("sql_chat_bot.main:app", host="0.0.0.0", port=8001, reload=True)

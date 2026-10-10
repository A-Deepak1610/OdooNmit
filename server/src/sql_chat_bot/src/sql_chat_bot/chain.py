
"""LangChain workflow for RAG SQL chatbot using Groq, ChromaDB, and TiDB."""

import os
import re
from typing import Any, Dict, Optional
from pathlib import Path

from dotenv import load_dotenv
from langchain_groq import ChatGroq

from .prompts import (
    ANSWER_EXPLANATION_PROMPT,
    SQL_GENERATION_PROMPT,
)
from .schema import retrieve_relevant_schema
from .sql_executor import execute_sql, get_engine


# Load the shared server/.env file
SERVER_ROOT = Path(__file__).resolve().parents[4]
load_dotenv(SERVER_ROOT / ".env")

GROQ_MODEL_ID = "openai/gpt-oss-20b"

_llm: Optional[ChatGroq] = None


def get_llm() -> ChatGroq:
    """Initialize and cache the Groq chat model."""
    global _llm

    if _llm is None:
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise ValueError("Missing GROQ_API_KEY environment variable.")

        _llm = ChatGroq(
            model=GROQ_MODEL_ID,
            api_key=api_key,
            temperature=0,
        )

    return _llm


def extract_sql_from_response(model_output: str) -> str:
    """Extract a SQL statement from the LLM response."""
    text_content = model_output.strip()

    if text_content.upper() == "NO_SQL":
        raise ValueError(
            "The question cannot be answered using the available schema."
        )

    # Extract SQL from a Markdown code block, if present.
    match = re.search(
        r"```(?:sql)?\s*([\s\S]*?)```",
        text_content,
        re.IGNORECASE,
    )

    if match:
        extracted = match.group(1).strip()
    else:
        extracted = text_content

    # Remove a trailing semicolon.
    cleaned_sql = extracted.rstrip(";").strip()

    if not cleaned_sql:
        raise ValueError("The model did not generate a SQL query.")

    return cleaned_sql


def run_sql_chat_pipeline(question: str) -> Dict[str, Any]:
    """
    Run the complete SQL chatbot pipeline:
    1. Retrieve relevant schema from ChromaDB.
    2. Generate SQL using Groq.
    3. Validate and execute SQL against TiDB.
    4. Explain the results in plain English.
    """
    cleaned_question = question.strip()

    if not cleaned_question:
        raise ValueError("Question cannot be empty.")

    # 1. Retrieve relevant schema documents.
    schema_docs = retrieve_relevant_schema(cleaned_question, k=6)

    if not schema_docs:
        raise ValueError(
            "Could not retrieve relevant schema metadata for this query."
        )

    schema_context = "\n\n".join(
        document.page_content for document in schema_docs
    )

    # 2. Generate SQL using Groq.
    llm = get_llm()

    sql_prompt_messages = SQL_GENERATION_PROMPT.format_messages(
        schema_context=schema_context,
        question=cleaned_question,
    )

    sql_generation_result = llm.invoke(sql_prompt_messages)

    content = sql_generation_result.content
    generated_sql_text = (
        content if isinstance(content, str) else str(content)
    )

    # 3. Extract the SQL statement.
    extracted_sql = extract_sql_from_response(generated_sql_text)

    # 4. Validate and execute SQL against TiDB.
    engine = get_engine()
    results, validated_sql = execute_sql(extracted_sql, engine)

    # 5. Generate a plain-English explanation.
    explanation_messages = ANSWER_EXPLANATION_PROMPT.format_messages(
        question=cleaned_question,
        sql=validated_sql,
        results=results,
    )

    explanation_result = llm.invoke(explanation_messages)
    explanation_content = explanation_result.content

    plain_english_answer = (
        explanation_content.strip()
        if isinstance(explanation_content, str)
        else str(explanation_content).strip()
    )

    # 6. Return a structured response.
    return {
        "question": cleaned_question,
        "sql": validated_sql,
        "answer": plain_english_answer,
        "results": results,
    }


"""LangChain workflow for RAG SQL chatbot using Groq, ChromaDB, and TiDB."""

import os
import re
from typing import Any, Dict, Optional
from pathlib import Path

from dotenv import load_dotenv
from langchain_groq import ChatGroq

from .prompts import (
    ANSWER_EXPLANATION_PROMPT,
    SPELL_CORRECTION_PROMPT,
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


def correct_query_spelling(question: str) -> str:
    """
    Send the user's input query to Groq to fix misspellings, typos,
    and grammatical errors before resuming the RAG pipeline.
    """
    raw_query = question.strip()
    if not raw_query:
        return raw_query

    try:
        llm = get_llm()
        messages = SPELL_CORRECTION_PROMPT.format_messages(query=raw_query)
        result = llm.invoke(messages)
        content = (
            result.content if isinstance(result.content, str) else str(result.content)
        )
        corrected = content.strip()

        # Remove markdown code formatting if accidentally returned
        match = re.search(r"```(?:\w+)?\s*([\s\S]*?)```", corrected)
        if match:
            corrected = match.group(1).strip()

        # Remove common introductory prefixes if returned
        for prefix in (
            "corrected query:",
            "corrected question:",
            "corrected:",
            "query:",
        ):
            if corrected.lower().startswith(prefix):
                corrected = corrected[len(prefix) :].strip()

        # Remove surrounding quotes if present
        if (corrected.startswith('"') and corrected.endswith('"')) or (
            corrected.startswith("'") and corrected.endswith("'")
        ):
            corrected = corrected[1:-1].strip()

        return corrected if corrected else raw_query
    except Exception as e:
        print(
            f"[SQL Chatbot] Spelling correction error, proceeding with original query: {e}"
        )
        return raw_query


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
    1. Send the query to Groq to correct spelling and typos (e.g. 'queuries' -> 'queries').
    2. RESUME RAG: Retrieve relevant schema from ChromaDB using the corrected query.
    3. Generate SQL using Groq.
    4. Validate and execute SQL against TiDB.
    5. Explain the results in plain English using Groq.
    """
    cleaned_question = question.strip()

    if not cleaned_question:
        raise ValueError("Question cannot be empty.")

    # 1. Correct spelling of the user's query via Groq
    corrected_question = correct_query_spelling(cleaned_question)

    # 2. RESUME RAG: Retrieve relevant schema documents using the corrected query
    schema_docs = retrieve_relevant_schema(corrected_question, k=6)

    if not schema_docs:
        raise ValueError(
            "Could not retrieve relevant schema metadata for this query."
        )

    schema_context = "\n\n".join(
        document.page_content for document in schema_docs
    )

    # 3. Generate SQL using Groq with schema context and corrected query
    llm = get_llm()

    sql_prompt_messages = SQL_GENERATION_PROMPT.format_messages(
        schema_context=schema_context,
        question=corrected_question,
    )

    sql_generation_result = llm.invoke(sql_prompt_messages)

    content = sql_generation_result.content
    generated_sql_text = (
        content if isinstance(content, str) else str(content)
    )

    # 4. Extract the SQL statement.
    extracted_sql = extract_sql_from_response(generated_sql_text)

    # 5. Validate and execute SQL against TiDB.
    engine = get_engine()
    results, validated_sql = execute_sql(extracted_sql, engine)

    # 6. Generate a plain-English explanation.
    explanation_messages = ANSWER_EXPLANATION_PROMPT.format_messages(
        question=corrected_question,
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

    # 7. Return a structured response with corrected and original queries.
    return {
        "question": corrected_question,
        "original_question": cleaned_question,
        "corrected_question": corrected_question,
        "sql": validated_sql,
        "answer": plain_english_answer,
        "results": results,
    }

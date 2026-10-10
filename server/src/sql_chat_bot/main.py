"""Convenience entrypoint allowing `uvicorn main:app` directly from sql_chat_bot directory."""

from sql_chat_bot.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

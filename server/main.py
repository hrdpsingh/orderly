from fastapi import FastAPI
from router import router as issue_router

app = FastAPI(title="Orderly")

app.include_router(issue_router)

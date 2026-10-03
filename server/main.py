from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router import router as issue_router

app = FastAPI(title="Orderly")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(issue_router)

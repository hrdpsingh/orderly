import asyncio
import os

import httpx
import numpy as np
from dotenv import load_dotenv
from fastapi import HTTPException
from huggingface_hub import AsyncInferenceClient
from huggingface_hub.errors import HfHubHTTPError
from models import CategorizeResponse, IssueResponse

load_dotenv()

MODEL_ID = "sentence-transformers/all-mpnet-base-v2"
MAX_RETRIES = 4

_client: AsyncInferenceClient | None = None

priority_categories = {
    "high": "critical bug, system crash, security vulnerability, urgent fix needed, data loss, high priority outage",
    "medium": "enhancement, new feature request, optimization, refactoring, medium priority code improvement",
    "low": "documentation update, minor typo, low priority, small UI tweak, formatting, text cleanup",
}

priority_labels = list(priority_categories.keys())
priority_texts = list(priority_categories.values())

# Lazily computed on first request, then cached
_priority_embeddings: np.ndarray | None = None
_priority_lock = asyncio.Lock()


def _get_client() -> AsyncInferenceClient:
    global _client
    if _client is None:
        token = os.getenv("HF_TOKEN")
        if not token:
            raise HTTPException(status_code=500, detail="HF_TOKEN is not configured")
        _client = AsyncInferenceClient(provider="hf-inference", api_key=token)
    return _client


async def embed(texts: list[str]) -> np.ndarray:
    """Returns an (n, dim) array of sentence embeddings via the HF Inference API."""
    client = _get_client()

    for attempt in range(MAX_RETRIES):
        try:
            out = await client.feature_extraction(texts, model=MODEL_ID)
            break
        except HfHubHTTPError as e:
            status = e.response.status_code if e.response is not None else None
            # 503 = model loading, 429 = rate limited
            if status in (429, 503) and attempt < MAX_RETRIES - 1:
                await asyncio.sleep(2**attempt)
                continue
            raise HTTPException(
                status_code=502, detail=f"Embedding service error: {e}"
            ) from e

    arr = np.asarray(out, dtype=np.float32)

    # Normalize shape to (n, dim)
    if arr.ndim == 1:
        arr = arr.reshape(1, -1)
    elif arr.ndim == 3:  # token-level embeddings -> mean pool
        arr = arr.mean(axis=1)

    return arr


def cos_sim(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    a = a / np.linalg.norm(a, axis=1, keepdims=True)
    b = b / np.linalg.norm(b, axis=1, keepdims=True)
    return a @ b.T


async def get_priority_embeddings() -> np.ndarray:
    global _priority_embeddings
    if _priority_embeddings is None:
        async with _priority_lock:
            if _priority_embeddings is None:
                _priority_embeddings = await embed(priority_texts)
    return _priority_embeddings


async def fetch_github_issues(owner: str, repo: str) -> list[dict]:
    """Fetches raw issues from the GitHub API."""
    url = f"https://api.github.com/repos/{owner}/{repo}/issues"

    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=30)

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Failed to fetch issues: {response.text}",
        )

    return response.json()


async def categorize_issue_list(
    issues_data: list[dict], owner: str, repo: str
) -> CategorizeResponse:
    """Filters out pull requests and categorizes issues by semantic similarity."""
    issues = [issue for issue in issues_data if "pull_request" not in issue]

    if not issues:
        return CategorizeResponse(
            repo=f"{owner}/{repo}", total_issues_analyzed=0, issues=[]
        )

    titles = [issue["title"] for issue in issues]
    title_embeddings = await embed(titles)
    priority_embeddings = await get_priority_embeddings()
    cosine_scores = cos_sim(title_embeddings, priority_embeddings)

    results: list[IssueResponse] = []
    for i, issue in enumerate(issues):
        scores = cosine_scores[i].tolist()

        match_scores = {
            label: round(score, 4) for label, score in zip(priority_labels, scores)
        }

        best_match_idx = scores.index(max(scores))
        assigned_priority = priority_labels[best_match_idx]

        body = issue.get("body") or ""
        truncated_body = body[:500] + "..." if len(body) > 500 else body

        results.append(
            IssueResponse(
                id=issue["id"],
                title=issue["title"],
                body=truncated_body,
                assigned_priority=assigned_priority,
                match_scores=match_scores,
            )
        )

    return CategorizeResponse(
        repo=f"{owner}/{repo}",
        total_issues_analyzed=len(results),
        issues=results,
    )

import httpx2
from dotenv import load_dotenv
from fastapi import HTTPException
from models import CategorizeResponse, IssueResponse
from sentence_transformers import SentenceTransformer, util

load_dotenv()


model = SentenceTransformer("all-mpnet-base-v2")

priority_categories = {
    "high": "critical bug, system crash, security vulnerability, urgent fix needed, data loss, high priority outage",
    "medium": "enhancement, new feature request, optimization, refactoring, medium priority code improvement",
    "low": "documentation update, minor typo, low priority, small UI tweak, formatting, text cleanup",
}

priority_labels = list(priority_categories.keys())
priority_texts = list(priority_categories.values())
priority_embeddings = model.encode(priority_texts)


async def fetch_github_issues(owner: str, repo: str) -> list[dict]:
    """Fetches raw issues from the GitHub API."""
    url = f"https://api.github.com/repos/{owner}/{repo}/issues"

    async with httpx2.AsyncClient() as client:
        response = await client.get(url)

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Failed to fetch issues: {response.text}",
        )

    return response.json()


def categorize_issue_list(
    issues_data: list[dict], owner: str, repo: str
) -> CategorizeResponse:
    """Filters out pull requests and categorizes issues by semantic similarity."""
    issues = [issue for issue in issues_data if "pull_request" not in issue]

    if not issues:
        return CategorizeResponse(
            repo=f"{owner}/{repo}", total_issues_analyzed=0, issues=[]
        )

    titles = [issue["title"] for issue in issues]
    title_embeddings = model.encode(titles)
    cosine_scores = util.cos_sim(title_embeddings, priority_embeddings)

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

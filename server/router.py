from fastapi import APIRouter
from models import CategorizeResponse, RepoRequest
from services import categorize_issue_list, fetch_github_issues

router = APIRouter()


@router.post("/categorize_issues", response_model=CategorizeResponse)
async def categorize_issues(request: RepoRequest):
    issues_data = await fetch_github_issues(request.owner, request.repo)
    return categorize_issue_list(issues_data, request.owner, request.repo)

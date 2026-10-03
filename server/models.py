from pydantic import BaseModel


class RepoRequest(BaseModel):
    owner: str
    repo: str


class IssueResponse(BaseModel):
    id: int
    title: str
    body: str
    assigned_priority: str
    match_scores: dict[str, float]


class CategorizeResponse(BaseModel):
    repo: str
    total_issues_analyzed: int
    issues: list[IssueResponse]

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.base import get_db
from app.models.issue import Issue
from app.models.job import Job
from app.models.repo import Repo
from app.workers.queue import is_async_broker
from app.workers.tasks import run_analysis

router = APIRouter()


class JobCreateRequest(BaseModel):
    repo_id: int
    options: dict | None = {}


@router.post("")
async def create_job(
    request: JobCreateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    repo = db.query(Repo).filter(Repo.id == request.repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repo not found")

    job = Job(repo_id=request.repo_id, status="queued")
    db.add(job)
    db.commit()
    db.refresh(job)

    if is_async_broker():
        # Production: hand off to a Dramatiq worker via Redis.
        run_analysis.send(job.id)
    else:
        # Default dev setup has no separate worker, so run the actor's
        # underlying function in-process once the response is sent.
        background_tasks.add_task(run_analysis.fn, job.id)

    return {"job_id": job.id}


@router.get("/{job_id}")
async def get_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "id": job.id,
        "repo_id": job.repo_id,
        "status": job.status,
        "stats": job.stats_json,
        "created_at": job.created_at.isoformat() if job.created_at else None,
        "updated_at": job.updated_at.isoformat() if job.updated_at else None,
        "error": job.error_text,
    }


@router.get("/{job_id}/issues")
async def get_job_issues(
    job_id: int,
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    issues = db.query(Issue).filter(Issue.job_id == job_id).all()
    return [
        {
            "id": issue.id,
            "file_path": issue.file_path,
            "language": issue.language,
            "line_span": issue.line_span,
            "severity": issue.severity,
            "confidence": issue.confidence,
            "category": issue.category,
            "summary": issue.summary,
            "rationale": issue.rationale,
            "suggested_fix_summary": issue.suggested_fix_summary,
        }
        for issue in issues
    ]


class ProposeRequest(BaseModel):
    issue_ids: list[int]


@router.post("/{job_id}/propose")
async def propose_fixes(
    job_id: int,
    request: ProposeRequest,
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    from app.models.repo import Repo
    from app.services.pr_assemble import assemble_pr

    repo = db.query(Repo).filter(Repo.id == job.repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repo not found")

    issues = db.query(Issue).filter(Issue.id.in_(request.issue_ids)).all()
    issues_data = [
        {
            "file_path": issue.file_path,
            "category": issue.category,
            "severity": issue.severity,
            "line_span": issue.line_span,
            "summary": issue.summary,
            "rationale": issue.rationale,
        }
        for issue in issues
    ]

    pr_data = assemble_pr(job_id, issues_data, repo.path)

    from app.models.pr import PR, PRFileChange
    pr = PR(
        job_id=job_id,
        title=pr_data["title"],
        description_md=pr_data["description_md"],
        risk_notes_md=pr_data["risk_notes_md"],
        test_plan_md=pr_data["test_plan_md"],
    )
    db.add(pr)
    db.flush()

    for file_path, fix_data in pr_data["file_fixes"].items():
        file_change = PRFileChange(
            pr_id=pr.id,
            file_path=file_path,
            diff_unified=fix_data["diff"],
        )
        db.add(file_change)

    job.status = "done"
    db.commit()
    db.refresh(pr)

    return {"pr_id": pr.id}


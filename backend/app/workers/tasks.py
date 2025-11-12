from sqlalchemy.orm import Session
from app.models.base import SessionLocal
from app.models.job import Job
from app.models.issue import Issue
from app.models.pr import PR, PRFileChange
from app.models.repo import Repo
from app.services.analyze import analyze_repo
from app.services.pr_assemble import assemble_pr
import dramatiq
from app.workers.queue import broker

dramatiq.set_broker(broker)


@dramatiq.actor
def run_analysis(job_id: int):
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return

        job.status = "analyzing"
        db.commit()

        repo = db.query(Repo).filter(Repo.id == job.repo_id).first()
        if not repo:
            job.status = "error"
            job.error_text = "Repo not found"
            db.commit()
            return

        issues_data = analyze_repo(repo.path)

        job.stats_json = {
            "files_analyzed": len(set(issue.get("file_path") for issue in issues_data)),
            "issues_found": len(issues_data),
        }

        for issue_data in issues_data:
            issue = Issue(
                job_id=job_id,
                file_path=issue_data.get("file_path", ""),
                language=issue_data.get("language"),
                line_span=issue_data.get("line_span", "1-1"),
                severity=issue_data.get("severity", "low"),
                confidence=issue_data.get("confidence", 0.5),
                category=issue_data.get("category", "Other"),
                summary=issue_data.get("summary", ""),
                rationale=issue_data.get("rationale", ""),
                suggested_fix_summary=issue_data.get("suggested_fix_summary"),
            )
            db.add(issue)

        job.status = "pr_ready"
        db.commit()
    except Exception as e:
        job.status = "error"
        job.error_text = str(e)
        db.commit()
    finally:
        db.close()


@dramatiq.actor
def propose_fixes(job_id: int, issue_ids: list):
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return None

        repo = db.query(Repo).filter(Repo.id == job.repo_id).first()
        if not repo:
            return None

        issues = db.query(Issue).filter(Issue.id.in_(issue_ids)).all()
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

        db.commit()
        db.refresh(pr)
        return pr.id
    except Exception as e:
        db.rollback()
        return None
    finally:
        db.close()


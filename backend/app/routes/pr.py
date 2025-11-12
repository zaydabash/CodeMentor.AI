from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.pr import PR, PRFileChange

router = APIRouter()


@router.get("/{pr_id}")
async def get_pr(
    pr_id: int,
    db: Session = Depends(get_db)
):
    pr_obj = db.query(PR).filter(PR.id == pr_id).first()
    if not pr_obj:
        raise HTTPException(status_code=404, detail="PR not found")

    file_changes = db.query(PRFileChange).filter(PRFileChange.pr_id == pr_id).all()

    return {
        "id": pr_obj.id,
        "job_id": pr_obj.job_id,
        "title": pr_obj.title,
        "description_md": pr_obj.description_md,
        "risk_notes_md": pr_obj.risk_notes_md,
        "test_plan_md": pr_obj.test_plan_md,
        "files": [
            {
                "file_path": fc.file_path,
                "diff_unified": fc.diff_unified,
            }
            for fc in file_changes
        ],
    }


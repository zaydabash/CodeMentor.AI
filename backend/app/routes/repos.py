from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.models.base import get_db
from app.models.repo import Repo
from app.services.ingest import ingest_zip, ingest_git_url
import os

router = APIRouter()


class GitImportRequest(BaseModel):
    git_url: str


@router.post("/upload")
async def upload_repo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    workspace_dir = os.getenv("WORKSPACE_DIR", "./workspace")
    os.makedirs(workspace_dir, exist_ok=True)

    repo_id = await ingest_zip(file, workspace_dir, db)
    return {"repo_id": repo_id}


@router.post("/import")
async def import_git_repo(
    request: GitImportRequest,
    db: Session = Depends(get_db)
):
    workspace_dir = os.getenv("WORKSPACE_DIR", "./workspace")
    os.makedirs(workspace_dir, exist_ok=True)

    try:
        repo_id = await ingest_git_url(request.git_url, workspace_dir, db)
        return {"repo_id": repo_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


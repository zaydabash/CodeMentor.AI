import os
import zipfile
import shutil
import uuid
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.repo import Repo
from git import Repo as GitRepo
import tempfile


async def ingest_zip(file, workspace_dir: str, db: Session) -> int:
    repo_name = file.filename.replace(".zip", "") if file.filename else f"repo_{uuid.uuid4().hex[:8]}"
    repo_path = os.path.join(workspace_dir, repo_name)

    os.makedirs(repo_path, exist_ok=True)

    zip_path = os.path.join(workspace_dir, f"{repo_name}.zip")
    with open(zip_path, "wb") as f:
        content = await file.read()
        f.write(content)

    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(repo_path)

    os.remove(zip_path)

    repo = Repo(name=repo_name, origin=None, path=repo_path)
    db.add(repo)
    db.commit()
    db.refresh(repo)

    return repo.id


async def ingest_git_url(git_url: str, workspace_dir: str, db: Session) -> int:
    repo_name = git_url.split("/")[-1].replace(".git", "")
    repo_path = os.path.join(workspace_dir, repo_name)

    if os.path.exists(repo_path):
        shutil.rmtree(repo_path)

    GitRepo.clone_from(git_url, repo_path, depth=1)

    repo = Repo(name=repo_name, origin=git_url, path=repo_path)
    db.add(repo)
    db.commit()
    db.refresh(repo)

    return repo.id


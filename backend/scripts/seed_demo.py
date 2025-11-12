import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.models.base import SessionLocal, Base, engine
from app.models.repo import Repo
from app.models.job import Job
from app.workers.tasks import run_analysis
import shutil
from pathlib import Path

Base.metadata.create_all(bind=engine)

db = SessionLocal()

workspace_dir = os.getenv("WORKSPACE_DIR", "./workspace")
os.makedirs(workspace_dir, exist_ok=True)

sample_repo_path = Path(workspace_dir) / "py_flask_bug"
sample_repo_path.mkdir(exist_ok=True)

app_py_content = """from flask import Flask, request
import sqlite3

app = Flask(__name__)

@app.route('/user/<user_id>')
def get_user(user_id):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE id = {user_id}"
    cursor.execute(query)
    user = cursor.fetchone()
    return {'user': user}

@app.route('/process')
async def process_data():
    result = expensive_operation()
    return {'result': result}

def expensive_operation():
    try:
        return 1 / 0
    except:
        return None
"""

(sample_repo_path / "app.py").write_text(app_py_content)
(sample_repo_path / "requirements.txt").write_text("flask==2.0.0\n")

repo = Repo(name="py_flask_bug", origin=None, path=str(sample_repo_path))
db.add(repo)
db.commit()
db.refresh(repo)

job = Job(repo_id=repo.id, status="queued")
db.add(job)
db.commit()
db.refresh(job)

print(f"Created repo {repo.id} and job {job.id}")
print("Running analysis...")

try:
    run_analysis.send(job.id)
    print("Analysis job enqueued")
except Exception as e:
    print(f"Error: {e}")

db.close()


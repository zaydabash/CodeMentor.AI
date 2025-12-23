import sys
import os
import time
import shutil
from pathlib import Path
import dramatiq
from dramatiq import Worker

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.base import SessionLocal, Base, engine
from app.models.repo import Repo
from app.models.job import Job
from app.models.issue import Issue
from app.workers.tasks import run_analysis
from app.workers.queue import broker

def verify_full_system():
    print("Starting Full System Verification...")
    
    # 1. Setup DB
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 2. Setup Provider
    os.environ["LLM_PROVIDER"] = "local"
    
    # 3. Create Dummy Repo
    workspace_dir = Path("workspace_verify")
    if workspace_dir.exists():
        shutil.rmtree(workspace_dir)
    workspace_dir.mkdir()
    
    repo_path = workspace_dir / "bad_repo"
    repo_path.mkdir()
    
    # Write a file that should trigger issues
    (repo_path / "main.py").write_text("""
def calculate(a, b):
    # This is a bad function
    return a / b  # Potential zero division
""")
    
    repo = Repo(name="bad_repo", path=str(repo_path.absolute()))
    db.add(repo)
    db.commit()
    db.refresh(repo)
    print(f"Created Repo ID: {repo.id}")
    
    # 4. Create Job
    job = Job(repo_id=repo.id, status="queued")
    db.add(job)
    db.commit()
    db.refresh(job)
    print(f"Created Job ID: {job.id}")
    
    # 5. Queue Analysis
    run_analysis.send(job.id)
    print("Job Queued.")
    
    # 6. Start Worker to Process
    print("Starting Worker...")
    worker = Worker(broker, worker_timeout=100)
    worker.start()
    
    # 7. Poll for Completion
    max_retries = 10
    for i in range(max_retries):
        db.refresh(job)
        print(f"Job Status: {job.status}")
        
        if job.status in ["pr_ready", "error"]:
            break
        
        time.sleep(1)
        
    worker.stop()
    
    # 8. Verify Results
    if job.status == "pr_ready":
        print("✅ Job Completed Successfully!")
        issues = db.query(Issue).filter(Issue.job_id == job.id).all()
        print(f"Found {len(issues)} issues:")
        for issue in issues:
            print(f"- [{issue.severity}] {issue.file_path}: {issue.summary}")
            
        if len(issues) > 0:
            print("✅ End-to-End Test PASSED")
        else:
            print("❌ End-to-End Test FAILED: No issues found (Parsing/LLM issue?)")
    else:
        print(f"❌ Job Failed with status: {job.status}")
        print(f"Error: {job.error_text}")
        
    # Cleanup
    db.close()
    if workspace_dir.exists():
        shutil.rmtree(workspace_dir)

if __name__ == "__main__":
    verify_full_system()

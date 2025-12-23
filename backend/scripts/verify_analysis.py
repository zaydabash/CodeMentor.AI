import sys
import os
import json
from pathlib import Path

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.analyze import analyze_repo

def verify():
    print("Verifying analysis...")
    os.environ["LLM_PROVIDER"] = "local"
    
    # Create a dummy repo
    repo_path = Path("workspace/verify_repo")
    repo_path.mkdir(parents=True, exist_ok=True)
    
    (repo_path / "app.py").write_text("""
def foo():
    x = 1
    y = 0
    return x / y
""")
    
    try:
        issues = analyze_repo(str(repo_path))
        print(f"Analysis complete. Found {len(issues)} issues.")
        print(json.dumps(issues, indent=2))
        
        # Cleanup
        import shutil
        shutil.rmtree(repo_path)
        
        return True
    except Exception as e:
        print(f"Verification failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    verify()

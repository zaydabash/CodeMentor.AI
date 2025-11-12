from typing import List, Dict
from app.llm.provider import get_llm_provider
from app.llm.prompts import get_fix_proposal_prompt
from app.services.diffs import parse_fix_response
from pathlib import Path
import os


def propose_fixes_for_issues(issues: List[Dict], repo_path: str) -> Dict[str, Dict]:
    llm_provider = get_llm_provider()
    file_fixes = {}

    for issue in issues:
        file_path = issue["file_path"]
        if file_path not in file_fixes:
            try:
                if os.path.isabs(file_path):
                    full_path = Path(file_path)
                else:
                    full_path = Path(repo_path) / file_path
                
                if not full_path.exists():
                    continue
                    
                with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                    file_content = f.read()

                prompt = get_fix_proposal_prompt(file_content, issue)
                response = llm_provider.complete(prompt, temperature=0.2)

                diff, explanation, risk_note = parse_fix_response(response)
                if diff:
                    rel_path = os.path.relpath(full_path, repo_path) if not os.path.isabs(file_path) else file_path
                    file_fixes[rel_path] = {
                        "diff": diff,
                        "explanation": explanation,
                        "risk_note": risk_note,
                    }
            except Exception:
                continue

    return file_fixes


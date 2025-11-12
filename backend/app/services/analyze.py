import os
from pathlib import Path
from typing import List, Dict
from app.services.lint import run_ruff, run_bandit, run_eslint
from app.llm.provider import get_llm_provider
from app.llm.prompts import get_issue_identification_prompt
import json


def detect_languages(repo_path: str) -> List[str]:
    languages = set()
    for ext in Path(repo_path).rglob("*"):
        if ext.is_file():
            suffix = ext.suffix.lower()
            if suffix == ".py":
                languages.add("python")
            elif suffix in [".js", ".ts", ".jsx", ".tsx"]:
                languages.add("javascript")
    return list(languages)


def chunk_file(file_path: str, max_chunk_size: int = 2000) -> List[str]:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
        lines = content.split("\n")
        chunks = []
        current_chunk = []
        current_size = 0

        for line in lines:
            line_size = len(line) + 1
            if current_size + line_size > max_chunk_size and current_chunk:
                chunks.append("\n".join(current_chunk))
                current_chunk = [line]
                current_size = line_size
            else:
                current_chunk.append(line)
                current_size += line_size

        if current_chunk:
            chunks.append("\n".join(current_chunk))

        return chunks


def analyze_repo(repo_path: str) -> List[Dict]:
    all_issues = []

    languages = detect_languages(repo_path)

    if "python" in languages:
        all_issues.extend(run_ruff(repo_path))
        all_issues.extend(run_bandit(repo_path))

    if "javascript" in languages:
        all_issues.extend(run_eslint(repo_path))

    llm_provider = get_llm_provider()
    source_files = []

    for ext in [".py", ".js", ".ts", ".jsx", ".tsx"]:
        for file_path in Path(repo_path).rglob(f"*{ext}"):
            if "node_modules" in str(file_path) or "__pycache__" in str(file_path):
                continue
            if file_path.is_file():
                source_files.append(str(file_path))

    for file_path in source_files[:50]:
        try:
            rel_path = os.path.relpath(file_path, repo_path)
            chunks = chunk_file(file_path, max_chunk_size=2000)
            for chunk_idx, chunk in enumerate(chunks):
                prompt = get_issue_identification_prompt(chunk, rel_path)
                response = llm_provider.complete(prompt, temperature=0.2)

                try:
                    parsed = json.loads(response)
                    if isinstance(parsed, list):
                        for issue in parsed:
                            issue["file_path"] = rel_path
                            issue["line_span"] = issue.get("line_span", f"{chunk_idx * 50 + 1}-{(chunk_idx + 1) * 50}")
                            all_issues.append(issue)
                except json.JSONDecodeError:
                    pass
        except Exception:
            continue

    return all_issues


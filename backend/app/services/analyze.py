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
            
            # Determine language for parser
            suffix = Path(file_path).suffix.lower()
            if suffix == ".py":
                language = "python"
            elif suffix == ".js" or suffix == ".jsx":
                language = "javascript"
            elif suffix == ".ts":
                language = "typescript"
            elif suffix == ".tsx":
                language = "tsx"
            else:
                language = "unknown"

            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            if language != "unknown":
                from app.services.parsing import chunk_code_by_ast
                chunks = chunk_code_by_ast(content, language)
            else:
                # Fallback for unknown languages (though we filtered extensions above)
                chunks = [{"content": content, "start_line": 1, "end_line": len(content.splitlines()), "type": "blob"}]

            for chunk in chunks:
                chunk_text = chunk["content"]
                start_line = chunk["start_line"]
                end_line = chunk["end_line"]
                
                # Context header to help LLM
                context_prompt = f"File: {rel_path}\nLines: {start_line}-{end_line}\n\n{chunk_text}"
                
                prompt = get_issue_identification_prompt(context_prompt, rel_path)
                response = llm_provider.complete(prompt, temperature=0.2)
                
                try:
                    parsed = json.loads(response)
                    if isinstance(parsed, list):
                        for issue in parsed:
                            issue["file_path"] = rel_path
                            # Use accurate line numbers from AST parsing
                            # If LLM returns relative line numbers (e.g. line 1 of chunk), mapped to absolute?
                            # Usually LLM sees line numbers in prompt? No, we didn't add line numbers to text.
                            # But we told it "Lines: X-Y".
                            # Let's trust LLM to give relatively correct context or just use the chunk range if unsure.
                            # Better: We accept the line_span from LLM, but if it looks like "1-10" and we are at 100-110, we might need to offset.
                            # For now, let's just save what LLM gives, but maybe default to chunk range if missing.
                            if "line_span" not in issue:
                                issue["line_span"] = f"{start_line}-{end_line}"
                            all_issues.append(issue)
                except json.JSONDecodeError:
                    print(f"Failed to parse JSON from LLM for {rel_path}")
        except Exception as e:
            print(f"Error analyzing {file_path}: {e}")
            continue

    return all_issues


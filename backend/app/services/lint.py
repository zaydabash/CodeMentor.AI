import subprocess
import json
import os
from pathlib import Path
from typing import List, Dict


def run_ruff(repo_path: str) -> List[Dict]:
    issues = []
    try:
        result = subprocess.run(
            ["ruff", "check", "--output-format", "json", repo_path],
            capture_output=True,
            text=True,
            timeout=60,
        )
        if result.returncode == 0 and result.stdout:
            data = json.loads(result.stdout)
            for violation in data.get("violations", []):
                file_path = violation.get("filename", "")
                rel_path = os.path.relpath(file_path, repo_path) if os.path.isabs(file_path) else file_path
                issues.append({
                    "file_path": rel_path,
                    "line": violation.get("location", {}).get("row", 0),
                    "severity": "med",
                    "category": "Code Smell",
                    "summary": violation.get("code", ""),
                    "rationale": violation.get("message", ""),
                    "confidence": 0.9,
                })
    except Exception:
        pass
    return issues


def run_bandit(repo_path: str) -> List[Dict]:
    issues = []
    try:
        result = subprocess.run(
            ["bandit", "-r", "-f", "json", repo_path],
            capture_output=True,
            text=True,
            timeout=60,
        )
        if result.stdout:
            data = json.loads(result.stdout)
            for result_item in data.get("results", []):
                file_path = result_item.get("filename", "")
                rel_path = os.path.relpath(file_path, repo_path) if os.path.isabs(file_path) else file_path
                severity_map = {"HIGH": "high", "MEDIUM": "med", "LOW": "low"}
                issues.append({
                    "file_path": rel_path,
                    "line": result_item.get("line_number", 0),
                    "severity": severity_map.get(result_item.get("issue_severity", "LOW"), "low"),
                    "category": "Security",
                    "summary": result_item.get("test_name", ""),
                    "rationale": result_item.get("issue_text", ""),
                    "confidence": 0.95,
                })
    except Exception:
        pass
    return issues


def run_eslint(repo_path: str) -> List[Dict]:
    issues = []
    js_files = list(Path(repo_path).rglob("*.js")) + list(Path(repo_path).rglob("*.ts"))
    js_files = [str(f) for f in js_files if "node_modules" not in str(f)]

    if not js_files:
        return issues

    try:
        result = subprocess.run(
            ["eslint", "--format", "json"] + js_files[:50],
            capture_output=True,
            text=True,
            timeout=60,
            cwd=repo_path,
        )
        if result.stdout:
            data = json.loads(result.stdout)
            for file_data in data:
                file_path = file_data.get("filePath", "")
                rel_path = os.path.relpath(file_path, repo_path) if os.path.isabs(file_path) else file_path
                for message in file_data.get("messages", []):
                    severity_map = {2: "high", 1: "med", 0: "low"}
                    issues.append({
                        "file_path": rel_path,
                        "line": message.get("line", 0),
                        "severity": severity_map.get(message.get("severity", 1), "med"),
                        "category": "Code Smell",
                        "summary": message.get("ruleId", ""),
                        "rationale": message.get("message", ""),
                        "confidence": 0.85,
                    })
    except Exception:
        pass
    return issues


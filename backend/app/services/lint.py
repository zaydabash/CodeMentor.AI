import json
import os
import shutil
import subprocess
from pathlib import Path


def _rel_path(file_path: str, repo_path: str) -> str:
    """Normalize a linter-reported path to be relative to the repo root.

    Linters report paths in different ways (absolute, or relative to the
    current working directory), so resolve both sides to absolute first.
    """
    if not file_path:
        return file_path
    return os.path.relpath(os.path.abspath(file_path), os.path.abspath(repo_path))


def _eslint_command() -> list[str]:
    """Resolve an eslint invocation, preferring a directly installed binary
    and falling back to ``npx`` (without triggering a network install)."""
    if shutil.which("eslint"):
        return ["eslint"]
    if shutil.which("npx"):
        return ["npx", "--no-install", "eslint"]
    return []


def run_ruff(repo_path: str) -> list[dict]:
    issues = []
    try:
        result = subprocess.run(
            ["ruff", "check", "--output-format", "json", repo_path],
            capture_output=True,
            text=True,
            timeout=60,
        )
        # ruff exits non-zero (1) when it finds violations, so we do not gate
        # on returncode. The JSON payload is a flat array of violations.
        if result.stdout:
            data = json.loads(result.stdout)
            for violation in data:
                file_path = violation.get("filename", "")
                rel_path = _rel_path(file_path, repo_path)
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


def run_bandit(repo_path: str) -> list[dict]:
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
                rel_path = _rel_path(file_path, repo_path)
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


def run_eslint(repo_path: str) -> list[dict]:
    issues = []
    js_files = list(Path(repo_path).rglob("*.js")) + list(Path(repo_path).rglob("*.ts"))
    js_files = [str(f) for f in js_files if "node_modules" not in str(f)]

    if not js_files:
        return issues

    eslint_cmd = _eslint_command()
    if not eslint_cmd:
        return issues

    try:
        result = subprocess.run(
            eslint_cmd + ["--format", "json"] + js_files[:50],
            capture_output=True,
            text=True,
            timeout=60,
            cwd=repo_path,
        )
        if result.stdout:
            data = json.loads(result.stdout)
            for file_data in data:
                file_path = file_data.get("filePath", "")
                rel_path = _rel_path(file_path, repo_path)
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


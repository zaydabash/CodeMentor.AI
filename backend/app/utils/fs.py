import os
from pathlib import Path


def should_ignore_file(file_path: str) -> bool:
    ignore_patterns = [
        "__pycache__",
        "node_modules",
        ".git",
        ".venv",
        "venv",
        "env",
        ".env",
        "dist",
        "build",
        ".next",
        "out",
        ".pytest_cache",
        ".mypy_cache",
        ".ruff_cache",
    ]
    return any(pattern in file_path for pattern in ignore_patterns)


def get_file_tree(repo_path: str) -> dict:
    tree = {}
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if not should_ignore_file(os.path.join(root, d))]
        rel_root = os.path.relpath(root, repo_path)
        if rel_root == ".":
            rel_root = ""
        for file in files:
            if not should_ignore_file(os.path.join(root, file)):
                rel_path = os.path.join(rel_root, file) if rel_root else file
                tree[rel_path] = {
                    "path": rel_path,
                    "size": os.path.getsize(os.path.join(root, file)),
                }
    return tree


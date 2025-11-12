#!/usr/bin/env python3
import re
import sys
from pathlib import Path


def has_emoji(text: str) -> bool:
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"
        "\U0001F300-\U0001F5FF"
        "\U0001F680-\U0001F6FF"
        "\U0001F1E0-\U0001F1FF"
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "]+",
        flags=re.UNICODE,
    )
    return bool(emoji_pattern.search(text))


def check_file(file_path: Path) -> list:
    violations = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            for line_num, line in enumerate(f, 1):
                if has_emoji(line):
                    violations.append((file_path, line_num, line.strip()))
    except Exception:
        pass
    return violations


def main():
    root = Path(".")
    exclude_dirs = {".git", "node_modules", "__pycache__", ".next", "venv", "env", ".venv"}
    exclude_exts = {".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".woff", ".woff2", ".ttf"}

    all_violations = []
    for file_path in root.rglob("*"):
        if any(part in exclude_dirs for part in file_path.parts):
            continue
        if file_path.suffix.lower() in exclude_exts:
            continue
        if file_path.is_file():
            violations = check_file(file_path)
            all_violations.extend(violations)

    if all_violations:
        print("Emoji violations found:")
        for file_path, line_num, line in all_violations:
            print(f"{file_path}:{line_num}: {line[:80]}")
        sys.exit(1)
    else:
        print("No emoji violations found.")
        sys.exit(0)


if __name__ == "__main__":
    main()


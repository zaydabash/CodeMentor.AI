#!/usr/bin/env python3
import re
import sys
from pathlib import Path


def has_emoji(text: str) -> bool:
    # Target actual emoji blocks only. The previous broad range
    # (U+24C2-U+1F251) also matched box-drawing and arrow characters used in
    # ASCII diagrams, producing false positives.
    emoji_pattern = re.compile(
        "["
        "\U0001F300-\U0001FAFF"  # symbols, pictographs, emoji extensions
        "\U0001F1E0-\U0001F1FF"  # regional indicators (flags)
        "\U00002600-\U000026FF"  # miscellaneous symbols
        "\U00002700-\U000027BF"  # dingbats (includes check mark, cross mark)
        "\U0000FE00-\U0000FE0F"  # variation selectors
        "\U0001F000-\U0001F0FF"  # mahjong, dominoes, playing cards
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


import difflib
from typing import Tuple


def generate_unified_diff(original: str, modified: str, file_path: str) -> str:
    original_lines = original.splitlines(keepends=True)
    modified_lines = modified.splitlines(keepends=True)

    diff = difflib.unified_diff(
        original_lines,
        modified_lines,
        fromfile=f"a/{file_path}",
        tofile=f"b/{file_path}",
        lineterm="",
    )

    return "".join(diff)


def parse_fix_response(response: str) -> Tuple[str, str, str]:
    lines = response.split("\n")
    diff_lines = []
    explanation = ""
    risk_note = ""

    in_diff = False
    in_explanation = False
    in_risk = False

    for line in lines:
        if line.startswith("---") or line.startswith("+++") or line.startswith("@@"):
            in_diff = True
            diff_lines.append(line)
        elif in_diff and (line.startswith(" ") or line.startswith("-") or line.startswith("+")):
            diff_lines.append(line)
        elif "Explanation:" in line.lower():
            in_diff = False
            in_explanation = True
            explanation = line.split("Explanation:", 1)[-1].strip()
        elif "Risk Note:" in line.lower() or "Risk:" in line.lower():
            in_explanation = False
            in_risk = True
            risk_note = line.split("Risk", 1)[-1].split(":", 1)[-1].strip()
        elif in_explanation:
            explanation += " " + line.strip()
        elif in_risk:
            risk_note += " " + line.strip()

    diff_text = "\n".join(diff_lines)
    return diff_text, explanation, risk_note


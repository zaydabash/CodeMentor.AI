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
        elif line.lower().startswith("explanation:"):
            in_diff = False
            in_explanation = True
            explanation = line[12:].strip()  # len("explanation:") == 12
        elif line.lower().startswith("risk note:") or line.lower().startswith("risk:"):
            in_explanation = False
            in_risk = True
            # Handle both "Risk Note:" (10 chars) and "Risk:" (5 chars)
            if line.lower().startswith("risk note:"):
                risk_note = line[10:].strip()
            else:
                risk_note = line[5:].strip()
        elif in_explanation:
            explanation += " " + line.strip()
        elif in_risk:
            risk_note += " " + line.strip()

    diff_text = "\n".join(diff_lines)
    return diff_text, explanation, risk_note


def get_issue_identification_prompt(code_chunk: str, file_path: str) -> str:
    return f"""Analyze the following code snippet for potential bugs, code smells, security issues, performance problems, maintainability concerns, and test gaps.

File: {file_path}
Code:
```
{code_chunk}
```

Return a JSON array of issues found. Each issue should have:
- category: one of ["Bug", "Code Smell", "Security", "Performance", "Maintainability", "Test Gap"]
- severity: one of ["low", "med", "high"]
- confidence: float between 0 and 1
- line_span: string like "10-15" indicating line range
- rationale: brief explanation of the issue
- summary: short title for the issue
- suggested_fix_summary: optional brief description of how to fix

Return only valid JSON, no markdown formatting, no explanatory text before or after.
Example format:
[
  {{
    "category": "Bug",
    "severity": "high",
    "confidence": 0.9,
    "line_span": "5-7",
    "rationale": "Missing await on async function call",
    "summary": "Unhandled async operation",
    "suggested_fix_summary": "Add await keyword"
  }}
]
"""


def get_fix_proposal_prompt(file_content: str, issue: dict) -> str:
    return f"""Given the following code file and an identified issue, generate a unified diff patch that fixes the issue.

Issue:
- Category: {issue.get('category')}
- Severity: {issue.get('severity')}
- Summary: {issue.get('summary')}
- Rationale: {issue.get('rationale')}
- Lines: {issue.get('line_span')}

Original file content:
```
{file_content}
```

Generate a unified diff patch that:
1. Fixes the identified issue
2. Maintains code style and structure
3. Includes minimal necessary changes

Return the unified diff format starting with the file path header. Include a brief explanation of the changes and a risk note after the diff.

Format:
--- a/path/to/file
+++ b/path/to/file
@@ -X,Y +A,B @@
...
[unified diff content]
...

Explanation: [brief explanation]
Risk Note: [any risks or considerations]
"""


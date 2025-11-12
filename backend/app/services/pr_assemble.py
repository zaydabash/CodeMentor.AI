from typing import List, Dict
from app.services.propose import propose_fixes_for_issues


def assemble_pr(job_id: int, issues: List[Dict], repo_path: str) -> Dict:
    file_fixes = propose_fixes_for_issues(issues, repo_path)

    title = f"Fix {len(issues)} issues identified by CodeMentor.AI"

    description_parts = [
        f"This PR addresses {len(issues)} issues found during automated analysis.",
        "",
        "## Issues Fixed",
    ]

    by_category = {}
    for issue in issues:
        cat = issue.get("category", "Other")
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(issue)

    for category, cat_issues in by_category.items():
        description_parts.append(f"\n### {category} ({len(cat_issues)})")
        for issue in cat_issues[:10]:
            description_parts.append(f"- {issue.get('summary')} ({issue.get('severity')})")

    description_md = "\n".join(description_parts)

    risk_notes = []
    for file_path, fix_data in file_fixes.items():
        if fix_data.get("risk_note"):
            risk_notes.append(f"**{file_path}**: {fix_data['risk_note']}")

    risk_notes_md = "\n".join(risk_notes) if risk_notes else "No significant risks identified."

    test_plan = [
        "## Test Plan",
        "",
        "1. Review all changes manually",
        "2. Run existing test suite",
        "3. Verify no regressions introduced",
        "4. Check that fixes address the identified issues",
    ]
    test_plan_md = "\n".join(test_plan)

    return {
        "title": title,
        "description_md": description_md,
        "risk_notes_md": risk_notes_md,
        "test_plan_md": test_plan_md,
        "file_fixes": file_fixes,
    }


from app.services.diffs import generate_unified_diff, parse_fix_response


def test_generate_unified_diff():
    original = "line1\nline2\nline3"
    modified = "line1\nline2_modified\nline3\nline4"
    file_path = "test.py"
    
    diff = generate_unified_diff(original, modified, file_path)
    
    assert "--- a/test.py" in diff
    assert "+++ b/test.py" in diff
    assert "-line2" in diff
    assert "+line2_modified" in diff
    assert "+line4" in diff


def test_parse_fix_response():
    response = """--- a/test.py
+++ b/test.py
@@ -1,2 +1,2 @@
-old
+new

Explanation: Changed old to new
Risk Note: Low risk change"""
    
    diff, explanation, risk_note = parse_fix_response(response)
    
    assert "--- a/test.py" in diff
    assert "old" in diff
    assert "new" in diff
    assert "Changed old to new" in explanation
    assert "Low risk change" in risk_note


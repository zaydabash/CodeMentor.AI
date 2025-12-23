from tree_sitter import Language, Parser
import tree_sitter_python
import tree_sitter_javascript
import tree_sitter_typescript

def test_setup():
    print("Testing Tree-sitter setup...")
    try:
        # Tried adding name argument
        py_lang = Language(tree_sitter_python.language())
        js_lang = Language(tree_sitter_javascript.language())
        ts_lang = Language(tree_sitter_typescript.language_typescript())
        
        parser = Parser(py_lang)
        # parser.set_language(py_lang) - removed in new version
        
        code = b"def foo(): pass"
        tree = parser.parse(code)
        print(f"Parsed python: {tree.root_node.type}")
        assert tree.root_node.type == "module"
        
        print("Tree-sitter setup valid!")
        return True
    except Exception as e:
        print(f"Setup failed: {e}")
        # Let's inspect what tree_sitter_python.language() actually returns
        try:
            print(f"Type of language obj: {type(tree_sitter_python.language())}")
        except:
            pass
        return False

if __name__ == "__main__":
    test_setup()

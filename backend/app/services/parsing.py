from tree_sitter import Language, Parser
import tree_sitter_python
import tree_sitter_javascript
import tree_sitter_typescript
from typing import List, Dict, Optional

# Initialize languages once
try:
    PY_LANG = Language(tree_sitter_python.language())
    JS_LANG = Language(tree_sitter_javascript.language())
    TS_LANG = Language(tree_sitter_typescript.language_typescript())
    TSX_LANG = Language(tree_sitter_typescript.language_tsx())
except Exception as e:
    print(f"Error loading tree-sitter languages: {e}")
    PY_LANG = None
    JS_LANG = None
    TS_LANG = None
    TSX_LANG = None


def get_parser(language: str) -> Optional[Parser]:
    if language == "python" and PY_LANG:
        return Parser(PY_LANG)
    elif language == "javascript" and JS_LANG:
        return Parser(JS_LANG)
    elif language == "typescript" and TS_LANG:
        return Parser(TS_LANG)
    elif language == "tsx" and TSX_LANG:
        return Parser(TSX_LANG)
    return None


def chunk_code_by_ast(content: str, language: str, max_chars: int = 2000) -> List[Dict]:
    """
    Splits code into logical chunks based on AST (functions, classes).
    Returns a list of dicts with keys: 'content', 'start_line', 'end_line', 'type'.
    """
    parser = get_parser(language)
    if not parser:
        return [{"content": content, "start_line": 1, "end_line": len(content.splitlines()), "type": "blob"}]

    bytes_content = content.encode("utf8")
    tree = parser.parse(bytes_content)
    root = tree.root_node
    
    chunks = []
    current_chunk_nodes = []
    current_size = 0
    
    cursor = root.walk()
    if cursor.goto_first_child():
        while True:
            node = cursor.node
            # Crude approximation of size: text length
            # Note: node.text likely decodes, so implies processing. 
            # Using byte range length is faster.
            node_size = node.end_byte - node.start_byte
            
            if current_size + node_size > max_chars and current_chunk_nodes:
                chunks.append(_merge_nodes(current_chunk_nodes, bytes_content))
                current_chunk_nodes = []
                current_size = 0
            
            current_chunk_nodes.append(node)
            current_size += node_size
            
            if not cursor.goto_next_sibling():
                break
        
        if current_chunk_nodes:
            chunks.append(_merge_nodes(current_chunk_nodes, bytes_content))
            
    if not chunks:
         return [{"content": content, "start_line": 1, "end_line": len(content.splitlines()), "type": "blob"}]

    return chunks


def _merge_nodes(nodes: List, bytes_content: bytes) -> Dict:
    """Merges a list of AST nodes into a single chunk, preserving whitespace."""
    if not nodes:
        return {}
    
    start_byte = nodes[0].start_byte
    end_byte = nodes[-1].end_byte
    
    start_line = nodes[0].start_point[0] + 1
    end_line = nodes[-1].end_point[0] + 1
    
    chunk_text = bytes_content[start_byte:end_byte].decode("utf8")
    
    return {
        "content": chunk_text,
        "start_line": start_line,
        "end_line": end_line,
        "type": "block"
    }

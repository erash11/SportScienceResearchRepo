"""Steps B3 cache/merge + Part C AST+semantic merge."""
import json
from pathlib import Path

# ---- B3: save to cache ----
try:
    from graphify.cache import save_semantic_cache
    new = json.loads(Path('.graphify_semantic_new.json').read_text())
    saved = save_semantic_cache(new.get('nodes', []), new.get('edges', []), new.get('hyperedges', []))
    print(f'Cached {saved} files')
except Exception as e:
    print(f'Cache save skipped: {e}')

# ---- B3: merge cached + new -> .graphify_semantic.json ----
cached = json.loads(Path('.graphify_cached.json').read_text()) if Path('.graphify_cached.json').exists() else {'nodes':[],'edges':[],'hyperedges':[]}
new = json.loads(Path('.graphify_semantic_new.json').read_text()) if Path('.graphify_semantic_new.json').exists() else {'nodes':[],'edges':[],'hyperedges':[]}

all_nodes = cached['nodes'] + new.get('nodes', [])
all_edges = cached['edges'] + new.get('edges', [])
all_hyperedges = cached.get('hyperedges', []) + new.get('hyperedges', [])
seen = set()
deduped = []
for n in all_nodes:
    if n['id'] not in seen:
        seen.add(n['id'])
        deduped.append(n)

merged = {
    'nodes': deduped,
    'edges': all_edges,
    'hyperedges': all_hyperedges,
    'input_tokens': new.get('input_tokens', 0),
    'output_tokens': new.get('output_tokens', 0),
}
Path('.graphify_semantic.json').write_text(json.dumps(merged, indent=2))
print(f'Semantic: {len(deduped)} nodes, {len(all_edges)} edges')

# ---- Part C: merge AST + semantic -> .graphify_extract.json ----
ast = json.loads(Path('.graphify_ast.json').read_text())
sem = json.loads(Path('.graphify_semantic.json').read_text())

seen2 = {n['id'] for n in ast['nodes']}
merged_nodes = list(ast['nodes'])
for n in sem['nodes']:
    if n['id'] not in seen2:
        merged_nodes.append(n)
        seen2.add(n['id'])

merged_edges = ast['edges'] + sem['edges']
merged_hyperedges = sem.get('hyperedges', [])
final = {
    'nodes': merged_nodes,
    'edges': merged_edges,
    'hyperedges': merged_hyperedges,
    'input_tokens': sem.get('input_tokens', 0),
    'output_tokens': sem.get('output_tokens', 0),
}
Path('.graphify_extract.json').write_text(json.dumps(final, indent=2))
print(f'Extract: {len(merged_nodes)} nodes, {len(merged_edges)} edges ({len(ast["nodes"])} AST + {len(sem["nodes"])} semantic)')

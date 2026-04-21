"""Step 6 - Generate HTML viz and Obsidian vault."""
import json
from pathlib import Path

extraction = json.loads(Path('.graphify_extract.json').read_text())
detection  = json.loads(Path('.graphify_detect.json').read_text())
analysis   = json.loads(Path('.graphify_analysis.json').read_text())
labels_raw = json.loads(Path('.graphify_labels.json').read_text())
labels = {int(k): v for k, v in labels_raw.items()}

from graphify.build import build_from_json
from graphify.export import to_html, to_obsidian

G = build_from_json(extraction)
communities_int = {int(k): v for k, v in analysis['communities'].items()}

cohesion_int = {int(k): v for k, v in analysis['cohesion'].items()}

# Generate HTML
try:
    to_html(G, communities_int, 'graphify-out/graph.html', community_labels=labels)
    print(f'HTML generated: graphify-out/graph.html')
except Exception as e:
    print(f'HTML generation error: {e}')

# Obsidian vault - write individual node notes via to_obsidian
obsidian_dir = Path('C:/Users/eric_rash/Desktop/Vault41/SportScienceResearch')
obsidian_dir.mkdir(parents=True, exist_ok=True)
try:
    count = to_obsidian(G, communities_int, str(obsidian_dir), community_labels=labels, cohesion=cohesion_int)
    print(f'Obsidian vault: {count} notes written to {obsidian_dir}')
except Exception as e:
    print(f'Obsidian to_obsidian failed: {e}')
    print('Falling back to manual note generation...')

    obsidian_dir.mkdir(parents=True, exist_ok=True)

    # Build node label map
    id_to_node = {n['id']: n for n in extraction['nodes']}

    # Write one note per community
    for cid, node_ids in sorted(communities_int.items()):
        comm_label = labels.get(cid, f'Community {cid}')
        safe_name = comm_label.replace('/', '-').replace(':', '-')
        lines = [f'# {comm_label}', '', f'**{len(node_ids)} papers in this research cluster**', '']

        # List papers (skip concept nodes)
        paper_nodes = [nid for nid in node_ids if nid.startswith('paper_')]
        concept_nodes = [nid for nid in node_ids if nid.startswith('concept_')]

        if concept_nodes:
            lines.append('**Key Concepts:** ' + ', '.join(
                id_to_node.get(nid, {}).get('label', nid) for nid in concept_nodes
            ))
            lines.append('')

        lines.append('## Papers')
        lines.append('')
        for nid in paper_nodes[:50]:  # cap at 50
            node = id_to_node.get(nid, {})
            lbl = node.get('label', nid)
            src = node.get('source_file', '')
            year = node.get('captured_at', '')
            year_str = f' ({year})' if year else ''
            doi = node.get('source_url', '')
            doi_str = f' — [{doi}]({doi})' if doi else ''
            lines.append(f'- {lbl[:120]}{year_str}{doi_str}')

        lines.append('')
        lines.append('## Related Communities')
        lines.append('')
        for other_cid, other_label in labels.items():
            if other_cid != cid:
                lines.append(f'- [[{other_label.replace("/", "-").replace(":", "-")}]]')

        note_path = obsidian_dir / f'{safe_name}.md'
        note_path.write_text('\n'.join(lines), encoding='utf-8')
        print(f'  Wrote: {note_path.name}')

    # Write index note
    index_lines = [
        '# Sports Science Research Graph',
        '',
        f'**{G.number_of_nodes()} nodes · {G.number_of_edges()} edges · {len(communities_int)} communities**',
        '',
        '## Research Communities',
        '',
    ]
    for cid, comm_label in sorted(labels.items()):
        safe_name = comm_label.replace('/', '-').replace(':', '-')
        node_ids = communities_int.get(cid, [])
        paper_count = sum(1 for n in node_ids if n.startswith('paper_'))
        index_lines.append(f'- [[{safe_name}]] — {paper_count} papers')

    index_lines += [
        '',
        '## God Nodes (Most Connected)',
        '',
    ]
    id_to_label = {n['id']: n['label'] for n in extraction['nodes']}
    for g in analysis['gods'][:5]:
        lbl = id_to_label.get(g['id'], g['id'])
        index_lines.append(f'- **{lbl[:100]}** ({g["edges"]} connections)')

    index_lines += ['', '## Suggested Questions', '']
    for q in analysis.get('questions', [])[:5]:
        index_lines.append(f'- {q.get("question", str(q))[:200]}')

    (obsidian_dir / 'INDEX.md').write_text('\n'.join(index_lines), encoding='utf-8')
    print(f'  Wrote: INDEX.md')
    print(f'Obsidian vault written to {obsidian_dir}')

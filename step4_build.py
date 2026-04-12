"""Step 4 - Build graph, cluster, analyze, generate outputs."""
import json, sys
from pathlib import Path

extraction = json.loads(Path('.graphify_extract.json').read_text())
detection  = json.loads(Path('.graphify_detect.json').read_text())

from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json

G = build_from_json(extraction)

if G.number_of_nodes() == 0:
    print('ERROR: Graph is empty - extraction produced no nodes.')
    sys.exit(1)

communities = cluster(G)
cohesion = score_all(G, communities)
tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}
gods = god_nodes(G)
surprises = surprising_connections(G, communities)
labels = {cid: 'Community ' + str(cid) for cid in communities}
questions = suggest_questions(G, communities, labels)

Path('graphify-out').mkdir(exist_ok=True)
report = generate(G, communities, cohesion, labels, gods, surprises, detection, tokens,
                  'SportScienceResearchRepo/docs', suggested_questions=questions)
Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding='utf-8')
to_json(G, communities, 'graphify-out/graph.json')

analysis = {
    'communities': {str(k): v for k, v in communities.items()},
    'cohesion': {str(k): v for k, v in cohesion.items()},
    'gods': gods,
    'surprises': surprises,
    'questions': questions,
}
Path('.graphify_analysis.json').write_text(json.dumps(analysis, indent=2))

print(f'Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities')
print(f'God nodes: {gods[:5]}')
print(f'Surprises: {surprises[:3]}')
print(f'Questions: {questions[:3]}')

# Print community node counts for labeling
comm_sizes = {}
for node, cid in communities.items():
    comm_sizes[cid] = comm_sizes.get(cid, 0) + 1
print(f'\nCommunity sizes:')
for cid, size in sorted(comm_sizes.items(), key=lambda x: -x[1]):
    print(f'  Community {cid}: {size} nodes')

# Print sample nodes per community
from collections import defaultdict
comm_nodes = defaultdict(list)
for node, cid in communities.items():
    comm_nodes[cid].append(node)

print('\nSample nodes per community (up to 5):')
for cid in sorted(comm_nodes.keys()):
    sample = comm_nodes[cid][:5]
    print(f'  Community {cid}: {sample}')

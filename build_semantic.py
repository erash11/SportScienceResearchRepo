import json, re
from pathlib import Path

src = Path('docs')
out_nodes = []
out_edges = []
out_hyperedges = []

# Topic keyword groups for concept nodes and hyperedges
TOPICS = {
    'hamstring': ['hamstring', 'hsI', 'proximal'],
    'concussion': ['concussion', 'tbi', 'head injur', 'mTBI', 'brain injur'],
    'acl': ['acl', 'anterior cruciate', 'knee ligament'],
    'training_load': ['training load', 'workload', 'rpm', 'session rpe', 'gps', 'monotony', 'strain'],
    'return_to_play': ['return to play', 'rtp', 'return-to-play', 'return to sport', 'rehabilitation'],
    'nfl': ['nfl', 'national football league', 'football player'],
    'neuromuscular': ['neuromuscular', 'nmf', 'fatigue', 'eccentric'],
    'biomechanics': ['biomechan', 'kinematics', 'kinetic', 'force'],
    'strength': ['strength', 'resistance training', 'nordic', 'squat', 'deadlift'],
    'prevention': ['prevention', 'preventive', 'injury prevention', 'protective'],
}

# Concept nodes (one per topic)
concept_nodes = {}
for topic, _ in TOPICS.items():
    nid = f'concept_{topic}'
    concept_nodes[topic] = nid
    label = topic.replace('_', ' ').title()
    out_nodes.append({
        'id': nid,
        'label': label,
        'file_type': 'document',
        'source_file': 'concepts',
        'source_location': None,
        'source_url': None,
        'captured_at': None,
        'author': None,
        'contributor': None,
    })

topic_paper_map = {t: [] for t in TOPICS}

json_files = sorted(src.glob('batch_*.json'))
processed = 0

for jf in json_files:
    try:
        papers = json.loads(jf.read_text(encoding='utf-8', errors='replace'))
    except Exception as e:
        print(f'Skip {jf.name}: {e}')
        continue

    for p in papers:
        pid = str(p.get('id', 'unknown')).strip()
        safe_id = re.sub(r'[^a-z0-9_]', '_', pid.lower())
        nid = f'paper_{safe_id}'

        title = p.get('title') or p.get('tldr') or pid
        if not isinstance(title, str):
            title = pid

        out_nodes.append({
            'id': nid,
            'label': title[:120],
            'file_type': 'document',
            'source_file': str(jf.relative_to(src.parent)),
            'source_location': None,
            'source_url': p.get('doi') or None,
            'captured_at': str(p.get('year', '')) or None,
            'author': None,
            'contributor': None,
        })

        # Build searchable text from all paper fields
        searchable = ' '.join([
            str(p.get('tldr') or ''),
            str(p.get('abstract') or ''),
            str(p.get('methods') or ''),
            str(p.get('findings') or ''),
            str(p.get('practicalImplications') or ''),
            str(p.get('athleteDev') or ''),
            str(p.get('rtp') or ''),
        ]).lower()

        # Add edges to matching concept nodes
        matched_topics = []
        for topic, keywords in TOPICS.items():
            if any(kw.lower() in searchable for kw in keywords):
                matched_topics.append(topic)
                out_edges.append({
                    'source': nid,
                    'target': concept_nodes[topic],
                    'relation': 'investigates',
                    'confidence': 'INFERRED',
                    'confidence_score': 0.85,
                    'source_file': str(jf.relative_to(src.parent)),
                    'source_location': None,
                    'weight': 1.0,
                })
                topic_paper_map[topic].append(nid)

        # Return-to-play edge if rtp field is substantial
        rtp_text = str(p.get('rtp') or '')
        if len(rtp_text) > 50 and 'return_to_play' not in matched_topics:
            out_edges.append({
                'source': nid,
                'target': concept_nodes['return_to_play'],
                'relation': 'recommends',
                'confidence': 'EXTRACTED',
                'confidence_score': 1.0,
                'source_file': str(jf.relative_to(src.parent)),
                'source_location': None,
                'weight': 1.0,
            })
            topic_paper_map['return_to_play'].append(nid)

        processed += 1

# Semantic similarity edges: papers sharing 2+ topics are semantically related
# Build paper→topic_set map
paper_topics = {}
for topic, papers in topic_paper_map.items():
    for p in papers:
        paper_topics.setdefault(p, set()).add(topic)

# Find pairs sharing 2+ topics (limit to avoid O(n^2) explosion)
paper_list = list(paper_topics.keys())
sim_edges_added = 0
MAX_SIM_EDGES = 300
for i in range(len(paper_list)):
    if sim_edges_added >= MAX_SIM_EDGES:
        break
    for j in range(i+1, len(paper_list)):
        if sim_edges_added >= MAX_SIM_EDGES:
            break
        shared = paper_topics[paper_list[i]] & paper_topics[paper_list[j]]
        if len(shared) >= 2:
            score = min(0.9, 0.6 + len(shared) * 0.1)
            out_edges.append({
                'source': paper_list[i],
                'target': paper_list[j],
                'relation': 'semantically_similar_to',
                'confidence': 'INFERRED',
                'confidence_score': round(score, 2),
                'source_file': 'concepts',
                'source_location': None,
                'weight': score,
            })
            sim_edges_added += 1

# Hyperedges for major topic clusters (topics with 3+ papers)
for topic, papers in topic_paper_map.items():
    if len(papers) >= 3:
        out_hyperedges.append({
            'id': f'hyperedge_{topic}',
            'label': topic.replace('_', ' ').title() + ' Research Cluster',
            'nodes': papers[:30],  # cap to 30 nodes per hyperedge
            'relation': 'participate_in',
            'confidence': 'INFERRED',
            'confidence_score': 0.8,
            'source_file': 'docs',
        })

merged = {
    'nodes': out_nodes,
    'edges': out_edges,
    'hyperedges': out_hyperedges,
    'input_tokens': 0,
    'output_tokens': 0,
}

out_path = Path('.graphify_semantic_new.json')
out_path.write_text(json.dumps(merged, indent=2))
print(f'Done: {len(out_nodes)} nodes, {len(out_edges)} edges, {len(out_hyperedges)} hyperedges from {processed} papers')

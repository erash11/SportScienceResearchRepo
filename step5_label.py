"""Step 5 - Label communities and regenerate report."""
import json
from pathlib import Path

extraction = json.loads(Path('.graphify_extract.json').read_text())
detection  = json.loads(Path('.graphify_detect.json').read_text())
analysis   = json.loads(Path('.graphify_analysis.json').read_text())

from graphify.build import build_from_json
from graphify.cluster import score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate

G = build_from_json(extraction)
communities = {int(k): v for k, v in analysis['communities'].items()}
cohesion = {int(k): v for k, v in analysis['cohesion'].items()}
tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}

labels = {
    0: 'NFL Performance & Epidemiology',
    1: 'Athlete Monitoring & Load Management',
    2: 'Hamstring Injury & Rehabilitation',
    3: 'Injury Prevention & Biomechanics',
    4: 'Concussion & Head Impact',
    5: 'Training Load & Recovery',
    6: 'ACL & Lower Extremity Injuries',
}

questions = suggest_questions(G, communities, labels)

report = generate(G, communities, cohesion, labels, analysis['gods'], analysis['surprises'],
                  detection, tokens, 'SportScienceResearchRepo/docs', suggested_questions=questions)
Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding='utf-8')
Path('.graphify_labels.json').write_text(json.dumps({str(k): v for k, v in labels.items()}))
print('Report updated with community labels')
print('Labels saved')

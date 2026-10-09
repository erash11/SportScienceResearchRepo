# Claim-fidelity judging

Each packet `packets/<ID>.json` has the path to a paper's extracted full text and two candidate library records, A and B, for that paper. Judge each record ONLY against the source text (read it fully, in chunks if large).

For each record, check every factual claim in every field (sample sizes, designs, populations, effects, directions, significance, causal language, what the authors concluded). Classify problems:
- **critical**: claim contradicts the source, invented number/finding, wrong direction or significance, or causal/clinical overstatement that could mislead a practitioner decision.
- **minor**: imprecise, missing an important caveat, mild overgeneralization, citation detail wrong.

Write `out/<ID>.json`:
```
{"id":"<ID>",
 "A":{"critical":[{"field":"","claim":"","source_says":""}],"minor":[{"field":"","issue":""}],"verdict":"publishable|minor_edits|major_revision","usefulness":1-5},
 "B":{...},
 "better":"A|B|tie", "note":"one sentence"}
```
`usefulness` = how useful the practical fields are to performance/medical staff (1 poor to 5 excellent). Be strict and specific; quote the source briefly in `source_says`.

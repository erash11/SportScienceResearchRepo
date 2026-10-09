"""Summarize one drafter evaluation iteration: python3 docs/ask-library-eval/summarize.py iteration-N"""
import glob, json, os, sys

here = os.path.dirname(os.path.abspath(__file__))
it = os.path.join(here, sys.argv[1])
rows = []
for path in sorted(glob.glob(f"{it}/audits/*.json")):
    a = json.load(open(path, encoding="utf8"))
    qid = a["questionId"]
    brief = json.load(open(f"{it}/briefs/{qid}.json", encoding="utf8"))
    log = open(f"{it}/briefs/{qid}.log", encoding="utf8").read()
    ratings = [c.get("rating") for c in a.get("claimVerdicts", [])]
    rows.append({
        "q": qid, "tier": brief["evidenceConfidence"]["tier"], "claims": len(brief["claims"]), "sources": len(brief["sources"]),
        "gates": "PASS" if "FAIL" not in log else "FAIL",
        "supported": sum(r == "supported" for r in ratings), "minor": sum(r == "minor" for r in ratings),
        "over": sum(r == "overstated" for r in ratings), "unsup": sum(r == "unsupported" for r in ratings),
        "critical": len(a.get("criticalFailures", [])), "useful": a.get("useful"), "score": a.get("usefulnessScore"),
        "crit": "; ".join(f"{c.get('location')}: {c.get('note')}" for c in a.get("criticalFailures", [])),
    })
n = len(rows)
crit = sum(r["critical"] for r in rows)
useful = sum(1 for r in rows if r["useful"])
out = [
    f"# Drafter evaluation, {sys.argv[1]}",
    "",
    f"- Briefs: {n}. Structure and source-excerpt gates passed: {sum(r['gates'] == 'PASS' for r in rows)}/{n}.",
    f"- Critical integrity failures: {crit} (in {sum(1 for r in rows if r['critical'])} briefs). Target: 0.",
    f"- Rated useful: {useful}/{n} ({round(100 * useful / max(n, 1))}%). Target: at least 80%.",
    f"- Claims: {sum(r['claims'] for r in rows)} total; supported {sum(r['supported'] for r in rows)}, minor {sum(r['minor'] for r in rows)}, overstated {sum(r['over'] for r in rows)}, unsupported {sum(r['unsup'] for r in rows)}.",
    "",
    "| Question | Tier | Claims | Sources | Gates | Critical | Useful | Score |",
    "|---|---|---|---|---|---|---|---|",
]
out += [f"| {r['q']} | {r['tier']} | {r['claims']} | {r['sources']} | {r['gates']} | {r['critical']} | {'yes' if r['useful'] else 'no'} | {r['score']} |" for r in rows]
out += ["", "## Critical failures", ""]
out += [f"- **{r['q']}**: {r['crit']}" for r in rows if r["critical"]] or ["- None."]
open(f"{it}/README.md", "w", encoding="utf8").write("\n".join(out) + "\n")
print("\n".join(out[:6]))

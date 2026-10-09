"""Write the human review file for an assembled batch.

Usage: python3 scripts/haiku-batch/review_md.py <workdir> <first-batch> <last-batch> <out.md> [extra-notes.md]
Reads <workdir>/review.json and <workdir>/verified/*.json. Lists scope calls, identity mismatches,
missing DOIs and high-priority spot checks, using the auditor's own change notes and concerns.
"""
import json, re, sys, collections

W, FIRST, LAST, OUT = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
extra = open(sys.argv[5], encoding="utf8").read().strip() if len(sys.argv) > 5 else ""
review = json.load(open(f"{W}/review.json", encoding="utf8"))
ver = {r["qid"]: json.load(open(f"{W}/verified/{r['qid']}.json", encoding="utf8")) for r in review}

def short(t, n=330):
    t = re.sub(r"\s+", " ", t or "").strip()
    return t if len(t) <= n else t[: n - 3].rstrip() + "..."

def label(r):
    return f"**{r['qid']}** ({r['decision']}{', ID ' + r['paperId'] if r['paperId'] else ''}) {r['title'][:110]}"

c = collections.Counter(r["decision"] for r in review)
ids = [int(r["paperId"]) for r in review if r["paperId"]]
BORDER = re.compile(r"borderline|judg|reviewer may|operator may|may prefer|could reasonably|relevance|in scope|out of scope|not athletes|no athletes|non-athlete", re.I)
IDENT = re.compile(r"identity mismatch|different article", re.I)
scope, mismatch, degraded, spot = [], [], [], []
for r in review:
    v = ver[r["qid"]]
    reason = v.get("exclusionReason") or v.get("degradedReason") or ""
    if r["decision"] == "EXCLUDE" and IDENT.search(reason):
        mismatch.append((r, reason))
    elif r["decision"] == "DEGRADED":
        degraded.append((r, reason))
    elif r["decision"] == "EXCLUDE" or r["status"] == "DECISION_CHANGED" or BORDER.search(r["concerns"] or ""):
        scope.append((r, reason or r["concerns"]))
    if r["priority"] == "high":
        spot.append(r)

out = [
    f"# Batches {FIRST}-{LAST} review",
    "",
    "Backlog queue drawn from the coverage manifest's unrepresented content groups (one canonical file per group). "
    "Claude Haiku 5.5 drafted each record from the PDF text; Claude Opus 5.5 audited every claim against the source "
    "text and corrected it in place. Each screening record's `workflow` field holds the audit notes.",
    "",
    "| | Count |",
    "|---|---|",
    f"| INCLUDE{f', published as IDs {min(ids)}-{max(ids)}' if ids else ''} | {c['INCLUDE']} |",
    f"| EXCLUDE | {c['EXCLUDE']} |",
    f"| DEGRADED | {c['DEGRADED']} |",
    f"| Corrected by the claim audit | {sum(1 for r in review if r['status'] in ('CORRECTED', 'DECISION_CHANGED'))} |",
    f"| Decision changed by the audit | {sum(1 for r in review if r['status'] == 'DECISION_CHANGED')} |",
    f"| High-priority spot checks | {len(spot)} |",
    "",
]
if extra:
    out += [extra, ""]
out += ["## Your calls (scope and eligibility)", ""]
out += [f"- {label(r)}: {short(reason)}" for r, reason in scope] or ["- None."]
out += ["", "## Wrong PDF on disk (identity mismatch)", ""]
out += [f"- {label(r)}: {short(reason)}" for r, reason in mismatch] or ["- None."]
out += ["", "## DEGRADED (DOI or year not printed, or text incomplete)", ""]
out += [f"- {label(r)}: {short(reason)}" for r, reason in degraded] or ["- None."]
out += ["", "## High-priority spot checks", "", "Clinically sensitive topics, decision changes, substantive corrections, or remaining concerns.", ""]
for r in spot:
    out.append(f"- {label(r)}")
    if r["changes"]:
        out.append(f"  - Audit changes: {short('; '.join(r['changes']), 420)}")
    if r["concerns"]:
        out.append(f"  - Concern: {short(r['concerns'])}")
open(OUT, "w", encoding="utf8").write("\n".join(out) + "\n")
print(f"wrote {OUT}: {len(scope)} scope calls, {len(mismatch)} mismatches, {len(degraded)} degraded, {len(spot)} spot checks")

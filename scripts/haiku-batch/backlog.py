"""List the unscreened backlog: one canonical PDF per unique content group with no published record and no
screening decision. Usage: python3 scripts/haiku-batch/backlog.py [out.txt] [--start N --count K]
Without slicing it writes the whole queue in filename order; prepare.py --files takes a slice of it.
"""
import glob, json, os, re, sys, unicodedata, urllib.parse

def norm(name):
    # Same normalization as scripts/audit-library.mjs: links may differ from filenames in quotes, dashes or case.
    name = unicodedata.normalize("NFKC", name)
    name = re.sub("[\u2018\u2019]", "'", name)
    name = re.sub("[\u2013\u2014]", "-", name)
    return re.sub(r"\s+", " ", name).strip().lower()


R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
manifest = json.load(open(f"{R}/docs/library-coverage-manifest.json", encoding="utf8"))
represented = set()
for paper in json.load(open(f"{R}/papers.json", encoding="utf8")):
    url = paper.get("driveUrl") or ""
    if "/SourcePapers/" in url:
        represented.add(norm(urllib.parse.unquote(url.split("/SourcePapers/", 1)[1])))
screened = {r["sourceFile"] for f in glob.glob(f"{R}/docs/pilot-screening/*.json") for r in json.load(open(f, encoding="utf8"))["records"]}
groups = {f: g["files"] for g in manifest["details"]["duplicateSourceContentGroups"] for f in g["files"]}
seen, queue = set(), []
for name in sorted(os.listdir(f"{R}/SourcePapers")):
    if not name.lower().endswith(".pdf"):
        continue
    group = tuple(sorted(groups.get(name, [name])))
    if group in seen:
        continue
    seen.add(group)
    if not any(norm(f) in represented or f in screened for f in group):
        queue.append(name)
start = int(sys.argv[sys.argv.index("--start") + 1]) if "--start" in sys.argv else 0
count = int(sys.argv[sys.argv.index("--count") + 1]) if "--count" in sys.argv else len(queue)
out = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else None
chunk = queue[start:start + count]
if out:
    open(out, "w", encoding="utf8").write("\n".join(chunk) + "\n")
print(f"{len(queue)} unscreened backlog PDFs; wrote {len(chunk)}" + (f" to {out}" if out else ""))

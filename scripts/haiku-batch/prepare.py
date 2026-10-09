"""Prepare a Haiku batch workdir: extract text, page counts and DOI candidates.

Usage: python3 scripts/haiku-batch/prepare.py <workdir> [--from-shortlist | --files list.txt]
Writes <workdir>/inputs.json, <workdir>/text/<ID>.txt, <workdir>/taxonomy.json and copies the
drafting/verification instructions. IDs are Q01..Qnn in input order.
"""
import json, os, re, shutil, subprocess, sys

R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
W = os.path.abspath(sys.argv[1]); os.makedirs(f"{W}/text", exist_ok=True)
for d in ("drafts", "verified"): os.makedirs(f"{W}/{d}", exist_ok=True)
if "--files" in sys.argv:
    rows = [{"sourceFile": l.strip(), "pilotDomain": None, "queueOrder": i + 1}
            for i, l in enumerate(open(sys.argv[sys.argv.index("--files") + 1], encoding="utf8")) if l.strip()]
else:
    rows = json.load(open(f"{R}/docs/pilot-expansion-shortlist.json"))["candidates"]
inputs = []
for i, x in enumerate(rows, 1):
    pid = f"Q{i:02d}"; f = f"{R}/SourcePapers/{x['sourceFile']}"
    txt = subprocess.run(["pdftotext", "-layout", f, "-"], capture_output=True, text=True).stdout
    info = subprocess.run(["pdfinfo", f], capture_output=True, text=True).stdout
    m = re.search(r"Pages:\s+(\d+)", info)
    open(f"{W}/text/{pid}.txt", "w").write(txt)
    dois = sorted({d.rstrip(".,;)") for d in re.findall(r'10\.\d{4,9}/[^\s"<>]+', txt)})
    inputs.append({"id": pid, "queueOrder": x.get("queueOrder", i), "pilotDomain": x.get("pilotDomain"),
                   "sourceFile": x["sourceFile"], "pages": int(m.group(1)) if m else 0,
                   "extractedCharacters": len(re.sub(r"\s+", " ", txt)), "doiCandidatesInText": dois[:6]})
json.dump(inputs, open(f"{W}/inputs.json", "w"), indent=1)
subprocess.run(["node", "-e", f"import('{R}/evidence-taxonomy.mjs').then(m=>require('fs').writeFileSync('{W}/taxonomy.json',JSON.stringify(m.TAXONOMY,null,1)))"], check=True)
here = os.path.dirname(os.path.abspath(__file__))
shutil.copy(f"{here}/drafting-instructions.md", f"{W}/INSTRUCTIONS.md")
shutil.copy(f"{here}/verification-instructions.md", f"{W}/VERIFY.md")
short = [x["id"] for x in inputs if x["extractedCharacters"] < 2000]
print(f"{len(inputs)} papers prepared in {W}; low-text: {short}")

"""Validate verified records before assembly. Usage: python3 scripts/haiku-batch/validate.py <workdir>"""
import json, re, sys
W = sys.argv[1]; T = json.load(open(f"{W}/taxonomy.json"))
inp = {x["id"]: x for x in json.load(open(f"{W}/inputs.json"))}
norm = lambda s: re.sub(r"\s+", " ", s.replace("\xa0", " ")).strip()
bad = []
for k, i in inp.items():
    try: v = json.load(open(f"{W}/verified/{k}.json"))
    except Exception as e: bad.append((k, "unreadable", str(e))); continue
    if v.get("id") != k: bad.append((k, "id", v.get("id")))
    if norm(v.get("sourceFile") or "") != norm(i["sourceFile"]): bad.append((k, "sourceFile"))
    dec = v.get("decision")
    if dec not in ("INCLUDE", "EXCLUDE", "DEGRADED"): bad.append((k, "decision", dec))
    if dec == "INCLUDE":
        txt = open(f"{W}/text/{k}.txt").read().lower(); d = (v["paper"].get("doi") or "").lower()
        if not d or (d not in txt and d not in re.sub(r"\s+", "", txt)): bad.append((k, "doi not in text", d))
        if not isinstance(v["paper"].get("year"), int): bad.append((k, "year"))
        for f in ("domains", "audiences", "sports", "populations"):
            if not v.get(f): bad.append((k, "empty", f))
            bad += [(k, f, x) for x in v.get(f) or [] if x not in T[f]]
        if v.get("studyDesign") not in T["studyDesigns"]: bad.append((k, "studyDesign"))
        if v.get("primaryDomain") not in (v.get("domains") or []): bad.append((k, "primaryDomain"))
        for f in ("evidenceSummary", "screeningLimitations", "synthesisCaution"):
            if not (v.get(f) or "").strip(): bad.append((k, "blank", f))
        for f in ("citation", "abstract", "tldr", "methods", "findings", "limitations", "practicalImplications", "athleteDev", "rtp"):
            if not (v["paper"].get(f) or "").strip(): bad.append((k, "blank paper", f))
    elif dec == "EXCLUDE" and not v.get("exclusionReason"): bad.append((k, "no exclusionReason"))
    elif dec == "DEGRADED" and not v.get("degradedReason"): bad.append((k, "no degradedReason"))
print("OK" if not bad else bad); sys.exit(1 if bad else 0)

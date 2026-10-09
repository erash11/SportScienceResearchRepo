"""Assemble verified records into screening + synthesis batch files (one batch per domain).

Usage: python3 scripts/haiku-batch/assemble.py <workdir> <YYYY-MM-DD> <next-unused-id> <first-batch-number>
Writes <workdir>/assembled.json (repo path -> batch JSON) and <workdir>/review.json. Requires pilotDomain
on every input; for manifest-driven backlog queues, assign pilotDomain from the verified primaryDomain first.
"""
import json,os,re,sys
B=os.path.abspath(sys.argv[1]); R=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TODAY=sys.argv[2]; NEXT_ID=int(sys.argv[3]); FIRST_BATCH=int(sys.argv[4])
inputs={x['id']:x for x in json.load(open(f'{B}/inputs.json'))}
DOM_ORDER=["Training & Performance","Sports Medicine & Injury","Rehabilitation & Return to Sport","Recovery & Readiness","Nutrition & Hydration","Brain Health & Psychology","Athlete Wellbeing","Monitoring & Technology"]
slug=lambda d:re.sub(r'[^a-z]+','-',d.lower().replace('&','')).strip('-')
def clean(v):
    if isinstance(v,str):
        v=re.sub(r'\s*—\s*',', ',v); v=re.sub(r'(?<=\d)\s*–\s*(?=\d)','-',v); v=v.replace('–','-')
        return v.strip()
    if isinstance(v,list): return [clean(x) for x in v]
    if isinstance(v,dict): return {k:clean(x) for k,x in v.items()}
    return v
F=["id","year","citation","doi","abstract","tldr","methods","findings","limitations","practicalImplications","athleteDev","rtp"]
recs={}
for pid in sorted(inputs):
    p=f'{B}/verified/{pid}.json'
    if not os.path.exists(p): sys.exit(f'missing verified {pid}')
    recs[pid]=clean(json.load(open(p)))
nid=NEXT_ID; out={}; review=[]
bn=FIRST_BATCH-1
for dom in DOM_ORDER:
    ids=[k for k in sorted(inputs) if inputs[k]['pilotDomain']==dom]
    if not ids: continue  # a domain with no papers in this queue gets no batch number
    bn+=1; sb=f'batch-{bn}-{slug(dom)}'; syb=f'pilot-synthesis-batch-{bn}'
    q=[inputs[k]['queueOrder'] for k in ids]
    scr=[];syn=[]
    for k in ids:
        v=recs[k]; inp=inputs[k]; dec=v['decision']
        r={'originalQueueOrder':inp['queueOrder'],'sourceFile':inp['sourceFile'],'decision':dec}
        if dec=='INCLUDE':
            pap=v['paper']; doi=(pap.get('doi') or '').strip()
            assert doi, k
            r['sourceVerification']={'status':'PASS','pages':inp['pages'],'extractedCharacters':inp['extractedCharacters'],'doi':doi,'doiVerification':'DOI printed in the local PDF text.'}
            for f in ['studyDesign','primaryDomain','domains','audiences','sports','populations','evidenceSummary']: r[f]=v[f]
            r['limitations']=v['screeningLimitations']; r['synthesisCaution']=v['synthesisCaution']
            paper={'id':str(nid),**{f:pap.get(f) for f in F[1:]}}; paper['doi']=doi; paper['year']=int(paper['year'])
            paper={f:paper[f] for f in F}
            syn.append({'sourceFile':inp['sourceFile'],'paper':paper}); nid+=1
        elif dec=='EXCLUDE': r['exclusionReason']=v['exclusionReason']
        else: r['degradedReason']=v['degradedReason']
        r['workflow']={'draftedBy':'claude-haiku-5-5','verifiedBy':'claude-opus-5-5 claim audit','verification':v.get('verification')}
        scr.append(r)
        ver=v.get('verification') or {}
        review.append({'qid':k,'batch':bn,'domain':dom,'decision':dec,'paperId':syn[-1]['paper']['id'] if dec=='INCLUDE' else '','title':inp['sourceFile'][:-4],'status':ver.get('status'),'priority':ver.get('spotCheckPriority'),'changes':ver.get('changes',[]),'concerns':ver.get('residualConcerns','')})
    out[f'docs/pilot-screening/{sb}.json']={'schemaVersion':1,'batchId':sb,'screenedOn':TODAY,'screeningScope':f'Full-text source, eligibility, taxonomy, and synthesis-readiness review of {dom} queue positions {min(q)}-{max(q)}. Drafted by Claude Haiku 5.5 and claim-audited against source text by Claude Opus 5.5 (docs/haiku-calibration/).','decisionDefinitions':{'INCLUDE':'Eligible for evidence extraction and synthesis after full-text review.','EXCLUDE':'Not eligible; exclusion reason required.','DEGRADED':'A required source or verification element was unavailable.'},'records':scr}
    if syn: out[f'docs/pilot-synthesis/batch-{bn}.json']={'schemaVersion':1,'batchId':syb,'sourceScreeningBatch':sb,'preparedOn':TODAY,'records':syn}
json.dump(out,open(f'{B}/assembled.json','w'),indent=1); json.dump(review,open(f'{B}/review.json','w'),indent=1)
import collections
print(collections.Counter(r['decision'] for r in review), 'IDs',NEXT_ID,'-',nid-1, collections.Counter(r['priority'] for r in review), collections.Counter(r['status'] for r in review))

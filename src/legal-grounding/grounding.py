"""Closed-vocabulary, annotation-based grounding audit; no pixel inference or LLM judge."""
import argparse
import json
import math
import re
from pathlib import Path

EXPERIMENTS = ('without_enthymeme','without_context','without_image','all_inputs')

def parse_output(text):
    # Parse the complete formal output; never scrape predicates from commentary.
    text = text.strip().rstrip('.')
    tokens = re.findall(r'[a-z][a-z0-9_]*|[(),\[\]]', text)
    if ''.join(tokens) != re.sub(r'\s+', '', text):
        raise ValueError('Unsupported syntax: lowercase terms and [premises],conclusion required')
    pos = 0
    def take(t):
        nonlocal pos
        if pos >= len(tokens) or tokens[pos] != t: raise ValueError('Expected '+t)
        pos += 1
    def term():
        nonlocal pos
        if pos >= len(tokens) or not re.fullmatch('[a-z][a-z0-9_]*',tokens[pos]): raise ValueError('Expected term')
        name=tokens[pos];pos+=1
        if pos<len(tokens) and tokens[pos]=='(':
            take('(');args=[term()]
            while pos<len(tokens) and tokens[pos]==',': take(',');args.append(term())
            take(')'); return name+'('+','.join(args)+')'
        return name
    take('['); premises=[]
    if pos<len(tokens) and tokens[pos]!=']':
        premises.append(term())
        while pos<len(tokens) and tokens[pos]==',':take(',');premises.append(term())
    take(']');take(',');conclusion=term()
    if pos!=len(tokens):raise ValueError('Trailing text')
    return premises,conclusion

def valid_box(b):
    return isinstance(b,list) and len(b)==4 and all(type(x) in (int,float) and math.isfinite(x) for x in b) and 0<=b[0]<b[2]<=1 and 0<=b[1]<b[3]<=1

def iou(a,b):
    if not valid_box(a) or not valid_box(b):return 0
    w=max(0,min(a[2],b[2])-max(a[0],b[0]));h=max(0,min(a[3],b[3])-max(a[1],b[1]));inter=w*h
    return inter/((a[2]-a[0])*(a[3]-a[1])+(b[2]-b[0])*(b[3]-b[1])-inter)

def evaluate(case,condition,output,evidence=None):
    if condition not in EXPERIMENTS:raise ValueError('Unknown condition')
    premises,conclusion=parse_output(output)
    predicted=set(premises+[conclusion]);gold={f['atom']:f for f in case['facts']}
    abstention='undetermined(visual_facts,doc1)'
    allowed=set(gold)|set(case['derived'])|{abstention}
    unknown=predicted-allowed
    retrieved=predicted&set(gold)
    visible=condition!='without_image'
    # A correct remembered fact in a no-image condition has no support in that input.
    unsupported=unknown | (retrieved if not visible else set())
    evidence=evidence or []
    if len({e['atom'] for e in evidence})!=len(evidence):raise ValueError('Duplicate evidence atom')
    if any(e['atom'] not in predicted for e in evidence):raise ValueError('Evidence does not map to a generated atom')
    localized=set()
    for e in evidence:
        atom=e['atom']
        if visible and atom in gold and e.get('source')=='image' and e.get('image_sha256')==case['sha256_image'] and e.get('page')==1 and iou(e.get('bbox'),gold[atom]['bbox'])>=.5:
            localized.add(atom)
    derived_ok=conclusion in case['derived'] and set(gold)<=set(premises) and visible
    n=len(predicted-{abstention})
    return {'case_id':case['id'],'condition':condition,'reference_status':case['reference_status'],
        'reference_fact_precision':len(retrieved)/len(predicted&set(gold)|unknown) if (predicted&set(gold)|unknown) else None,
        'reference_fact_recall':len(retrieved)/len(gold),
        'localized_fact_precision':len(localized)/len(retrieved|unknown) if visible and (retrieved|unknown) else None,
        'localized_fact_recall':len(localized)/len(gold) if visible else None,
        'visual_support_applicable':visible,'unsupported_atoms':sorted(unsupported),
        'derived_conclusion_supported':derived_ok,
        'conclusion_exact_match':conclusion in case['derived'],
        'abstained':abstention in predicted,
        'unsupported_input_assertions':len(unsupported),
        'all_claims_supported_by_input':not unsupported and (derived_ok or conclusion==abstention),
        'evidence_missing':visible and bool(retrieved-localized),
        'all_visual_claims_localized':visible and bool(retrieved) and retrieved==localized and not unknown,
        'note':'Reference agreement and region overlap are annotation-based proxies, not automatic proof of visual entailment.'}

def main():
    p=argparse.ArgumentParser();p.add_argument('responses');p.add_argument('--cases',default=str(Path(__file__).with_name('cases.json')));a=p.parse_args()
    cases={c['id']:c for c in json.loads(Path(a.cases).read_text())};seen=set()
    for line in Path(a.responses).read_text().splitlines():
        if not line.strip():continue
        r=json.loads(line);key=(r['case_id'],r['condition'],r.get('model'),r.get('repeat',1))
        if key in seen:raise ValueError('Duplicate run key')
        seen.add(key)
        if r.get('status')=='error':
            print(json.dumps({'case_id':r['case_id'],'condition':r['condition'],'status':'transport_or_output_error','error_type':r.get('error_type')}));continue
        try: result=evaluate(cases[r['case_id']],r['condition'],r['model_output'],r.get('evidence'))
        except ValueError as e:result={'case_id':r['case_id'],'condition':r['condition'],'parse_error':str(e)}
        result.update(model=r.get('model'),repeat=r.get('repeat',1))
        print(json.dumps(result,ensure_ascii=False))
if __name__=='__main__':main()

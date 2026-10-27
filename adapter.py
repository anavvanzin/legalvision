"""Reuse upstream request construction and metrics without modifying its files."""
import argparse
import hashlib
import importlib.util
import json
import os
import random
import sys
from pathlib import Path
from grounding import EXPERIMENTS
ROOT=Path(__file__).resolve().parent

def load_upstream(path):
    lock=json.loads((ROOT/'upstream.json').read_text())
    for name,digest in lock['files'].items():
        if hashlib.sha256((path/name).read_bytes()).hexdigest()!=digest:raise ValueError('Upstream snapshot mismatch: '+name)
    modules=[]
    for name in ['main','validation']:
        key='legal_upstream_'+name
        spec=importlib.util.spec_from_file_location(key,path/(name+'.py'));m=importlib.util.module_from_spec(spec);sys.modules[key]=m;spec.loader.exec_module(m);modules.append(m)
    return modules

def jobs(upstream,repeat=3,seed=26):
    main,_=load_upstream(upstream)
    for case in json.loads((ROOT/'cases.json').read_text()):
        for field,digest in [('image','sha256_image'),('source_pdf','sha256_pdf')]:
            if hashlib.sha256((ROOT/case[field]).read_bytes()).hexdigest()!=case[digest]:raise ValueError('Asset checksum mismatch')
    examples=(upstream/'all_examples.txt').read_text().splitlines(keepends=True)
    out=[]
    for case in json.loads((ROOT/'cases.json').read_text()):
        for rep in range(1,repeat+1):
            for condition in EXPERIMENTS:
                e=case['enthymeme'] if condition!='without_enthymeme' else ''
                c=case['context'] if condition!='without_context' else ''
                fn=main.build_prompt_without_image if condition=='without_image' else main.build_prompt
                # Sidecar extension instruction identical across conditions; no reference facts leak.
                contract='\nUse only these predicates: printed_recipient_role(doc1,ROLE), blank_recipient_name(doc1), recipient_identity_undetermined(doc1), undetermined(visual_facts,doc1). ROLE may be defendant, third_party_defendant, or plaintiff_attorney_or_unrepresented_plaintiff. If no visual input is supplied, do not guess visual facts. Output [premises],conclusion. No speaker is supplied; do not fabricate one to fill a scheme. Return the final_output block only.'
                out.append({'case_id':case['id'],'condition':condition,'repeat':rep,'prompt':fn(examples,e,c)+contract,'image':case['image'] if condition!='without_image' else None,'image_sha256':case['sha256_image'] if condition!='without_image' else None})
    random.Random(seed).shuffle(out);return out

def main():
    p=argparse.ArgumentParser();p.add_argument('mode',choices=['prepare','metrics']);p.add_argument('--upstream',type=Path,required=True);p.add_argument('--responses',type=Path);p.add_argument('--repeat',type=int,default=3);p.add_argument('--semantic',action='store_true',help='Run unchanged upstream semantic judge using DEEPSEEK_API_KEY');a=p.parse_args()
    if a.mode=='prepare':
        if a.repeat<1:p.error('repeat must be positive')
        for job in jobs(a.upstream,a.repeat): print(json.dumps(job,ensure_ascii=False))
    else:
        _,validation=load_upstream(a.upstream)
        cases={c['id']:c for c in json.loads((ROOT/'cases.json').read_text())}
        client=None
        if a.semantic:
            if not os.environ.get('DEEPSEEK_API_KEY'):p.error('Missing DEEPSEEK_API_KEY')
            from openai import OpenAI
            client=OpenAI(api_key=os.environ['DEEPSEEK_API_KEY'],base_url='https://api.deepseek.com')
        if a.responses is None:p.error('--responses required')
        # Scheme metric is called unchanged. Semantic judge remains unrun until explicitly supplied.
        for line in a.responses.read_text().splitlines():
            if not line.strip():continue
            r=json.loads(line)
            if r.get('status')=='error':continue
            print(json.dumps({'case_id':r['case_id'],'condition':r['condition'],'expected_output':cases[r['case_id']]['expected_output'],'model_output':r['model_output'],'scheme_correct':validation.scheme_correct(r['model_output']),'semantic_match':validation.semantic_correct(client,cases[r['case_id']]['expected_output'],r['model_output']) if client else None,'semantic_status':'upstream_judge' if client else 'not_run'},ensure_ascii=False))
if __name__=='__main__':main()

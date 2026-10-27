"""Optional live run. Uses an existing API key from environment; never logs it."""
import argparse
from contextlib import ExitStack
from datetime import datetime,timezone
import json
import os
from pathlib import Path
from types import SimpleNamespace
from adapter import ROOT,load_upstream,jobs

def main():
    p=argparse.ArgumentParser();p.add_argument('--upstream',type=Path,required=True);p.add_argument('--provider',choices=['openai','claude','deepseek'],required=True);p.add_argument('--model',required=True);p.add_argument('--repeat',type=int,default=3);p.add_argument('--out',type=Path,required=True);a=p.parse_args()
    if a.repeat<1:p.error('repeat must be positive')
    env={'openai':'OPENAI_API_KEY','claude':'ANTHROPIC_API_KEY','deepseek':'DEEPSEEK_API_KEY'}
    key=os.environ.get(env[a.provider]);
    if not key:p.error('Missing '+env[a.provider])
    main_module,_=load_upstream(a.upstream)
    args=SimpleNamespace(**{n+'_api_key':key if n==a.provider else None for n in env})
    # New output only: never overwrite experimental records.
    with a.out.open('x',encoding='utf-8') as f,ExitStack() as stack:
        clients=main_module.create_model_clients(args,stack);provider,_,client=clients[0]
        for job in jobs(a.upstream,a.repeat):
            record={**job,'model':a.model,'provider':provider,'timestamp_utc':datetime.now(timezone.utc).isoformat(),'parameters':'upstream request_model defaults; Claude max_tokens=8192','status':'pending'}
            try:
                b64=main_module.encode_image(ROOT/job['image']) if job['image'] else None
                raw=main_module.request_model(provider,a.model,client,job['prompt'],b64)
                record.update(raw_response=raw,model_output=main_module.extract_final_output(raw),status='completed')
            except Exception as exc:record.update(status='error',error_type=type(exc).__name__)
            # Avoid exception messages: some SDK errors can contain request data.
            f.write(json.dumps(record,ensure_ascii=False)+'\n');f.flush()
if __name__=='__main__':main()

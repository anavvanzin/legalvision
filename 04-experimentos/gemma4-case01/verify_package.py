#!/usr/bin/env python3
"""Read-only integrity check of this prepared bundle, before recording model runs."""
import hashlib
import json
from pathlib import Path
import sys

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'MANIFESTO-SHA256.json').read_text(encoding='utf-8'))
failures = []
for name, record in manifest['files'].items():
    path = root / name
    if not path.is_file():
        failures.append('missing: ' + name)
    elif hashlib.sha256(path.read_bytes()).hexdigest() != record['sha256']:
        failures.append('changed: ' + name)
for path in root.rglob('*.json'):
    try:
        json.loads(path.read_text(encoding='utf-8'))
    except (ValueError, OSError) as error:
        failures.append('invalid JSON: ' + str(path.relative_to(root)) + ': ' + str(error))
if (root / 'evaluator-only/results/results.jsonl').stat().st_size != 0:
    failures.append('results.jsonl was filled; this check targets the original prepared package')
if len((root / 'evaluator-only/results/results.csv').read_text().splitlines()) != 1:
    failures.append('results.csv was filled; this check targets the original prepared package')
print(json.dumps({'package_files_checked': len(manifest['files']), 'failures': failures,
                  'passed': not failures, 'scope': 'Prepared-package bytes and JSON only; no model run or legal/visual validation.'},
                 ensure_ascii=False, indent=2))
sys.exit(1 if failures else 0)

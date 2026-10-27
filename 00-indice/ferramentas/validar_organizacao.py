#!/usr/bin/env python3
"""Read-only staged/central integrity and active-navigation checks; no model runs."""
import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

parser = argparse.ArgumentParser()
parser.add_argument('root', type=Path)
args = parser.parse_args()
root = args.root.resolve()
failures = []
active_links = []
historical_links = []
external_links = []


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        for name in ('href', 'src'):
            if values.get(name):
                self.refs.append(values[name])


def is_historical(path):
    return (any(x in path.parts for x in ('registros-originais', 'pacotes-originais',
            'preparacao-original', 'originais', 'background', 'registros')) or
            path.name.endswith('.original.md') or
            'baseline-meteorologico-guilherme' in path.parts or
            'preflight-mac' in path.parts)


for path in sorted(root.rglob('*')):
    if not path.is_file() or '.git' in path.parts or path.name == '.DS_Store':
        continue
    if path.suffix == '.json':
        try:
            json.loads(path.read_text())
        except (ValueError, OSError) as error:
            failures.append({'file': str(path.relative_to(root)), 'error': str(error)})
    if path.suffix not in ('.md', '.html'):
        continue
    text = path.read_text()
    if path.suffix == '.md':
        refs = re.findall(r'(?<!!)\[[^\]]*\]\((<[^>]+>|[^\s)]+)(?:\s+[^)]*)?\)', text)
    else:
        links = Links()
        links.feed(text)
        refs = links.refs
    for raw in refs:
        ref = raw[1:-1] if raw.startswith('<') and raw.endswith('>') else raw
        parsed = urlsplit(ref)
        record = {'document': str(path.relative_to(root)), 'target': ref}
        if parsed.scheme or parsed.netloc or ref.startswith('#'):
            external_links.append(record)
            continue
        target_text = unquote(parsed.path)
        target_text = re.sub(r':\d+$', '', target_text)
        target = Path(target_text) if target_text.startswith('/') else path.parent / target_text
        record['exists_in_checked_environment'] = target.exists()
        if is_historical(path) or target_text.startswith('/'):
            record['scope'] = 'historical_reference_preserved; not a portable navigation guarantee'
            historical_links.append(record)
        else:
            active_links.append(record)
            if not target.exists():
                failures.append(record)

pkg = root / '04-experimentos/gemma4-case01'
manifest = json.loads((pkg / 'MANIFESTO-SHA256.json').read_text())
for name, entry in manifest['files'].items():
    path = pkg / name
    if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != entry['sha256']:
        failures.append({'package_hash': name})
results = pkg / 'evaluator-only/results'
if (results / 'results.jsonl').stat().st_size != 0:
    failures.append({'result_state': 'JSONL unexpectedly nonempty'})
if len((results / 'results.csv').read_text().splitlines()) != 1:
    failures.append({'result_state': 'CSV unexpectedly contains results'})
for path in (pkg / 'model-input').rglob('*'):
    if path.is_file() and path.suffix in ('.txt', '.json'):
        text = path.read_text().lower()
        for term in ('dutch bicycle', 'petar', 'preto', 'black', 'commons.wikimedia',
                     'gold.json', 'accepted_values'):
            if term in text:
                failures.append({'model_input_leak': str(path.relative_to(root)), 'term': term})
image = (pkg / 'model-input/images/case01.jpg').read_bytes()
if b'Dutch bicycle' in image or b'Exif\x00\x00' in image:
    failures.append({'image_metadata': 'descriptive Exif present'})
state = json.loads((root / '05-resultados/juridico-gemma/estado.json').read_text())
if state['candidate_model_runs'] != 0 or state['status'] != 'paused_not_executed':
    failures.append({'pilot_state': 'Unexpected active state'})
print(json.dumps({'root': str(root), 'passed': not failures, 'failures': failures,
                  'active_internal_links_checked': len(active_links),
                  'historical_references_preserved': len(historical_links),
                  'external_references_not_integral_backup': len(external_links),
                  'candidate_model_runs': 0, 'model_input_leak_scan_passed': not any('model_input_leak' in x for x in failures),
                  'active_links': active_links, 'historical_links': historical_links},
                 ensure_ascii=False, indent=2))
raise SystemExit(1 if failures else 0)

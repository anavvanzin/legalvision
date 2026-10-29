"""Valida a fronteira neutra do lote adicional usando somente arquivos locais."""
import hashlib
import json
from pathlib import Path

CASE_KEYS = {'case_id', 'asset_id', 'image', 'image_sha256', 'context', 'enthymeme', 'provided_rule', 'output_contract', 'vocabulary'}
ROW_KEYS = {'record_type', 'status', 'case_id', 'condition', 'repeat', 'prompt', 'image', 'image_sha256'}
CONDITIONS = ['with_image', 'without_image']
ABSTENTION = '[],undetermined(visual_facts,doc1)'


# The notebook is standalone; its canonical composition is checked against this copy.
def compose_prompt(case):
    return "\n\n".join([
        f"CASO: {case['case_id']}.",
        "Use somente o contexto, o entimema, a regra e o contrato abaixo e, na condição with_image, os pixels fornecidos. Não use fontes externas, metadados descritivos ou outras conversas.",
        "CONTEXTO\n" + case["context"],
        "ENTIMEMA\n" + case["enthymeme"],
        "REGRA FORNECIDA\n" + case["provided_rule"],
        "CONTRATO DE SAÍDA\n" + json.dumps(case["output_contract"], ensure_ascii=False),
        "VOCABULÁRIO\n" + json.dumps(case.get("vocabulary", {}), ensure_ascii=False),
    ])


def read_cases(root, ids):
    cases = []
    for case_id in ids:
        case = json.loads((root / f'{case_id}.json').read_text(encoding='utf-8'))
        if set(case) != CASE_KEYS:
            raise ValueError('campos não permitidos no caso')
        if case['case_id'] != case_id or case['image'] != f'images/{case_id}.png':
            raise ValueError('ID ou caminho da imagem divergente')
        image = (root / case['image']).resolve()
        if not image.is_relative_to(root.resolve()) or not image.is_file():
            raise ValueError('imagem fora da pasta neutra ou ausente')
        data = image.read_bytes()
        if not data.startswith(b'\x89PNG\r\n\x1a\n') or hashlib.sha256(data).hexdigest() != case['image_sha256']:
            raise ValueError('imagem ou hash divergente')
        if not all(isinstance(case[k], str) and case[k].strip() for k in ('asset_id', 'context', 'enthymeme', 'provided_rule')):
            raise ValueError('texto obrigatório ausente')
        contract = case['output_contract']
        if set(contract) != {'format', 'without_image', 'allowed_atoms'} or contract['without_image'] != ABSTENTION:
            raise ValueError('contrato neutro divergente')
        if not isinstance(contract['allowed_atoms'], list) or 'undetermined(visual_facts,doc1)' not in contract['allowed_atoms']:
            raise ValueError('vocabulário sem abstenção')
        cases.append(case)
    return cases


def read_records(root, cases):
    rows = [json.loads(line) for line in (root / 'prepared-inputs.jsonl').read_text(encoding='utf-8').splitlines() if line.strip()]
    by_id = {case['case_id']: case for case in cases}
    expected = {(case_id, condition) for case_id in by_id for condition in CONDITIONS}
    keys = [(row.get('case_id'), row.get('condition')) for row in rows]
    if len(keys) != len(expected) or set(keys) != expected:
        raise ValueError('registros ausentes ou duplicados')
    for row in rows:
        if set(row) != ROW_KEYS or row['record_type'] != 'prepared_input' or row['status'] != 'prepared_not_executed':
            raise ValueError('campos ou estado do registro divergentes')
        if type(row['repeat']) is not int or row['repeat'] != 1 or not isinstance(row['prompt'], str) or not row['prompt'].strip():
            raise ValueError('repetição ou prompt divergente')
        case = by_id[row['case_id']]
        if row['prompt'] != compose_prompt(case):
            raise ValueError('prompt diferente do canônico do caso')
        if row['condition'] == 'without_image':
            if row['image'] is not None or row['image_sha256'] is not None:
                raise ValueError('controle sem imagem contém anexo')
        elif (row['image'], row['image_sha256']) != (case['image'], case['image_sha256']):
            raise ValueError('anexo não corresponde ao caso')
    for case_id in by_id:
        pair = [row['prompt'] for row in rows if row['case_id'] == case_id]
        if pair[0] != pair[1]:
            raise ValueError('prompts diferentes entre condições')
    return rows


def validate_neutral(root):
    root = Path(root)
    index = json.loads((root / 'index.json').read_text(encoding='utf-8'))
    if set(index) != {'case_ids', 'conditions', 'prepared_input_count', 'model_runs_performed'}:
        raise ValueError('campos não permitidos no índice')
    ids = index['case_ids']
    if ids != [f'ADD{i:02d}' for i in range(1, 7)]:
        raise ValueError('IDs do índice inválidos')
    if index['conditions'] != CONDITIONS or index['model_runs_performed'] != 0 or index['prepared_input_count'] != 2 * len(ids):
        raise ValueError('contagem ou condições do índice divergentes')
    expected = {'index.json', 'prepared-inputs.jsonl'} | {f'{x}.json' for x in ids} | {f'images/{x}.png' for x in ids}
    paths = list(root.rglob('*'))
    actual = {p.relative_to(root).as_posix() for p in paths if p.is_file()}
    if actual != expected or any(p.is_symlink() for p in paths):
        raise ValueError('inventário neutro contém arquivo extra, ausente ou link')
    cases = read_cases(root, ids)
    records = read_records(root, cases)
    return {'cases': cases, 'records': records, 'index': index}


if __name__ == '__main__':
    data = validate_neutral(Path(__file__).resolve().parent / 'model-input')
    print(f"{len(data['cases'])} tarefas; {len(data['records'])} entradas preparadas; nenhuma inferência.")

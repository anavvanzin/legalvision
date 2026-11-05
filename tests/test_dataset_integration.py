import importlib.util
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import threading
from urllib.error import HTTPError
from urllib.request import urlopen
import json
import os
from pathlib import Path
import shutil
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SUITE = ROOT / '04-experimentos/dataset-piloto-2026-10-27'
spec = importlib.util.spec_from_file_location('validar_entradas', SUITE / 'validar_entradas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class NeutralBoundaryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.inputs = Path(self.temp.name) / 'model-input'
        shutil.copytree(SUITE / 'model-input', self.inputs)

    def tearDown(self):
        self.temp.cleanup()

    def rewrite(self, relative, mutate):
        path = self.inputs / relative
        obj = json.loads(path.read_text(encoding='utf-8'))
        mutate(obj)
        path.write_text(json.dumps(obj), encoding='utf-8')

    def test_six_cases_and_twelve_preparations(self):
        data = module.validate_neutral(self.inputs)
        self.assertEqual(len(data['cases']), 6)
        self.assertEqual(len(data['records']), 12)

    def test_extra_answer_file_is_rejected(self):
        (self.inputs / 'gabarito.txt').write_text('not candidate material')
        with self.assertRaisesRegex(ValueError, 'inventário'):
            module.validate_neutral(self.inputs)

    def test_reference_field_inside_case_is_rejected(self):
        self.rewrite('ADD01.json', lambda x: x.update({'expected_output': 'leak'}))
        with self.assertRaisesRegex(ValueError, 'campos'):
            module.validate_neutral(self.inputs)

    def test_index_cannot_carry_a_reference_answer(self):
        self.rewrite('index.json', lambda x: x.update({'expected_output': 'not candidate material'}))
        with self.assertRaisesRegex(ValueError, 'campos'):
            module.validate_neutral(self.inputs)

    def test_identical_extra_text_in_both_prompts_is_rejected(self):
        path = self.inputs / 'prepared-inputs.jsonl'
        rows = [json.loads(x) for x in path.read_text(encoding='utf-8').splitlines()]
        for row in rows:
            if row['case_id'] == 'ADD01':
                row['prompt'] = 'GABARITO: ' + row['prompt']
        path.write_text('\n'.join(json.dumps(x) for x in rows), encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'canônico'):
            module.validate_neutral(self.inputs)

    def test_index_with_wrong_count_is_rejected(self):
        self.rewrite('index.json', lambda x: x.update({'prepared_input_count': 99}))
        with self.assertRaisesRegex(ValueError, 'contagem'):
            module.validate_neutral(self.inputs)

    def test_case_id_and_path_escape_are_rejected(self):
        for change in [{'case_id': 'ADD99'}, {'image': '../outside.png'}]:
            original = (SUITE / 'model-input/ADD01.json').read_text(encoding='utf-8')
            (self.inputs / 'ADD01.json').write_text(original, encoding='utf-8')
            self.rewrite('ADD01.json', lambda x: x.update(change))
            with self.assertRaises(ValueError):
                module.validate_neutral(self.inputs)

    def test_altered_image_is_rejected(self):
        (self.inputs / 'images/ADD01.png').write_bytes(b'not a PNG')
        with self.assertRaisesRegex(ValueError, 'imagem'):
            module.validate_neutral(self.inputs)

    def test_duplicate_record_and_attached_control_are_rejected(self):
        path = self.inputs / 'prepared-inputs.jsonl'
        rows = path.read_text(encoding='utf-8').splitlines()
        path.write_text('\n'.join([rows[0]] + rows[0:-1]), encoding='utf-8')
        with self.assertRaises(ValueError):
            module.validate_neutral(self.inputs)
        rows = [json.loads(x) for x in (SUITE / 'model-input/prepared-inputs.jsonl').read_text(encoding='utf-8').splitlines()]
        rows[1]['image'] = 'images/ADD01.png'
        path.write_text('\n'.join(json.dumps(x) for x in rows), encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'sem imagem'):
            module.validate_neutral(self.inputs)


class DatasetIntegrationTests(unittest.TestCase):
    def test_catalog_agrees_with_official_six_case_suite(self):
        catalog = json.loads((ROOT / 'src/data/datasetCatalog.json').read_text(encoding='utf-8'))
        data = module.validate_neutral(SUITE / 'model-input')
        self.assertEqual([item['id'] for item in catalog['cases']], [f'ADD0{i}' for i in range(1, 7)])
        self.assertEqual(catalog['caseCount'], 6)
        self.assertEqual(catalog['preparedInputCount'], 12)
        self.assertEqual(catalog['referenceStatus'], 'assistant_proposed_pending_human_review')
        self.assertEqual(catalog['executionStatus'], 'prepared_not_executed')
        self.assertEqual([item['id'] for item in catalog['cases']], data['index']['case_ids'])
        self.assertEqual(catalog['preparedInputCount'], len(data['records']))

    def test_downloads_over_local_http_and_no_evaluation_directory(self):
        class QuietHandler(SimpleHTTPRequestHandler):
            def log_message(self, *_args):
                pass
        public = ROOT / 'public'
        handler = partial(QuietHandler, directory=str(public))
        with ThreadingHTTPServer(('127.0.0.1', 0), handler) as server:
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            base = f'http://127.0.0.1:{server.server_port}'
            try:
                for name in ('notebook-aditivo-offline.ipynb', 'prepared-inputs.jsonl', 'index.json'):
                    route = '/dataset-offline-2026-10-27/' + name
                    with urlopen(base + route, timeout=5) as response:
                        self.assertEqual(response.read(), (public / route.lstrip('/')).read_bytes())
                for forbidden in ('somente-model-input.zip', 'evaluator-only/ADD01.reference.json'):
                    with self.assertRaises(HTTPError) as error:
                        urlopen(base + '/dataset-offline-2026-10-27/' + forbidden, timeout=5)
                    self.assertEqual(error.exception.code, 404)
                    error.exception.close()
            finally:
                server.shutdown()
                thread.join(timeout=5)

    def test_downloads_are_neutral_and_match_source_bytes(self):
        public = ROOT / 'public/dataset-offline-2026-10-27'
        expected = {'notebook-aditivo-offline.ipynb', 'prepared-inputs.jsonl', 'index.json'}
        self.assertEqual({p.name for p in public.iterdir()}, expected)
        for name in ('prepared-inputs.jsonl', 'index.json'):
            self.assertEqual((public / name).read_bytes(), (SUITE / 'model-input' / name).read_bytes())

    def test_public_notebook_runs_with_only_the_three_public_downloads(self):
        public = ROOT / 'public/dataset-offline-2026-10-27'
        notebook = json.loads((public / 'notebook-aditivo-offline.ipynb').read_text(encoding='utf-8'))
        code = [''.join(cell['source']) for cell in notebook['cells'] if cell['cell_type'] == 'code']
        self.assertNotIn('model-input', '\n'.join(code))
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            for name in ('notebook-aditivo-offline.ipynb', 'prepared-inputs.jsonl', 'index.json'):
                shutil.copy2(public / name, base / name)
            previous = Path.cwd()
            try:
                os.chdir(base)
                state = {}
                for position, source in enumerate(code):
                    exec(compile(source, f'public-notebook-cell-{position}', 'exec'), state)
            finally:
                os.chdir(previous)
            self.assertEqual(state['summary'], {'cases': 6, 'prepared_inputs': 12, 'inferences': 0})


if __name__ == '__main__':
    unittest.main(verbosity=2)

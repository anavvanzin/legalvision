"""Regression checks for the two offline entry points; never calls a model."""
import contextlib
import io
import json
import os
from pathlib import Path
import shutil
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SUITE = ROOT / '04-experimentos/dataset-piloto-2026-10-27'
PUBLIC = ROOT / 'public/dataset-offline-2026-10-27'


def run_cells(notebook, directory, count=None):
    cells = [''.join(c['source']) for c in json.loads(notebook.read_text())['cells'] if c['cell_type'] == 'code']
    previous = Path.cwd()
    try:
        os.chdir(directory)
        state = {}
        with contextlib.redirect_stdout(io.StringIO()):
            for i, code in enumerate(cells[:count]):
                exec(compile(code, f'cell-{i}', 'exec'), state)
        return state
    finally:
        os.chdir(previous)


class ResearchNotebookTests(unittest.TestCase):
    def test_selected_stimulus_respects_condition(self):
        notebook = SUITE / 'notebook-aditivo-offline.ipynb'
        for condition in ('with_image', 'without_image'):
            with self.subTest(condition=condition), tempfile.TemporaryDirectory() as directory:
                base = Path(directory)
                shutil.copytree(SUITE / 'model-input', base / 'model-input')
                obj = json.loads(notebook.read_text())
                cell = [c for c in obj['cells'] if c['cell_type'] == 'code'][-1]
                cell['source'] = ''.join(cell['source']).replace('CONDITION = "with_image"', f'CONDITION = "{condition}"').splitlines(keepends=True)
                path = base / 'practice.ipynb'
                path.write_text(json.dumps(obj))
                state = run_cells(path, base)
                self.assertEqual(state['stimulus']['prompt'], state['prepared_inputs'][0]['prompt'])
                if condition == 'without_image':
                    self.assertIsNone(state['stimulus']['image_bytes'])
                else:
                    self.assertEqual(state['stimulus']['image_bytes'], (base / 'model-input/images/ADD01.png').read_bytes())

    def test_rejects_reference_field_before_composing_prompt(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            shutil.copytree(SUITE / 'model-input', base / 'model-input')
            path = base / 'model-input/ADD01.json'
            case = json.loads(path.read_text())
            case['expected_output'] = 'evaluation-only content'
            path.write_text(json.dumps(case))
            with self.assertRaisesRegex(ValueError, 'campos'):
                run_cells(SUITE / 'notebook-aditivo-offline.ipynb', base, 2)

    def test_rejects_incomplete_inventory(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            shutil.copytree(SUITE / 'model-input', base / 'model-input')
            (base / 'model-input/ADD06.json').unlink()
            with self.assertRaisesRegex(ValueError, 'inventário'):
                run_cells(SUITE / 'notebook-aditivo-offline.ipynb', base, 2)


class PublicNotebookTests(unittest.TestCase):
    def check_mutation_rejected(self, mutate):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            shutil.copytree(PUBLIC, base, dirs_exist_ok=True)
            path = base / 'prepared-inputs.jsonl'
            rows = [json.loads(s) for s in path.read_text().splitlines()]
            mutate(rows)
            path.write_text('\n'.join(json.dumps(r) for r in rows))
            with self.assertRaises((AssertionError, ValueError)):
                run_cells(PUBLIC / 'notebook-aditivo-offline.ipynb', base)

    def test_rejects_duplicate_pair_even_with_all_ids_and_conditions_present(self):
        self.check_mutation_rejected(lambda rows: rows[0].update(condition='without_image', image=None, image_sha256=None))

    def test_rejects_different_prompts_between_conditions(self):
        self.check_mutation_rejected(lambda rows: rows[1].update(prompt='changed prompt'))

    def test_rejects_image_in_without_image_condition(self):
        self.check_mutation_rejected(lambda rows: rows[1].update(image=rows[0]['image']))


if __name__ == '__main__':
    unittest.main(verbosity=2)

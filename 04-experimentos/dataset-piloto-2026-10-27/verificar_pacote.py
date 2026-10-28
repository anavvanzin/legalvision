"""Verificações locais dos dados e do notebook; não chama modelos ou rede."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
import zipfile
from validar_entradas import validate_neutral

ROOT = Path(__file__).resolve().parent
IDS = [f"ADD{i:02d}" for i in range(1, 7)]


class PackageChecks(unittest.TestCase):
    def test_cases_assets_and_provisional_references(self):
        validate_neutral(ROOT / "model-input")
        cases = sorted((ROOT / "model-input").glob("ADD[0-9][0-9].json"))
        self.assertEqual([p.stem for p in cases], IDS)
        for path in cases:
            case = json.loads(path.read_text(encoding="utf-8"))
            ref = json.loads((ROOT / "evaluator-only" / f"{path.stem}.reference.json").read_text(encoding="utf-8"))
            image = (ROOT / "model-input" / case["image"]).resolve()
            self.assertTrue(image.is_relative_to((ROOT / "model-input").resolve()))
            self.assertTrue(image.read_bytes().startswith(b"\x89PNG\r\n\x1a\n"))
            self.assertEqual(hashlib.sha256(image.read_bytes()).hexdigest(), case["image_sha256"])
            self.assertEqual(case["image_sha256"], ref["image_sha256"])
            self.assertEqual(ref["model_image"], "model-input/" + case["image"])
            self.assertEqual(hashlib.sha256((ROOT / ref["source_file"]).read_bytes()).hexdigest(), ref["source_sha256"])
            self.assertEqual(ref["reference_status"], "assistant_proposed_pending_human_review")
            self.assertFalse(ref["human_review_completed"])
            self.assertTrue(ref["facts"])
            atoms = [f["atom"] for f in ref["facts"]] + ref["derived"]
            self.assertTrue(set(atoms) <= set(case["output_contract"]["allowed_atoms"]))
            self.assertTrue(all(atom == atom.lower() for atom in atoms))
            for fact in ref["facts"]:
                x0, y0, x1, y1 = fact["bbox"]
                self.assertTrue(0 <= x0 < x1 <= 1 and 0 <= y0 < y1 <= 1)
            expected = "[" + ",".join(f["atom"] for f in ref["facts"]) + "]," + ref["derived"][0]
            self.assertEqual(ref["expected_output"], expected)
            self.assertEqual(ref["without_image_expected"], "[],undetermined(visual_facts,doc1)")
            self.assertFalse(set(case) & {"facts", "expected_output", "source_url", "source_file", "derived"})
        manifest = json.loads((ROOT / "MANIFEST-SHA256.json").read_text(encoding="utf-8"))
        actual = {p.relative_to(ROOT).as_posix() for p in ROOT.rglob("*") if p.is_file() and p.name not in {"MANIFEST-SHA256.json", ".DS_Store"} and "__pycache__" not in p.parts}
        self.assertEqual(set(manifest["files"]), actual)
        for relative, entry in manifest["files"].items():
            path = (ROOT / relative).resolve()
            self.assertTrue(path.is_relative_to(ROOT.resolve()), relative)
            self.assertTrue(path.is_file(), relative)
            self.assertEqual(path.stat().st_size, entry["bytes"], relative)
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), entry["sha256"], relative)

    def test_two_independent_conditions_and_candidate_archive(self):
        rows = [json.loads(s) for s in (ROOT / "model-input/prepared-inputs.jsonl").read_text(encoding="utf-8").splitlines()]
        self.assertEqual(len(rows), 12)
        self.assertEqual(len({(r["case_id"], r["condition"]) for r in rows}), 12)
        for case_id in IDS:
            pair = {r["condition"]: r for r in rows if r["case_id"] == case_id}
            self.assertEqual(set(pair), {"with_image", "without_image"})
            self.assertEqual(pair["with_image"]["prompt"], pair["without_image"]["prompt"])
            self.assertIsNone(pair["without_image"]["image"])
            self.assertIsNone(pair["without_image"]["image_sha256"])
            for row in pair.values():
                self.assertEqual(row["status"], "prepared_not_executed")
                self.assertNotIn("raw_response", row)
                self.assertNotIn("http", row["prompt"])
        with zipfile.ZipFile(ROOT / "somente-model-input.zip") as archive:
            self.assertIsNone(archive.testzip())
            expected = {p.relative_to(ROOT).as_posix() for p in (ROOT / "model-input").rglob("*") if p.is_file()}
            self.assertEqual(set(archive.namelist()), expected)
            for name in expected:
                self.assertEqual(archive.read(name), (ROOT / name).read_bytes())

    def test_offline_notebook_preparation(self):
        notebook = json.loads((ROOT / "notebook-aditivo-offline.ipynb").read_text(encoding="utf-8"))
        code = ["".join(c["source"]) for c in notebook["cells"] if c["cell_type"] == "code"]
        self.assertEqual(len(code), 3)
        for cell in notebook["cells"]:
            if cell["cell_type"] == "code":
                self.assertIsNone(cell["execution_count"])
                self.assertEqual(cell["outputs"], [])
        for i, source in enumerate(code):
            compile(source, f"notebook-cell-{i}", "exec")
        state = {}
        source = code[0].replace('Path("model-input")', f"Path({str(ROOT / 'model-input')!r})", 1)
        exec(compile(source, "preparacao-local", "exec"), state)
        exec(compile(code[1], "condicoes-locais", "exec"), state)
        expected = [json.loads(s) for s in (ROOT / "model-input/prepared-inputs.jsonl").read_text(encoding="utf-8").splitlines()]
        self.assertEqual(state["prepared_inputs"], expected)
        with tempfile.TemporaryDirectory() as directory:
            missing = code[0].replace('Path("model-input")', f"Path({directory!r})", 1)
            with self.assertRaisesRegex(AssertionError, "Nenhum caso"):
                exec(compile(missing, "pasta-vazia", "exec"), {})
        from copy import deepcopy
        invalid = deepcopy(state["cases"][0])
        invalid["image_sha256"] = "0" * 64
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            (base / "images").mkdir()
            (base / "images" / Path(invalid["image"]).name).write_bytes((ROOT / "model-input" / invalid["image"]).read_bytes())
            (base / "ADD01.json").write_text(json.dumps(invalid))
            changed = code[0].replace('Path("model-input")', f"Path({directory!r})", 1)
            with self.assertRaisesRegex(AssertionError, "Hash de imagem"):
                exec(compile(changed, "imagem-adulterada", "exec"), {})


if __name__ == "__main__":
    unittest.main(verbosity=2)

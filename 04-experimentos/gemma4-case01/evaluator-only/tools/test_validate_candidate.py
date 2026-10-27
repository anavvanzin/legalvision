"""Six synthetic software fixtures. These are not model or oracle responses."""

import copy
import io
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import validate_candidate as checker


def software_fixture(condition="with_image", abstention=False):
    no_pixels = condition == "without_image"
    supported = not (no_pixels or abstention)
    atom = lambda predicate, args, source: {
        "predicate": predicate, "args": args, "role": "ordinary",
        "source_id": source, "polaridade": "positive", "modality": "defeasible",
    }
    premises = [atom("classification_warrant", [checker.CATEGORY, checker.PROPERTY], "R1")]
    if supported:
        premises.insert(0, atom("classified_as", ["A", checker.CATEGORY], "IMG01"))
    return {
        "case_id": "CASE01", "condition": condition, "image_inspected": not no_pixels,
        "visual_answers": {
            key: {"value": None, "evidence_status": "insufficient", "reason": "Software fixture; sem observação real.", "region": None}
            for key in ("Q1", "Q2", "Q3")
        },
        "classification": {"entity": "A", "category": checker.CATEGORY,
                           "evidence_status": "supported" if supported else "insufficient",
                           "reason": "Estado sintético para testar o software; nenhum pixel foi usado.", "region": None},
        "instance": {
            "scheme_id": "verbal_classification", "profile_version": "0.1", "premises": premises,
            "conclusion": {"predicate": "has_property", "args": ["A", checker.PROPERTY],
                           "role": "conclusion", "polaridade": "positive", "modality": "defeasible"} if supported else None,
            "critical_questions": {
                "CQ1": {"state": "unknown", "reason": "Fixture de software sem revisão independente."},
                "CQ2": {"state": "unknown", "reason": "Fixture de software sem revisão independente."},
            },
        },
        "limitations": ["Software fixture sintética, não é resposta de modelo nem anotação visual."],
    }


class CandidateChecks(unittest.TestCase):
    def validate(self, fixture, condition="with_image"):
        return checker.validate_text(json.dumps(fixture, ensure_ascii=False), condition)

    def codes(self, report):
        return {finding["code"] for finding in report["findings"]}

    def test_valid_binding_and_self_reported_cqs(self):
        fixture = software_fixture()
        fixture["instance"]["critical_questions"]["CQ2"] = {
            "state": "defeater_established", "reason": "Estado sintético: não é adjudicação externa.",
        }
        report = self.validate(fixture)
        self.assertEqual((report["schema_status"], report["binding_status"], report["evidence_policy"]), ("pass", "pass", "pass"))
        self.assertEqual(report["structure"]["conclusion_origin"], "derived")
        self.assertEqual(report["structure"]["critical_questions"]["CQ2"]["assessment"], "self_reported")
        self.assertFalse(report["structure"]["external_independent_review"])
        fixture["classification"]["evidence_status"] = "insufficient"
        report = self.validate(fixture)
        self.assertEqual(report["binding_status"], "pass")
        self.assertEqual(report["evidence_policy"], "fail")
        self.assertIn("conclusion_without_supported_classification", self.codes(report))
        fixture = software_fixture()
        for region in ([True, 0, 1, 1], [0, 0, 10 ** 400, 1]):
            with self.subTest(region_type=type(region[0]).__name__):
                fixture["classification"]["region"] = region
                self.assertEqual(self.validate(fixture)["schema_status"], "fail")

    def test_swapped_entity_breaks_binding(self):
        fixture = software_fixture()
        fixture["instance"]["premises"][0]["args"][0] = "B"
        report = self.validate(fixture)
        self.assertEqual(report["binding_status"], "fail")
        self.assertIn("term_binding", self.codes(report))
        self.assertIn("conclusion_requires_complete_premises", self.codes(report))

    def test_warrant_wrong_source_and_conclusion_origin(self):
        fixture = software_fixture()
        fixture["instance"]["premises"][1]["source_id"] = "IMG01"
        report = self.validate(fixture)
        self.assertEqual((report["binding_status"], report["evidence_policy"]), ("fail", "fail"))
        self.assertIn("warrant_source", self.codes(report))
        fixture = software_fixture()
        fixture["instance"]["conclusion"]["source_id"] = None
        self.assertIn("conclusion_source_must_be_omitted", self.codes(self.validate(fixture)))
        fixture = software_fixture()
        fixture["instance"]["premises"].append(copy.deepcopy(fixture["instance"]["premises"][1]))
        self.assertIn("duplicate_premise", self.codes(self.validate(fixture)))

    def test_abstention_without_image_is_incomplete_not_defeated(self):
        fixture = software_fixture("without_image")
        for premises in (fixture["instance"]["premises"], []):
            with self.subTest(premise_count=len(premises)):
                fixture["instance"]["premises"] = premises
                report = self.validate(fixture, "without_image")
                self.assertEqual((report["schema_status"], report["binding_status"], report["evidence_policy"]), ("pass", "incomplete", "pass"))
                self.assertEqual(report["structure"]["argument_state"], "abstention")

    def test_hallucination_without_image_and_uninspected_image(self):
        for condition in checker.CONDITIONS:
            with self.subTest(condition=condition):
                fixture = software_fixture()
                fixture["condition"] = condition
                fixture["image_inspected"] = False
                fixture["visual_answers"]["Q1"].update({"value": 2, "evidence_status": "supported", "region": [0.1, 0.1, 0.9, 0.9]})
                report = self.validate(fixture, condition)
                self.assertEqual(report["evidence_policy"], "fail")
                self.assertIn("visual_claim_without_inspection", self.codes(report))
                self.assertIn("image_source_unavailable", self.codes(report))
                self.assertIn("conclusion_without_inspection", self.codes(report))

    def test_malformed_json_and_cli_emits_json(self):
        for text in ('{"case_id":', '{"a":1,"a":2}', '{"a":NaN}', '{"a":1e999}'):
            with self.subTest(text=text):
                report = checker.validate_text(text, "without_image")
                self.assertEqual(report["schema_status"], "fail")
                self.assertIn("malformed_json", self.codes(report))
        with tempfile.TemporaryDirectory(prefix="case01-software-fixture-") as temp_dir:
            fixture_path = Path(temp_dir) / "malformed-software-fixture.json"
            fixture_path.write_text('{"case_id":', encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(Path(checker.__file__)), "--candidate", str(fixture_path), "--condition", "without_image"],
                capture_output=True, text=True, check=False,
            )
        self.assertEqual(result.returncode, 2)
        self.assertEqual(result.stderr, "")
        self.assertIn("malformed_json", self.codes(json.loads(result.stdout)))


if __name__ == "__main__":
    log = io.StringIO()
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(CandidateChecks)
    result = unittest.TextTestRunner(stream=log, verbosity=2).run(suite)
    base = Path(__file__).resolve().parent
    (base / "validator-tests.log").write_text(log.getvalue(), encoding="utf-8")
    summary = {
        "kind": "software_fixture_test_run", "candidate_models_executed": 0,
        "tests_run": result.testsRun, "failures": len(result.failures), "errors": len(result.errors),
        "successful": result.wasSuccessful(), "log": "validator-tests.log",
        "scope": "Synthetic software fixtures only; no image, reference, oracle, or candidate response inspected.",
    }
    output = json.dumps(summary, ensure_ascii=False, indent=2)
    (base / "validator-test-results.json").write_text(output + "\n", encoding="utf-8")
    print(output)
    sys.exit(0 if result.wasSuccessful() else 1)

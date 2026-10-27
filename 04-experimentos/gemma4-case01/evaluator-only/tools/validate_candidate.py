#!/usr/bin/env python3
"""Mechanical CASE01 checks for future manually exported JSON candidates.

Standard library only. Does not inspect images, consult an oracle, interpret
free-form reasons, run inference, or establish legal validity. The constants
below freeze only the proposed verbal_classification profile 0.1 read during
the pilot setup, together with the narrower CASE01 shared-prompt contract.
"""

import argparse
import json
import math
import sys
from pathlib import Path


CASE_ID = "CASE01"
SCHEME_ID = "verbal_classification"
PROFILE_VERSION = "0.1"
ENTITY = "A"
CATEGORY = "bicicleta_visual"
PROPERTY = "deve_ser_conduzido_a_mao_na_zona_Z"
CONDITIONS = ("with_image", "without_image")
EVIDENCE_STATES = {"supported", "contradicted", "insufficient"}
CQ_STATES = {
    "resolved_no_defeater", "defeater_established", "unknown",
    "not_applicable_justified",
}
ROOT_KEYS = {
    "case_id", "condition", "image_inspected", "visual_answers",
    "classification", "instance", "limitations",
}
ATOM_KEYS = {"predicate", "args", "role", "polaridade", "modality"}
PREMISE_ARGS = {
    "classified_as": [ENTITY, CATEGORY],
    "classification_warrant": [CATEGORY, PROPERTY],
}
CONCLUSION_ARGS = [ENTITY, PROPERTY]
LIMITATIONS = [
    "Conferência mecânica isolada do CASE01; não implementa um validador jurídico completo.",
    "Autoridade formal: snapshot do perfil proposto verbal_classification 0.1, restringido pelo prompt CASE01.",
    "Não lê pixels, referências, gabaritos ou fontes externas; não certifica verdade ou suporte visual.",
    "Classificação, observações e estados de questões críticas são declarações self_reported do candidato.",
    "Razões em prosa livre não recebem interpretação semântica ou revisão externa independente.",
    "incomplete descreve ausência estrutural ou abstenção; não declara um argumento derrotado.",
    "pass descreve somente conformidade com as verificações indicadas, sem certificar validade jurídica.",
]


class StrictJSONError(ValueError):
    """A JSON export is not uniquely and finitely representable."""


def _unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise StrictJSONError("Chave JSON duplicada: " + key)
        result[key] = value
    return result


def _reject_constant(value):
    raise StrictJSONError("Constante fora do padrão JSON: " + value)


def _finite_float(value):
    parsed = float(value)
    if not math.isfinite(parsed):
        raise StrictJSONError("Número não finito: " + value)
    return parsed


def parse_json(text):
    return json.loads(
        text, object_pairs_hook=_unique_object,
        parse_constant=_reject_constant, parse_float=_finite_float,
    )


def _base_report(condition):
    return {
        "case_id": CASE_ID,
        "condition": condition,
        "checker_version": "0.1",
        "formal_authority": {
            "scheme_id": SCHEME_ID,
            "profile_version": PROFILE_VERSION,
            "status": "proposed_not_implemented",
            "snapshot_source": "work/legal-package/schemes/profiles.json#verbal_classification",
            "case_contract": "prompts/shared.txt and PROTOCOL.md (CASE01)",
        },
        "schema_status": "fail",
        "binding_status": "fail",
        "evidence_policy": "fail",
        "findings": [],
        "structure": {
            "argument_state": "not_assessable",
            "premise_predicates": [],
            "complete_premise_slots": [],
            "missing_premise_slots": list(PREMISE_ARGS),
            "conclusion_present": False,
            "conclusion_origin": "absent",
            "classification_assessment": "self_reported",
            "visual_assessment": "self_reported",
            "critical_questions_assessment": "self_reported",
            "critical_questions": {},
            "external_independent_review": False,
        },
        "limitations": list(LIMITATIONS),
    }


def failure_report(condition, code, message):
    report = _base_report(condition)
    report["findings"].append({
        "code": code, "checks": ["schema", "binding", "evidence_policy"],
        "severity": "error", "path": "$", "message": message,
    })
    return report


class Checker:
    def __init__(self, candidate, condition):
        self.candidate = candidate
        self.condition = condition
        self.report = _base_report(condition)
        self.failed = set()

    def finding(self, code, checks, path, message, severity="error"):
        self.report["findings"].append({
            "code": code, "checks": list(checks), "severity": severity,
            "path": path, "message": message,
        })
        if severity == "error":
            self.failed.update(checks)

    def schema_error(self, code, path, message):
        self.finding(code, ("schema", "binding"), path, message)

    def object_shape(self, value, keys, path):
        if not isinstance(value, dict):
            self.schema_error("object_required", path, "Esperado objeto JSON.")
            return False
        missing = keys - value.keys()
        extra = value.keys() - keys
        if missing:
            self.schema_error("missing_fields", path, "Campos ausentes: " + ", ".join(sorted(missing)))
        if extra:
            self.schema_error("extra_fields", path, "Campos não previstos: " + ", ".join(sorted(extra)))
        return not missing and not extra

    def exact(self, value, expected, path, code="unexpected_value"):
        if type(value) is not type(expected) or value != expected:
            self.schema_error(code, path, "Valor exigido pelo contrato: " + json.dumps(expected, ensure_ascii=False))
            return False
        return True

    def string(self, value, path, nonempty=False):
        if not isinstance(value, str) or (nonempty and not value.strip()):
            self.schema_error("string_required", path, "Esperado texto" + (" com justificativa não vazia." if nonempty else "."))
            return False
        return True

    def enum(self, value, choices, path):
        if not isinstance(value, str) or value not in choices:
            self.schema_error("enum_value", path, "Valor fora do vocabulário permitido.")
            return False
        return True

    def region(self, value, path):
        if value is None:
            return True
        if (not isinstance(value, list) or len(value) != 4 or
                any(type(n) not in (int, float) or (type(n) is float and not math.isfinite(n)) for n in value)):
            self.schema_error("region_shape", path, "Região deve ser null ou quatro números finitos.")
            return False
        x0, y0, x1, y1 = value
        if not (0 <= x0 < x1 <= 1 and 0 <= y0 < y1 <= 1):
            self.schema_error("region_bounds", path, "Região normalizada deve ter 0≤x0<x1≤1 e 0≤y0<y1≤1.")
            return False
        return True

    def visual_entry(self, entry, path, no_pixels):
        self.object_shape(entry, {"value", "evidence_status", "reason", "region"}, path)
        if not isinstance(entry, dict):
            return
        value = entry.get("value")
        if isinstance(value, (dict, list)):
            self.schema_error("visual_scalar_required", path + ".value", "Resposta visual deve ser escalar JSON ou null.")
        self.enum(entry.get("evidence_status"), EVIDENCE_STATES, path + ".evidence_status")
        self.string(entry.get("reason"), path + ".reason")
        self.region(entry.get("region"), path + ".region")
        if no_pixels:
            for field, expected in (("value", None), ("region", None), ("evidence_status", "insufficient")):
                if field in entry and entry[field] != expected:
                    self.finding("visual_claim_without_inspection", ("evidence_policy",), path + "." + field,
                                 "Sem pixels inspecionados, resposta deve ter value/region=null e evidence_status=insufficient.")

    def atom(self, atom, path, conclusion=False):
        expected_keys = ATOM_KEYS if conclusion else ATOM_KEYS | {"source_id"}
        shape_ok = self.object_shape(atom, expected_keys, path)
        if not isinstance(atom, dict):
            return None, False
        before = len(self.report["findings"])
        predicate = atom.get("predicate")
        allowed = {"has_property"} if conclusion else set(PREMISE_ARGS)
        predicate_ok = self.enum(predicate, allowed, path + ".predicate")
        args = atom.get("args")
        args_ok = isinstance(args, list) and len(args) == 2 and all(isinstance(arg, str) for arg in args)
        if not args_ok:
            self.schema_error("atom_arity", path + ".args", "Cada átomo exige exatamente dois argumentos textuais.")
        elif predicate_ok:
            expected_args = CONCLUSION_ARGS if conclusion else PREMISE_ARGS[predicate]
            if args != expected_args:
                self.finding("term_binding", ("binding",), path + ".args", "Vinculação exigida: " + json.dumps(expected_args, ensure_ascii=False))
                args_ok = False
        self.exact(atom.get("role"), "conclusion" if conclusion else "ordinary", path + ".role")
        self.exact(atom.get("polaridade"), "positive", path + ".polaridade")
        self.exact(atom.get("modality"), "defeasible", path + ".modality")
        source_ok = True
        if conclusion:
            if "source_id" in atom:
                self.finding("conclusion_source_must_be_omitted", ("binding", "evidence_policy"), path + ".source_id",
                             "Conclusão derivada deve omitir source_id; pixels não fornecem regra normativa.")
                source_ok = False
        elif predicate_ok:
            expected_source = "R1" if predicate == "classification_warrant" else "IMG01"
            if atom.get("source_id") != expected_source:
                self.finding("warrant_source" if predicate == "classification_warrant" else "classification_source",
                             ("binding", "evidence_policy"), path + ".source_id", "Fonte exigida: " + expected_source + ".")
                source_ok = False
        if atom.get("source_id") == "IMG01" and (self.condition != "with_image" or self.candidate.get("image_inspected") is not True):
            self.finding("image_source_unavailable", ("evidence_policy",), path + ".source_id",
                         "IMG01 exige condição with_image e inspeção de imagem declarada.")
        atom_errors = any(item["severity"] == "error" for item in self.report["findings"][before:])
        return predicate, shape_ok and predicate_ok and args_ok and source_ok and not atom_errors

    def run(self):
        c = self.candidate
        self.object_shape(c, ROOT_KEYS, "$")
        if not isinstance(c, dict):
            self.failed.add("evidence_policy")
            return self.finish()
        self.exact(c.get("case_id"), CASE_ID, "$.case_id", "case_id")
        self.exact(c.get("condition"), self.condition, "$.condition", "condition_mismatch")
        inspected = c.get("image_inspected")
        if type(inspected) is not bool:
            self.schema_error("boolean_required", "$.image_inspected", "Esperado booleano JSON.")
            self.failed.add("evidence_policy")
        if self.condition == "without_image" and inspected is not False:
            self.finding("inspection_without_image", ("evidence_policy",), "$.image_inspected", "without_image exige image_inspected=false.")
        no_pixels = self.condition == "without_image" or inspected is not True
        visual = c.get("visual_answers")
        self.object_shape(visual, {"Q1", "Q2", "Q3"}, "$.visual_answers")
        if isinstance(visual, dict):
            for key in ("Q1", "Q2", "Q3"):
                if key in visual:
                    self.visual_entry(visual[key], "$.visual_answers." + key, no_pixels)
        classification = c.get("classification")
        self.object_shape(classification, {"entity", "category", "evidence_status", "reason", "region"}, "$.classification")
        classification_state = None
        if isinstance(classification, dict):
            self.exact(classification.get("entity"), ENTITY, "$.classification.entity")
            self.exact(classification.get("category"), CATEGORY, "$.classification.category")
            classification_state = classification.get("evidence_status")
            self.enum(classification_state, EVIDENCE_STATES, "$.classification.evidence_status")
            self.string(classification.get("reason"), "$.classification.reason")
            self.region(classification.get("region"), "$.classification.region")
            if no_pixels and (classification_state != "insufficient" or classification.get("region") is not None):
                self.finding("classification_without_inspection", ("evidence_policy",), "$.classification",
                             "Sem pixels inspecionados, classificação exige evidence_status=insufficient e region=null.")
        limitations = c.get("limitations")
        if not isinstance(limitations, list) or any(not isinstance(item, str) for item in limitations):
            self.schema_error("limitations_list", "$.limitations", "Esperada lista de textos.")
        instance = c.get("instance")
        self.object_shape(instance, {"scheme_id", "profile_version", "premises", "conclusion", "critical_questions"}, "$.instance")
        if not isinstance(instance, dict):
            self.failed.add("evidence_policy")
            return self.finish()
        self.exact(instance.get("scheme_id"), SCHEME_ID, "$.instance.scheme_id", "scheme_id")
        self.exact(instance.get("profile_version"), PROFILE_VERSION, "$.instance.profile_version", "profile_version")
        premises = instance.get("premises")
        seen = set()
        complete = set()
        if not isinstance(premises, list):
            self.schema_error("premises_list", "$.instance.premises", "Esperada lista de premissas.")
        else:
            for index, premise in enumerate(premises):
                path = "$.instance.premises[" + str(index) + "]"
                predicate, valid = self.atom(premise, path)
                if isinstance(predicate, str):
                    self.report["structure"]["premise_predicates"].append(predicate)
                    if predicate in seen:
                        self.finding("duplicate_premise", ("binding",), path, "Cada premissa do esquema pode aparecer uma única vez.")
                    seen.add(predicate)
                    if valid:
                        complete.add(predicate)
        conclusion = instance.get("conclusion")
        conclusion_present = conclusion is not None
        self.report["structure"]["conclusion_present"] = conclusion_present
        conclusion_ok = False
        if conclusion_present:
            _, conclusion_ok = self.atom(conclusion, "$.instance.conclusion", conclusion=True)
            self.report["structure"]["conclusion_origin"] = "derived" if conclusion_ok else "invalid"
            if not set(PREMISE_ARGS).issubset(complete):
                self.finding("conclusion_requires_complete_premises", ("binding",), "$.instance.conclusion",
                             "Conclusão exige classified_as(A,C) e classification_warrant(C,F) completos.")
            if classification_state != "supported":
                self.finding("conclusion_without_supported_classification", ("evidence_policy",), "$.instance.conclusion",
                             "Conclusão exige classificação declarada supported; insufficient ou contradicted exige abstenção.")
            if no_pixels:
                self.finding("conclusion_without_inspection", ("evidence_policy",), "$.instance.conclusion", "Sem pixels inspecionados, deve haver abstenção normativa.")
        cq = instance.get("critical_questions")
        self.object_shape(cq, {"CQ1", "CQ2"}, "$.instance.critical_questions")
        if isinstance(cq, dict):
            for key in ("CQ1", "CQ2"):
                if key not in cq:
                    continue
                entry = cq[key]
                path = "$.instance.critical_questions." + key
                self.object_shape(entry, {"state", "reason"}, path)
                if isinstance(entry, dict):
                    self.enum(entry.get("state"), CQ_STATES, path + ".state")
                    self.string(entry.get("reason"), path + ".reason", nonempty=True)
                    self.report["structure"]["critical_questions"][key] = {
                        "state": entry.get("state"), "reason": entry.get("reason"),
                        "assessment": "self_reported",
                    }
        structure = self.report["structure"]
        structure["complete_premise_slots"] = [key for key in PREMISE_ARGS if key in complete]
        structure["missing_premise_slots"] = [key for key in PREMISE_ARGS if key not in complete]
        if "binding" in self.failed:
            structure["argument_state"] = "invalid_structure"
        elif conclusion_ok and not structure["missing_premise_slots"]:
            structure["argument_state"] = "structurally_complete"
        else:
            structure["argument_state"] = "abstention" if classification_state != "supported" and not conclusion_present else "structurally_incomplete"
            self.finding("incomplete_instance", ("binding",), "$.instance",
                         "Instância parcial ou abstenção; isso não estabelece derrota do argumento.", severity="info")
        return self.finish()

    def finish(self):
        self.report["schema_status"] = "fail" if "schema" in self.failed else "pass"
        self.report["evidence_policy"] = "fail" if "evidence_policy" in self.failed else "pass"
        if "binding" in self.failed:
            self.report["binding_status"] = "fail"
        elif self.report["structure"]["argument_state"] == "structurally_complete":
            self.report["binding_status"] = "pass"
        else:
            self.report["binding_status"] = "incomplete"
        return self.report


def validate_text(text, condition):
    if condition not in CONDITIONS:
        return failure_report(condition, "unknown_condition", "Condição deve ser with_image ou without_image.")
    try:
        candidate = parse_json(text)
    except (json.JSONDecodeError, StrictJSONError, ValueError, RecursionError) as exc:
        return failure_report(condition, "malformed_json", "JSON inválido: " + str(exc))
    return Checker(candidate, condition).run()


class JSONArgumentParser(argparse.ArgumentParser):
    def error(self, message):
        print(json.dumps(failure_report(None, "cli_arguments", message), ensure_ascii=False, indent=2, allow_nan=False))
        raise SystemExit(2)


def main(argv=None):
    parser = JSONArgumentParser(description=__doc__)
    parser.add_argument("--candidate", required=True, type=Path, help="JSON UTF-8 exportado manualmente; o arquivo não é alterado.")
    parser.add_argument("--condition", required=True, choices=CONDITIONS)
    args = parser.parse_args(argv)
    try:
        text = args.candidate.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        report = failure_report(args.condition, "candidate_read_error", "Não foi possível ler JSON UTF-8: " + str(exc))
        exit_code = 2
    else:
        report = validate_text(text, args.condition)
        exit_code = 2 if any(f["code"] == "malformed_json" for f in report["findings"]) else int(report["binding_status"] == "fail" or report["evidence_policy"] == "fail")
    print(json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False))
    return exit_code


if __name__ == "__main__":
    sys.exit(main())

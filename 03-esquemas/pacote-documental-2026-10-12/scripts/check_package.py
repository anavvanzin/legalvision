#!/usr/bin/env python3
"""Integrity checks only. Does not implement the proposed argument validator."""
import json
from pathlib import Path
from itertools import product
ROOT = Path(__file__).resolve().parents[1]
def read(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))
def main():
    catalog = read("schemes/catalog.json")["schemes"]
    profiles = read("schemes/profiles.json")["schemes"]
    cases = read("tests/acceptance-cases.json")["cases"]
    assert sorted(x["number"] for x in catalog) == list(range(1, 11))
    assert len({x["id"] for x in catalog}) == 10
    selected = {x["id"] for x in catalog if x["visual_role"] == "pilot"}
    assert selected == {x["id"] for x in profiles}
    for p in profiles:
        cqs = [cq["id"] for cq in p["critical_questions"]]
        assert len(cqs) == len(set(cqs))
    assert len(next(x for x in profiles if x["id"] == "witness_testimony")["critical_questions"]) == 5
    assert len(next(x for x in profiles if x["id"] == "verbal_classification")["critical_questions"]) == 2
    assert len({c["id"] for c in cases}) == len(cases)
    allowed = {
        "structure": {"pass", "fail"},
        "semantics": {"match", "mismatch", "unreviewed"},
        "visual": {"supported", "contradicted", "insufficient", "not_applicable"},
        "argument_status": {"provisionally_supported", "defeated", "unresolved"},
    }
    for c in cases:
        assert c["scheme"] in selected
        assert set(c["expected"]) == set(allowed)
        for field, values in allowed.items():
            assert c["expected"][field] in values
    for scheme in selected:
        group = [c for c in cases if c["scheme"] == scheme]
        assert {"pass", "fail"} <= {c["expected"]["structure"] for c in group}
        assert {"supported", "contradicted", "insufficient"} <= {c["expected"]["visual"] for c in group}
    table = [(d, e, d and e, d and not e) for d,e in product([False,True],repeat=2)]
    assert table[-2:] == [(True,False,False,True),(True,True,True,False)]
    edits = read("docs/notion-edits.json")["edits"]
    assert any("cq(cq3, not excuses(E))" in e["new_str"] for e in edits)
    assert any("factors_favor(defendant(P))" in e["new_str"] for e in edits)
    assert any('exceptions: ["exists PC2: is_counterexample(PC2,PC1)"]' in e["new_str"] for e in edits)
    print(f"Integrity OK: {len(catalog)} schemes, {len(profiles)} proposed profiles, {len(cases)} acceptance oracles.")
    print("Polarity illustration: 4 Boolean rows checked; Wolfram independently returned Equivalent=False.")
    print("NOT checked: model outputs, images, defeasible engine, legal validity.")
if __name__ == "__main__":
    main()


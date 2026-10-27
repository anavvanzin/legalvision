#!/usr/bin/env python3
"""Recompute archived binary counts and inventory locally, with only stdlib.

This reads source files; it never invokes models or changes the source repository.
Semantic labels are copied from the archive, never judged again here.
"""
import argparse
import collections
import csv
import hashlib
import json
import re
import subprocess
from pathlib import Path


CLASSES = ("class1", "class2", "class3")
EXPERIMENTS = {
    1: "without_enthymeme", 2: "without_context",
    3: "without_image", 4: "all_inputs",
}


def normalize_cell(value):
    return value.replace("\r\n", " ").replace("\r", " ").replace("\n", " ").replace("\t", " ").strip()


def lexical_scheme(value):
    value = value.lower().replace("`", "").replace("\\texttt{", "").replace("}", "").replace("{", "")
    predicates = set(re.findall(r"\b([a-zA-Z][a-zA-Z0-9_]*)\s*\(", value))
    return "yes" if {"position_to_know", "asserts", "contain"} <= predicates else "no"


def read_csv(path, **kwargs):
    with path.open(encoding="utf-8-sig", newline="") as source:
        return list(csv.reader(source, strict=True, **kwargs))


def metric_row(group, key, counter):
    total = sum(counter.values())
    scheme = sum(v for (s, _), v in counter.items() if s == "yes")
    semantic = sum(v for (_, s), v in counter.items() if s == "yes")
    both = counter[("yes", "yes")]
    return [group, key, total, scheme, semantic, both,
            round(100 * scheme / total, 6), round(100 * semantic / total, 6),
            round(100 * both / total, 6)]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    repo, output = args.repo.resolve(), args.output.resolve()
    if output == repo or repo in output.parents:
        raise ValueError("Output must be outside the read-only source repository.")
    output.mkdir(parents=True, exist_ok=True)
    tracked = subprocess.check_output(["git", "-C", str(repo), "ls-files"], text=True).splitlines()
    head = subprocess.check_output(["git", "-C", str(repo), "rev-parse", "HEAD"], text=True).strip()
    status = subprocess.check_output(["git", "-C", str(repo), "status", "--porcelain"], text=True).splitlines()
    selected = [p for p in tracked if p in ("README.md", "main.py", "validation.py", "statistics.py", "all_examples.txt", "requirements.txt")
                or p.startswith(("tests/", "images/", "expected_outputs/", "results/", "validation/"))]
    manifest = []
    for relative in sorted(selected):
        payload = (repo / relative).read_bytes()
        manifest.append([relative, len(payload), hashlib.sha256(payload).hexdigest()])
    with (output / "source-sha256.csv").open("w", encoding="utf-8", newline="") as destination:
        writer = csv.writer(destination)
        writer.writerow(["relative_path", "bytes", "sha256"])
        writer.writerows(manifest)

    classes, all_image_hashes = {}, []
    for cls in CLASSES:
        cases = read_csv(repo / "tests" / f"{cls}.tsv", delimiter="\t")
        expected = (repo / "expected_outputs" / f"{cls}.txt").read_text(encoding="utf-8-sig").splitlines()
        images = sorted((repo / "images" / cls).glob("test*.png"))
        image_hashes = [hashlib.sha256(p.read_bytes()).hexdigest() for p in images]
        all_image_hashes.extend(image_hashes)
        item = {
            "cases": len(cases), "input_widths": dict(collections.Counter(map(len, cases))),
            "expected_rows": len(expected), "unique_expected_texts": len(set(expected)),
            "image_files": len(images), "unique_image_sha256": len(set(image_hashes)),
            "unique_enthymeme_texts": len({row[0] for row in cases}),
            "unique_context_texts": len({row[1] for row in cases}),
            "results": {},
        }
        for model_dir in sorted((repo / "results").iterdir()):
            if not model_dir.is_dir() or model_dir.name.startswith("."):
                continue
            records = read_csv(model_dir / f"{cls}.txt", delimiter="\t", quoting=csv.QUOTE_NONE)
            header, rows = records[0], records[1:]
            widths = dict(collections.Counter(map(len, rows)))
            legacy, metadata_mismatches = [], []
            for number, row in enumerate(rows, 1):
                expected_image = f"images/{cls}/test{number}.png"
                if len(row) == 7 and row[1] == expected_image and row[2] == "":
                    legacy.append(number)
                    row = [row[0], "", *row[1:]]
                if len(row) != 8:
                    raise ValueError(f"Invalid result width: {model_dir.name}/{cls}/{number}")
                mismatched_fields = [name for name, source, saved in zip(
                    ("Enthymeme", "Context"), cases[number - 1], row[:2]
                ) if normalize_cell(source) != normalize_cell(saved)]
                if mismatched_fields:
                    metadata_mismatches.append({"case": number, "fields": mismatched_fields})
            item["results"][model_dir.name] = {
                "rows": len(rows), "response_headers": header[4:], "original_widths": widths,
                "legacy_padding_cases": legacy, "metadata_mismatches_against_current_tsv": metadata_mismatches,
            }
        classes[cls] = item

    groups = collections.defaultdict(collections.Counter)
    files, mismatches = [], []
    pattern = re.compile(r"(.+)_(class[1-3])_col([1-4])\.csv")
    for path in sorted((repo / "validation").glob("*.csv")):
        match = pattern.fullmatch(path.name)
        if match is None:
            raise ValueError(f"Invalid validation filename: {path.name}")
        model, cls, col = match.group(1), match.group(2), int(match.group(3))
        records = read_csv(path)
        if records[0] != ["expected_output", "model_output", "scheme_correct", "semantic_match"]:
            raise ValueError(f"Invalid validation header: {path.name}")
        counter = collections.Counter()
        for number, row in enumerate(records[1:], 1):
            if len(row) != 4 or row[2] not in ("yes", "no") or row[3] not in ("yes", "no"):
                raise ValueError(f"Invalid binary row: {path.name}/{number}")
            if lexical_scheme(row[1]) != row[2]:
                mismatches.append({"file": path.name, "case": number})
            counter[tuple(row[2:])] += 1
        for group, key in (("overall", "all"), ("model", model), ("class", cls),
                           ("experiment", f"col{col}:{EXPERIMENTS[col]}"),
                           ("model_class", f"{model}/{cls}"),
                           ("model_experiment", f"{model}/col{col}"),
                           ("class_experiment", f"{cls}/col{col}")):
            groups[(group, key)].update(counter)
        files.append({"file": path.name, "rows": len(records) - 1,
                      "outcomes": {f"{s}/{m}": counter[(s,m)] for s,m in
                                   (("yes","yes"),("yes","no"),("no","yes"),("no","no"))}})
    metric_rows = [metric_row(group, key, counter) for (group, key), counter in sorted(groups.items())]
    with (output / "recomputed-metrics.csv").open("w", encoding="utf-8", newline="") as destination:
        writer = csv.writer(destination)
        writer.writerow(["group", "key", "evaluations", "scheme_yes", "semantic_yes", "both_yes",
                         "scheme_percent", "semantic_percent", "both_percent"])
        writer.writerows(metric_rows)
    report = {
        "source_repository": str(repo), "source_head": head, "source_status": status,
        "source_files_hashed": len(manifest), "classes": classes,
        "total_cases": sum(c["cases"] for c in classes.values()),
        "total_images": len(all_image_hashes), "global_unique_image_sha256": len(set(all_image_hashes)),
        "validation_files": files, "current_lexical_scheme_label_mismatches": mismatches,
        "interpretation": "Archived semantic labels only; no model inference or semantic rejudgment.",
    }
    (output / "inventory-and-audit.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"head": head, "cases": report["total_cases"], "global_unique_images": report["global_unique_image_sha256"],
                      "validation_files": len(files), "lexical_label_mismatches": len(mismatches),
                      "metadata_mismatches": {cls: {model: len(info["metadata_mismatches_against_current_tsv"])
                                              for model, info in item["results"].items()} for cls, item in classes.items()},
                      "source_status": status}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

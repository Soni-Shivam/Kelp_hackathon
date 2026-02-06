import csv
from pathlib import Path
from collections import defaultdict


def build_financial_citations(financial_dir: Path):
    citations = {}
    cid = 1

    for csv_file in financial_dir.glob("*.csv"):
        with open(csv_file, encoding="utf-8") as f:
            reader = csv.DictReader(f)

            by_metric = defaultdict(lambda: {"years": set(), "blocks": set()})

            for row in reader:
                metric = row["metric"]
                by_metric[metric]["years"].add(int(row["year"]))
                by_metric[metric]["blocks"].add(row["source_block"])

            for metric, data in by_metric.items():
                citations[f"CIT_{cid:03d}"] = {
                    "used_in": f"typed/financials/{csv_file.name}",
                    "metric": metric,
                    "years": sorted(data["years"]),
                    "source_blocks": sorted(data["blocks"]),
                    "source_type": "canonical_list"
                }
                cid += 1

    return citations

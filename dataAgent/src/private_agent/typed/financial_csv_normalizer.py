import csv
from pathlib import Path


def generate_financial_csvs(financial_section, output_dir: Path):
    """
    Converts template-driven financial raw lines into CSVs.
    Works ONLY with the new canonical structure.
    """

    if not financial_section:
        return

    output_dir.mkdir(parents=True, exist_ok=True)

    raw_lines = financial_section.get("raw_lines", [])
    if not raw_lines:
        return

    # Each line looks like:
    # Metric Name | 2014: value | 2015: value | ...
    records_by_file = {}

    for line in raw_lines:
        parts = [p.strip() for p in line.split("|")]
        if len(parts) < 2:
            continue

        metric = parts[0]

        for year_part in parts[1:]:
            if ":" not in year_part:
                continue

            year, value = year_part.split(":", 1)
            year = year.strip()
            value = value.strip()

            file_key = infer_financial_file(metric)

            records_by_file.setdefault(file_key, []).append({
                "metric": metric,
                "year": year,
                "value": value
            })

    # write CSVs
    for file_key, rows in records_by_file.items():
        path = output_dir / f"{file_key}.csv"
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["metric", "year", "value"])
            writer.writeheader()
            writer.writerows(rows)


def infer_financial_file(metric_name: str):
    m = metric_name.lower()

    if any(k in m for k in ["revenue", "ebitda", "pat", "pbt", "expense", "income"]):
        return "income_statement"

    if any(k in m for k in ["asset", "liabilit", "borrow", "equity", "reserve"]):
        return "balance_sheet"

    if any(k in m for k in ["cash", "flow", "dividend"]):
        return "cash_flow"

    return "ratios"

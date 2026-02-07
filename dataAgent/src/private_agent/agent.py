from pathlib import Path
import json

from .parsers.private_md_canonical_parser import parse_private_md
from .typed.promote_typed import promote_typed
from .typed.sector_inference import infer_sector
from .typed.financial_csv_normalizer import generate_financial_csvs


class PrivateDataIngestionAgent:

    def __init__(self, input_dir, output_dir):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir) / "private"

    def run(self):
        md_path = self.input_dir / "Company_OnePager.md"
        md_text = md_path.read_text(encoding="utf-8")

        canonical = parse_private_md(md_text)
        typed = promote_typed(canonical)
        sector = infer_sector(typed)

        self._prepare_dirs()

        self._write_json(canonical, "canonical.json")

        for name, data in typed.items():
            self._write_json({name: data}, f"typed/{name}.json")

        financial_section = canonical["sections"].get("financial_snapshot")
        if financial_section:
            generate_financial_csvs(
                financial_section,
                self.output_dir / "typed/financials"
            )


        self._write_json(
            {
                "sector": sector,
                "sections_present": list(typed.keys())
            },
            "metadata.json"
        )

    def _prepare_dirs(self):
        (self.output_dir / "typed/financials").mkdir(parents=True, exist_ok=True)

    def _write_json(self, obj, rel):
        path = self.output_dir / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(obj, f, indent=2)

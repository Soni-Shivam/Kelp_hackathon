import json
from pathlib import Path
from .utils import read_json


class MergeAgent:
    def __init__(self, output_dir="data/output"):
        self.base = Path(output_dir)
        self.out = self.base / "merged"

    def run(self):
        self.out.mkdir(parents=True, exist_ok=True)

        merged = {
            "company_identity": {},
            "private": {},
            "public": {}
        }

        # ---------- METADATA ----------
        private_meta = read_json(self.base / "private" / "metadata.json")

        public_meta_path = self.base / "public" / "metadata.json"
        public_meta = read_json(public_meta_path) if public_meta_path.exists() else {}

        merged["company_identity"]["name"] = (
            public_meta.get("company")
            or private_meta.get("company_name")
            or "Unknown"
        )

        merged["company_identity"]["listing_status"] = (
            "listed" if public_meta.get("source") == "screener" else "unlisted"
        )

        # ---------- PRIVATE JSON TYPED (WITH CITATIONS) ----------
        private_typed = self.base / "private" / "typed"
        for file in private_typed.glob("*.json"):
            section = file.stem
            data = read_json(file)

            merged["private"][section] = {
                "data": data,
                "citation": {
                    "source_type": "private",
                    "source_file": str(file)
                }
            }

        # ---------- PRIVATE FINANCIAL CSVs ----------
        fin_dir = private_typed / "financials"
        if fin_dir.exists():
            merged["private"]["financials"] = {}
            for f in fin_dir.glob("*.csv"):
                merged["private"]["financials"][f.stem] = {
                    "type": "csv",
                    "path": str(f),
                    "citation": {
                        "source_type": "private",
                        "source_file": f.name
                    }
                }

        # ---------- PUBLIC JSON TYPED (WITH CITATIONS) ----------
        public_typed = self.base / "public" / "typed"
        if public_typed.exists():
            for file in public_typed.glob("*.json"):
                section = file.stem
                data = read_json(file)

                merged["public"][section] = {
                    "data": data,
                    "citation": {
                        "source_type": "public",
                        "source_file": str(file),
                        "source_url": public_meta.get("screener_url")
                    }
                }

        # ---------- WRITE OUTPUTS ----------
        with open(self.out / "canonical.json", "w", encoding="utf-8") as f:
            json.dump(merged, f, indent=2)

        with open(self.out / "index.json", "w", encoding="utf-8") as f:
            json.dump(
                {
                    "private_sections": list(merged["private"].keys()),
                    "public_sections": list(merged["public"].keys()),
                    "financials": list(
                        merged["private"].get("financials", {}).keys()
                    )
                },
                f,
                indent=2,
            )

        with open(self.out / "metadata.json", "w", encoding="utf-8") as f:
            json.dump(
                {
                    "merge_complete": True,
                    "citations_enabled": True
                },
                f,
                indent=2,
            )

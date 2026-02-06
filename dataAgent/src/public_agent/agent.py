import json
from pathlib import Path

from src.public_agent.screener_search import search_company
from src.public_agent.screener_fetch import fetch_company_page
from src.public_agent.screener_parser import parse_screener
from src.public_agent.typed.promote_typed import promote_public_typed


class PublicDataAgent:

    def __init__(self, company_name, output_dir):
        self.company_name = company_name
        self.output_dir = Path(output_dir) / "public"

    def run(self):
        search_result = search_company(self.company_name)
        html = fetch_company_page(search_result["url"])

        canonical = parse_screener(html)
        typed = promote_public_typed(canonical)

        self._prepare_dirs()

        self._write_json(canonical, "canonical.json")

        for section, content in typed.items():
            self._write_json(
                {section: content},
                f"typed/{section}.json"
            )

        self._write_json(
            {
                "source": "screener",
                "company": canonical["company_identity"]["official_name"],
                "screener_url": search_result["url"],
                "sections_present": list(typed.keys())
            },
            "metadata.json"
        )

    def _prepare_dirs(self):
        (self.output_dir / "typed").mkdir(parents=True, exist_ok=True)

    def _write_json(self, obj, rel):
        path = self.output_dir / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(obj, f, indent=2)

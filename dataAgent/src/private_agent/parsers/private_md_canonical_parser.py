from .section_map import SECTION_MAP


def parse_private_md(md_text: str):
    canonical = {
        "source": "private_examples_v1",
        "sections": {}
    }

    current_section = None

    for raw_line in md_text.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        # section header
        if line.startswith("#"):
            header = line.lstrip("#").strip().lower()
            for k, v in SECTION_MAP.items():
                if k in header:
                    current_section = v
                    canonical["sections"].setdefault(v, {"raw_lines": []})
                    break
            continue

        if not current_section:
            continue

        canonical["sections"][current_section]["raw_lines"].append(line)

    return canonical

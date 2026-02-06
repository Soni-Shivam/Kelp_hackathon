def promote_typed(canonical):
    typed = {}

    for section, data in canonical["sections"].items():
        if section == "financial_snapshot":
            continue

        text = "\n".join(data["raw_lines"]).strip()
        if not text:
            continue

        typed[section] = [{
            "text": text,
            "section": section,
            "source": canonical["source"]
        }]

    return typed

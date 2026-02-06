def infer_sector(typed):
    blob = " ".join(
        entry["text"].lower()
        for section in typed.values()
        for entry in section
    )

    if any(k in blob for k in ["forging", "machining", "manufacturing", "plant"]):
        return {
            "sector": "manufacturing",
            "sub_sector": "industrial_components",
            "confidence": 0.9
        }

    if any(k in blob for k in ["software", "platform", "saas"]):
        return {
            "sector": "technology",
            "sub_sector": "software_services",
            "confidence": 0.85
        }

    return {
        "sector": "unknown",
        "sub_sector": None,
        "confidence": 0.3
    }

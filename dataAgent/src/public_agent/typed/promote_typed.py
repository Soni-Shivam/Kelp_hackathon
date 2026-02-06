def promote_public_typed(canonical):
    typed = {}

    for section, data in canonical["sections"].items():
        if "raw_text" in data:
            typed[section] = [{
                "text": data["raw_text"],
                "source": data["source"],
                "confidence": 1.0
            }]

        elif "raw_fields" in data:
            typed[section] = [{
                "fields": data["raw_fields"],
                "source": data["source"],
                "confidence": 1.0
            }]

        elif "companies" in data:
            typed[section] = [{
                "companies": data["companies"],
                "source": data["source"],
                "confidence": 1.0
            }]

    return typed

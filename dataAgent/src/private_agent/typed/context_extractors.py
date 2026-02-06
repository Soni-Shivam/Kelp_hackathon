def extract_operations(key_value_blocks):
    ops = {}

    for kv in key_value_blocks:
        key = kv["key"].lower()
        value = kv["value"]

        if "plant" in key:
            ops["manufacturing_facilities"] = value
        if "employee" in key:
            ops["employee_count"] = value
        if "erp" in key or "sap" in value.lower():
            ops["erp_system"] = value

    return ops


def extract_business_profile(raw_blocks):
    profile = {
        "descriptions": []
    }

    for block in raw_blocks:
        if "business" in block["section"]:
            profile["descriptions"].append(block["text"])

    return profile

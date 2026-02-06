from collections import defaultdict

FINANCIAL_SECTIONS = {
    "income statement",
    "balance sheet",
    "cash flow",
    "ratios"
}

SECTION_ROUTING = {
    "business": "business_profile",
    "overview": "business_profile",
    "company": "business_profile",

    "operation": "operations",
    "manufacturing": "operations",
    "facility": "operations",
    "plant": "operations",

    "customer": "customers",
    "client": "customers",
    "oem": "customers",

    "product": "products_services",
    "service": "products_services",

    "milestone": "milestones",
    "history": "milestones",

    "risk": "risks",
    "swot": "swot",

    "award": "awards",
    "certification": "awards",
}


def route_section(section_name: str) -> str:
    s = section_name.lower()
    for k, v in SECTION_ROUTING.items():
        if k in s:
            return v
    return "other_disclosures"


def promote_canonical_to_typed(canonical):
    """
    SECTION-LEVEL promotion.
    Merges lists + raw blocks.
    Guarantees NO DATA LOSS.
    """

    # group canonical content by section
    section_content = defaultdict(lambda: {
        "texts": [],
        "source_blocks": set()
    })

    # lists
    for lst in canonical.get("lists", []):
        section = lst["section"].lower().replace("#", "").strip()
        if section in FINANCIAL_SECTIONS:
            continue

        for item in lst.get("items", []):
            if item.strip():
                section_content[section]["texts"].append(item.strip())
                section_content[section]["source_blocks"].add(lst["list_id"])

    # raw blocks
    for raw in canonical.get("raw_blocks", []):
        section = raw["section"].lower().replace("#", "").strip()
        if section in FINANCIAL_SECTIONS:
            continue

        text = raw.get("text", "").strip()
        if text:
            section_content[section]["texts"].append(text)
            section_content[section]["source_blocks"].add(raw["block_id"])

    # promote
    typed = defaultdict(list)

    for section, data in section_content.items():
        if not data["texts"]:
            continue  # ONLY skip truly empty sections

        category = route_section(section)

        typed[category].append({
            "text": "\n".join(data["texts"]),
            "section": section,
            "source_blocks": sorted(list(data["source_blocks"]))
        })

    return typed

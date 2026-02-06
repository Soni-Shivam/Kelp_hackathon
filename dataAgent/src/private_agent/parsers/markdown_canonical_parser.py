from pathlib import Path
import re
import uuid

def uid(prefix):
    return f"{prefix}_{uuid.uuid4().hex[:8]}"

def parse_markdown_to_canonical(md_path: Path):
    text = md_path.read_text(encoding="utf-8")
    lines = text.splitlines()

    sections = []
    tables = []
    lists = []
    key_values = []
    raw_blocks = []

    current_section = "root"
    section_order = 0
    buffer = []

    def flush_buffer():
        nonlocal buffer
        if buffer:
            raw_blocks.append({
                "block_id": uid("raw"),
                "section": current_section,
                "text": "\n".join(buffer).strip()
            })
            buffer = []

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Heading
        if line.startswith("##"):
            flush_buffer()
            section_order += 1
            title = line.replace("##", "").strip()
            current_section = title.lower()
            sections.append({
                "section_id": uid("sec"),
                "title": title,
                "level": 2,
                "order": section_order
            })
            i += 1
            continue

        # Markdown table
        if "|" in line and i + 1 < len(lines) and "---" in lines[i + 1]:
            headers = [h.strip().lower() for h in line.split("|") if h.strip()]
            rows = []
            i += 2
            while i < len(lines) and "|" in lines[i]:
                row = [c.strip() for c in lines[i].split("|") if c.strip()]
                rows.append(row)
                i += 1

            tables.append({
                "table_id": uid("tbl"),
                "section": current_section,
                "headers": headers,
                "rows": rows,
                "source_block": "markdown_table"
            })
            continue

        # Bullet list
        if line.startswith("- "):
            items = []
            while i < len(lines) and lines[i].strip().startswith("- "):
                items.append(lines[i].strip()[2:])
                i += 1

            lists.append({
                "list_id": uid("lst"),
                "section": current_section,
                "items": items
            })
            continue

        # Key-value pattern
        if ":" in line and len(line.split(":")) == 2:
            k, v = line.split(":", 1)
            key_values.append({
                "block_id": uid("kv"),
                "section": current_section,
                "key": k.strip(),
                "value": v.strip()
            })
            i += 1
            continue

        # Otherwise raw text
        buffer.append(line)
        i += 1

    flush_buffer()

    return {
        "sections": sections,
        "tables": tables,
        "lists": lists,
        "key_values": key_values,
        "raw_blocks": raw_blocks
    }

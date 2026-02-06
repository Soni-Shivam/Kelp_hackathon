import uuid

def generate_cid(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:8]}"

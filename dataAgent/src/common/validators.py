def validate_cids_exist(objects, citation_map):
    for obj in objects:
        for cid in getattr(obj, "source_cids", []):
            if cid not in citation_map:
                raise ValueError(f"Missing citation for CID: {cid}")

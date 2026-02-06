import requests

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

def search_company(company_name: str):
    url = "https://www.screener.in/api/company/search/"
    params = {"q": company_name}

    r = requests.get(url, params=params, headers=HEADERS, timeout=15)
    if r.status_code != 200:
        raise RuntimeError("Screener search API failed")

    results = r.json()
    if not results:
        raise RuntimeError("No company found on Screener")

    # Pick best match (exact name match preferred)
    for res in results:
        if company_name.lower() in res["name"].lower():
            return res

    return results[0]  # fallback

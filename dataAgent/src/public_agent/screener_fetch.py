import requests

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

def fetch_company_page(company_url: str) -> str:
    full_url = f"https://www.screener.in{company_url}"
    r = requests.get(full_url, headers=HEADERS, timeout=15)

    if r.status_code != 200:
        raise RuntimeError(f"Failed to fetch Screener page: {full_url}")

    return r.text

from bs4 import BeautifulSoup

def parse_screener(html: str):
    soup = BeautifulSoup(html, "html.parser")

    canonical = {
        "company_identity": {},
        "sections": {}
    }

    # ---------- Company name ----------
    h1 = soup.find("h1")
    if not h1:
        raise RuntimeError("Company name not found on Screener page")

    canonical["company_identity"]["official_name"] = h1.text.strip()

    # ---------- Company profile ----------
    profile = soup.find("div", class_="company-profile")
    if profile:
        canonical["sections"]["company_profile"] = {
            "source": "screener",
            "raw_text": profile.get_text("\n", strip=True)
        }

    # ---------- Top ratios / market snapshot ----------
    ratios = {}
    ratio_items = soup.select("ul#top-ratios li")
    for li in ratio_items:
        name = li.find("span", class_="name")
        value = li.find("span", class_="value")
        if name and value:
            ratios[name.text.strip()] = value.text.strip()

    if ratios:
        canonical["sections"]["market_presence"] = {
            "source": "screener",
            "raw_fields": ratios
        }

    # ---------- Peers ----------
    peers = []
    peer_tables = soup.find_all("table", class_="data-table")
    if peer_tables:
        peer_table = peer_tables[0]
        rows = peer_table.find_all("tr")[1:]
        for r in rows:
            cols = [c.get_text(strip=True) for c in r.find_all("td")]
            if cols:
                peers.append({
                    "name": cols[0],
                    "market_cap": cols[1] if len(cols) > 1 else None
                })

    if peers:
        canonical["sections"]["peers"] = {
            "source": "screener",
            "companies": peers
        }

    # ---------- Industry ----------
    industry = soup.find("span", class_="industry")
    if industry:
        canonical["sections"]["industry_context"] = {
            "source": "screener",
            "raw_text": industry.text.strip()
        }

    return canonical

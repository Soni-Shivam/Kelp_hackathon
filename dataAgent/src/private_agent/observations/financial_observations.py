import pandas as pd


def derive_financial_observations(financial_dir):
    observations = []

    income_path = financial_dir / "income_statement.csv"
    if not income_path.exists():
        return observations

    df = pd.read_csv(income_path)

    rev = df[df["metric"] == "revenue_from_operations"]
    if len(rev) >= 3:
        rev = rev.sort_values("year")
        growth = rev.iloc[-1]["value"] - rev.iloc[0]["value"]

        if growth > 0:
            observations.append({
                "type": "revenue_growth",
                "summary": "Revenue has grown over the observed period",
                "confidence": "high",
                "supporting_years": [int(rev.iloc[0]["year"]), int(rev.iloc[-1]["year"])]
            })

    return observations

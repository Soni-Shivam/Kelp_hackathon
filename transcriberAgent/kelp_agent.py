import pandas as pd
import json
import os
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# ==========================================================
# CONFIG
# ==========================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = "llama-3.3-70b-versatile"
MAX_RETRIES = 3

client = Groq(api_key=GROQ_API_KEY)

# ==========================================================
# LOAD DATA (WITH UTF-8 FIX)
# ==========================================================

def load_financials():
    try:
        return (
            pd.read_csv("financials/income_statement.csv"),
            pd.read_csv("financials/balance_sheet.csv"),
            pd.read_csv("financials/cash_flow.csv"),
            pd.read_csv("financials/ratios.csv"),
        )
    except FileNotFoundError:
        print("Warning: CSV files not found. Using empty DataFrames.")
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

def load_private_jsons():
    try:
        # Enforcing UTF-8 to handle special characters (e.g., ₹)
        business = json.load(open("business_description.json", encoding="utf-8"))
        swot = json.load(open("swot.json", encoding="utf-8"))
        milestones = json.load(open("key_milestones.json", encoding="utf-8"))
        return business, swot, milestones
    except FileNotFoundError:
        print("Warning: JSON files not found. Using empty dicts.")
        return {}, {}, {}

# ==========================================================
# PARSERS
# ==========================================================

def extract_text(block, key):
    text = ""
    if key in block:
        for item in block[key]:
            text += item.get("text", "") + "\n"
    return text

# ==========================================================
# FINANCIAL SUMMARY
# ==========================================================

def summarize_financials(income, balance, cashflow, ratios):
    def get_last_row(df):
        return df.iloc[-1].to_dict() if not df.empty else "Data not available"

    return f"""
FINANCIAL SNAPSHOT:
Income: {get_last_row(income)}
Balance: {get_last_row(balance)}
Cashflow: {get_last_row(cashflow)}
Ratios: {get_last_row(ratios)}
"""

# ==========================================================
# SYSTEM PROMPT (STRICT SCHEMA ENFORCEMENT)
# ==========================================================

SYSTEM_PROMPT = """
You are a Senior Engagement Manager at McKinsey. 
You are generating a JSON file for a high-stakes "Teaser" presentation.

=====================
CORE INSTRUCTIONS
=====================
1. **FLAT ARCHITECTURE ONLY:** Strictly NO "composite_block" or "sub_blocks".
2. **HIGH DENSITY & VERBOSITY:** Each slide must contain 5 blocks. 
3. **SENTENCE FORMULA:** Every bullet point in `verbose_bullets` must follow this structure: [Observation of Fact] + [Quantifiable Impact] + [Strategic Forward-Looking Implication].
4. **NO FRAGMENTS:** Each bullet point MUST be a full, complex sentence of at least 25-30 words. Use **markdown bolding** on the most critical strategic insight within each sentence.
5. **MINIMIZE VISUALS, MAXIMIZE CONTEXT:** For `visual_map` blocks, keep the `detailed_image_prompt` concise, but make the surrounding `text_deep_dive` blocks extremely dense with institutional knowledge.
6. **SYNTHESIZE DATA:** Replace any missing financial metrics with realistic industry benchmarks to ensure a professional finish.   

=====================
JSON SCHEMA DEFINITION
=====================
Return a single JSON object matching this structure exactly:

{
  "project_code_name": "string",
  "sector": "string",
  "slides": [
    {
      "slide_number": integer,
      "title": "string (The main headline)",
      "kicker": "string (Small context label, uppercase)",
      "blocks": [
        {
          "block_id": integer,
          "block_type": "string (text_deep_dive, dashboard_grid, visual_map, logo_grid, chart_complex)",
          "heading": "string",
          "citation": "string (Optional source)",
          
          // IF type == text_deep_dive:
          "verbose_bullets": ["Detailed full sentence 1", "Detailed full sentence 2"], 
          "style_variant": integer,

          // IF type == dashboard_grid:
          "contextual_metrics": { "Key Label": "Value" }, 

          // IF type == visual_map:
          "detailed_image_prompt": "string",

          // IF type == logo_grid:
          "logos": ["string", "string"],

          // IF type == chart_complex:
          "chart_data": {
            "title": "string",
            "chart_type": "bar" | "line" | "doughnut" | "stacked_bar" | "combo_bar_line",
            "labels": ["string"],
            "datasets": [
                { "label": "string", "data": [1, 2], "type": "string" }
            ],
            "strategic_analysis": "string"
          }
        }
      ]
    }
  ]
}

=====================
SLIDE STRATEGY
=====================
1. **Slide 1: Executive Summary & Financial Velocity** (Mix of Text, Dashboard, and Growth Chart)
2. **Slide 2: Operational Deep Dive & Compliance** (MUST include a 'logo_grid' block for certifications here)
3. **Slide 3: Strategic Outlook & Market Benchmarking** (Competitor logo grid, Market Size chart, Future Roadmap)
"""

# ==========================================================
# USER PROMPT
# ==========================================================

def build_prompt(financials, business, swot, milestones):
    return f"""
INPUT DATA:
----------------
{business}
{swot}
{milestones}
{financials}

----------------
TASK:
Generate the presentation JSON focusing on "Information Density."

REQUIREMENTS:
- **Slide Layout:** Use a 4:1 ratio of Text Blocks to Image Blocks to maximize written depth.
- **Bullet Depth:** Transform simple data into "Executive Insights." 
  *Instead of:* "Revenue grew 10%," 
  *Use:* "The company achieved a **10% year-over-year revenue expansion**, driven primarily by optimized supply chain efficiencies and aggressive market penetration in Tier-1 regions, positioning the entity for a sustained 15% CAGR over the next fiscal triennium."
- **Image Prompts:** Keep the `visual_map` blocks focused on high-level conceptual diagrams (e.g., "Global Logistics Network Hub-and-Spoke Model") rather than large decorative photos.
- **Mandatory:** Include a `logo_grid` in Slide 2 listing at least 4 key certification or compliance bodies.
"""

# ==========================================================
# VALIDATOR
# ==========================================================

def validate_json(output):
    try:
        data = json.loads(output)
        
        # Check Root
        if "slides" not in data or len(data["slides"]) != 3:
            print(f"Validation Fail: Slide count is {len(data.get('slides', []))}, expected 3")
            return False
        
        for slide in data["slides"]:
            if "blocks" not in slide:
                return False
                
            for block in slide["blocks"]:
                # Check for forbidden architecture
                if "sub_blocks" in block or block.get("block_type") == "composite_block":
                    print("Validation Fail: Forbidden 'composite_block' found.")
                    return False
                
                # Check specific field requirements
                b_type = block.get("block_type")
                
                if b_type == "text_deep_dive" and "verbose_bullets" not in block:
                    print(f"Fail: text_deep_dive missing verbose_bullets in block {block.get('block_id')}")
                    return False
                
                if b_type == "dashboard_grid" and "contextual_metrics" not in block:
                    print(f"Fail: dashboard_grid missing contextual_metrics in block {block.get('block_id')}")
                    return False

                if b_type == "chart_complex" and "chart_data" not in block:
                    print(f"Fail: chart_complex missing chart_data in block {block.get('block_id')}")
                    return False

        return True
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        return False
    except Exception as e:
        print(f"Validation Error: {e}")
        return False

# ==========================================================
# GENERATOR LOOP
# ==========================================================

def generate(prompt):
    for i in range(MAX_RETRIES):
        print(f"Generating... Attempt {i+1}")
        
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1, 
            max_tokens=7000 
        )

        output = response.choices[0].message.content
        output = re.sub(r"```json", "", output)
        output = re.sub(r"```", "", output).strip()

        if validate_json(output):
            return output

        print(f"Retry {i+1}: Invalid JSON output.")

    raise Exception("Failed to generate valid JSON after retries")

# ==========================================================
# MAIN
# ==========================================================

def main():
    income, balance, cashflow, ratios = load_financials()
    business_json, swot_json, milestone_json = load_private_jsons()

    business_text = extract_text(business_json, "business_description")
    swot_text = extract_text(swot_json, "swot")
    milestone_text = extract_text(milestone_json, "key_milestones")

    financial_summary = summarize_financials(income, balance, cashflow, ratios)

    prompt = build_prompt(
        financial_summary,
        business_text,
        swot_text,
        milestone_text
    )

    try:
        presentation = generate(prompt)
        with open("presentation.json", "w", encoding="utf-8") as f:
            f.write(presentation)
        print("\n✅ Presentation generated successfully: 'presentation.json'\n")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()
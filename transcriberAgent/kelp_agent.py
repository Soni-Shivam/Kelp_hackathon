import pandas as pd
import json
import os
import re
import requests
import io
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# ==========================================================
# 1. CONFIGURATION
# ==========================================================

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

MODEL_NAME = "gemini-3-flash-preview" 
MAX_RETRIES = 3
API_URL = "http://localhost:8000/trigger-agent"

# ==========================================================
# 2. PROMPT CONFIGURATION (EDIT THIS SECTION)
# ==========================================================

# A. The Core Persona & Constraints (Applies to ALL sectors)
CORE_PERSONA = """
You are an elite Investment Banking Analyst at a top-tier firm (Goldman Sachs/Morgan Stanley). 
You are tasked with writing a high-stakes, "Blind" Investment Teaser (CIM) for a potential acquisition target.

CORE DIRECTIVES (NON-NEGOTIABLE):
1. **THE "BLIND" FACTOR:** You MUST completely anonymize the company. NEVER use the specific company name. Refer to it as "The Company," "The Entity," or "Market Leader." Remove specific locations if they reveal identity.
2. **INVESTMENT BANKING TONE:** Your writing must be punchy, persuasive, and value-focused. Use terms like "EBITDA expansion," "blue-chip client base," "mission-critical," and "high-barrier-to-entry."
3. **FLAT ARCHITECTURE:** Strictly NO "composite_block" or "sub_blocks".
4. **DENSITY & VERBOSITY:** Each slide must contain 5 to 8 blocks. 
5. **THE "VALUE" FORMULA:** Every bullet point in `verbose_bullets` must follow this structure: [Key Metric/Fact] + [Operational Driver] + [Forward-Looking Investment Merits].
   - *Bad:* "Revenue grew 10% last year."
   - *Good:* "Delivered consistent double-digit top-line growth (10% YoY), underpinned by a pivot to high-margin export markets, signaling strong potential for sustained EBITDA expansion."
6. **DATA & FACTS:** Use real-world data and facts to support your claims. Avoid speculation and unsubstantiated claims.
7. **CITATION INTEGRITY:** Every single data point must be traceable. You will output a specific "source_map" for every slide.
8. **VISUAL INTELLIGENCE:** For `detailed_image_prompt`, write cinematic, photorealistic AI image prompts (e.g., "Midjourney style, 8k, cinematic lighting, corporate, clean lines") that represent the sector abstractly without showing specific logos.
"""
SECTOR_STRATEGIES = """
SECTOR RECOGNITION & ADAPTATION LOGIC: (ADAPT & CONQUER)
Analyze the input data to detect the company's "Archetype" and apply the specific slide strategy below.

### SECTOR LOGIC (ADAPT & CONQUER):
Analyze the input to classify the company into one of these archetypes:

* **ARCHETYPE A: MANUFACTURING (Ind. Goods, Chemicals, Pharma)**
    * *Focus:* Asset Base, Certifications, Capacity Utilization, Export %.
    * *Visuals:* Aerial factory shots (no logos), R&D labs, supply chain maps.
* **ARCHETYPE B: CONSUMER / D2C (Retail, E-com, FMCG)**
    * *Focus:* Unit Economics (CAC/LTV), Brand Stickiness (Repeat Rate), Channel Mix (Amazon vs. Own Website).
    * *Visuals:* Lifestyle product usage, packaging detail (blur logos), mobile app UI.
* **ARCHETYPE C: SAAS / TECH**
    * *Focus:* ARR, Churn, Rule of 40, Tech Stack, Client Tiering.
    * *Visuals:* Network topology, abstract data visualization, dashboard mockups.
"""

# C. The Strict JSON Output Format
JSON_SCHEMA = """
Return a single JSON object matching this structure exactly:
{
  "project_code_name": "string (A cool, abstract M&A code name, e.g., 'Project Titan')",
  "sector": "string (The detected sector, e.g., 'Specialty Chemicals')",
  "slides": [
    {
      "slide_number": integer,
      "title": "string (Use the Title defined in the Sector Strategy)",
      "kicker": "string (Upper case context label, e.g., 'INVESTMENT HIGHLIGHTS')",
      "blocks": [
        {
          "block_id": integer,
          "block_type": "string (text_deep_dive, dashboard_grid, visual_map, logo_grid, chart_complex)",
          "heading": "string (Short & Punchy)",
          "citation": "string (Mandatory source)",
          "verbose_bullets": ["Detailed full sentence 1", "Detailed full sentence 2"], 
          "style_variant": integer,
          "contextual_metrics": { "Key Label": "Value" }, 
          "detailed_image_prompt": "string (Photorealistic, atmospheric description)",
          "logos": ["string", "string"],
          "chart_data": {
            "title": "string",
            "chart_type": "bar" | "line" | "doughnut" | "stacked_bar" | "combo_bar_line",
            "labels": ["string"],
            "datasets": [ { "label": "string", "data": [1, 2], "type": "string" } ],
            "strategic_analysis": "string"
          }
        }
      ]
    }
  ]
}
"""

# D. The Template to Inject Data
USER_INPUT_TEMPLATE = """
=====================
INPUT DATA PACK 
INSTRUCTION: GENERATE BLIND TEASER (JSON)

=====================
**BUSINESS OVERVIEW:**
{business}

**STRATEGIC SWOT ANALYSIS:**
{swot}

**OPERATIONAL MILESTONES:**
{milestones}

**FINANCIAL DATA:**
{financials}

=====================
MISSION: GENERATE "BLIND" TEASER JSON
=====================
1. Detect the sector based on the input above.
2. Select the appropriate "Slide Strategy" from the System Instructions, if none is found, make your own strategy.
3. Synthesize the data into the JSON format.
4. Ensure strictly NO mention of the specific company name.
5. LAYOUT & BLOCK COUNT RULES (CRITICAL)
    You must generate exactly **5, 6, or 7 blocks** per slide to trigger specific layouts:
    * **5 Blocks (The "Split" Layout):** Use for slides with big visuals.
        * *Result:* Top Half = 3 Blocks (Key Metrics/Title), Bottom Half = 2 Blocks (detailed text).
    * **6 Blocks (The "Balanced" Layout):** Use for dense financial slides.
        * *Result:* Top Half = 3 Blocks, Bottom Half = 3 Blocks.
    * **7 Blocks (The "Deep Dive" Layout):** Use for the final "Investment Highlights" slide.
        * *Result:* Top Half = 4 Blocks (Quick wins), Bottom Half = 3 Blocks (Detailed text).
        8 Blocks 
        * *Result:* Top Half = 5 Blocks (Quick wins), Bottom Half = 3 Blocks (Detailed text).
5. **CONSTRAINT:** Limit all `text_deep_dive` blocks to exactly **3 bullet points**.
          "verbose_bullets": [
             "High-impact bullet point 1", 
             "High-impact bullet point 2", 
             "High-impact bullet point 3"
          ], 
          // CONSTRAINT: Must have EXACTLY 3 items. dont have too lengthy bullet points, keep them short and punchy.
7. Generate atleast 2 charts, with quality data.
8. You must bold important words. do not overdo it. use markdown bold syntax ie **text**.
9. ###. CITATION STRICTNESS [cite: 21, 60]
* **Rule:** Every block MUST have a `citation` string. 
* **Format:** If a block uses multiple sources (e.g., Private Financials + Public Blog), combine them: "Private Data Pack (Sheet 1) | TechCrunch Blog (2024)."

10. BLOCK TYPES
Use these `block_type` values strategically:
* `text_deep_dive`: For the "Investment Hook" (Strictly 3 bullets).
* `dashboard_grid`: For KPI boxes (Revenue, EBITDA).
* `chart_complex`: For "Growth" or "Market Share" graphs.
* `visual_map`: For "images"
* `logo_grid`: For "Certifications" or "Client Logos" (Use placeholders like "Fortune 500 Client 1").

11. Have the charts be of high quality, with proper labels and titles, and keep them in top half of the slide.
12. Keep the text_deep_dive blocks to exactly **3 bullet points** and each point MUST have an letter count less than 110 character. But if the text_deep_dive is in the lower half and the number of blocks in the slide are odd then you can use maximum 130 characters for each bullet point. Also if there are 7 block being used and the text_deep_dive is in the top half of the slide then you can use maximum 70 characters for each bullet point.
13. When using dashboard_grid, make sure to use 4 KPI boxes.
14. When using logo_grid, make sure to use even number of logos.
Generate the JSON now.
"""

# Assemble the final System Prompt
FULL_SYSTEM_PROMPT = f"{CORE_PERSONA}\n\n{SECTOR_STRATEGIES}\n\n{JSON_SCHEMA}"

# ==========================================================
# 3. HELPER FUNCTIONS (DATA PROCESSING)
# ==========================================================

def fetch_data_from_api(company_name, md_file_path):
    print(f"Fetching data for {company_name} from API...")
    try:
        with open(md_file_path, "r", encoding="utf-8") as f:
            md_content = f.read()
        
        payload = {
            "company_name": company_name,
            "md_content": md_content
        }
        
        response = requests.post(API_URL, json=payload)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching data from API: {e}")
        return None

def extract_financials(api_output):
    try:
        fin_data = api_output.get("output", {}).get("private", {}).get("typed", {}).get("financials", {})
        
        def read_csv_str(filename):
            content = fin_data.get(filename)
            if content:
                return pd.read_csv(io.StringIO(content))
            return pd.DataFrame()

        return (
            read_csv_str("income_statement.csv"),
            read_csv_str("balance_sheet.csv"),
            read_csv_str("cash_flow.csv"),
            read_csv_str("ratios.csv"),
        )
    except Exception as e:
        print(f"Error extracting financials: {e}")
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

def extract_private_jsons(api_output):
    try:
        typed_data = api_output.get("output", {}).get("private", {}).get("typed", {})
        
        def get_json(filename):
            return typed_data.get(filename, {})

        return (
            get_json("business_description.json"),
            get_json("swot.json"),
            get_json("key_milestones.json")
        )
    except Exception as e:
        print(f"Error extracting private JSONs: {e}")
        return {}, {}, {}

def extract_text(block, key):
    text = ""
    if key in block:
        for item in block[key]:
            text += item.get("text", "") + "\n"
    return text

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
# 4. GENERATOR LOGIC
# ==========================================================

def validate_json(output):
    try:
        data = json.loads(output)
        
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
                
                # Basic field checks
                b_type = block.get("block_type")
                if b_type == "text_deep_dive" and "verbose_bullets" not in block: return False
                if b_type == "dashboard_grid" and "contextual_metrics" not in block: return False
                if b_type == "chart_complex" and "chart_data" not in block: return False

        return True
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        return False
    except Exception as e:
        print(f"Validation Error: {e}")
        return False

def generate(prompt):
    # Initialize the model using the FULL_SYSTEM_PROMPT constructed at the top
    model = genai.GenerativeModel(
        model_name=MODEL_NAME,
        system_instruction=FULL_SYSTEM_PROMPT,
        generation_config={
            "temperature": 0.1,
            "response_mime_type": "application/json",
            "max_output_tokens": 8192
        }
    )

    for i in range(MAX_RETRIES):
        print(f"Generating... Attempt {i+1}")
        try:
            response = model.generate_content(prompt)
            output = response.text
            
            # Clean formatting
            output = re.sub(r"```json", "", output)
            output = re.sub(r"```", "", output).strip()

            if validate_json(output):
                return output
            else:
                print(f"Retry {i+1}: JSON Validation failed.")
                
        except Exception as e:
            print(f"Retry {i+1} failed with error: {e}")

    raise Exception("Failed to generate valid JSON after retries")

# ==========================================================
# 5. MAIN EXECUTION
# ==========================================================

def generate_presentation(api_data):
    if not api_data:
        raise Exception("No API data provided")

    # Extract Data
    income, balance, cashflow, ratios = extract_financials(api_data)
    business_json, swot_json, milestone_json = extract_private_jsons(api_data)

    # Process Text
    business_text = extract_text(business_json, "business_description")
    swot_text = extract_text(swot_json, "swot")
    milestone_text = extract_text(milestone_json, "key_milestones")
    financial_summary = summarize_financials(income, balance, cashflow, ratios)

    # Build Prompt using the Template at the top
    prompt = USER_INPUT_TEMPLATE.format(
        business=business_text,
        swot=swot_text,
        milestones=milestone_text,
        financials=financial_summary
    )

    # Generate
    presentation = generate(prompt)
    return json.loads(presentation)

def run_standalone():
    # Example usage
    api_data = fetch_data_from_api(
        company_name="Kalyani Forge Ltd",
        md_file_path="dataAgent/data/input/private/Company_OnePager.md" 
    )
    
    if not api_data:
        print("Aborting: Could not fetch data from API.")
        return

    try:
        presentation_json = generate_presentation(api_data)
        with open("presentation.json", "w", encoding="utf-8") as f:
            json.dump(presentation_json, f, indent=2)
        print("\n✅ Presentation data generated successfully: 'presentation.json'\n")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    run_standalone()
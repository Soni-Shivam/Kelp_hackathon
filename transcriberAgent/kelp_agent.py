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
MAX_RETRIES = 4
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
8. 6. **VISUAL INTELLIGENCE (DUAL MODE):** You must start with word "GENERATIVE" or "SEARCH" based on the mode you are using.
   * **Mode A (Generative):** For `detailed_image_prompt`, write cinematic, photorealistic AI image prompts (e.g., "Midjourney style, 8k, cinematic lighting").
   * **Mode B (Search):** For `Google Search_keywords`, write SIMPLE, factual search queries. 
     * *Bad:* "Cinematic 8k shot of a futuristic automotive factory with blue lighting"
     * *Good:* "automotive assembly line interior" or "industrial forging machinery", or "facebook logo" or "iso certification 9001:2015 logo".
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
6. **CONSTRAINT:** Limit all `text_deep_dive` blocks to exactly **3 bullet points**.
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

# def extract_financials(api_output):
#     try:
#         fin_data = api_output.get("output", {}).get("private", {}).get("typed", {}).get("financials", {})
        
#         def read_csv_str(filename):
#             content = fin_data.get(filename)
#             if content:
#                 return pd.read_csv(io.StringIO(content))
#             return pd.DataFrame()

#         return (
#             read_csv_str("income_statement.csv"),
#             read_csv_str("balance_sheet.csv"),
#             read_csv_str("cash_flow.csv"),
#             read_csv_str("ratios.csv"),
#         )
#     except Exception as e:
#         print(f"Error extracting financials: {e}")
#         return pd.DataFrame(), pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

def extract_financials(api_output):
    try:
        # Safer extraction: Handle case where 'output' might be a list
        output_data = api_output.get("output", {})
        if isinstance(output_data, list):
            output_data = output_data[0] if output_data else {}
            
        private_data = output_data.get("private", {})
        # Handle case where 'private' might be a list
        if isinstance(private_data, list):
            private_data = private_data[0] if private_data else {}

        fin_data = private_data.get("typed", {}).get("financials", {})
        
        def read_csv_str(filename):
            content = fin_data.get(filename)
            if content:
                # Handle potential list structure for CSV content
                if isinstance(content, list):
                    content = content[0] if content else None
                
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

# def validate_json(output):
#     try:
#         data = json.loads(output)
        
#         if "slides" not in data or len(data["slides"]) != 3:
#             print(f"Validation Fail: Slide count is {len(data.get('slides', []))}, expected 3")
#             return False
        
#         for slide in data["slides"]:
#             if "blocks" not in slide:
#                 return False
#             for block in slide["blocks"]:
#                 # Check for forbidden architecture
#                 if "sub_blocks" in block or block.get("block_type") == "composite_block":
#                     print("Validation Fail: Forbidden 'composite_block' found.")
#                     return False
                
#                 # Basic field checks
#                 b_type = block.get("block_type")
#                 if b_type == "text_deep_dive" and "verbose_bullets" not in block: return False
#                 if b_type == "dashboard_grid" and "contextual_metrics" not in block: return False
#                 if b_type == "chart_complex" and "chart_data" not in block: return False

#         return True
#     except json.JSONDecodeError as e:
#         print(f"JSON Parse Error: {e}")
#         return False
#     except Exception as e:
#         print(f"Validation Error: {e}")
#         return False

import typing_extensions as typing

# 1. Define the Strict Schema in Python

class ChartDataset(typing.TypedDict):
    label: str
    data: list[float]
    type: typing.NotRequired[str]

class ChartData(typing.TypedDict):
    title: str
    chart_type: str 
    labels: list[str]
    datasets: list[ChartDataset]
    strategic_analysis: str

class Metric(typing.TypedDict):
    label: str
    value: str

class Block(typing.TypedDict):
    block_id: int
    block_type: str
    heading: str
    citation: str
    verbose_bullets: list[str]
    detailed_image_prompt: str
    # Use list[Metric] instead of dict to avoid "empty object" schema error
    contextual_metrics: list[Metric] 
    chart_data: ChartData 
    logos: list[str]
    image_url: typing.NotRequired[str]

class Slide(typing.TypedDict):
    slide_number: int
    title: str
    kicker: str
    blocks: list[Block]

class Presentation(typing.TypedDict):
    project_code_name: str
    sector: str
    slides: list[Slide]

# ==========================================================
# 4. GENERATOR LOGIC
# ==========================================================

def validate_json(output):
    try:
        data = json.loads(output)
        
        # 1. Sanity Check Root
        if "slides" not in data or not isinstance(data["slides"], list):
            print("Validation Fail: Root JSON missing 'slides' list.")
            return False
            
        # 2. Deep Check
        for i, slide in enumerate(data["slides"]):
            if "blocks" not in slide or not isinstance(slide["blocks"], list):
                print(f"Validation Fail: Slide {i} missing 'blocks' list.")
                return False
                
            for j, block in enumerate(slide["blocks"]):
                # --- THE FIX IS HERE ---
                # Check if 'block' is actually a Dict. If it's a List, fail immediately.
                if not isinstance(block, dict):
                    print(f"CRITICAL FAIL: Slide {i}, Block {j} is a {type(block).__name__}, expected dict.")
                    return False
                
                # Check for forbidden types
                if block.get("block_type") == "composite_block":
                    return False

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

    # 6. Generate Presentation
    presentation = generate(prompt)
    presentation_json = json.loads(presentation)

    # 7. Post-Processing: Fetch Images for Visual Maps & Convert Metrics
    presentation_json = enrich_presentation_with_images(presentation_json)

    return presentation_json

def enrich_presentation_with_images(presentation_json):
    """
    Scans the presentation JSON for 'visual_map' blocks and fetches images.
    Also fixes 'dashboard_grid' metrics format.
    """
    import sys
    # Add parent directory to path to allow importing imageAgent
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    try:
        from imageAgent.src.handler import fetch_google_images, generate_images
        
        # Ensure static images directory exists
        static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'images')
        if not os.path.exists(static_dir):
            os.makedirs(static_dir)

        print("\n--- Starting Image Enrichment & Metric Conversion ---")
        for slide in presentation_json.get("slides", []):
            for block in slide.get("blocks", []):
                
                # A. Metric Conversion (List[Metric] -> Dict[str, str])
                if block.get("block_type") == "dashboard_grid":
                    metrics_list = block.get("contextual_metrics")
                    # If strictly generated as list of dicts, convert to dict
                    if isinstance(metrics_list, list):
                        new_metrics = {}
                        for m in metrics_list:
                            if isinstance(m, dict) and 'label' in m and 'value' in m:
                                new_metrics[m['label']] = m['value']
                            elif isinstance(m, str): # fallback if it was a list of strings
                                pass 
                        # Replace list with dict if conversion successful
                        if new_metrics:
                            block["contextual_metrics"] = new_metrics
                            
                # B. Visual Map Image Fetching
                if block.get("block_type") == "visual_map":
                    heading = block.get("heading", "visualization")
                    prompt = block.get("detailed_image_prompt", heading)
                    
                    # Dual Mode Logic
                    try:
                        # 1. Check for Generative Mode
                        if "GENERATIVE" in prompt.upper():
                            # Extract the prompt part
                            # Remove the keyword to get the clean prompt
                            clean_prompt = re.sub(r'GENERATIVE:?', '', prompt, flags=re.IGNORECASE).strip()
                            # Fallback if empty
                            if not clean_prompt: clean_prompt = f"{heading} cinematic detail"
                            
                            print(f"🎨 GENERATIVE MODE detected for block {block.get('block_id')}")
                            
                            filename = generate_images(prompt=clean_prompt, save_folder=static_dir)
                            
                            if filename:
                                block["image_url"] = f"http://localhost:8001/images/{filename}"
                                print(f"Attached Generated Image: {block['image_url']}")
                            else:
                                print("Generation failed, falling back to placeholder.")
                                # Fallback
                                block["image_url"] = "http://localhost:8001/images/abstract_financial_growth_blue_and_silver_8k_0.jpg"

                        # 2. Search Mode (Default)
                        else:
                            # Extract search terms if "SEARCH" is present
                            if "SEARCH" in prompt.upper():
                                clean_query = re.sub(r'SEARCH:?', '', prompt, flags=re.IGNORECASE).strip()
                            else:
                                # Default behavior if no keyword
                                clean_query = f"{presentation_json.get('sector', '')} {heading} {prompt}"
                                clean_query = clean_query[:100]

                            print(f"🔍 SEARCH MODE detected for block {block.get('block_id')}: {clean_query}")
                            
                            # Fetch 1 image
                            try:
                                fetch_google_images(query=clean_query, num_images=1, save_folder=static_dir)
                            except Exception as e:
                                print(f"Search fetch failed: {e}")
                            
                            # Guess filename (Search handler uses query -> filename)
                            sanitized_query = clean_query.replace(' ', '_')
                            expected_filename = f"{sanitized_query}_0.jpg"
                            
                            image_path = os.path.join(static_dir, expected_filename)
                            
                            if os.path.exists(image_path):
                                block["image_url"] = f"http://localhost:8001/images/{expected_filename}"
                                print(f"Attached Search Image: {block['image_url']}")
                            else:
                                print(f"Warning: Search Image not found at {image_path}. Using fallback.")
                                block["image_url"] = "http://localhost:8001/images/abstract_financial_growth_blue_and_silver_8k_0.jpg"

                    except Exception as img_err:
                        print(f"Failed to process image for block: {img_err}")
                        block["image_url"] = "http://localhost:8001/images/abstract_financial_growth_blue_and_silver_8k_0.jpg"
                        
    except ImportError as e:
        print(f"Warning: Could not import imageAgent.handler: {e}. Image enrichment skipped.")
    except Exception as e:
        print(f"Error during image enrichment: {e}")

    return presentation_json

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
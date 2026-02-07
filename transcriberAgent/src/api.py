from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from transcriberAgent.kelp_agent import generate_presentation
import sys
import os

# Add parent directory to path to allow imports if running from subdir
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

# Mount static images
# Current file is transcriberAgent/src/api.py
# Static dir is transcriberAgent/static/images
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
static_images_dir = os.path.join(base_dir, "static", "images")

# Ensure dir exists
if not os.path.exists(static_images_dir):
    os.makedirs(static_images_dir)

app.mount("/images", StaticFiles(directory=static_images_dir), name="images")

@app.post("/generate_from_data")
async def generate_from_data(request: Request):
    try:
        api_data = await request.json()
        result = generate_presentation(api_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# --- Citation Generator ---
from fastapi.responses import Response
from transcriberAgent.citation_generator import generate_citations_text
import io

@app.post("/generate-citations")
async def generate_citations_endpoint(request: Request):
    """
    Generates a citation text file from the presentation JSON.
    """
    try:
        presentation_data = await request.json()
        citation_text = generate_citations_text(presentation_data)
        
        # Return as a downloadable file response
        return Response(
            content=citation_text,
            media_type="text/plain",
            headers={"Content-Disposition": "attachment; filename=citations.txt"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

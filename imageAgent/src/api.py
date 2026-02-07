from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import sys

# Ensure parent directory is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from imageAgent.src.handler import fetch_google_images, generate_images

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static images
# Current file is imageAgent/src/api.py
# Static dir is imageAgent/downloaded_images and imageAgent/generated_images
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
downloaded_dir = os.path.join(base_dir, "downloaded_images")
generated_dir = os.path.join(base_dir, "generated_images")

# Ensure dirs exist
os.makedirs(downloaded_dir, exist_ok=True)
os.makedirs(generated_dir, exist_ok=True)

# We mount both potentially, or just one unified "images" route if we move them there.
# For now, let's mount them separately to be safe, or just one common one if they shared a parent. 
# But the handler saves to specific folders. 
# Let's map /images/downloaded -> downloaded_images
# and /images/generated -> generated_images

app.mount("/images/downloaded", StaticFiles(directory=downloaded_dir), name="downloaded_images")
app.mount("/images/generated", StaticFiles(directory=generated_dir), name="generated_images")

@app.get("/fetch")
async def fetch_images_endpoint(query: str, num_images: int = 1):
    try:
        # This function saves images to disk and prints filenames
        # We might need to modify handler to return filenames to be useful here, 
        # but for now we just trigger it.
        # Ideally handler should return the path/filename.
        # The current handler prints them. 
        # For the hackathon context, the user is calling this via library import in proper use,
        # but via API here.
        # Let's just run it.
        fetch_google_images(query, num_images, save_folder=downloaded_dir)
        return {"status": "success", "message": f"Images fetched for {query}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/generate")
async def generate_image_endpoint(prompt: str):
    try:
        filename = generate_images(prompt, save_folder=generated_dir)
        if filename:
             return {"status": "success", "image_url": f"/images/generated/{filename}"}
        else:
             raise HTTPException(status_code=500, detail="Generation failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}

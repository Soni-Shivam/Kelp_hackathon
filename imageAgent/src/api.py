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

from fastapi.responses import FileResponse

# Current file is imageAgent/src/api.py
# Static dir is imageAgent/downloaded_images and imageAgent/generated_images
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
downloaded_dir = os.path.join(base_dir, "downloaded_images")
generated_dir = os.path.join(base_dir, "generated_images")

# Ensure dirs exist
os.makedirs(downloaded_dir, exist_ok=True)
os.makedirs(generated_dir, exist_ok=True)

@app.get("/images/downloaded/{filename}")
async def get_downloaded_image(filename: str):
    file_path = os.path.join(downloaded_dir, filename)
    if os.path.exists(file_path):
        headers = {"Access-Control-Allow-Origin": "*"}
        return FileResponse(file_path, headers=headers)
    raise HTTPException(status_code=404, detail="Image not found")

@app.get("/images/generated/{filename}")
async def get_generated_image(filename: str):
    file_path = os.path.join(generated_dir, filename)
    if os.path.exists(file_path):
        headers = {"Access-Control-Allow-Origin": "*"}
        return FileResponse(file_path, headers=headers)
    raise HTTPException(status_code=404, detail="Image not found")

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

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from transcriberAgent.kelp_agent import generate_presentation, set_log_queue, clear_log_queue
import sys
import os
import json
import queue
import threading

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

# Current file is transcriberAgent/src/api.py
# Static dir is transcriberAgent/static/images
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
static_images_dir = os.path.join(base_dir, "static", "images")

# Ensure dir exists
if not os.path.exists(static_images_dir):
    os.makedirs(static_images_dir)

@app.get("/images/{filename}")
async def get_image(filename: str):
    file_path = os.path.join(static_images_dir, filename)
    if os.path.exists(file_path):
        headers = {"Access-Control-Allow-Origin": "*"}
        return FileResponse(file_path, headers=headers)
    raise HTTPException(status_code=404, detail="Image not found")

@app.post("/generate_from_data")
async def generate_from_data(request: Request):
    api_data = await request.json()

    log_q: queue.Queue = queue.Queue(maxsize=500)
    result_holder = {}

    def run_generation():
        set_log_queue(log_q)
        try:
            result = generate_presentation(api_data)
            result_holder["data"] = result
        except Exception as e:
            result_holder["error"] = str(e)
        finally:
            clear_log_queue()
            # Signal done
            log_q.put(None)

    thread = threading.Thread(target=run_generation, daemon=True)
    thread.start()

    def event_stream():
        while True:
            try:
                item = log_q.get(timeout=120)  # 2-min timeout per item
            except queue.Empty:
                yield json.dumps({"type": "error", "detail": "Generation timed out"}) + "\n"
                break

            if item is None:
                # Generation finished — emit final result
                if "error" in result_holder:
                    yield json.dumps({"type": "error", "detail": result_holder["error"]}) + "\n"
                else:
                    yield json.dumps({"type": "result", "data": result_holder["data"]}) + "\n"
                break
            else:
                yield json.dumps(item) + "\n"

    return StreamingResponse(
        event_stream(),
        media_type="application/x-ndjson",
        headers={"Access-Control-Allow-Origin": "*"}
    )

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

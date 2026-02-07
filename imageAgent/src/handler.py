import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('SEARCH_API_KEY')
SEARCH_ENGINE_ID = os.getenv('SEARCH_ENGINE_ID')


def fetch_google_images(query, num_images=5, save_folder='./imageAgent/downloaded_images'):
    """
    Fetches image URLs from Google Custom Search API and downloads them.
    """
    if not os.path.exists(save_folder):
        os.makedirs(save_folder)

    # Google Custom Search API Endpoint
    url = "https://www.googleapis.com/customsearch/v1"
    
    # Parameters for the search
    params = {
        'q': query,
        'key': API_KEY,
        'cx': SEARCH_ENGINE_ID,
        'searchType': 'image', # fast-tracks to image results
        'num': num_images,     # max 10 per request
        'fileType': 'jpg',     # optional: restrict to jpg/png
        'safe': 'active'       # optional: safe search
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        search_results = response.json()

        if 'items' not in search_results:
            print("No images found for this query.")
            return

        print(f"Found {len(search_results['items'])} images. Downloading...")

        for i, item in enumerate(search_results['items']):
            image_url = item['link']
            try:
                # Get the image data
                img_data = requests.get(image_url, timeout=10).content
                
                # Create a filename (e.g., query_0.jpg)
                filename = f"{query.replace(' ', '_')}_{i}.jpg"
                file_path = os.path.join(save_folder, filename)
                
                with open(file_path, 'wb') as handler:
                    handler.write(img_data)
                print(f"Downloaded: {filename}")
                
            except Exception as e:
                print(f"Failed to download image {i}: {e}")

    except Exception as e:
        print(f"Error fetching search results: {e}")

# --- Generative Image Function ---
from google import genai
import base64

def generate_images(prompt, save_folder='./imageAgent/generated_images'):
    """
    Generates images using Google's GenAI (Imagen) model via interactions interface.
    """
    if not os.path.exists(save_folder):
        os.makedirs(save_folder)

    print(f"Generating image for prompt: {prompt[:50]}...")
    
    try:
        # Initialize Client - Version auto-negotiated or default
        client = genai.Client(api_key=API_KEY, http_options={'api_version': 'v1alpha'})
        
        # Using Gemini 3 Pro Image Preview as per user snippet
        try:
            interaction = client.interactions.create(
                model="gemini-3-pro-image-preview",
                input=prompt,
                response_modalities=["IMAGE"]
            )
            
            for i, output in enumerate(interaction.outputs):
                if output.type == "image":
                    # Create a safe filename
                    safe_prompt = "".join([c for c in prompt if c.isalnum() or c in (' ', '_')]).strip().replace(' ', '_')
                    filename = f"gen_{safe_prompt[:50]}_{i}.png"
                    file_path = os.path.join(save_folder, filename)
                    
                    # Decocde and save
                    with open(file_path, "wb") as f:
                        f.write(base64.b64decode(output.data))
                        
                    print(f"Generated and saved: {filename}")
                    return filename # Return the first filename
                    
        except Exception as e:
            if "quota" in str(e).lower() or "429" in str(e):
                print(f"Rate Limit Hit for Image Generation. Skipping.")
                return None
            print(f"Interaction Error: {e}")
            return None
        
    except Exception as e:
        print(f"Failed to generate image: {e}")
        return None

# USAGE
if __name__ == "__main__":
    fetch_google_images(query="golden retriever puppy", num_images=5)
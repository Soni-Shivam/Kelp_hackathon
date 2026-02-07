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

# USAGE
if __name__ == "__main__":
    fetch_google_images(query="golden retriever puppy", num_images=5)
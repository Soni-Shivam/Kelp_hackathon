import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add imageAgent to path to import handler
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from imageAgent.src.handler import fetch_google_images
except ImportError:
    print("Error: Could not import imageAgent.src.handler. Ensure you are running this from the project root.")
    sys.exit(1)

def test_search():
    print("--- Google Image Search Test ---")
    query = input("Enter an image search query: ")
    num = input("Number of images to fetch (default 1): ")
    
    if not num:
        num = 1
    else:
        num = int(num)
        
    save_dir = "./test_downloads"
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
        
    print(f"Searching for '{query}'...")
    try:
        fetch_google_images(query, num_images=num, save_folder=save_dir)
        print(f"\nSuccess! Check the '{save_dir}' folder for results.")
    except Exception as e:
        print(f"\nError: {e}")
        print("\nMake sure your .env file has:")
        print("SEARCH_API_KEY=your_key")
        print("SEARCH_ENGINE_ID=your_id")

if __name__ == "__main__":
    test_search()

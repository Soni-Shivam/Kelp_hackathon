import sys
import os
# Add root to path so we can import backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.schemas import PresentationRequest, Slide
from backend.generator import PresentationGenerator

def test_generation():
    request = PresentationRequest(
        title="Kelp Hackathon Pitch",
        slides=[
            Slide(
                title="Financial Overview",
                type="metrics",
                content={
                    "metrics": [
                        {"label": "Revenue", "value": "$50M"},
                        {"label": "EBITDA", "value": "20%"},
                        {"label": "Growth", "value": "+15% YoY"}
                    ]
                }
            ),
            Slide(
                title="Key Highlights",
                type="bullets",
                content={
                    "points": [
                        "Market Leader in Segment A",
                        "Strong Unit Economics",
                        "Expansion plan ready for Q3"
                    ]
                }
            )
        ]
    )
    
    gen = PresentationGenerator()
    try:
        output_path = gen.generate(request)
        print(f"Success! PPTX generated at: {output_path}")
        
        # Verify file exists and has size
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            print("File verification passed.")
        else:
            print("File verification FAILED (File missing or empty).")
            
    except Exception as e:
        print(f"Error generating presentation: {e}")

if __name__ == "__main__":
    test_generation()

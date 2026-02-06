import os
import json
from pathlib import Path
from src.private_agent.agent import PrivateDataIngestionAgent
from src.public_agent.agent import PublicDataAgent
from src.merge_agent.agent import MergeAgent


def get_directory_structure(root_dir):
    """
    recursively traverses the directory and returns a nested dictionary 
    representing the file structure and contents.
    Files matching *.json are parsed. Others are read as text.
    """
    output = {}
    root_path = Path(root_dir)
    
    if not root_path.exists():
        return {}

    for path in root_path.rglob("*"):
        if path.is_file():
            relative_path = path.relative_to(root_path)
            parts = relative_path.parts
            
            # traverse/build the dict structure
            current_level = output
            for part in parts[:-1]:
                if part not in current_level:
                    current_level[part] = {}
                current_level = current_level[part]
            
            # read file content
            try:
                if path.suffix == ".json":
                    with open(path, "r", encoding="utf-8") as f:
                        content = json.load(f)
                else:
                    content = path.read_text(encoding="utf-8")
                
                current_level[parts[-1]] = content
            except Exception as e:
                 current_level[parts[-1]] = f"Error reading file: {str(e)}"
                 
    return output


def run_data_agent(company_name: str, md_content: str = None):
    # Handle Input File
    if md_content:
        input_path = Path("data/input/Company_OnePager.md")
        input_path.parent.mkdir(parents=True, exist_ok=True)
        input_path.write_text(md_content, encoding="utf-8")

    private_agent = PrivateDataIngestionAgent(
        input_dir="data/input",
        output_dir="data/output"
    )
    private_agent.run()

    #take from input
    public_agent = PublicDataAgent(
        company_name=company_name,
        output_dir="data/output"
    )
    public_agent.run()

    merge_agent = MergeAgent("data/output")
    merge_agent.run()

    # Read all output
    output_data = get_directory_structure("data/output")

    return {"status": "success", "company": company_name, "output": output_data}


def main():
    run_data_agent("Kalyani Forge Ltd")


if __name__ == "__main__":
    main()

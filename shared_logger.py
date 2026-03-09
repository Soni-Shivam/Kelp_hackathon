import os
import json
import logging
from datetime import datetime

# Configure a file handler for LLM logs
project_root = os.path.dirname(os.path.abspath(__file__))
logs_dir = os.path.join(project_root, "llm_logs")
os.makedirs(logs_dir, exist_ok=True)

class LLMLogger:
    def __init__(self, agent_name):
        self.agent_name = agent_name
        self.logger = logging.getLogger(f"LLMLogger_{agent_name}")
        self.logger.setLevel(logging.INFO)
        
        # Avoid adding multiple handlers if already configured
        if not self.logger.handlers:
            log_file = os.path.join(logs_dir, f"{agent_name}_llm_calls.log")
            file_handler = logging.FileHandler(log_file, encoding='utf-8')
            formatter = logging.Formatter('%(asctime)s - %(name)s - %(message)s')
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)

    def log_response(self, prompt, response_text, model_name="unknown"):
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "agent": self.agent_name,
            "model": model_name,
            "prompt": prompt,
            "response": response_text
        }
        self.logger.info(json.dumps(log_entry, indent=2))

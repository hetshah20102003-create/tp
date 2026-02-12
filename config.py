import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
PROJECT_DIR = Path(__file__).parent
load_dotenv(PROJECT_DIR / ".env")

# Anthropic
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# LinkedIn
LINKEDIN_ACCESS_TOKEN = os.getenv("LINKEDIN_ACCESS_TOKEN", "")
LINKEDIN_PERSON_ID = os.getenv("LINKEDIN_PERSON_ID", "")
LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID", "")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET", "")

# Paths
TOPICS_FILE = PROJECT_DIR / "content" / "topics.txt"
POST_HISTORY_FILE = PROJECT_DIR / "logs" / "post_history.json"

"""Configuration for the business suite."""

import os
from pathlib import Path

PACKAGE_DIR = Path(__file__).parent

# Database — SQLite by default so the suite runs with zero external services.
DATABASE_URL = os.getenv(
    "BS_DATABASE_URL", f"sqlite:///{PACKAGE_DIR / 'business_suite.db'}"
)

# Auth / JWT
SECRET_KEY = os.getenv("BS_SECRET_KEY", "dev-secret-change-me-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("BS_TOKEN_EXPIRE_MINUTES", "480"))

# Functional / home currency for the finance module.
BASE_CURRENCY = os.getenv("BS_BASE_CURRENCY", "INR")

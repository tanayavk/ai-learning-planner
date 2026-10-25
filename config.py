"""API configuration and file paths."""
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")


def _load_env(path):
    """Read KEY=VALUE lines from .env (handles BOM / UTF-16 / quotes)."""
    if not os.path.exists(path):
        return
    with open(path, "rb") as f:
        raw = f.read()
    if raw.startswith((b"\xff\xfe", b"\xfe\xff")):
        text = raw.decode("utf-16")
    else:
        text = raw.decode("utf-8-sig")
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and value:
            os.environ[key] = value


_load_env(ENV_PATH)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")

DATA_DIR = os.path.join(BASE_DIR, "data")
PROFILE_PATH = os.path.join(DATA_DIR, "learner_profile.json")
PLAN_PATH = os.path.join(DATA_DIR, "learning_plan.json")

LEVELS = ["Beginner", "Intermediate", "Advanced"]
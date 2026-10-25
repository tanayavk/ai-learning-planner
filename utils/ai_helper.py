"""Shared helper for talking to the Groq API via the OpenAI SDK."""
import json
import re

import config

_client = None


def _get_client():
    global _client
    if not config.GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY not found. Create a .env file and add: GROQ_API_KEY=gsk_your_key"
        )
    if _client is None:
        from openai import OpenAI  # imported lazily so tests work without the package
        _client = OpenAI(api_key=config.GROQ_API_KEY, base_url=config.GROQ_BASE_URL)
    return _client


def ask_ai(prompt, system="You are a helpful learning assistant.",
           json_mode=False, temperature=0.4):
    """Send a prompt to the model and return the text reply."""
    kwargs = {}
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}
    response = _get_client().chat.completions.create(
        model=config.MODEL_NAME,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        temperature=temperature,
        **kwargs,
    )
    return response.choices[0].message.content.strip()


def ask_ai_json(prompt, system="You are a helpful learning assistant."):
    """Ask the model for JSON and return it parsed as a dict."""
    text = ask_ai(prompt, system + " Respond with valid JSON only.", json_mode=True)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
        raise ValueError("The AI did not return valid JSON. Please try again.")
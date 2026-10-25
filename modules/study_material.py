"""Objective 2: topic-specific study notes."""
from utils.ai_helper import ask_ai


def generate_study_notes(topic, level):
    prompt = f"""Write study notes on: {topic}
Learner level: {level}

Use Markdown with these sections:
## Overview
## Key Concepts (bullet points)
## Worked Example
## Common Mistakes
## Practice Exercise
Keep it clear and concise (about 400-600 words)."""
    return ask_ai(prompt, "You are a clear, friendly tutor.", temperature=0.5)

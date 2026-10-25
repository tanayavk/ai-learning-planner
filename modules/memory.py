"""Objective 5: learner memory (profile + plan stored as JSON files)."""
import copy
import json
import os

import config

DEFAULT_PROFILE = {
    "skill_level": "Beginner",
    "completed_topics": [],
    "quiz_scores": [],
    "preferred_study_hours": 2,
}

DEFAULT_PLAN = {"goal": "", "duration_days": 7, "tasks": []}


def _save(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def _load(path, default):
    if not os.path.exists(path):
        _save(path, default)
        return copy.deepcopy(default)
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError):
        return copy.deepcopy(default)
    merged = copy.deepcopy(default)
    if isinstance(data, dict):
        merged.update(data)
    return merged


def load_profile():
    return _load(config.PROFILE_PATH, DEFAULT_PROFILE)


def save_profile(profile):
    _save(config.PROFILE_PATH, profile)


def load_plan():
    return _load(config.PLAN_PATH, DEFAULT_PLAN)


def save_plan(plan):
    _save(config.PLAN_PATH, plan)


def add_quiz_score(topic, correct, total):
    """Record a quiz result in the learner profile."""
    profile = load_profile()
    percent = round(correct / total * 100, 1) if total else 0.0
    profile["quiz_scores"].append(
        {"topic": topic, "correct": correct, "total": total, "percent": percent}
    )
    save_profile(profile)
    return profile

"""Objective 1: generate a multi-day learning plan."""
from modules import memory
from utils.ai_helper import ask_ai_json


def generate_learning_plan(goal, days, level, hours_per_day=2):
    """Ask the AI for a day-by-day plan, save it, and return it."""
    prompt = f"""Create a {days}-day learning plan.
Goal: {goal}
Learner level: {level}
Study time per day: about {hours_per_day} hours.

Return JSON in exactly this format:
{{"tasks": [{{"day": 1, "title": "short topic title", "description": "what to study and practice", "estimated_hours": 2}}]}}

Rules: cover every day from 1 to {days}; use 1-3 tasks per day; keep titles short."""
    data = ask_ai_json(prompt, "You are an expert study planner.")
    raw_tasks = data.get("tasks") if isinstance(data, dict) else None
    if not raw_tasks:
        raise ValueError("The AI returned no tasks. Please try again.")

    tasks = []
    for t in raw_tasks:
        if not isinstance(t, dict) or not t.get("title"):
            continue
        try:
            day = int(t.get("day", 1))
        except (TypeError, ValueError):
            day = 1
        try:
            hours = float(t.get("estimated_hours", hours_per_day))
        except (TypeError, ValueError):
            hours = float(hours_per_day)
        tasks.append({
            "day": max(1, min(day, days)),
            "title": str(t["title"]).strip(),
            "description": str(t.get("description", "")).strip(),
            "estimated_hours": hours,
        })
    if not tasks:
        raise ValueError("The AI returned no usable tasks. Please try again.")

    tasks.sort(key=lambda x: x["day"])
    for i, t in enumerate(tasks, start=1):
        t["id"] = i
        t["completed"] = False

    plan = {"goal": goal, "duration_days": days, "tasks": tasks}
    memory.save_plan(plan)
    return plan

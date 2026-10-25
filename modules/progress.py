"""Objective 4: track completed tasks and progress."""
from modules import memory


def calculate_progress(tasks):
    """Return percentage (0-100) of completed tasks."""
    if not tasks:
        return 0.0
    done = sum(1 for t in tasks if t.get("completed"))
    return round(done / len(tasks) * 100, 1)


def mark_task_complete(task_id, completed):
    """Update one task's status and keep the learner profile in sync."""
    plan = memory.load_plan()
    title = None
    for t in plan["tasks"]:
        if t["id"] == task_id:
            t["completed"] = bool(completed)
            title = t["title"]
            break
    if title is None:
        raise ValueError(f"Task {task_id} not found.")
    memory.save_plan(plan)

    profile = memory.load_profile()
    topics = profile["completed_topics"]
    if completed and title not in topics:
        topics.append(title)
    elif not completed and title in topics:
        topics.remove(title)
    memory.save_profile(profile)
    return plan

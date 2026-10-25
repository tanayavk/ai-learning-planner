"""Objective 3: generate quizzes and calculate scores."""
from utils.ai_helper import ask_ai_json


def generate_quiz(topic, level, num_questions=5):
    prompt = f"""Create a {num_questions}-question multiple-choice quiz.
Topic: {topic}
Learner level: {level}

Return JSON in exactly this format:
{{"questions": [{{"question": "...", "options": ["A text", "B text", "C text", "D text"], "answer_index": 0, "explanation": "why the answer is correct"}}]}}

Rules: exactly 4 options per question; answer_index is the 0-based index of the correct option."""
    data = ask_ai_json(prompt, "You are an expert quiz writer.")
    raw = data.get("questions") if isinstance(data, dict) else None
    if not raw:
        raise ValueError("The AI returned no questions. Please try again.")

    questions = []
    for q in raw:
        if not isinstance(q, dict):
            continue
        options = q.get("options")
        try:
            idx = int(q.get("answer_index"))
        except (TypeError, ValueError):
            continue
        if not q.get("question") or not isinstance(options, list) or len(options) < 2:
            continue
        if not 0 <= idx < len(options):
            continue
        questions.append({
            "question": str(q["question"]),
            "options": [str(o) for o in options],
            "answer_index": idx,
            "explanation": str(q.get("explanation", "")),
        })
    if not questions:
        raise ValueError("The AI returned no valid questions. Please try again.")
    return questions


def calculate_score(answers, questions):
    """answers: list of chosen option indexes (None = unanswered)."""
    total = len(questions)
    correct = sum(
        1 for a, q in zip(answers, questions)
        if a is not None and a == q["answer_index"]
    )
    percent = round(correct / total * 100, 1) if total else 0.0
    return {"correct": correct, "total": total, "percent": percent}

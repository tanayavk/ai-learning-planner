"""FastAPI backend server for AI Learning Planner.
Provides RESTful APIs for the React frontend and serves static production build.
"""
import os
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

import config
from modules import memory, planner, progress, quiz, study_material

app = FastAPI(
    title="AI Learning Planner API",
    description="Backend API powering the AI Learning Planner application",
    version="2.0.0",
)

# Enable CORS for local development (Vite runs on port 5173 by default)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- Pydantic Request/Response Models ----------------
class ProfileUpdateRequest(BaseModel):
    skill_level: Optional[str] = None
    preferred_study_hours: Optional[int] = Field(None, ge=1, le=16)


class PlanGenerateRequest(BaseModel):
    goal: str = Field(..., min_length=2, description="Learning goal")
    days: int = Field(7, ge=1, le=60, description="Duration in days")
    level: Optional[str] = "Beginner"
    hours_per_day: Optional[int] = Field(2, ge=1, le=16)


class TaskUpdateRequest(BaseModel):
    completed: bool


class NotesGenerateRequest(BaseModel):
    topic: str = Field(..., min_length=2)
    level: Optional[str] = "Beginner"


class QuizGenerateRequest(BaseModel):
    topic: str = Field(..., min_length=2)
    level: Optional[str] = "Beginner"
    num_questions: int = Field(5, ge=1, le=10)


class QuizQuestionItem(BaseModel):
    question: str
    options: List[str]
    answer_index: int
    explanation: Optional[str] = ""


class QuizSubmitRequest(BaseModel):
    topic: str
    answers: List[Optional[int]]
    questions: List[QuizQuestionItem]


# ---------------- API Routes ----------------

@app.get("/api/status")
def get_system_status():
    """Check API configuration and system state."""
    has_key = bool(config.GROQ_API_KEY and len(config.GROQ_API_KEY.strip()) > 5)
    plan = memory.load_plan()
    profile = memory.load_profile()
    return {
        "status": "ready" if has_key else "needs_key",
        "api_key_configured": has_key,
        "model": config.MODEL_NAME,
        "levels": config.LEVELS,
        "has_active_plan": bool(plan.get("tasks")),
        "completed_topics_count": len(profile.get("completed_topics", [])),
    }


@app.get("/api/profile")
def get_profile():
    """Retrieve learner profile with calculated statistics."""
    p = memory.load_profile()
    scores = p.get("quiz_scores", [])
    avg_score = round(sum(s.get("percent", 0) for s in scores) / len(scores), 1) if scores else 0.0
    return {
        "profile": p,
        "stats": {
            "completed_topics_count": len(p.get("completed_topics", [])),
            "quizzes_taken": len(scores),
            "average_quiz_score": avg_score,
            "skill_level": p.get("skill_level", "Beginner"),
            "preferred_study_hours": p.get("preferred_study_hours", 2),
        }
    }


@app.put("/api/profile")
def update_profile(req: ProfileUpdateRequest):
    """Update learner profile preferences."""
    p = memory.load_profile()
    if req.skill_level is not None:
        if req.skill_level in config.LEVELS:
            p["skill_level"] = req.skill_level
    if req.preferred_study_hours is not None:
        p["preferred_study_hours"] = int(req.preferred_study_hours)
    memory.save_profile(p)
    return {"message": "Profile updated successfully", "profile": p}


@app.post("/api/profile/reset")
def reset_profile():
    """Reset learner profile back to default."""
    default = {
        "skill_level": "Beginner",
        "completed_topics": [],
        "quiz_scores": [],
        "preferred_study_hours": 2,
    }
    memory.save_profile(default)
    return {"message": "Profile reset", "profile": default}


@app.get("/api/plan")
def get_plan():
    """Retrieve current learning plan with summary metrics."""
    plan = memory.load_plan()
    tasks = plan.get("tasks", [])
    pct = progress.calculate_progress(tasks)
    total_hours = sum(t.get("estimated_hours", 0) for t in tasks)
    completed_hours = sum(t.get("estimated_hours", 0) for t in tasks if t.get("completed"))
    
    return {
        "goal": plan.get("goal", ""),
        "duration_days": plan.get("duration_days", 7),
        "tasks": tasks,
        "progress_percent": pct,
        "stats": {
            "total_tasks": len(tasks),
            "completed_tasks": sum(1 for t in tasks if t.get("completed")),
            "remaining_tasks": sum(1 for t in tasks if not t.get("completed")),
            "total_hours": round(total_hours, 1),
            "completed_hours": round(completed_hours, 1),
        }
    }


@app.post("/api/plan/generate")
def create_plan(req: PlanGenerateRequest):
    """Generate a new AI-powered learning plan."""
    if not config.GROQ_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GROQ_API_KEY is not configured. Please set it in your .env file."
        )
    try:
        level = req.level or "Beginner"
        hours = req.hours_per_day or 2
        plan = planner.generate_learning_plan(req.goal.strip(), req.days, level, hours)
        return plan
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate learning plan: {str(e)}"
        )


@app.delete("/api/plan")
def clear_plan():
    """Clear the existing plan."""
    empty_plan = {"goal": "", "duration_days": 7, "tasks": []}
    memory.save_plan(empty_plan)
    return {"message": "Plan cleared successfully", "plan": empty_plan}


@app.patch("/api/tasks/{task_id}")
def update_task_completion(task_id: int, req: TaskUpdateRequest):
    """Toggle completion status of a specific task."""
    try:
        updated_plan = progress.mark_task_complete(task_id, req.completed)
        return {
            "message": "Task updated",
            "task_id": task_id,
            "completed": req.completed,
            "progress_percent": progress.calculate_progress(updated_plan["tasks"]),
            "plan": updated_plan
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/notes/generate")
def create_notes(req: NotesGenerateRequest):
    """Generate topic study notes using AI."""
    if not config.GROQ_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GROQ_API_KEY is not configured. Please set it in your .env file."
        )
    try:
        content = study_material.generate_study_notes(req.topic.strip(), req.level or "Beginner")
        return {
            "topic": req.topic.strip(),
            "level": req.level or "Beginner",
            "content": content
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate study notes: {str(e)}"
        )


@app.post("/api/quiz/generate")
def create_quiz(req: QuizGenerateRequest):
    """Generate a multiple-choice quiz using AI."""
    if not config.GROQ_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GROQ_API_KEY is not configured. Please set it in your .env file."
        )
    try:
        questions = quiz.generate_quiz(req.topic.strip(), req.level or "Beginner", req.num_questions)
        return {
            "topic": req.topic.strip(),
            "level": req.level or "Beginner",
            "num_questions": len(questions),
            "questions": questions
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quiz: {str(e)}"
        )


@app.post("/api/quiz/submit")
def submit_quiz(req: QuizSubmitRequest):
    """Grade quiz answers and record the score in learner profile."""
    try:
        raw_questions = [q.model_dump() for q in req.questions]
        score_res = quiz.calculate_score(req.answers, raw_questions)
        
        # Save score in profile
        memory.add_quiz_score(req.topic, score_res["correct"], score_res["total"])
        
        # Detailed feedback per question
        detailed = []
        for i, q in enumerate(raw_questions):
            user_choice_idx = req.answers[i] if i < len(req.answers) else None
            is_correct = (user_choice_idx is not None and user_choice_idx == q["answer_index"])
            detailed.append({
                "question": q["question"],
                "options": q["options"],
                "user_answer_index": user_choice_idx,
                "correct_answer_index": q["answer_index"],
                "is_correct": is_correct,
                "explanation": q.get("explanation", ""),
            })
            
        return {
            "topic": req.topic,
            "correct": score_res["correct"],
            "total": score_res["total"],
            "percent": score_res["percent"],
            "detailed": detailed,
            "profile": memory.load_profile()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to grade quiz: {str(e)}"
        )


# ---------------- Frontend Static Files Serving (Production) ----------------
DIST_DIR = os.path.join(config.BASE_DIR, "frontend", "dist")

if os.path.exists(DIST_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        # Allow API routes to be handled by FastAPI
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not Found")
        
        target = os.path.join(DIST_DIR, full_path)
        if os.path.isfile(target):
            return FileResponse(target)
        # Fallback to index.html for client-side routing
        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        return {"message": "Frontend build not found. Run npm run build inside frontend/"}

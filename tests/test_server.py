"""Unit tests for FastAPI server endpoints without socket dependency."""
import os
import tempfile
import unittest
from unittest.mock import patch

import config
import server
from server import (
    ProfileUpdateRequest,
    PlanGenerateRequest,
    TaskUpdateRequest,
    NotesGenerateRequest,
    QuizGenerateRequest,
    QuizSubmitRequest,
    QuizQuestionItem
)


class TestServerDirect(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.p1 = patch.object(config, "PROFILE_PATH", os.path.join(self.tmp.name, "p.json"))
        self.p2 = patch.object(config, "PLAN_PATH", os.path.join(self.tmp.name, "l.json"))
        self.p1.start()
        self.p2.start()

    def tearDown(self):
        self.p1.stop()
        self.p2.stop()
        self.tmp.cleanup()

    def test_status_endpoint(self):
        data = server.get_system_status()
        self.assertIn("status", data)
        self.assertIn("model", data)
        self.assertIn("levels", data)
        self.assertEqual(data["levels"], config.LEVELS)

    def test_profile_endpoints(self):
        # Initial profile
        data = server.get_profile()
        self.assertEqual(data["profile"]["skill_level"], "Beginner")

        # Update profile
        up_req = ProfileUpdateRequest(skill_level="Advanced", preferred_study_hours=4)
        up_res = server.update_profile(up_req)
        self.assertEqual(up_res["profile"]["skill_level"], "Advanced")
        self.assertEqual(up_res["profile"]["preferred_study_hours"], 4)

        # Reset profile
        reset_res = server.reset_profile()
        self.assertEqual(reset_res["profile"]["skill_level"], "Beginner")

    @patch("modules.planner.ask_ai_json")
    def test_plan_lifecycle(self, mock_ai):
        mock_ai.return_value = {
            "tasks": [
                {"day": 1, "title": "Day 1 Task", "description": "Study basics", "estimated_hours": 2},
                {"day": 2, "title": "Day 2 Task", "description": "Practice coding", "estimated_hours": 2},
            ]
        }
        with patch.object(config, "GROQ_API_KEY", "test_key"):
            plan_req = PlanGenerateRequest(
                goal="FastAPI Masterclass",
                days=2,
                level="Intermediate",
                hours_per_day=2
            )
            gen_res = server.create_plan(plan_req)
            self.assertEqual(len(gen_res["tasks"]), 2)

            # Check get plan
            plan_res = server.get_plan()
            self.assertEqual(plan_res["goal"], "FastAPI Masterclass")
            self.assertEqual(plan_res["progress_percent"], 0.0)

            # Update task
            task_res = server.update_task_completion(1, TaskUpdateRequest(completed=True))
            self.assertEqual(task_res["completed"], True)
            self.assertEqual(task_res["progress_percent"], 50.0)

            # Clear plan
            del_res = server.clear_plan()
            self.assertEqual(del_res["plan"]["tasks"], [])

    @patch("modules.study_material.ask_ai")
    def test_notes_generation(self, mock_ai):
        mock_ai.return_value = "## Overview\nTest overview notes."
        with patch.object(config, "GROQ_API_KEY", "test_key"):
            req = NotesGenerateRequest(topic="Python Asyncio", level="Advanced")
            res = server.create_notes(req)
            self.assertEqual(res["topic"], "Python Asyncio")
            self.assertIn("Test overview", res["content"])

    @patch("modules.quiz.ask_ai_json")
    def test_quiz_lifecycle(self, mock_ai):
        mock_ai.return_value = {
            "questions": [
                {
                    "question": "What is Python?",
                    "options": ["Snake", "Language", "Fruit", "Car"],
                    "answer_index": 1,
                    "explanation": "It is a programming language"
                }
            ]
        }
        with patch.object(config, "GROQ_API_KEY", "test_key"):
            req = QuizGenerateRequest(topic="Python Introduction", level="Beginner", num_questions=1)
            gen_res = server.create_quiz(req)
            questions = gen_res["questions"]
            self.assertEqual(len(questions), 1)

            # Submit answers
            sub_req = QuizSubmitRequest(
                topic="Python Introduction",
                answers=[1],
                questions=[QuizQuestionItem(**q) for q in questions]
            )
            sub_res = server.submit_quiz(sub_req)
            self.assertEqual(sub_res["correct"], 1)
            self.assertEqual(sub_res["percent"], 100.0)
            self.assertTrue(sub_res["detailed"][0]["is_correct"])


if __name__ == "__main__":
    unittest.main()

"""Offline tests (no API key needed). Run: python -m unittest discover -s tests -v"""
import os
import tempfile
import unittest
from unittest.mock import patch

import config
from modules import memory, planner, progress, quiz


class BaseCase(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.p1 = patch.object(config, "PROFILE_PATH", os.path.join(self.tmp.name, "p.json"))
        self.p2 = patch.object(config, "PLAN_PATH", os.path.join(self.tmp.name, "l.json"))
        self.p1.start(); self.p2.start()

    def tearDown(self):
        self.p1.stop(); self.p2.stop(); self.tmp.cleanup()


class TestMemory(BaseCase):
    def test_defaults_created(self):
        self.assertEqual(memory.load_profile()["skill_level"], "Beginner")
        self.assertEqual(memory.load_plan()["tasks"], [])

    def test_save_and_reload(self):
        p = memory.load_profile(); p["skill_level"] = "Advanced"; memory.save_profile(p)
        self.assertEqual(memory.load_profile()["skill_level"], "Advanced")

    def test_corrupt_file_recovers(self):
        memory.load_profile()
        with open(config.PROFILE_PATH, "w") as f:
            f.write("{bad json")
        self.assertEqual(memory.load_profile()["skill_level"], "Beginner")


FAKE_PLAN = {"tasks": [
    {"day": 2, "title": "Loops", "description": "d", "estimated_hours": 2},
    {"day": 1, "title": "Variables", "description": "d", "estimated_hours": "1.5"},
    {"day": 99, "title": "Functions"},
    {"description": "no title - skipped"},
]}


class TestPlannerProgress(BaseCase):
    @patch("modules.planner.ask_ai_json", return_value=FAKE_PLAN)
    def test_plan_and_progress(self, _):
        plan = planner.generate_learning_plan("Python", 3, "Beginner")
        self.assertEqual([t["title"] for t in plan["tasks"]], ["Variables", "Loops", "Functions"])
        self.assertEqual([t["id"] for t in plan["tasks"]], [1, 2, 3])
        self.assertEqual(plan["tasks"][2]["day"], 3)  # clamped
        self.assertEqual(progress.calculate_progress(plan["tasks"]), 0.0)

        progress.mark_task_complete(1, True)
        saved = memory.load_plan()
        self.assertEqual(progress.calculate_progress(saved["tasks"]), 33.3)
        self.assertIn("Variables", memory.load_profile()["completed_topics"])

        progress.mark_task_complete(1, False)
        self.assertNotIn("Variables", memory.load_profile()["completed_topics"])
        with self.assertRaises(ValueError):
            progress.mark_task_complete(999, True)

    @patch("modules.planner.ask_ai_json", return_value={"tasks": []})
    def test_empty_plan_raises(self, _):
        with self.assertRaises(ValueError):
            planner.generate_learning_plan("x", 3, "Beginner")


FAKE_QUIZ = {"questions": [
    {"question": "2+2?", "options": ["3", "4", "5", "6"], "answer_index": 1, "explanation": "math"},
    {"question": "Bad", "options": ["a", "b"], "answer_index": 7},
    {"question": "Capital of France?", "options": ["Paris", "Rome"], "answer_index": "0"},
]}


class TestQuiz(BaseCase):
    @patch("modules.quiz.ask_ai_json", return_value=FAKE_QUIZ)
    def test_quiz(self, _):
        qs = quiz.generate_quiz("t", "Beginner", 3)
        self.assertEqual(len(qs), 2)  # invalid one dropped
        self.assertEqual(quiz.calculate_score([1, 0], qs),
                         {"correct": 2, "total": 2, "percent": 100.0})
        self.assertEqual(quiz.calculate_score([0, None], qs)["correct"], 0)

    def test_score_saved(self):
        memory.add_quiz_score("Loops", 3, 4)
        self.assertEqual(memory.load_profile()["quiz_scores"][0]["percent"], 75.0)


if __name__ == "__main__":
    unittest.main()

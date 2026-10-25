"""AI-Based Personal Learning & Task Planner - Streamlit entry point."""
import streamlit as st

import config
from modules import memory, planner, progress, quiz, study_material

st.set_page_config(page_title="AI Learning Planner", page_icon="🎓", layout="wide")
st.title("🎓 AI-Based Personal Learning & Task Planner")

if not config.GROQ_API_KEY:
    st.error("GROQ_API_KEY is missing. Add it to your .env file and restart the app.")
    st.stop()

# ---------- Sidebar: learner profile (Objective 5) ----------
profile = memory.load_profile()
with st.sidebar:
    st.header("👤 Learner Profile")
    level_idx = config.LEVELS.index(profile["skill_level"]) \
        if profile["skill_level"] in config.LEVELS else 0
    level = st.selectbox("Skill level", config.LEVELS, index=level_idx)
    hours = st.number_input("Study hours per day", 1, 12,
                            int(profile["preferred_study_hours"]))
    if level != profile["skill_level"] or hours != profile["preferred_study_hours"]:
        profile["skill_level"] = level
        profile["preferred_study_hours"] = int(hours)
        memory.save_profile(profile)
    st.metric("Completed topics", len(profile["completed_topics"]))
    scores = profile["quiz_scores"]
    avg = round(sum(s["percent"] for s in scores) / len(scores), 1) if scores else 0
    st.metric("Average quiz score", f"{avg}%")

tab_plan, tab_notes, tab_quiz, tab_progress = st.tabs(
    ["📅 Plan", "📖 Notes", "📝 Quiz", "✅ Progress"]
)

# ---------- Tab 1: Plan (Objective 1) ----------
with tab_plan:
    goal = st.text_input("What do you want to learn?",
                         placeholder="e.g. Python basics for data analysis")
    days = st.number_input("Number of days", 1, 60, 7)
    if st.button("Generate Plan", type="primary"):
        if not goal.strip():
            st.warning("Please enter a learning goal.")
        else:
            with st.spinner("Creating your plan..."):
                try:
                    planner.generate_learning_plan(goal.strip(), int(days), level, int(hours))
                    st.success("Plan created! Open the Progress tab to track it.")
                except Exception as e:
                    st.error(f"Could not generate plan: {e}")

    plan = memory.load_plan()
    if plan["tasks"]:
        st.subheader(f"Goal: {plan['goal']} ({plan['duration_days']} days)")
        for d in sorted({t["day"] for t in plan["tasks"]}):
            with st.expander(f"Day {d}", expanded=(d == 1)):
                for t in plan["tasks"]:
                    if t["day"] == d:
                        st.markdown(f"**{t['title']}** (~{t['estimated_hours']} h)")
                        st.write(t["description"])
    else:
        st.info("No plan yet. Enter a goal above and click Generate Plan.")

# ---------- Tab 2: Notes (Objective 2) ----------
with tab_notes:
    plan = memory.load_plan()
    titles = [t["title"] for t in plan["tasks"]]
    choice = st.selectbox("Choose a topic", ["Custom topic"] + titles, key="notes_choice")
    topic = st.text_input("Custom topic", key="notes_custom") \
        if choice == "Custom topic" else choice
    if st.button("Generate Notes"):
        if not topic.strip():
            st.warning("Please enter a topic.")
        else:
            with st.spinner("Writing notes..."):
                try:
                    st.session_state["notes"] = (
                        topic.strip(),
                        study_material.generate_study_notes(topic.strip(), level),
                    )
                except Exception as e:
                    st.error(f"Could not generate notes: {e}")
    if "notes" in st.session_state:
        st.subheader(st.session_state["notes"][0])
        st.markdown(st.session_state["notes"][1])

# ---------- Tab 3: Quiz (Objective 3) ----------
with tab_quiz:
    plan = memory.load_plan()
    titles = [t["title"] for t in plan["tasks"]]
    qchoice = st.selectbox("Choose a topic", ["Custom topic"] + titles, key="quiz_choice")
    qtopic = st.text_input("Custom topic", key="quiz_custom") \
        if qchoice == "Custom topic" else qchoice
    num_q = st.slider("Number of questions", 3, 10, 5)

    if st.button("Generate Quiz"):
        if not qtopic.strip():
            st.warning("Please enter a topic.")
        else:
            with st.spinner("Creating quiz..."):
                try:
                    questions = quiz.generate_quiz(qtopic.strip(), level, num_q)
                    st.session_state["quiz"] = {
                        "id": st.session_state.get("quiz_counter", 0) + 1,
                        "topic": qtopic.strip(),
                        "questions": questions,
                    }
                    st.session_state["quiz_counter"] = st.session_state["quiz"]["id"]
                    st.session_state.pop("quiz_result", None)
                except Exception as e:
                    st.error(f"Could not generate quiz: {e}")

    current = st.session_state.get("quiz")
    if current:
        st.subheader(f"Quiz: {current['topic']}")
        for i, q in enumerate(current["questions"]):
            st.radio(f"Q{i + 1}. {q['question']}", q["options"], index=None,
                     key=f"q_{current['id']}_{i}")
        if st.button("Submit Answers"):
            answers = []
            for i, q in enumerate(current["questions"]):
                picked = st.session_state.get(f"q_{current['id']}_{i}")
                answers.append(q["options"].index(picked) if picked in q["options"] else None)
            result = quiz.calculate_score(answers, current["questions"])
            result["answers"] = answers
            result["quiz_id"] = current["id"]
            st.session_state["quiz_result"] = result
            memory.add_quiz_score(current["topic"], result["correct"], result["total"])

        result = st.session_state.get("quiz_result")
        if result and result["quiz_id"] == current["id"]:
            st.success(f"Score: {result['correct']}/{result['total']} ({result['percent']}%)")
            for i, q in enumerate(current["questions"]):
                chosen = result["answers"][i]
                ok = chosen == q["answer_index"]
                st.markdown(f"{'✅' if ok else '❌'} **Q{i + 1}:** correct answer: "
                            f"**{q['options'][q['answer_index']]}**")
                if q["explanation"]:
                    st.caption(q["explanation"])

# ---------- Tab 4: Progress (Objective 4) ----------
with tab_progress:
    plan = memory.load_plan()
    if not plan["tasks"]:
        st.info("Generate a plan first.")
    else:
        st.subheader("Tick tasks as you complete them")
        changed = False
        for t in plan["tasks"]:
            new_val = st.checkbox(f"Day {t['day']}: {t['title']}",
                                  value=t["completed"], key=f"task_{t['id']}")
            if new_val != t["completed"]:
                progress.mark_task_complete(t["id"], new_val)
                changed = True
        plan = memory.load_plan() if changed else plan
        pct = progress.calculate_progress(plan["tasks"])
        st.progress(pct / 100)
        done = sum(1 for t in plan["tasks"] if t["completed"])
        st.write(f"**{pct}% complete** ({done}/{len(plan['tasks'])} tasks)")

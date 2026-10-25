# AI-Based Personal Learning & Task Planner 🎯

An AI-powered learning assistant that creates personalized study plans, generates study materials and quizzes, and tracks learning progress.

## 🎯 Features
- **Learning Plans:** Generate multi-day study plans from learning goals.
- **Study Materials:** Create notes based on topic and skill level.
- **AI Quizzes:** Test understanding with generated quizzes.
- **Progress Tracking:** Track completed tasks.
- **Learner Memory:** Store learner information using JSON.

## 🛠️ Tech Stack
- Python
- Streamlit
- Groq API
- JSON

## ⚙️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/AI-Learning-Planner.git
   cd AI-Learning-Planner
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file and add your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

5. Run the application:
   ```bash
   streamlit run app.py
   ```

**Note:** Never upload your `.env` file or API key to GitHub.

## 🚀 Purpose
An educational project demonstrating AI-powered personalized learning and basic learner progress management.

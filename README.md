# 🎓 AI-Based Personal Learning & Task Planner (React + FastAPI)

An AI-powered personalized learning assistant with a modern, responsive **React** UI and a high-performance **FastAPI** backend. It creates tailored multi-day study roadmaps, generates structured topic study notes with code examples, tests understanding with interactive adaptive quizzes, and tracks persistent progress.

---

## ✨ Features & UI Highlights

- ⚡ **Modern React + Tailwind UI:** Dark-mode glassmorphic theme with glowing accents, animated transitions, and mobile responsiveness.
- 📅 **Dynamic Study Roadmaps:** Generates day-by-day task schedules tailored to chosen skill tier (Beginner, Intermediate, Advanced) and daily study hours.
- 📖 **High-Yield Study Notes:** Generates structured notes with bullet concepts, syntax-highlighted code snippets, common pitfalls, and practical exercises.
- 📝 **Interactive Quiz Engine:** Adaptive multiple-choice challenges with instant grading, detailed explanations, and celebration animations.
- 📊 **Analytics & Progress Dashboard:** Real-time KPI cards for completion rate, hours fulfilled, average quiz scores, and mastered topics.
- 👤 **Persistent Memory:** Learner profile and study roadmap persist automatically across sessions in `data/`.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Canvas Confetti
- **Backend:** Python 3.11, FastAPI, Pydantic, Uvicorn
- **AI Engine:** Groq API (`openai/gpt-oss-120b` or Llama 3)
- **Persistence:** Local JSON data store (`data/learning_plan.json`, `data/learner_profile.json`)

---

## 🚀 Quickstart: Running Locally

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- A Groq API key ([Get one free from Groq Console](https://console.groq.com))

### 2. Setup Environment

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/AI-Learning-Planner.git
cd AI-Learning-Planner

# Install Python backend dependencies
pip install -r requirements.txt

# Create .env and add your Groq API key
cp .env.example .env
# Edit .env and set: GROQ_API_KEY=gsk_your_groq_api_key_here
```

### 3. Run in Development Mode

Run the backend and frontend separately for instant hot module reloading:

**Terminal 1 (Backend):**
```bash
python -m uvicorn server:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

### 4. Run in Production Mode (Unified Single Server)

Build the React frontend once, and FastAPI will host both the API and the React web app from a single port:

```bash
# Build React app
cd frontend
npm install
npm run build
cd ..

# Start single production server
python -m uvicorn server:app --host 0.0.0.0 --port 8000
```

Open **http://localhost:8000**!

---

## 🌐 Deployment Instructions

You can deploy the app using any of the following 3 approaches:

### Option 1: Deploy with Docker (Render, Railway, Fly.io, or VPS) — *Recommended*

The included multi-stage `Dockerfile` compiles the React frontend and packages it directly with the FastAPI server into a lightweight production container.

1. Build & run locally with Docker:
   ```bash
   docker build -t ai-learning-planner .
   docker run -p 8000:8000 -e GROQ_API_KEY="your_api_key" ai-learning-planner
   ```
2. Or use `docker-compose`:
   ```bash
   docker-compose up --build
   ```

#### Deploying on Railway:
1. Connect your GitHub repository to [Railway.app](https://railway.app).
2. Railway detects the `Dockerfile` automatically.
3. In **Variables**, add:
   - `GROQ_API_KEY` = your Groq API key.
4. Click **Deploy**. Railway provides an HTTPS URL automatically.

#### Deploying on Render:
1. Go to [Render.com](https://render.com) and click **New Web Service**.
2. Connect your repo and select **Docker** as the runtime (or **Python**).
3. Set the environment variable:
   - `GROQ_API_KEY` = your Groq API key.
4. Set health check path to `/api/status`.
5. Click **Create Web Service**.

---

### Option 2: Decoupled Deployment (Vercel Frontend + Render Backend)

If you prefer hosting the React app on a global CDN like Vercel and the backend on Render:

#### A. Deploy the FastAPI Backend to Render
1. Create a **New Web Service** on Render pointing to your repo.
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Add environment variable `GROQ_API_KEY`.
5. Copy your Render backend URL (e.g. `https://my-backend.onrender.com`).

#### B. Deploy React Frontend to Vercel
1. Import the repository in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. In **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://my-backend.onrender.com/api`
4. Click **Deploy**. Vercel will build and deploy your React frontend to a fast global edge network.

---

### Option 3: Traditional VPS Deployment (Ubuntu + Nginx + Systemd)

1. **Install dependencies on VPS:**
   ```bash
   sudo apt update && sudo apt install -y python3-pip python3-venv nodejs npm nginx
   ```
2. **Build frontend:**
   ```bash
   cd /var/www/AI-Learning-Planner/frontend
   npm install && npm run build
   ```
3. **Setup Systemd service for FastAPI (`/etc/systemd/system/learning-planner.service`):**
   ```ini
   [Unit]
   Description=AI Learning Planner FastAPI Server
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/var/www/AI-Learning-Planner
   ExecStart=/var/www/AI-Learning-Planner/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8000
   Restart=always
   EnvironmentFile=/var/www/AI-Learning-Planner/.env

   [Install]
   WantedBy=multi-user.target
   ```
4. **Nginx Reverse Proxy (`/etc/nginx/sites-available/planner`):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```
5. Enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now learning-planner
   sudo systemctl restart nginx
   ```

---

## 🧪 Testing

Run all backend offline tests:
```bash
python -m unittest discover -s tests -v
```

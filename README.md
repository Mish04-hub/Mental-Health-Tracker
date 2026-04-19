# 🧠 Student Mental Health Tracker — AI + DevOps Pipeline

A full-stack web application to track student mental health, log daily moods, and get AI-powered stress level predictions using a Random Forest model.

---

## 🗂️ Project Structure

```
Mental/
├── frontend/          # React + Vite + TailwindCSS
│   └── src/
│       ├── api/           # Axios instance
│       ├── components/    # Sidebar, Layout, StressAlert, Guards
│       ├── context/       # AuthContext (JWT)
│       └── pages/         # LoginPage, DashboardPage, MoodTrackerPage
├── backend/           # Node.js + Express + Mongoose
│   ├── model/             # stressModel.js (ML prediction)
│   ├── models/            # Mongoose schemas (User, MoodLog)
│   ├── middleware/        # JWT auth guard
│   ├── routes/            # auth.js, mood.js, predict.js
│   └── app.js             # Express entry point
├── docker/            # Dockerfile.backend
└── jenkins/           # Jenkinsfile (CI/CD)
```

---

## 🚀 Getting Started (Local)

### Prerequisites

- Node.js ≥ 18
- A MongoDB Atlas account (free tier works fine)

---

### 1. Clone the repo & set up Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mental_health_tracker?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_string
PORT=5000
```

Install dependencies and start:

```bash
npm install
npm run dev          # uses nodemon for hot-reload
# OR
npm start            # production start
```

The backend will be live at **http://localhost:5000**

---

### 2. Set up Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**. The Vite proxy automatically forwards `/api/*` calls to the backend on port 5000.

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login, get JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/mood/add-mood` | ✅ | Log mood + get prediction |
| GET | `/api/mood/get-history` | ✅ | Fetch mood history |
| DELETE | `/api/mood/:id` | ✅ | Delete a log entry |
| POST | `/api/predict/predict-stress` | ❌ | Standalone stress prediction |

### Example: Predict Stress

```bash
curl -X POST http://localhost:5000/api/predict/predict-stress \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "stressed",
    "sleepHours": 4,
    "studyHours": 10,
    "exercised": false,
    "socialInteraction": "none"
  }'
```

Response:
```json
{
  "input": { ... },
  "prediction": { "stressLevel": "High", "probability": 0.92 },
  "alert": "⚠️ High stress detected! Please consider taking a break..."
}
```

---

## 🤖 AI Model

- **Algorithm**: Random Forest Classifier (via `ml-random-forest` npm package — 100% JavaScript, no Python needed)
- **Features**: mood score, sleep hours, study hours, exercised (bool), social interaction level
- **Labels**: `Low`, `Medium`, `High`
- **Training**: 320 simulated student records with realistic patterns
- **Training happens on startup** (takes ~1s), no pre-trained file needed

---

## 🐳 Docker

Build and run the backend in Docker:

```bash
# From project root
docker build -f docker/Dockerfile.backend -t mht-backend .
docker run -p 5000:5000 --env-file backend/.env mht-backend
```

---

## 🔁 Jenkins CI/CD

The `jenkins/Jenkinsfile` includes these stages:

1. **Checkout** – pull source code
2. **Install Dependencies** – parallel install for backend + frontend
3. **Run Tests** – `npm test` on backend
4. **Build Frontend** – `npm run build` for production bundle
5. **Build Docker Image** – only on `main`/`master` branches
6. **Deploy** – start container on port 5000 (main branch only)

---

## 🎨 UI Features

- 🌙 Dark theme with blue/green gradient (soft mental health aesthetic)
- 📊 Interactive charts: Area chart, Pie chart, Bar charts (via Recharts)
- ⚠️ Animated high-stress alert with pulsing icon
- 🧭 Sidebar navigation with active route highlighting
- 📱 Responsive layout

---

## 🗄️ MongoDB Collections

**`users`** — name, email, hashed password  
**`moodlogs`** — userId, mood, sleepHours, studyHours, exercised, socialInteraction, notes, predictedStress, stressProbability, timestamps

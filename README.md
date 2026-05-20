# CvAura — AI-Powered Resume Optimization Platform


## Deployed Link : [here](cvaura.vercel.app)

An intelligent full-stack application that analyzes, scores, fixes, and optimizes resumes using multi-agent AI, real-time job market data, and advanced ATS evaluation.

## Quick Start

### 📋 Prerequisites
- Node.js 16+
- Python 3.11+
- Supabase account
- Groq API key

### 🚀 Quick Setup

#### Frontend
```bash
cd aura-resume-studio
npm install
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
# Open http://localhost:8080
```

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env with your credentials
echo "SUPABASE_URL=your-url" > .env
echo "SUPABASE_KEY=your-key" >> .env
echo "GROQ_API_KEY=your-groq-key" >> .env

uvicorn main:app --reload
# Server at http://localhost:8000
```

## 📚 Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for complete technical docs.

## 🏗️ Project Structure

```
cvaura/
├── aura-resume-studio/     # React + Vite frontend
│   ├── src/
│   │   ├── components/     # UI components (Landing, Workspace, Score, Recommendations)
│   │   ├── context/        # Global state (AppContext)
│   │   └── lib/            # API client, utilities
├── backend/                # FastAPI backend
│   ├── services/
│   │   ├── parser.py       # Resume extraction & AI structuring
│   │   ├── scorer.py       # Multi-parameter ATS scoring with rubrics
│   │   ├── fixer.py        # "Fix All with AI" engine
│   │   ├── chat.py         # AI-powered section editing
│   │   ├── targeting.py    # Company targeting & learning paths
│   │   ├── job_search.py   # Real-time multi-source job search
│   │   ├── scraper.py      # LinkedIn & job board scraping
│   │   └── pdf_generator.py# Professional PDF export
│   ├── main.py             # FastAPI endpoints
│   ├── schemas.py          # Pydantic models
│   └── db.py               # Supabase client
├── DOCUMENTATION.md        # Full technical documentation
└── README.md               # This file
```

## 🎯 Key Features

### Core Intelligence
- **Resume Upload & Parsing** — PDF/DOCX support with AI-powered structuring via Groq Llama-3.3-70b
- **Advanced ATS Scoring** — Multi-parameter evaluation (0-100) with detailed rubrics for freshers and experienced professionals. Each parameter includes reasoning, feedback, and 6-7 actionable improvement suggestions
- **Fix All with AI** — One-click AI-powered resume overhaul that rewrites weak sections (summary, experience bullets, projects, skills) with before/after comparison view and PDF download
- **AI Chat Editor** — Natural language conversation for section-specific resume editing with context-aware suggestions

### Targeting & Market Intelligence
- **Company Targeting** — Paste a job description + company name → get TF-IDF keyword gap analysis, skill gaps with verified learning paths (Coursera, Udemy, freeCodeCamp, LeetCode), and YouTube tutorials
- **Real-Time Job Suggestions** — Searches Remotive, Arbeitnow, and LinkedIn simultaneously using 5-6 query variations. Returns 10-15 ranked jobs with direct apply links, match scores, and source badges
- **DSA & CS Fundamentals Detection** — Auto-detects software roles and flags missing competitive programming/DSA skills with specific platform recommendations

### Design & UX
- **Theme-Aware Hero** — Light mode: massive typographic hero with "Get Started" button. Dark mode: 3D WebGL Orb with drag-drop upload
- **3D Feature Showcase** — WebGL-based interactive globe (InfiniteMenu) for feature display
- **Glassmorphism UI** — Modern design with View Transition API theme toggle, Framer Motion animations, and responsive layouts

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion |
| Backend | FastAPI + Python 3.11 + Pydantic |
| AI/LLM | Groq Llama-3.3-70b-versatile (multi-agent architecture) |
| Database | Supabase (PostgreSQL + Storage) |
| Job Search | Remotive API + Arbeitnow API + LinkedIn Public Scraping |
| NLP | scikit-learn TF-IDF, YouTube Search API |
| PDF | ReportLab (generation) + PyMuPDF (parsing) |
| WebGL | gl-matrix + custom shaders (Orb, InfiniteMenu) |
| Hosting | Vercel (frontend) + Railway/Render (backend) |

## 📖 Common Commands

### Frontend
```bash
npm run dev          # Start dev server (port 8080)
npm run build        # Production build
npm run preview      # Preview build
npx tsc --noEmit     # Type check
```

### Backend
```bash
uvicorn main:app --reload --port 8000    # Dev server
python -m pytest                          # Run tests
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload & parse resume (PDF/DOCX) |
| `POST` | `/api/score` | ATS score with rubric-based reasoning + suggestions |
| `POST` | `/api/fix-all` | AI rewrites all weak sections, returns before/after |
| `POST` | `/api/chat-edit` | Natural language section editing |
| `POST` | `/api/target-company` | Company targeting + skill gaps + 15 job suggestions |
| `POST` | `/api/export-pdf` | Generate professional PDF |
| `GET`  | `/health` | Health check |

## 🔧 Environment Variables

### Backend (.env)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
GROQ_API_KEY=your-groq-api-key
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Frontend won't connect to backend | Verify backend is running on port 8000, check `VITE_API_URL` |
| Supabase connection fails | Verify `SUPABASE_URL` and `SUPABASE_KEY`, run migration.sql |
| Groq API errors | Verify `GROQ_API_KEY` at https://console.groq.com |
| Job search returns 0 results | Check internet connection — Remotive/Arbeitnow APIs need outbound access |
| Fix All takes too long | Normal — makes 3-4 sequential LLM calls with rate-limit delays |

See [DOCUMENTATION.md](./DOCUMENTATION.md) for full troubleshooting guide.

---

**Status**: Active Development  
**Last Updated**: April 12, 2026

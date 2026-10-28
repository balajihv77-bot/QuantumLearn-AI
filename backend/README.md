# QuantumLearn AI — FastAPI Backend & MySQL Setup Guide

This guide describes how to run and test the Python FastAPI backend with MySQL (or SQLite fallback) alongside the QuantumLearn AI frontend.

---

## 1. Directory Structure

```text
backend/
├── app/
│   ├── main.py                  # FastAPI app entry point, CORS, lifespan, routes
│   ├── api/
│   │   ├── auth.py              # POST /api/auth/register, POST /api/auth/login
│   │   ├── users.py             # GET /api/users/me, PUT /api/users/me
│   │   ├── learning.py          # GET /api/learning/modules
│   │   ├── progress.py          # GET /api/learning/progress, POST /api/learning/progress
│   │   ├── circuits.py          # POST /api/circuits, GET /api/circuits
│   │   ├── simulation.py        # POST /api/simulation/run
│   │   ├── quizzes.py           # POST /api/quizzes/submit
│   │   └── ai_tutor.py          # POST /api/ai/chat
│   ├── models/                  # SQLAlchemy ORM models (users, modules, progress, circuits, quizzes)
│   ├── schemas/                 # Pydantic validation request/response schemas
│   ├── services/                # Business logic, statevector simulation, bcrypt auth, Gemini AI
│   ├── database/
│   │   └── connection.py        # SQLAlchemy engine, MySQL pool, SQLite fallback
│   └── core/
│       ├── config.py            # Pydantic settings loading from .env
│       └── security.py          # bcrypt password hashing and JWT token management
├── tests/
│   └── test_api.py              # Pytest automated endpoint tests (Bell state, gates, health)
├── database_schema.sql          # Complete DDL script for MySQL 8.0+
├── requirements.txt             # Python package dependencies
└── .env.example                 # Environment variables template
```

---

## 2. Requirements & Installation

### Prerequisites
- Python 3.10+ (recommended 3.11 or 3.12)
- MySQL 8.0+ (optional: SQLite fallback is built-in for zero-setup local dev)

### Setup Steps

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create a virtual environment
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create your local .env file
cp .env.example .env
```

---

## 3. Database Configuration

### Option A: MySQL 8.0+ (Production & Team Dev)
1. Launch MySQL and execute the setup schema:
   ```bash
   mysql -u root -p < database_schema.sql
   ```
2. Configure credentials in `backend/.env`:
   ```ini
   DATABASE_URL=mysql+pymysql://quantum_user:quantum_secret_pass@localhost:3306/quantumlearn_db
   USE_SQLITE_FALLBACK=false
   ```

### Option B: SQLite Development Fallback (Instant Zero-Setup)
If MySQL is not installed locally, enable the automatic fallback:
```ini
USE_SQLITE_FALLBACK=true
```
The backend will automatically create all tables in `backend/quantumlearn.db` on server launch.

---

## 4. Running the Backend Server

Start the Uvicorn development server:

```bash
# From the project root or backend directory:
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

- API Base URL: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- ReDoc Documentation: `http://localhost:8000/redoc`
- Health Check: `http://localhost:8000/api/health`

---

## 5. Running Automated Tests

Run the pytest suite to verify quantum simulation, Bell-state entanglement, and API routes:

```bash
cd backend
pytest tests/ -v
```

Expected output:
- `test_health_endpoint`: PASSED
- `test_simulation_bell_state`: PASSED (confirms |Φ+⟩ superposition probabilities: 50% |00⟩, 50% |11⟩)
- `test_simulation_pauli_x`: PASSED (confirms |0⟩ -> |1⟩ bit-flip)
- `test_modules_listing`: PASSED (confirms 9 learning modules)

---

## 6. REST API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new student account (bcrypt hashed) | No |
| `POST` | `/api/auth/login` | Login and acquire JWT Bearer token | No |
| `GET` | `/api/users/me` | Fetch authenticated student profile and XP | Yes (Bearer) |
| `GET` | `/api/learning/modules` | List all 9 quantum curriculum modules | No |
| `GET` | `/api/learning/progress` | Get student module completion status | Yes (Bearer) |
| `POST` | `/api/learning/progress` | Mark module completed / award XP | Yes (Bearer) |
| `POST` | `/api/circuits` | Save a user-constructed quantum circuit | Yes (Bearer) |
| `GET` | `/api/circuits` | List student's saved circuits | Yes (Bearer) |
| `POST` | `/api/simulation/run` | Execute exact tensor-product statevector simulation | No |
| `POST` | `/api/quizzes/submit` | Grade quiz submission and award XP | Yes (Bearer) |
| `POST` | `/api/ai/chat` | AI Tutor conversation (Gemini live or verified pedagogical fallback) | No |
| `GET` | `/api/health` | Service and simulation engine status | No |

---

## 7. Connecting Frontend to the Backend

1. In the frontend root directory, configure `.env`:
   ```ini
   VITE_API_BASE_URL=http://localhost:8000
   VITE_AI_BACKEND_URL=http://localhost:8000/api/ai/chat
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. The frontend on `http://localhost:3000` communicates directly with `http://localhost:8000`, with CORS pre-configured in `backend/app/main.py`.

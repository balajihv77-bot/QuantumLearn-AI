"""
QuantumLearn AI - Backend Test Suite
Automated tests for health check, quantum statevector simulation (Hadamard, CNOT, Bell state),
curriculum learning module listing, student registration, login, profile, and quiz grading.
"""

import os
import pytest
from fastapi.testclient import TestClient

# Ensure test run uses sqlite memory or test DB
os.environ["USE_SQLITE_FALLBACK"] = "true"

from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    """Verify backend health endpoint is functional and reports online status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "simulation_engine" in data


def test_simulation_bell_state():
    """
    Verify exact quantum statevector simulation for Bell state |Φ+⟩ = (|00⟩ + |11⟩) / √2.
    Qubit 0: H gate at step 0
    Qubit 0 & 1: CNOT gate at step 1
    """
    grid = [
        ["H", "CNOT", None],  # Qubit 0
        [None, "CNOT", None]  # Qubit 1
    ]

    response = client.post("/api/simulation/run", json={
        "num_qubits": 2,
        "grid": grid,
        "shots": 1024
    })

    assert response.status_code == 200
    data = response.json()
    assert data["num_qubits"] == 2
    assert data["is_entangled"] is True

    # Check probabilities: ~50% for |00> and ~50% for |11>
    probs = data["probabilities"]
    assert "00" in probs
    assert "11" in probs
    assert abs(probs["00"] - 0.5) < 0.01
    assert abs(probs["11"] - 0.5) < 0.01
    assert probs.get("01", 0.0) < 0.001
    assert probs.get("10", 0.0) < 0.001


def test_simulation_pauli_x():
    """Verify Pauli-X gate flips |0⟩ to |1⟩ with probability 1.0."""
    grid = [["X"]]

    response = client.post("/api/simulation/run", json={
        "num_qubits": 1,
        "grid": grid,
        "shots": 500
    })

    assert response.status_code == 200
    data = response.json()
    probs = data["probabilities"]
    assert abs(probs.get("1", 0.0) - 1.0) < 0.001
    assert probs.get("0", 0.0) < 0.001


def test_simulation_hadamard():
    """Verify Hadamard gate creates equal superposition (|0⟩ + |1⟩) / √2."""
    grid = [["H"]]

    response = client.post("/api/simulation/run", json={
        "num_qubits": 1,
        "grid": grid,
        "shots": 1000
    })

    assert response.status_code == 200
    data = response.json()
    probs = data["probabilities"]
    assert abs(probs.get("0", 0.0) - 0.5) < 0.01
    assert abs(probs.get("1", 0.0) - 0.5) < 0.01


def test_modules_listing():
    """Verify modules endpoint returns quantum computing curriculum."""
    response = client.get("/api/learning/modules")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 9
    assert len(data["modules"]) == 9
    assert data["modules"][0]["id"] == "mod-1"


def test_auth_and_user_flow():
    """Verify student registration, JWT issuance, and /api/users/me lookup."""
    import time
    unique_user = f"tester_{int(time.time() * 1000)}"
    reg_payload = {
        "email": f"{unique_user}@quantumlearn.edu",
        "username": unique_user,
        "password": "StrongQuantumPass123!",
        "full_name": "Test Quantum Student",
        "institution": "Quantum Institute"
    }

    # 1. Register
    reg_resp = client.post("/api/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201
    tokens = reg_resp.json()
    assert "access_token" in tokens
    token = tokens["access_token"]

    # 2. Login
    login_resp = client.post("/api/auth/login", json={
        "username_or_email": reg_payload["email"],
        "password": reg_payload["password"]
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

    # 3. Get Current User Me
    me_resp = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == reg_payload["email"]
    assert me_data["username"] == reg_payload["username"]


def test_quiz_submit():
    """Verify quiz submission endpoint evaluates correct answers and calculates score."""
    import time
    unique_user = f"quiz_user_{int(time.time() * 1000)}"
    reg_resp = client.post("/api/auth/register", json={
        "email": f"{unique_user}@test.edu",
        "username": unique_user,
        "password": "Password123!",
        "full_name": "Quiz Taker"
    })
    token = reg_resp.json()["access_token"]

    quiz_payload = {
        "quiz_id": "quiz-fundamentals",
        "answers": {
            "qc-1-1": "b",
            "qc-1-2": "c",
            "qc-2-1": "b",
            "qc-2-2": "b"
        }
    }

    resp = client.post(
        "/api/quizzes/submit",
        json=quiz_payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["score"] == 4
    assert data["total_questions"] == 4
    assert data["percentage"] == 100.0
    assert data["passed"] is True


def test_ai_tutor_chat():
    """Verify AI Tutor endpoint returns pedagogical reply and code snippets."""
    chat_payload = {
        "message": "Explain how the Hadamard gate produces superposition.",
        "history": [],
        "context": {"mode": "general"}
    }

    resp = client.post("/api/ai/chat", json=chat_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["reply"]) > 20
    assert data["source"] in ["live_backend", "curated_demo"]

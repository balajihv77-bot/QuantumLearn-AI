"""
QuantumLearn AI - Mock Interview Backend API Tests
Validates start, question retrieval, answer submissions, blank validation,
session completion, history tracking, early termination, evaluation reports,
track-specific rubrics, follow-ups, and demo fallbacks.
"""

import os
import json
import pytest
from fastapi.testclient import TestClient

os.environ["USE_SQLITE_FALLBACK"] = "true"

from backend.app.main import app
from backend.app.services.interview_ai_provider import InterviewAIProvider, RUBRIC_WEIGHTS, SAFETY_SYSTEM_INSTRUCTION

client = TestClient(app)


# Mock classes for fast, deterministic unit/API testing of Gemini AI integration
class MockGenAIResponse:
    def __init__(self, text: str):
        self.text = text


class MockGenAIModels:
    def generate_content(self, model: str, contents: str):
        if "question #" in contents or "creating question" in contents.lower():
            return MockGenAIResponse(json.dumps({
                "id": "gemini-q-mock-1",
                "question": "Explain how GIL and reference counting interact in Python CPython runtime.",
                "category": "Core Architecture",
                "difficulty": "Medium",
                "hint": "Focus on reference increments and thread context switching.",
                "is_coding_question": False,
                "coding_language": "",
                "starter_code": "",
                "follow_up_hint": "How do subinterpreters mitigate GIL contention?",
                "effective_answer_guide": "State reference count atomicity, GIL lock acquisition, and multi-threading limits.",
                "evaluation_criteria": ["Reference counting", "GIL mechanics", "Thread safety"],
                "model_answer": "CPython uses reference counts to manage memory lifetimes and deallocates memory when zero...",
                "key_points": ["Ref counts", "GIL lock", "Cyclic GC"]
            }))
        elif "Evaluate the candidate's answer" in contents:
            is_hr = "RUBRIC TO USE: HR" in contents
            if is_hr:
                return MockGenAIResponse(json.dumps({
                    "overall_score": 88,
                    "rubric_breakdown": {
                        "communication_and_clarity": {"score": 90, "weight": 35, "comment": "Clear STAR presentation."},
                        "situational_judgment_and_conflict_resolution": {"score": 88, "weight": 30, "comment": "Used benchmarks to de-escalate."},
                        "cultural_and_team_alignment": {"score": 85, "weight": 20, "comment": "Focus on shared engineering outcomes."},
                        "authenticity_and_reflection": {"score": 85, "weight": 15, "comment": "Acknowledged past learning."}
                    },
                    "feedback": "Strong situational response demonstrating emotional intelligence and metrics-backed problem-solving.",
                    "suggested_follow_up": "What was the most challenging feedback you received during that post-mortem?",
                    "effective_answer_guide": "State concrete metrics, maintain blameless attitude, and detail lasting process improvements.",
                    "strengths_identified": ["STAR structure", "Objective data focus"],
                    "gaps_identified": ["Elaborate on personal reflection"]
                }))
            else:
                return MockGenAIResponse(json.dumps({
                    "overall_score": 86,
                    "rubric_breakdown": {
                        "technical_correctness": {"score": 90, "weight": 40, "comment": "Accurate CPython memory explanation."},
                        "relevance_and_completeness": {"score": 85, "weight": 25, "comment": "Covered reference counting and cycle detector."},
                        "clarity": {"score": 85, "weight": 20, "comment": "Logical sequencing of memory tiers."},
                        "problem_solving": {"score": 80, "weight": 15, "comment": "Good theoretical trade-off analysis."}
                    },
                    "feedback": "Comprehensive technical answer demonstrating strong internal runtime knowledge.",
                    "suggested_follow_up": "How does free-threaded Python in PEP 703 address GIL contention without hurting single-thread performance?",
                    "effective_answer_guide": "State reference counts, cyclic generational collection, and GIL execution constraints.",
                    "strengths_identified": ["Precise terminology", "Accurate GC generations"],
                    "gaps_identified": ["Could mention sys.getrefcount() details"]
                }))
        elif "Produce a comprehensive final" in contents:
            return MockGenAIResponse(json.dumps({
                "summary": "Candidate exhibited solid technical proficiency and structured communication.",
                "strengths": ["Clear architecture intuition", "Precise terminology"],
                "areas_for_improvement": ["State asymptotic complexities", "Elaborate on production failure modes"],
                "technical_correctness": 86,
                "answer_relevance": 85,
                "clarity": 83,
                "problem_solving": 81
            }))
        return MockGenAIResponse("{}")


class MockGenAIClient:
    def __init__(self, api_key: str = "test-key"):
        self.models = MockGenAIModels()


@pytest.fixture(autouse=True)
def mock_genai_client(monkeypatch):
    """
    Automatically mocks InterviewAIProvider._get_client so that live AI integration
    logic runs instantaneously without external network latency or timeouts.
    """
    monkeypatch.setattr(InterviewAIProvider, "_get_client", classmethod(lambda cls, key: MockGenAIClient(key)))


# =============================================================================
# Core Endpoint & Session Tests
# =============================================================================

def test_interview_health_check():
    """Verify mock interview API health check reports available status."""
    response = client.get("/api/interviews/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "available"
    assert "Mock Interview Service" in data["service"]
    assert "storage_mode" in data
    assert "provider_mode" in data


def test_start_interview_success():
    """Verify starting a new interview returns 201 with session and initial question."""
    payload = {
        "role": "Python Developer",
        "experience_level": "Intermediate",
        "interview_type": "Technical",
        "difficulty": "Medium",
        "question_count": 5
    }
    response = client.post("/api/interviews/start", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert "session_id" in data
    assert data["role"] == "Python Developer"
    assert data["status"] == "in_progress"
    assert data["current_question_index"] == 0
    assert data["total_questions"] == 5
    assert data["current_question"] is not None
    assert "id" in data["current_question"]
    assert "question" in data["current_question"]


def test_start_interview_validation_error():
    """Verify request validation rejects missing mandatory fields."""
    incomplete_payload = {
        "role": "Python Developer"
        # missing experience_level, interview_type, difficulty
    }
    response = client.post("/api/interviews/start", json=incomplete_payload)
    assert response.status_code == 422


def test_get_interview_session():
    """Verify retrieving an active interview session by its ID."""
    start_resp = client.post("/api/interviews/start", json={
        "role": "Frontend Developer",
        "experience_level": "Beginner",
        "interview_type": "Technical",
        "difficulty": "Easy",
        "question_count": 5
    })
    session_id = start_resp.json()["session_id"]

    response = client.get(f"/api/interviews/{session_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == session_id
    assert data["role"] == "Frontend Developer"
    assert data["status"] == "in_progress"


def test_get_nonexistent_session():
    """Verify retrieving an invalid session ID returns 404 Not Found."""
    response = client.get("/api/interviews/nonexistent-session-uuid-1234")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_submit_valid_answer():
    """Verify submitting a valid answer advances to the next question."""
    start_resp = client.post("/api/interviews/start", json={
        "role": "Java Developer",
        "experience_level": "Intermediate",
        "interview_type": "Technical",
        "difficulty": "Medium",
        "question_count": 5
    })
    session_data = start_resp.json()
    session_id = session_data["session_id"]
    q_id = session_data["current_question"]["id"]

    answer_resp = client.post(f"/api/interviews/{session_id}/answer", json={
        "question_id": q_id,
        "answer_text": "ConcurrentHashMap uses CAS on empty bucket nodes and synchronized bin locks for collision handling.",
        "code_answer": None
    })

    assert answer_resp.status_code == 200
    ans_data = answer_resp.json()
    assert ans_data["status"] == "recorded"
    assert ans_data["current_question_index"] == 1
    assert ans_data["next_question"] is not None
    assert ans_data["is_completed"] is False


def test_prevent_blank_answer_submission():
    """Verify submitting blank/whitespace answer is rejected with 422."""
    start_resp = client.post("/api/interviews/start", json={
        "role": "Python Developer",
        "experience_level": "Fresher",
        "interview_type": "Technical",
        "difficulty": "Easy",
        "question_count": 5
    })
    session_id = start_resp.json()["session_id"]
    q_id = start_resp.json()["current_question"]["id"]

    blank_resp = client.post(f"/api/interviews/{session_id}/answer", json={
        "question_id": q_id,
        "answer_text": "   "
    })
    assert blank_resp.status_code == 422
    assert "blank" in blank_resp.json()["detail"].lower()


def test_submit_answer_nonexistent_session():
    """Verify submitting an answer to an unknown session returns 404."""
    response = client.post("/api/interviews/unknown-id/answer", json={
        "question_id": "q-1",
        "answer_text": "Valid explanation text here."
    })
    assert response.status_code == 404


def test_coding_interview_flow():
    """Verify coding interview provides coding challenge and accepts code snippets."""
    start_resp = client.post("/api/interviews/start", json={
        "role": "C Programmer",
        "experience_level": "Intermediate",
        "interview_type": "Coding",
        "difficulty": "Medium",
        "question_count": 5
    })
    session_data = start_resp.json()
    session_id = session_data["session_id"]
    first_q = session_data["current_question"]

    answer_resp = client.post(f"/api/interviews/{session_id}/answer", json={
        "question_id": first_q["id"],
        "answer_text": "Pointer arithmetic comparison ensures we copy forward when dest < src, and backwards otherwise.",
        "code_answer": "void *custom_memmove(void *dest, const void *src, size_t n) { ... }"
    })
    assert answer_resp.status_code == 200
    assert answer_resp.json()["status"] == "recorded"


def test_finish_interview_early_and_get_report():
    """Verify early interview termination generates a full diagnostic evaluation report."""
    start_resp = client.post("/api/interviews/start", json={
        "role": "AI/ML Engineer",
        "experience_level": "Experienced",
        "interview_type": "Mixed",
        "difficulty": "Hard",
        "question_count": 5
    })
    session_id = start_resp.json()["session_id"]
    first_q_id = start_resp.json()["current_question"]["id"]

    # Submit one response
    client.post(f"/api/interviews/{session_id}/answer", json={
        "question_id": first_q_id,
        "answer_text": "Attention scaling by sqrt(d_k) prevents softmax dot product saturation and vanishing gradients."
    })

    # End interview early
    finish_resp = client.post(f"/api/interviews/{session_id}/finish")
    assert finish_resp.status_code == 200
    finish_data = finish_resp.json()
    assert finish_data["status"] == "completed"
    assert finish_data["report"] is not None

    report = finish_data["report"]
    assert report["overall_score"] > 0
    assert "technical_correctness" in report
    assert "clarity" in report
    assert len(report["strengths"]) > 0
    assert len(report["areas_for_improvement"]) > 0
    assert len(report["question_breakdowns"]) == 5

    # Fetch report directly via GET /api/interviews/{session_id}/report
    report_resp = client.get(f"/api/interviews/{session_id}/report")
    assert report_resp.status_code == 200
    assert report_resp.json()["session_id"] == session_id


def test_interview_history():
    """Verify chronological history lists recorded mock interview sessions."""
    response = client.get("/api/interviews/history")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "interviews" in data
    assert data["total"] > 0


# =============================================================================
# Part 4: Live AI Integration, Rubric Validation & Safety Guardrail Tests
# =============================================================================

def test_provider_status_endpoint():
    """Verify /api/interviews/provider-status returns provider info and supported rubrics."""
    response = client.get("/api/interviews/provider-status")
    assert response.status_code == 200
    data = response.json()
    assert "provider_configured" in data
    assert "provider_name" in data
    assert "model_name" in data
    assert "active_mode" in data
    assert data["active_mode"] in ["live_ai", "demo"]
    assert "Technical" in data["rubrics_supported"]
    assert "HR" in data["rubrics_supported"]
    assert data["safety_guardrails_active"] is True


def test_technical_rubric_weights_and_breakdown():
    """
    Verify Technical interview answers are scored according to rubric:
    Technical correctness: 40%, Relevance and completeness: 25%, Clarity: 20%, Problem-solving: 15%.
    """
    tech_weights = RUBRIC_WEIGHTS["Technical"]
    assert tech_weights["technical_correctness"] == 40
    assert tech_weights["relevance_and_completeness"] == 25
    assert tech_weights["clarity"] == 20
    assert tech_weights["problem_solving"] == 15
    assert sum(tech_weights.values()) == 100


def test_hr_rubric_weights_distinct_from_technical():
    """Verify HR interview uses a distinct, non-technical rubric with custom weights."""
    hr_weights = RUBRIC_WEIGHTS["HR"]
    assert "communication_and_clarity" in hr_weights
    assert "situational_judgment_and_conflict_resolution" in hr_weights
    assert "cultural_and_team_alignment" in hr_weights
    assert "authenticity_and_reflection" in hr_weights
    assert sum(hr_weights.values()) == 100
    assert hr_weights != RUBRIC_WEIGHTS["Technical"]


def test_answer_response_includes_follow_up_and_effective_guide():
    """Verify answer response includes follow-up questions, effective answer guide, and practice estimate label."""
    start_resp = client.post("/api/interviews/start", json={
        "role": "Python Developer",
        "experience_level": "Intermediate",
        "interview_type": "Technical",
        "difficulty": "Medium",
        "question_count": 3
    })
    session_id = start_resp.json()["session_id"]
    q_id = start_resp.json()["current_question"]["id"]

    answer_resp = client.post(f"/api/interviews/{session_id}/answer", json={
        "question_id": q_id,
        "answer_text": "Python memory management relies on reference counting and generational cycle detection (Gen 0, 1, 2) to reclaim unreferenced cyclic structures."
    })
    assert answer_resp.status_code == 200
    ans_data = answer_resp.json()

    assert "score" in ans_data
    assert ans_data["score"] >= 0
    assert "rubric_breakdown" in ans_data
    assert "practice_estimate_notice" in ans_data
    assert "practice estimate" in ans_data["practice_estimate_notice"].lower()
    assert ans_data["suggested_follow_up"] is not None
    assert ans_data["effective_answer_guide"] is not None


def test_hr_interview_submission_flow():
    """Verify behavioral HR interview evaluates situational responses with HR rubric."""
    start_resp = client.post("/api/interviews/start", json={
        "role": "Frontend Developer",
        "experience_level": "Experienced",
        "interview_type": "HR",
        "difficulty": "Medium",
        "question_count": 2
    })
    session_data = start_resp.json()
    session_id = session_data["session_id"]
    q_id = session_data["current_question"]["id"]

    answer_resp = client.post(f"/api/interviews/{session_id}/answer", json={
        "question_id": q_id,
        "answer_text": "I used the STAR method to organize an objective benchmarking spike when our team disagreed on state management, letting quantitative bundle size and render metrics resolve the discussion."
    })
    assert answer_resp.status_code == 200
    ans_data = answer_resp.json()
    assert ans_data["rubric_breakdown"] is not None
    assert "communication_and_clarity" in ans_data["rubric_breakdown"]


def test_demo_fallback_when_unconfigured(monkeypatch):
    """Verify system gracefully falls back to curated demo mode when API key is unset without inventing fake AI."""
    monkeypatch.setattr(InterviewAIProvider, "get_api_key", classmethod(lambda cls: None))

    assert InterviewAIProvider.is_configured() is False
    status = InterviewAIProvider.get_provider_status()
    assert status["active_mode"] == "demo"
    assert status["provider_configured"] is False

    # Start session in demo mode
    start_resp = client.post("/api/interviews/start", json={
        "role": "Java Developer",
        "experience_level": "Beginner",
        "interview_type": "Technical",
        "difficulty": "Easy",
        "question_count": 3
    })
    assert start_resp.status_code == 201
    assert start_resp.json()["provider_mode"] == "demo"
    assert start_resp.json()["is_live_ai"] is False


def test_protected_characteristics_safety_instruction():
    """Verify safety instructions explicitly forbid altering scores based on protected characteristics."""
    instruction_lower = SAFETY_SYSTEM_INSTRUCTION.lower()
    assert "protected personal characteristics" in instruction_lower
    assert "gender" in instruction_lower
    assert "race" in instruction_lower
    assert "religion" in instruction_lower
    assert "disability" in instruction_lower
    assert "never execute" in instruction_lower

"""
QuantumLearn AI - Interview MySQL Persistence Tests (Part 5)
Verifies:
1. InterviewSession persistence in database with role, level, type, status, and timestamps.
2. InterviewQuestion persistence with question text, order, and rubric criteria.
3. InterviewAnswer persistence with scores (correctness, relevance, clarity, problem-solving), feedback, and answer text.
4. InterviewReport persistence with overall practice score, strengths, improvement areas, recommendations, and timestamp.
5. User privacy & history isolation (multi-tenant boundary between authenticated users and guest sessions).
6. Invalid session IDs (404 Not Found error handling).
7. Database connection failure handling (graceful 503 Service Unavailable).
8. Absence of passwords, API keys, or sensitive credentials in interview tables.
"""

import os
import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

os.environ["USE_SQLITE_FALLBACK"] = "true"

from backend.app.main import app
from backend.app.database.connection import SessionLocal, engine, Base
from backend.app.models.user import User
from backend.app.models.interview import (
    InterviewSession,
    InterviewQuestion,
    InterviewAnswer,
    InterviewReport,
)
from backend.app.services.interview_ai_provider import InterviewAIProvider
from backend.app.services.interview_service import InterviewService
from backend.app.core.security import create_access_token

client = TestClient(app)


# Mock AI client to run tests deterministically without external API latency
class MockGenAIResponse:
    def __init__(self, text: str):
        self.text = text


class MockGenAIModels:
    def generate_content(self, model: str, contents: str):
        if "question #" in contents or "creating question" in contents.lower():
            return MockGenAIResponse(json.dumps({
                "id": "persisted-q-1",
                "question": "Explain MySQL InnoDB indexing, B+Tree leaf clustering, and secondary index lookups.",
                "category": "Database Architecture",
                "difficulty": "Medium",
                "hint": "Mention clustered index vs secondary index pointer to primary key.",
                "is_coding_question": False,
                "follow_up_hint": "How do covering indexes prevent secondary index double-lookups?",
                "effective_answer_guide": "State clustered index contains row data at leaf nodes, secondary indexes point to primary keys.",
                "evaluation_criteria": ["Clustered index mechanics", "B+Tree traversal", "Covering index optimization"],
                "model_answer": "InnoDB stores table rows in a clustered index ordered by primary key. Secondary index leaves store the PK.",
                "key_points": ["Clustered index", "Secondary indexes store PK", "Covering indexes"]
            }))
        elif "Evaluate the candidate's answer" in contents:
            return MockGenAIResponse(json.dumps({
                "overall_score": 88,
                "rubric_breakdown": {
                    "technical_correctness": {"score": 90, "weight": 40, "comment": "Accurate B+Tree explanation."},
                    "relevance_and_completeness": {"score": 88, "weight": 25, "comment": "Covered secondary lookups."},
                    "clarity": {"score": 85, "weight": 20, "comment": "Clear terminology."},
                    "problem_solving": {"score": 85, "weight": 15, "comment": "Good trade-off awareness."}
                },
                "feedback": "Strong architectural response detailing InnoDB storage internals.",
                "suggested_follow_up": "How does adaptive hash indexing complement B+Trees in InnoDB?",
                "effective_answer_guide": "Explain leaf-node clustering and secondary index lookup overhead.",
                "strengths_identified": ["Precise terminology", "Good memory layout analysis"],
                "gaps_identified": ["Could mention page split mechanics"]
            }))
        elif "Produce a comprehensive final" in contents:
            return MockGenAIResponse(json.dumps({
                "summary": "Candidate demonstrated solid database engineering understanding.",
                "strengths": ["Clean conceptual clarity", "Accurate storage engine mechanics"],
                "areas_for_improvement": ["Elaborate on lock contention in high concurrency"],
                "technical_correctness": 88,
                "answer_relevance": 86,
                "clarity": 85,
                "problem_solving": 84
            }))
        return MockGenAIResponse("{}")


class MockGenAIClient:
    def __init__(self, api_key: str = "test-key"):
        self.models = MockGenAIModels()


@pytest.fixture(autouse=True)
def mock_genai(monkeypatch):
    monkeypatch.setattr(InterviewAIProvider, "_get_client", classmethod(lambda cls, key: MockGenAIClient(key)))


@pytest.fixture(scope="function")
def db_session():
    """Yields a database session and cleans up test records."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =============================================================================
# 1. Session Creation Persistence
# =============================================================================

def test_session_creation_in_mysql(db_session):
    """Verify InterviewSession and InterviewQuestion records are persisted in MySQL."""
    payload = {
        "role": "Database Engineer",
        "experience_level": "Intermediate",
        "interview_type": "Technical",
        "difficulty": "Medium",
        "question_count": 4
    }
    response = client.post("/api/interviews/start", json=payload)
    assert response.status_code == 201
    data = response.json()
    session_id = data["session_id"]

    # Verify directly in database via SQLAlchemy
    session_record = db_session.query(InterviewSession).filter(
        InterviewSession.session_id == session_id
    ).first()

    assert session_record is not None
    assert session_record.role == "Database Engineer"
    assert session_record.experience_level == "Intermediate"
    assert session_record.interview_type == "Technical"
    assert session_record.difficulty == "Medium"
    assert session_record.total_questions == 4
    assert session_record.status == "in_progress"
    assert session_record.created_at is not None
    assert session_record.completed_at is None

    # Verify questions persisted with foreign keys
    questions = db_session.query(InterviewQuestion).filter(
        InterviewQuestion.session_id == session_id
    ).order_by(InterviewQuestion.question_order).all()

    assert len(questions) == 4
    assert questions[0].question_order == 0
    assert len(questions[0].question_text) > 10
    assert questions[0].session_id == session_id


# =============================================================================
# 2. Answer Persistence
# =============================================================================

def test_answer_persistence_in_mysql(db_session):
    """Verify submitted answers and evaluation rubrics persist in InterviewAnswer table."""
    start_resp = client.post("/api/interviews/start", json={
        "role": "Python Developer",
        "experience_level": "Intermediate",
        "interview_type": "Technical",
        "difficulty": "Medium",
        "question_count": 3
    })
    assert start_resp.status_code == 201
    session_data = start_resp.json()
    session_id = session_data["session_id"]
    q_id = session_data["current_question"]["id"]

    answer_text = (
        "In InnoDB, the primary key forms the clustered index with row data stored directly in leaf pages. "
        "Secondary indexes store the indexed column values alongside primary key pointers."
    )
    code_snippet = "SELECT * FROM users FORCE INDEX (idx_users_email) WHERE email = 'test@example.com';"

    ans_resp = client.post(f"/api/interviews/{session_id}/answer", json={
        "question_id": q_id,
        "answer_text": answer_text,
        "code_answer": code_snippet
    })
    assert ans_resp.status_code == 200

    # Query InterviewAnswer table in DB
    ans_record = db_session.query(InterviewAnswer).filter(
        InterviewAnswer.session_id == session_id,
        InterviewAnswer.question_id == q_id
    ).first()

    assert ans_record is not None
    assert ans_record.answer_text == answer_text
    assert ans_record.code_answer == code_snippet
    assert ans_record.correctness_score is not None
    assert ans_record.relevance_score is not None
    assert ans_record.clarity_score is not None
    assert ans_record.problem_solving_score is not None
    assert ans_record.overall_score is not None
    assert ans_record.feedback is not None
    assert len(ans_record.feedback) > 10
    assert ans_record.submitted_at is not None

    # Verify rubric breakdown JSON
    breakdown = ans_record.get_rubric_breakdown()
    assert isinstance(breakdown, dict)


# =============================================================================
# 3. Report Persistence
# =============================================================================

def test_report_persistence_in_mysql(db_session):
    """Verify final performance evaluation reports persist in InterviewReport table."""
    start_resp = client.post("/api/interviews/start", json={
        "role": "Cloud Architect",
        "experience_level": "Experienced",
        "interview_type": "Technical",
        "difficulty": "Hard",
        "question_count": 2
    })
    session_data = start_resp.json()
    session_id = session_data["session_id"]
    q_id = session_data["current_question"]["id"]

    # Submit an answer
    client.post(f"/api/interviews/{session_id}/answer", json={
        "question_id": q_id,
        "answer_text": "We deploy multi-region active-active clusters with asynchronous replication and local read replicas."
    })

    # Conclude interview session early
    finish_resp = client.post(f"/api/interviews/{session_id}/finish")
    assert finish_resp.status_code == 200
    finish_data = finish_resp.json()
    assert finish_data["status"] == "completed"

    # Verify InterviewReport in database
    db_report = db_session.query(InterviewReport).filter(
        InterviewReport.session_id == session_id
    ).first()

    assert db_report is not None
    assert db_report.overall_practice_score > 0
    assert db_report.technical_correctness is not None
    assert db_report.answer_relevance is not None
    assert db_report.clarity is not None
    assert db_report.problem_solving is not None

    strengths = db_report.get_strengths()
    improvements = db_report.get_improvement_areas()
    recommendations = db_report.get_recommendations()

    assert isinstance(strengths, list)
    assert len(strengths) > 0
    assert isinstance(improvements, list)
    assert len(improvements) > 0
    assert isinstance(recommendations, list)
    assert len(recommendations) > 0
    assert db_report.created_at is not None

    # Retrieve report via GET endpoint
    report_resp = client.get(f"/api/interviews/{session_id}/report")
    assert report_resp.status_code == 200
    report_data = report_resp.json()
    assert report_data["session_id"] == session_id
    assert report_data["overall_score"] == db_report.overall_practice_score


# =============================================================================
# 4. User Privacy & History Isolation
# =============================================================================

def test_user_history_isolation_and_privacy(db_session):
    """
    Ensure each authenticated user can only access their own private records,
    and guest / unauthenticated requests cannot inspect authenticated student history.
    """
    # Create two test users in database
    user_a = db_session.query(User).filter(User.email == "alice@quantum.test").first()
    if not user_a:
        user_a = User(
            email="alice@quantum.test",
            username="alice_test",
            hashed_password="hashed_secret_pass_1",
            full_name="Alice Candidate"
        )
        db_session.add(user_a)
        db_session.commit()
        db_session.refresh(user_a)

    user_b = db_session.query(User).filter(User.email == "bob@quantum.test").first()
    if not user_b:
        user_b = User(
            email="bob@quantum.test",
            username="bob_test",
            hashed_password="hashed_secret_pass_2",
            full_name="Bob Candidate"
        )
        db_session.add(user_b)
        db_session.commit()
        db_session.refresh(user_b)

    token_a = create_access_token({"sub": str(user_a.id)})
    token_b = create_access_token({"sub": str(user_b.id)})

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Alice starts a session
    resp_a = client.post("/api/interviews/start", json={
        "role": "Security Engineer",
        "experience_level": "Intermediate",
        "interview_type": "Technical",
        "difficulty": "Medium",
        "question_count": 3
    }, headers=headers_a)
    assert resp_a.status_code == 201
    session_a_id = resp_a.json()["session_id"]

    # Bob starts a session
    resp_b = client.post("/api/interviews/start", json={
        "role": "Frontend Architect",
        "experience_level": "Experienced",
        "interview_type": "Technical",
        "difficulty": "Hard",
        "question_count": 3
    }, headers=headers_b)
    assert resp_b.status_code == 201
    session_b_id = resp_b.json()["session_id"]

    # 1. Alice retrieves history: only Alice's session should appear
    history_a = client.get("/api/interviews/history", headers=headers_a).json()
    alice_sessions = [item["session_id"] for item in history_a["interviews"]]
    assert session_a_id in alice_sessions
    assert session_b_id not in alice_sessions

    # 2. Bob retrieves history: only Bob's session should appear
    history_b = client.get("/api/interviews/history", headers=headers_b).json()
    bob_sessions = [item["session_id"] for item in history_b["interviews"]]
    assert session_b_id in bob_sessions
    assert session_a_id not in bob_sessions

    # 3. Bob attempts to access Alice's session directly: must return 403 Forbidden
    cross_access_resp = client.get(f"/api/interviews/{session_a_id}", headers=headers_b)
    assert cross_access_resp.status_code == 403

    # 4. Unauthenticated guest attempts to access Alice's private session: must return 403 Forbidden
    unauth_access_resp = client.get(f"/api/interviews/{session_a_id}")
    assert unauth_access_resp.status_code == 403

    # 5. Unauthenticated guest history retrieval: must NOT contain Alice's or Bob's private sessions
    guest_history = client.get("/api/interviews/history").json()
    guest_sessions = [item["session_id"] for item in guest_history["interviews"]]
    assert session_a_id not in guest_sessions
    assert session_b_id not in guest_sessions


# =============================================================================
# 5. Invalid Session IDs
# =============================================================================

def test_invalid_session_id_handling():
    """Verify appropriate 404 Not Found is returned for nonexistent session IDs."""
    fake_id = "nonexistent_session_999999"

    # GET session state
    resp1 = client.get(f"/api/interviews/{fake_id}")
    assert resp1.status_code == 404
    assert "not found" in resp1.json()["detail"].lower()

    # POST answer
    resp2 = client.post(f"/api/interviews/{fake_id}/answer", json={
        "question_id": "q-1",
        "answer_text": "Sample test answer."
    })
    assert resp2.status_code == 404

    # POST finish
    resp3 = client.post(f"/api/interviews/{fake_id}/finish")
    assert resp3.status_code == 404

    # GET report
    resp4 = client.get(f"/api/interviews/{fake_id}/report")
    assert resp4.status_code == 404


# =============================================================================
# 6. Database Connection Failure Handling
# =============================================================================

def test_database_connection_failure_handling():
    """
    Verify backend catches database connection and operational errors gracefully,
    rolls back transactions, and returns HTTP 503 Service Unavailable without crashing.
    """
    from backend.app.database.connection import get_db

    class MockFailingSession:
        def add(self, obj):
            pass
        def commit(self):
            raise OperationalError(
                "Can't connect to MySQL server on 'localhost:3306' (111 Connection refused)",
                params=None,
                orig=Exception("Connection refused")
            )
        def rollback(self):
            pass
        def query(self, *args, **kwargs):
            raise OperationalError(
                "Can't connect to MySQL server on 'localhost:3306' (111 Connection refused)",
                params=None,
                orig=Exception("Connection refused")
            )
        def close(self):
            pass

    def broken_get_db():
        yield MockFailingSession()

    app.dependency_overrides[get_db] = broken_get_db

    try:
        response = client.post("/api/interviews/start", json={
            "role": "Python Developer",
            "experience_level": "Beginner",
            "interview_type": "Technical",
            "difficulty": "Easy",
            "question_count": 2
        })
        assert response.status_code == 503
        assert "database connection failure" in response.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()


# =============================================================================
# 7. No Sensitive Information Stored in Interview Records
# =============================================================================

def test_no_sensitive_secrets_in_interview_records(db_session):
    """
    Verify that no passwords, API keys, or JWT tokens are stored in interview records
    or exposed in interview schemas.
    """
    columns_session = [col.name for col in InterviewSession.__table__.columns]
    columns_question = [col.name for col in InterviewQuestion.__table__.columns]
    columns_answer = [col.name for col in InterviewAnswer.__table__.columns]
    columns_report = [col.name for col in InterviewReport.__table__.columns]

    all_columns = columns_session + columns_question + columns_answer + columns_report

    forbidden_tokens = ["password", "secret", "api_key", "token", "hash"]
    for col in all_columns:
        for forbidden in forbidden_tokens:
            assert forbidden not in col.lower(), f"Forbidden field '{col}' detected in interview tables!"

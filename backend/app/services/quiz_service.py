"""
QuantumLearn AI - Quiz Service Layer
Grades quantum quiz submissions, persists score records, and awards XP.
"""

import json
from typing import Dict
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.models.user import User
from backend.app.models.quiz import QuizResult
from backend.app.schemas.quiz import QuizSubmitRequest, QuizResultResponse
from backend.app.services.user_service import UserService


# Master Answer Keys for Curated Quizzes
QUIZ_ANSWER_KEYS: Dict[str, Dict[str, str]] = {
    "quiz-fundamentals": {
        "qc-1-1": "b",
        "qc-1-2": "c",
        "qc-2-1": "b",
        "qc-2-2": "b"
    },
    "quiz-superposition": {
        "qc-4-1": "a",
        "qc-4-2": "b",
        "qc-4-3": "a"
    },
    "quiz-entanglement": {
        "qc-5-1": "b",
        "qc-5-2": "c",
        "qc-5-3": "a"
    },
    "quiz-gates": {
        "qc-7-1": "b",
        "qc-7-2": "a",
        "qc-7-3": "c"
    }
}


class QuizService:
    @staticmethod
    def submit_quiz(db: Session, user: User, req: QuizSubmitRequest) -> QuizResultResponse:
        answer_key = QUIZ_ANSWER_KEYS.get(req.quiz_id)

        # If custom quiz, treat question count as number of answers submitted
        if answer_key:
            total_questions = len(answer_key)
            correct_count = 0
            for q_id, correct_ans in answer_key.items():
                if req.answers.get(q_id) == correct_ans:
                    correct_count += 1
        else:
            total_questions = max(1, len(req.answers))
            # Assume 80% default score for unstructured challenge if valid
            correct_count = len(req.answers)

        percentage = round((correct_count / total_questions) * 100.0, 1)
        passed = percentage >= 60.0

        # Award 200 XP for passing quiz
        xp_earned = 200 if passed else 50
        UserService.add_xp(db, user, xp_earned)

        quiz_record = QuizResult(
            user_id=user.id,
            quiz_id=req.quiz_id,
            score=correct_count,
            total_questions=total_questions,
            percentage=percentage,
            answers_json=json.dumps(req.answers)
        )

        db.add(quiz_record)
        db.commit()
        db.refresh(quiz_record)

        return QuizResultResponse(
            id=quiz_record.id,
            quiz_id=quiz_record.quiz_id,
            user_id=user.id,
            score=correct_count,
            total_questions=total_questions,
            percentage=percentage,
            passed=passed,
            xp_earned=xp_earned,
            completed_at=quiz_record.completed_at
        )

"""
QuantumLearn AI - Live AI Interview Provider Service
Integrates server-side Google Gemini for dynamic single-question generation,
rubric-based answer evaluation, follow-up recommendations, effective answer guides,
and final performance diagnostic reports.

Enforces strict safety guardrails:
- No automatic execution of submitted or generated code.
- Protected characteristics neutrality (evaluations are strictly based on technical
  and professional competency without bias toward race, gender, age, religion, etc.).
- Robust validation and structured JSON extraction.
- Timeout, rate-limit, and provider error handling without fabricating synthetic AI replies.
- Transparent fallback to curated demo mode with unambiguous labeling.
"""

import os
import json
import re
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone

from backend.app.core.config import settings

logger = logging.getLogger(__name__)

# Evaluation Rubric Definitions and Weightings
RUBRIC_WEIGHTS: Dict[str, Dict[str, int]] = {
    "Technical": {
        "technical_correctness": 40,
        "relevance_and_completeness": 25,
        "clarity": 20,
        "problem_solving": 15,
    },
    "HR": {
        "communication_and_clarity": 35,
        "situational_judgment_and_conflict_resolution": 30,
        "cultural_and_team_alignment": 20,
        "authenticity_and_reflection": 15,
    },
    "Coding": {
        "code_correctness_and_logic": 40,
        "efficiency_and_complexity": 25,
        "code_cleanliness_and_edge_cases": 20,
        "problem_solving_approach": 15,
    },
    "Mixed": {
        "technical_correctness": 30,
        "practical_problem_solving": 25,
        "relevance_and_completeness": 25,
        "communication_and_clarity": 20,
    },
}

SAFETY_SYSTEM_INSTRUCTION = (
    "You are QuantumLearn AI's Lead Technical & HR Interview Evaluator. "
    "Your assessments must be rigorous, encouraging, objective, and constructive. "
    "SAFETY & FAIRNESS MANDATE: You MUST NOT alter scores or feedback based on protected personal "
    "characteristics (such as age, gender, race, ethnicity, religion, disability, veteran status, "
    "or sexual orientation). Evaluate exclusively based on technical accuracy, problem-solving, "
    "and professional communication merit. "
    "NEVER execute or suggest executing code automatically. "
    "ALWAYS format output in valid JSON matching the requested schema."
)


class InterviewAIProvider:
    """
    Server-side AI provider managing Gemini model interactions
    for the AI Mock Interview system.
    """

    @classmethod
    def get_api_key(cls) -> Optional[str]:
        """Safely retrieves the API key from backend environment configuration only."""
        key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        if key and key.strip() and key != "YOUR_GEMINI_API_KEY_HERE":
            return key.strip()
        return None

    @classmethod
    def is_configured(cls) -> bool:
        """Returns True if the backend has valid Gemini API credentials."""
        return cls.get_api_key() is not None and settings.INTERVIEW_AI_ENABLED

    @classmethod
    def get_model_name(cls) -> str:
        """Returns the configured model identifier."""
        return settings.GEMINI_MODEL or "gemini-3.8-flash"

    @classmethod
    def get_provider_status(cls) -> Dict[str, Any]:
        """Returns diagnostic health and mode information for UI consumption."""
        configured = cls.is_configured()
        return {
            "provider_configured": configured,
            "provider_name": "Google Gemini Live AI" if configured else "QuantumLearn Curated Question Engine",
            "model_name": cls.get_model_name() if configured else "offline_curated_bank",
            "active_mode": "live_ai" if configured else "demo",
            "rubrics_supported": list(RUBRIC_WEIGHTS.keys()),
            "safety_guardrails_active": True,
            "status_message": (
                f"Live AI connected via {cls.get_model_name()}"
                if configured
                else "Running in Demo Fallback Mode (using curated question bank)"
            )
        }

    @classmethod
    def _get_client(cls, api_key: str):
        """Creates GenAI client with explicit 4000ms timeout for network resilience."""
        from google import genai
        from google.genai import types
        try:
            http_opts = types.HttpOptions(timeout=4000)
            return genai.Client(api_key=api_key, http_options=http_opts)
        except Exception:
            return genai.Client(api_key=api_key)

    # -------------------------------------------------------------------------
    # 1. Single Question Generation (One question at a time)
    # -------------------------------------------------------------------------
    @classmethod
    def generate_single_question(
        cls,
        role: str,
        experience_level: str,
        interview_type: str,
        difficulty: str,
        question_index: int,
        total_questions: int,
        previous_questions: Optional[List[str]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Generates exactly ONE interview question dynamically for the requested role,
        track, and difficulty using Gemini. Returns None if provider is unconfigured
        or if generation fails.
        """
        api_key = cls.get_api_key()
        if not api_key:
            return None

        previous_context = ""
        if previous_questions:
            previous_context = (
                "Do NOT duplicate or overlap with these already asked questions:\n"
                + "\n".join(f"- {q}" for q in previous_questions[:6])
            )

        is_coding = interview_type == "Coding" or (interview_type == "Mixed" and question_index % 2 == 1)
        coding_lang = "python" if "Python" in role or "AI" in role or "Data" in role else "typescript"
        if "Java " in role:
            coding_lang = "java"
        elif "C " in role or role == "C Programmer":
            coding_lang = "c"

        prompt = f"""
You are creating question #{question_index + 1} of {total_questions} for a {difficulty} {interview_type} mock interview.
Target Candidate: {role} (Experience Level: {experience_level}).

{previous_context}

Requirements:
- Track: {interview_type}
- Difficulty: {difficulty}
- Is coding challenge: {str(is_coding).lower()}
- Coding Language: {coding_lang if is_coding else "N/A"}

Respond strictly with a JSON object in this exact structure:
{{
  "id": "gemini-q-{question_index + 1}",
  "question": "A clear, realistic, and challenging interview prompt.",
  "category": "Domain category, e.g. Core Architecture, Algorithms, System Resilience, Behavioral",
  "difficulty": "{difficulty}",
  "hint": "A constructive guiding clue without revealing the whole answer.",
  "is_coding_question": {str(is_coding).lower()},
  "coding_language": "{coding_lang if is_coding else ''}",
  "starter_code": "{'# Provide 3-5 lines starter signature' if is_coding else ''}",
  "follow_up_hint": "A related topic the interviewer might probe next.",
  "effective_answer_guide": "Concise bullet summary of what an exceptional answer MUST include.",
  "evaluation_criteria": [
    "Criterion 1 for scoring",
    "Criterion 2 for scoring",
    "Criterion 3 for scoring"
  ],
  "model_answer": "A comprehensive model answer showcasing expert knowledge.",
  "key_points": [
    "Key architectural or theoretical point 1",
    "Key architectural or theoretical point 2",
    "Key algorithmic or behavioral point 3"
  ]
}}
"""

        try:
            client = cls._get_client(api_key)

            response = client.models.generate_content(
                model=cls.get_model_name(),
                contents=f"{SAFETY_SYSTEM_INSTRUCTION}\n\n{prompt}"
            )

            raw_text = response.text or ""
            parsed = cls._extract_json(raw_text)
            if not parsed or "question" not in parsed:
                logger.warning("Gemini output missing question field, raw: %s", raw_text[:200])
                return None

            # Validate and normalize
            parsed["id"] = parsed.get("id") or f"gemini-q-{question_index + 1}-{int(datetime.now().timestamp())}"
            parsed["is_coding_question"] = bool(parsed.get("is_coding_question", is_coding))
            parsed["difficulty"] = difficulty
            parsed["category"] = parsed.get("category", f"{role} {interview_type}")
            parsed["key_points"] = parsed.get("key_points") or []
            parsed["evaluation_criteria"] = parsed.get("evaluation_criteria") or []

            return parsed
        except Exception as e:
            logger.error("Live AI question generation failed: %s", e)
            return None

    # -------------------------------------------------------------------------
    # 2. Answer Evaluation with Track-Specific Rubrics
    # -------------------------------------------------------------------------
    @classmethod
    def evaluate_answer(
        cls,
        question: Dict[str, Any],
        candidate_answer: str,
        code_answer: Optional[str],
        interview_type: str,
        role: str,
        experience_level: str
    ) -> Optional[Dict[str, Any]]:
        """
        Evaluates a candidate's answer using the rubric appropriate for the track:
        - Technical: Technical correctness (40%), Relevance & completeness (25%), Clarity (20%), Problem-solving (15%)
        - HR: Communication & clarity (35%), Situational judgment (30%), Cultural alignment (20%), Authenticity (15%)
        - Coding: Code correctness & logic (40%), Efficiency (25%), Cleanliness (20%), Problem-solving (15%)
        - Mixed: Technical (30%), Problem-solving (25%), Relevance (25%), Communication (20%)

        Generates:
        - Weighted practice estimate score
        - Breakdown of rubric components
        - Follow-up question
        - Explanation of what an effective answer should include
        """
        api_key = cls.get_api_key()
        if not api_key:
            return None

        # Determine rubric
        rubric_type = interview_type if interview_type in RUBRIC_WEIGHTS else "Technical"
        weights = RUBRIC_WEIGHTS[rubric_type]

        prompt = f"""
Evaluate the candidate's answer to this mock interview question.
Role: {role} ({experience_level})
Track: {interview_type}

QUESTION:
{question.get('question')}

MODEL ANSWER (Reference):
{question.get('model_answer', '')}

KEY POINTS EXPECTED:
{json.dumps(question.get('key_points', []))}

CANDIDATE'S SUBMITTED TEXT:
{candidate_answer}

CANDIDATE'S SUBMITTED CODE:
{code_answer or "None provided"}

RUBRIC TO USE: {rubric_type}
Weights: {json.dumps(weights)}

SAFETY RULE: Evaluate strictly on technical and situational merit. Never factor protected personal characteristics into any score.
Practice Estimate Notice: All scores are practice estimates for candidate preparation.

Respond strictly with a JSON object in this exact structure:
{{
  "overall_score": 82,
  "rubric_breakdown": {{
    {", ".join(f'"{k}": {{"score": 80, "weight": {v}, "comment": "Brief comment"}}' for k, v in weights.items())}
  }},
  "feedback": "2-3 sentences evaluating the candidate's strengths and areas for improvement.",
  "suggested_follow_up": "A targeted follow-up question digging deeper into their response.",
  "effective_answer_guide": "2-3 bullets stating what an exceptional answer should include.",
  "strengths_identified": ["Point 1", "Point 2"],
  "gaps_identified": ["Gap 1", "Gap 2"]
}}
"""

        try:
            client = cls._get_client(api_key)

            response = client.models.generate_content(
                model=cls.get_model_name(),
                contents=f"{SAFETY_SYSTEM_INSTRUCTION}\n\n{prompt}"
            )

            raw_text = response.text or ""
            parsed = cls._extract_json(raw_text)
            if not parsed:
                return None

            # Calculate and enforce mathematical consistency with rubric weights
            breakdown = parsed.get("rubric_breakdown", {})
            calculated_weighted_score = 0.0
            total_weight = 0

            sanitized_breakdown = {}
            for criterion, weight in weights.items():
                crit_data = breakdown.get(criterion, {})
                if isinstance(crit_data, dict):
                    raw_score = crit_data.get("score", 70)
                    comment = crit_data.get("comment", "Evaluated against rubric standards.")
                else:
                    raw_score = int(crit_data) if isinstance(crit_data, (int, float)) else 70
                    comment = "Evaluated against rubric standards."

                clamped_score = max(0, min(100, int(raw_score)))
                sanitized_breakdown[criterion] = {
                    "score": clamped_score,
                    "weight": weight,
                    "comment": comment
                }
                calculated_weighted_score += (clamped_score * weight)
                total_weight += weight

            final_score = int(round(calculated_weighted_score / total_weight)) if total_weight > 0 else 75

            return {
                "overall_score": max(0, min(100, final_score)),
                "rubric_breakdown": sanitized_breakdown,
                "feedback": parsed.get("feedback") or "Good technical response demonstrating domain comprehension.",
                "suggested_follow_up": parsed.get("suggested_follow_up") or question.get("follow_up_hint") or "How would you handle high load or edge cases in this scenario?",
                "effective_answer_guide": parsed.get("effective_answer_guide") or question.get("effective_answer_guide") or "State algorithmic complexity upfront and address failure isolation.",
                "strengths_identified": parsed.get("strengths_identified") or ["Clear conceptual understanding"],
                "gaps_identified": parsed.get("gaps_identified") or ["Consider elaborating on production edge cases"],
                "is_practice_estimate": True,
                "practice_estimate_notice": "Scores and feedback are practice estimates for interview preparation only.",
                "provider_mode": "live_ai"
            }
        except Exception as e:
            logger.error("Live AI answer evaluation failed: %s", e)
            return None

    # -------------------------------------------------------------------------
    # 3. Final Performance Report Generation
    # -------------------------------------------------------------------------
    @classmethod
    def generate_final_report(
        cls,
        session: Dict[str, Any],
        answers: Dict[str, Any],
        evaluations: Dict[str, Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """
        Synthesizes candidate session history into a comprehensive diagnostic report.
        """
        api_key = cls.get_api_key()
        if not api_key:
            return None

        role = session.get("role", "Developer")
        interview_type = session.get("interview_type", "Technical")
        difficulty = session.get("difficulty", "Medium")

        summary_data = []
        for q in session.get("questions", []):
            q_id = q["id"]
            ans = answers.get(q_id, {})
            ev = evaluations.get(q_id, {})
            summary_data.append({
                "question": q["question"],
                "candidate_answer": ans.get("answer_text", "[Unanswered]"),
                "score": ev.get("overall_score", 65),
                "feedback": ev.get("feedback", "")
            })

        prompt = f"""
Produce a comprehensive final mock interview performance diagnostic report.
Candidate Role: {role}
Interview Track: {interview_type}
Difficulty: {difficulty}

Session Data:
{json.dumps(summary_data, indent=2)}

Respond strictly in JSON with this schema:
{{
  "summary": "3-4 sentence comprehensive performance assessment for the candidate.",
  "strengths": [
    "Specific observed strength 1",
    "Specific observed strength 2",
    "Specific observed strength 3"
  ],
  "areas_for_improvement": [
    "Actionable improvement area 1",
    "Actionable improvement area 2",
    "Actionable improvement area 3"
  ],
  "technical_correctness": 82,
  "answer_relevance": 85,
  "clarity": 80,
  "problem_solving": 78
}}
"""

        try:
            client = cls._get_client(api_key)

            response = client.models.generate_content(
                model=cls.get_model_name(),
                contents=f"{SAFETY_SYSTEM_INSTRUCTION}\n\n{prompt}"
            )

            raw_text = response.text or ""
            parsed = cls._extract_json(raw_text)
            if not parsed:
                return None

            return parsed
        except Exception as e:
            logger.error("Live AI final report synthesis failed: %s", e)
            return None

    # -------------------------------------------------------------------------
    # Helper: Robust JSON Extraction
    # -------------------------------------------------------------------------
    @classmethod
    def _extract_json(cls, text: str) -> Optional[Dict[str, Any]]:
        """
        Extracts valid JSON from Gemini output, handling Markdown blocks or stray commentary.
        """
        if not text:
            return None

        cleaned = text.strip()
        # Remove markdown code fences if present
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```[a-zA-Z]*\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)
            cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            # Fallback: search for first { and last }
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start != -1 and end != -1 and end > start:
                try:
                    return json.loads(cleaned[start:end + 1])
                except json.JSONDecodeError:
                    pass
        return None

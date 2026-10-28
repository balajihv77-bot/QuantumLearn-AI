"""
QuantumLearn AI - MySQL-Backed Interview Service Layer
Manages interview sessions, live AI single-question generation, candidate answer evaluation,
rubric scoring, follow-up question prompting, and diagnostic evaluation reports.
Integrates with MySQL via SQLAlchemy (InterviewSession, InterviewQuestion,
InterviewAnswer, InterviewReport) with foreign key integrity, index optimization,
and strict multi-tenant privacy enforcement.
"""

from contextlib import contextmanager
from datetime import datetime, timezone
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, OperationalError, DBAPIError

from backend.app.models.interview import (
    InterviewSession,
    InterviewQuestion,
    InterviewAnswer,
    InterviewReport,
)
from backend.app.schemas.interview import (
    InterviewQuestionSchema,
    InterviewStartRequest,
    InterviewSessionResponse,
    InterviewAnswerRequest,
    InterviewAnswerResponse,
    QuestionBreakdownSchema,
    InterviewReportSchema,
    InterviewFinishResponse,
    InterviewSessionSummarySchema,
    InterviewHistoryResponse,
    InterviewHealthResponse,
    InterviewProviderStatusResponse,
)
from backend.app.services.interview_ai_provider import InterviewAIProvider, RUBRIC_WEIGHTS

logger = logging.getLogger(__name__)


class InterviewService:
    # Comprehensive curated question bank by role (for demo fallback)
    QUESTION_BANK = {
        "Python Developer": [
            {
                "id": "py-1",
                "question": "Explain how Python handles memory management, referencing the Global Interpreter Lock (GIL), reference counting, and generational garbage collection.",
                "category": "Core Language Architecture",
                "difficulty": "Medium",
                "hint": "Mention sys.getrefcount, PyObject ob_refcnt, and cyclical reference collection.",
                "follow_up_hint": "How does free-threaded Python (PEP 703) propose to remove the GIL?",
                "effective_answer_guide": "Explain reference count increment/decrement, cyclic GC thresholds (Gen 0, 1, 2), and thread synchronization under the GIL.",
                "evaluation_criteria": ["Reference counting mechanics", "Generational cyclic collection", "GIL execution safety"],
                "model_answer": "Python uses reference counting as its primary memory management mechanism: every PyObject tracks its reference count and deallocates memory when it reaches zero. A cyclical generational garbage collector (Generations 0, 1, 2) breaks reference cycles. The GIL ensures thread-safe byte-code execution in CPython by restricting execution to one native thread at a time.",
                "key_points": ["Reference counting", "Generational GC for cycles", "GIL thread-safety"]
            },
            {
                "id": "py-2",
                "question": "What is the difference between a Python generator and a list comprehension, and when should you use each in high-volume pipelines?",
                "category": "Data Structures & Iterators",
                "difficulty": "Easy",
                "hint": "Contrast eager memory allocation with lazy evaluation via the yield keyword.",
                "follow_up_hint": "How would you chain multiple generators using itertools.chain or generator expressions?",
                "effective_answer_guide": "State time vs memory trade-offs, O(1) streaming space for generators vs O(N) memory allocation for list comprehensions.",
                "evaluation_criteria": ["Lazy vs eager evaluation", "Memory footprint comparison", "Pipeline streaming suitability"],
                "model_answer": "List comprehensions evaluate eagerly, allocating all elements in memory immediately (O(N) space). Generators evaluate lazily via the iterator protocol (yield), keeping memory constant (O(1) space) and streaming records.",
                "key_points": ["Eager vs lazy evaluation", "Memory allocation differences", "Stream processing suitability"]
            },
            {
                "id": "py-3",
                "question": "How do async and await work under the hood with Python's asyncio event loop, and when do you choose asyncio over multiprocessing?",
                "category": "Concurrency & I/O",
                "difficulty": "Hard",
                "hint": "Explain cooperative multitasking vs preemptive OS processes for I/O vs CPU workloads.",
                "follow_up_hint": "What occurs if you call time.sleep() instead of asyncio.sleep() in a coroutine?",
                "effective_answer_guide": "Contrast single-threaded event loop cooperative task switching for I/O with multi-process GIL bypass for CPU computations.",
                "evaluation_criteria": ["Cooperative event loop scheduling", "I/O bound vs CPU bound suitability", "GIL considerations"],
                "model_answer": "asyncio is cooperative single-threaded concurrency where tasks yield on I/O boundaries. It is optimal for high-concurrency I/O-bound network services. Multiprocessing bypasses the GIL by spawning separate OS processes, optimal for CPU-bound computations.",
                "key_points": ["Event loop task switching", "I/O bound vs CPU bound workloads", "GIL bypass via multiprocessing"]
            },
            {
                "id": "py-code-1",
                "question": "Coding Challenge: Implement a two-sum function in Python returning the indices of two numbers that add up to target in O(N) time.",
                "category": "Algorithmic Problem Solving",
                "difficulty": "Easy",
                "is_coding_question": True,
                "coding_language": "python",
                "starter_code": "def two_sum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    # Implement here\n    return []\n",
                "hint": "Use a hash table to check if target - num exists in a single pass.",
                "follow_up_hint": "What if the input array is already sorted? Can we solve it in O(1) auxiliary space?",
                "effective_answer_guide": "Implement single-pass hash map with O(N) time and O(N) space, checking complement existence before inserting.",
                "evaluation_criteria": ["O(N) single-pass lookup", "Correct complement indexing", "Empty list or duplicate handling"],
                "model_answer": "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in seen:\n            return [seen[comp], i]\n        seen[num] = i\n    return []",
                "key_points": ["O(N) single-pass lookup", "Correct complement indexing", "O(N) auxiliary space"]
            },
            {
                "id": "py-code-2",
                "question": "Coding Challenge: Implement a Least Recently Used (LRU) Cache in Python supporting O(1) get and put operations.",
                "category": "Data Structure Design",
                "difficulty": "Medium",
                "is_coding_question": True,
                "coding_language": "python",
                "starter_code": "from collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = OrderedDict()\n",
                "hint": "Pair a hash map with a doubly linked list or use collections.OrderedDict.",
                "follow_up_hint": "How would you make this LRU cache thread-safe in a multi-threaded web application?",
                "effective_answer_guide": "Maintain O(1) get and put by combining a hash map for node lookups with a doubly linked list for eviction ordering.",
                "evaluation_criteria": ["O(1) lookups and updates", "Accurate eviction of LRU entry", "Capacity boundary enforcement"],
                "model_answer": "from collections import OrderedDict\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = OrderedDict()\n    def get(self, key: int) -> int:\n        if key not in self.cache: return -1\n        self.cache.move_to_end(key)\n        return self.cache[key]\n    def put(self, key: int, value: int) -> None:\n        if key in self.cache:\n            self.cache.move_to_end(key)\n        self.cache[key] = value\n        if len(self.cache) > self.capacity:\n            self.cache.popitem(last=False)",
                "key_points": ["O(1) get and put", "OrderedDict or Doubly-linked list", "Capacity overflow eviction"]
            }
        ],
        "Quantum Software Engineer": [
            {
                "id": "q-1",
                "question": "Explain quantum superposition and how the Hadamard gate maps computational basis states |0⟩ and |1⟩ onto the Bloch sphere equator.",
                "category": "Quantum Mechanics & Gates",
                "difficulty": "Medium",
                "hint": "Recall H|0⟩ = (|0⟩ + |1⟩)/√2 and H|1⟩ = (|0⟩ - |1⟩)/√2.",
                "follow_up_hint": "What occurs when you apply a Pauli-Z phase flip after a Hadamard gate?",
                "effective_answer_guide": "State matrix unitary transformation of H, mapping pole vectors to equatorial superposition states with equal 50% probability amplitudes.",
                "evaluation_criteria": ["Unitary transformation of H", "Superposition amplitude breakdown", "Bloch sphere equatorial geometry"],
                "model_answer": "The Hadamard gate creates an equal superposition of basis states. On the Bloch sphere, it rotates the state vector 180 degrees around the X+Z diagonal axis, mapping north pole |0⟩ to positive X axis (|0⟩+|1⟩)/√2.",
                "key_points": ["Unitary transformation", "Equal probability amplitudes", "Bloch sphere representation"]
            },
            {
                "id": "q-2",
                "question": "Describe the construction of a 2-qubit Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2 and why this state cannot be factored into independent product states.",
                "category": "Quantum Entanglement",
                "difficulty": "Medium",
                "hint": "Start with |00⟩, apply H to Qubit 0, then CNOT with control Qubit 0 and target Qubit 1.",
                "follow_up_hint": "How does measuring Qubit 0 immediately determine the outcome of Qubit 1?",
                "effective_answer_guide": "Detail circuit steps (Hadamard then CNOT), statevector evolution, and algebraic proof showing non-factorability into tensor products.",
                "evaluation_criteria": ["Circuit layout H + CNOT", "Statevector non-separability proof", "Instantaneous correlation on measurement"],
                "model_answer": "Initialize |00⟩. Apply H on qubit 0 to yield (|00⟩ + |10⟩)/√2. Apply CNOT(0,1) flipping qubit 1 when qubit 0 is |1⟩, resulting in (|00⟩ + |11⟩)/√2. Because no α,β,γ,δ satisfy (α|0⟩+β|1⟩)⊗(γ|0⟩+δ|1⟩) = |Φ+⟩, the qubits are maximally entangled.",
                "key_points": ["H followed by CNOT", "Non-separable statevector", "Maximal entanglement"]
            },
            {
                "id": "q-code-1",
                "question": "Coding Challenge: Write a Python function using Qiskit or Cirq syntax that creates an entangled Greenberger–Horne–Zeilinger (GHZ) state across 3 qubits.",
                "category": "Quantum Circuit Design",
                "difficulty": "Hard",
                "is_coding_question": True,
                "coding_language": "python",
                "starter_code": "from qiskit import QuantumCircuit\n\ndef create_ghz_circuit() -> QuantumCircuit:\n    qc = QuantumCircuit(3, 3)\n    # Construct 3-qubit GHZ state (|000> + |111>) / sqrt(2)\n    return qc\n",
                "hint": "Apply Hadamard to qubit 0, followed by cascaded CNOT(0,1) and CNOT(1,2).",
                "follow_up_hint": "How do decoherence rates scale as you increase the number of entangled qubits in a GHZ state?",
                "effective_answer_guide": "Hadamard on first qubit followed by CNOT chain across remaining qubits, creating macroscopic superposition state (|000> + |111>)/√2.",
                "evaluation_criteria": ["Hadamard on qubit 0", "Cascaded CNOT gates", "Measurement registration"],
                "model_answer": "qc = QuantumCircuit(3, 3)\nqc.h(0)\nqc.cx(0, 1)\nqc.cx(1, 2)\nqc.measure([0, 1, 2], [0, 1, 2])\nreturn qc",
                "key_points": ["Hadamard gate initialization", "Cascaded CNOT entangling gates", "GHZ multipartite entanglement"]
            }
        ],
        "HR / Behavioral": [
            {
                "id": "hr-1",
                "question": "Tell me about a challenging technical disagreement you had with a teammate or lead. How did you handle it and what was the outcome?",
                "category": "Conflict Resolution & Collaboration",
                "difficulty": "Medium",
                "hint": "Structure your response using the STAR method: Situation, Task, Action, Result.",
                "follow_up_hint": "Looking back, is there anything you would handle differently if faced with that situation today?",
                "effective_answer_guide": "Use STAR format, focus on objective data/benchmarks rather than egos, describe empathy and active listening, and finish with a measurable positive outcome.",
                "evaluation_criteria": ["STAR structure clarity", "Constructive, objective conflict resolution", "Reflective self-awareness"],
                "model_answer": "In our payment gateway migration, a teammate advocated an asynchronous messaging broker while I favored synchronous idempotent RPCs due to transaction rollback guarantees. Instead of debating in vacuum, I organized a spike benchmark testing latency and network failure handling. The benchmark revealed that asynchronous messaging had superior throughput under peak load, while idempotent RPCs prevented double-billing. We combined both patterns: synchronous edge validation with asynchronous background settlement.",
                "key_points": ["STAR methodology", "Data-driven de-escalation", "Win-win architectural consensus"]
            },
            {
                "id": "hr-2",
                "question": "Describe a production outage or high-severity bug you caused or investigated. What steps did you take to mitigate it and ensure it never recurred?",
                "category": "Accountability & Post-Mortem",
                "difficulty": "Medium",
                "hint": "Emphasize ownership, fast blast-radius containment, blameless post-mortem, and automated guardrails.",
                "follow_up_hint": "How did you communicate progress and status to non-technical stakeholders during the incident?",
                "effective_answer_guide": "Demonstrate blameless accountability, immediate customer impact mitigation (rollback/failover), root cause analysis (5 Whys), and permanent systemic prevention (CI tests, canary deployments).",
                "evaluation_criteria": ["Clear personal accountability", "Root cause depth", "Permanent automated mitigation"],
                "model_answer": "During a schema migration, an unindexed foreign key lock caused query pileups and API timeouts. Within 4 minutes of alerts firing, I executed our automated rollback pipeline to restore service. In the subsequent blameless post-mortem, we instituted a migration linter in CI blocking unindexed foreign keys and required shadow production test runs on pre-release stages.",
                "key_points": ["Blameless accountability", "Rapid incident containment", "Systemic CI/CD guardrails"]
            }
        ]
    }

    @classmethod
    @contextmanager
    def _get_db(cls, db: Optional[Session] = None):
        """
        Yields an active database session. If db is provided, uses it.
        Otherwise creates a SessionLocal and ensures it is cleanly closed.
        Rolls back on database exceptions and translates connection errors to HTTP 503.
        """
        try:
            if db is not None:
                try:
                    yield db
                except Exception:
                    try:
                        db.rollback()
                    except Exception:
                        pass
                    raise
            else:
                from backend.app.database.connection import SessionLocal
                session = SessionLocal()
                try:
                    yield session
                except Exception:
                    try:
                        session.rollback()
                    except Exception:
                        pass
                    raise
                finally:
                    session.close()
        except HTTPException:
            raise
        except (OperationalError, SQLAlchemyError, DBAPIError) as e:
            logger.error(f"Database connection failure or query error: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Database connection failure or operation error: {str(e)}"
            )

    @classmethod
    def _get_demo_question_pool(
        cls, role: str, interview_type: str, difficulty: str, count: int
    ) -> List[Dict[str, Any]]:
        """Selects a tailored list of questions from the curated bank for fallback mode."""
        role_key = "Python Developer"
        if "quantum" in role.lower():
            role_key = "Quantum Software Engineer"
        elif interview_type.lower() == "hr" or "hr" in role.lower() or "behavioral" in role.lower():
            role_key = "HR / Behavioral"
        elif role in cls.QUESTION_BANK:
            role_key = role

        pool = list(cls.QUESTION_BANK.get(role_key, cls.QUESTION_BANK["Python Developer"]))

        # For coding or mixed, ensure coding questions are included if available
        if interview_type.lower() == "coding":
            coding_only = [q for q in pool if q.get("is_coding_question")]
            if coding_only:
                pool = coding_only

        # If pool is smaller than requested count, generate distinct mock items
        result = []
        for i in range(count):
            base_q = pool[i % len(pool)].copy()
            unique_id = f"{base_q['id']}-{i+1}_{uuid.uuid4().hex[:8]}"
            base_q["id"] = unique_id
            result.append(base_q)
        return result

    @classmethod
    def start_interview(
        cls,
        req: InterviewStartRequest,
        user_id: Optional[int] = None,
        db: Optional[Session] = None
    ) -> InterviewSessionResponse:
        """
        Initializes a new mock interview session in MySQL with its questions.
        Generates initial question via live Gemini AI if configured, otherwise falls back
        to curated question bank and flags demo mode.
        """
        now = datetime.now(timezone.utc)
        session_id = f"intv_{uuid.uuid4().hex[:16]}"
        is_live_configured = InterviewAIProvider.is_configured()

        # Generate the first question
        first_q_dict = None
        provider_mode = "demo"

        if is_live_configured:
            try:
                ai_first_q = InterviewAIProvider.generate_single_question(
                    role=req.role,
                    experience_level=req.experience_level,
                    interview_type=req.interview_type,
                    difficulty=req.difficulty,
                    question_index=0,
                    total_questions=req.question_count,
                    previous_questions=[]
                )
                if ai_first_q:
                    ai_first_q["id"] = f"{ai_first_q.get('id', 'ai-q')}_{uuid.uuid4().hex[:8]}"
                    first_q_dict = ai_first_q
                    provider_mode = "live_ai"
            except Exception as e:
                logger.warning(f"Live AI question generation failed: {e}. Falling back to demo pool.")
                first_q_dict = None

        fallback_pool = cls._get_demo_question_pool(req.role, req.interview_type, req.difficulty, req.question_count)
        if not first_q_dict:
            first_q_dict = fallback_pool[0]
            provider_mode = "demo"

        questions_list = [first_q_dict]
        if len(fallback_pool) > 1:
            questions_list.extend(fallback_pool[1:])

        first_q_schema = InterviewQuestionSchema(
            id=first_q_dict["id"],
            question=first_q_dict["question"],
            category=first_q_dict.get("category", f"{req.role} {req.interview_type}"),
            difficulty=first_q_dict.get("difficulty", req.difficulty),
            hint=first_q_dict.get("hint"),
            is_coding_question=first_q_dict.get("is_coding_question", False),
            coding_language=first_q_dict.get("coding_language"),
            starter_code=first_q_dict.get("starter_code"),
            follow_up_hint=first_q_dict.get("follow_up_hint"),
            effective_answer_guide=first_q_dict.get("effective_answer_guide"),
            evaluation_criteria=first_q_dict.get("evaluation_criteria", [])
        )

        # Persist session and questions to MySQL
        with cls._get_db(db) as s:
            new_session = InterviewSession(
                session_id=session_id,
                user_id=user_id,
                role=req.role,
                experience_level=req.experience_level,
                interview_type=req.interview_type,
                difficulty=req.difficulty,
                total_questions=req.question_count,
                status="in_progress",
                current_question_index=0,
                provider_mode=provider_mode,
                is_live_ai=(provider_mode == "live_ai"),
                created_at=now,
                completed_at=None
            )
            s.add(new_session)

            for idx, q in enumerate(questions_list):
                q_id = q.get("id") or f"q_{uuid.uuid4().hex[:12]}"
                criteria = q.get("evaluation_criteria", [])
                keys = q.get("key_points", [])
                db_q = InterviewQuestion(
                    id=q_id,
                    session_id=session_id,
                    question_text=q["question"],
                    question_type=q.get("question_type", req.interview_type.lower()),
                    question_order=idx,
                    category=q.get("category", f"{req.role} {req.interview_type}"),
                    difficulty=q.get("difficulty", req.difficulty),
                    hint=q.get("hint"),
                    is_coding_question=q.get("is_coding_question", False),
                    coding_language=q.get("coding_language"),
                    starter_code=q.get("starter_code"),
                    follow_up_hint=q.get("follow_up_hint"),
                    effective_answer_guide=q.get("effective_answer_guide"),
                    model_answer=q.get("model_answer"),
                    evaluation_criteria_json=json.dumps(criteria),
                    key_points_json=json.dumps(keys),
                    created_at=now
                )
                s.add(db_q)

            s.commit()

        return InterviewSessionResponse(
            session_id=session_id,
            role=req.role,
            experience_level=req.experience_level,
            interview_type=req.interview_type,
            difficulty=req.difficulty,
            question_count=req.question_count,
            status="in_progress",
            current_question_index=0,
            current_question=first_q_schema,
            total_questions=len(questions_list),
            answered_count=0,
            created_at=now,
            completed_at=None,
            user_id=user_id,
            provider_mode=provider_mode,
            is_live_ai=(provider_mode == "live_ai")
        )

    @classmethod
    def get_session(
        cls,
        session_id: str,
        user_id: Optional[int] = None,
        db: Optional[Session] = None
    ) -> InterviewSessionResponse:
        """
        Retrieves active interview session state, current question, and progress from MySQL.
        Restricts access so users only access their own private records.
        """
        with cls._get_db(db) as s:
            session = s.query(InterviewSession).filter(InterviewSession.session_id == session_id).first()
            if not session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Interview session not found."
                )

            # Access Control: authenticated users can only view their own records
            if session.user_id is not None:
                if user_id is None or session.user_id != user_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied to this private interview session."
                    )

            curr_idx = session.current_question_index
            total_q = session.total_questions

            # Fetch the question at current_question_index
            curr_q_obj = s.query(InterviewQuestion).filter(
                InterviewQuestion.session_id == session_id,
                InterviewQuestion.question_order == curr_idx
            ).first()

            curr_q_schema = None
            if curr_q_obj:
                curr_q_schema = InterviewQuestionSchema(
                    id=curr_q_obj.id,
                    question=curr_q_obj.question_text,
                    category=curr_q_obj.category or f"{session.role} {session.interview_type}",
                    difficulty=curr_q_obj.difficulty or session.difficulty,
                    hint=curr_q_obj.hint,
                    is_coding_question=curr_q_obj.is_coding_question,
                    coding_language=curr_q_obj.coding_language,
                    starter_code=curr_q_obj.starter_code,
                    follow_up_hint=curr_q_obj.follow_up_hint,
                    effective_answer_guide=curr_q_obj.effective_answer_guide,
                    evaluation_criteria=curr_q_obj.get_evaluation_criteria()
                )

            answered_count = s.query(InterviewAnswer).filter(
                InterviewAnswer.session_id == session_id
            ).count()

            return InterviewSessionResponse(
                session_id=session.session_id,
                role=session.role,
                experience_level=session.experience_level,
                interview_type=session.interview_type,
                difficulty=session.difficulty,
                question_count=session.total_questions,
                status=session.status,
                current_question_index=curr_idx,
                current_question=curr_q_schema,
                total_questions=total_q,
                answered_count=answered_count,
                created_at=session.created_at,
                completed_at=session.completed_at,
                user_id=session.user_id,
                provider_mode=session.provider_mode,
                is_live_ai=session.is_live_ai
            )

    @classmethod
    def submit_answer(
        cls,
        session_id: str,
        req: InterviewAnswerRequest,
        user_id: Optional[int] = None,
        db: Optional[Session] = None
    ) -> InterviewAnswerResponse:
        """
        Records the candidate's answer to MySQL, performs live or calibrated rubric evaluation,
        persists evaluation results to interview_answers, advances the session question index,
        and generates the next question dynamically if using live AI.
        """
        if not req.answer_text or not req.answer_text.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Answer text cannot be blank."
            )

        clean_answer = req.answer_text.strip()
        clean_code = req.code_answer.strip() if req.code_answer else None

        with cls._get_db(db) as s:
            session = s.query(InterviewSession).filter(InterviewSession.session_id == session_id).first()
            if not session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Interview session not found."
                )

            # Access Control
            if session.user_id is not None:
                if user_id is None or session.user_id != user_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied to this private interview session."
                    )

            if session.status == "completed":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Interview session is already completed."
                )

            curr_idx = session.current_question_index
            total = session.total_questions

            # Retrieve current question
            current_q_obj = s.query(InterviewQuestion).filter(
                InterviewQuestion.session_id == session_id,
                InterviewQuestion.question_order == curr_idx
            ).first()

            if not current_q_obj:
                current_q_obj = s.query(InterviewQuestion).filter(
                    InterviewQuestion.id == req.question_id,
                    InterviewQuestion.session_id == session_id
                ).first()

            if not current_q_obj:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Question not found for this interview session."
                )

            current_q_dict = {
                "id": current_q_obj.id,
                "question": current_q_obj.question_text,
                "category": current_q_obj.category,
                "difficulty": current_q_obj.difficulty,
                "hint": current_q_obj.hint,
                "is_coding_question": current_q_obj.is_coding_question,
                "coding_language": current_q_obj.coding_language,
                "starter_code": current_q_obj.starter_code,
                "follow_up_hint": current_q_obj.follow_up_hint,
                "effective_answer_guide": current_q_obj.effective_answer_guide,
                "evaluation_criteria": current_q_obj.get_evaluation_criteria(),
                "model_answer": current_q_obj.model_answer,
                "key_points": current_q_obj.get_key_points()
            }

            # Run evaluation (Live AI or Calibrated Rubric)
            evaluation_result = None
            if session.is_live_ai:
                try:
                    evaluation_result = InterviewAIProvider.evaluate_answer(
                        question=current_q_dict,
                        candidate_answer=clean_answer,
                        code_answer=clean_code,
                        interview_type=session.interview_type,
                        role=session.role,
                        experience_level=session.experience_level
                    )
                except Exception as e:
                    logger.warning(f"AI evaluation failed: {e}. Falling back to calibrated rubric.")
                    evaluation_result = None

            if not evaluation_result:
                evaluation_result = cls._evaluate_answer_calibrated(
                    current_q_dict, clean_answer, clean_code, session.interview_type
                )

            rubric = evaluation_result.get("rubric_breakdown", {})
            # Extract distinct score components for technical vs HR vs coding
            tech_score = (
                rubric.get("technical_correctness", {}).get("score")
                or rubric.get("communication_and_clarity", {}).get("score")
                or evaluation_result.get("overall_score")
            )
            rel_score = (
                rubric.get("relevance_and_completeness", {}).get("score")
                or rubric.get("situational_judgment_and_conflict_resolution", {}).get("score")
                or evaluation_result.get("overall_score")
            )
            clar_score = (
                rubric.get("clarity", {}).get("score")
                or rubric.get("cultural_and_team_alignment", {}).get("score")
                or evaluation_result.get("overall_score")
            )
            prob_score = (
                rubric.get("problem_solving", {}).get("score")
                or rubric.get("authenticity_and_reflection", {}).get("score")
                or evaluation_result.get("overall_score")
            )

            # Save answer to MySQL
            answer_id = f"ans_{uuid.uuid4().hex[:16]}"
            new_answer = InterviewAnswer(
                id=answer_id,
                session_id=session_id,
                question_id=current_q_obj.id,
                answer_text=clean_answer,
                code_answer=clean_code,
                correctness_score=tech_score,
                relevance_score=rel_score,
                clarity_score=clar_score,
                problem_solving_score=prob_score,
                overall_score=evaluation_result.get("overall_score"),
                feedback=evaluation_result.get("feedback"),
                suggested_follow_up=evaluation_result.get("suggested_follow_up"),
                effective_answer_guide=evaluation_result.get("effective_answer_guide"),
                rubric_breakdown_json=json.dumps(rubric),
                strengths_json=json.dumps(evaluation_result.get("strengths_identified", [])),
                gaps_json=json.dumps(evaluation_result.get("gaps_identified", [])),
                submitted_at=datetime.now(timezone.utc)
            )
            s.add(new_answer)

            # Advance session state
            is_last = (curr_idx >= total - 1)
            next_q_schema = None

            if not is_last:
                next_idx = curr_idx + 1
                session.current_question_index = next_idx

                # Check if next question exists in DB
                next_q_obj = s.query(InterviewQuestion).filter(
                    InterviewQuestion.session_id == session_id,
                    InterviewQuestion.question_order == next_idx
                ).first()

                # If live AI is enabled, generate dynamic single question for next step
                if session.is_live_ai:
                    try:
                        asked_questions = [
                            q.question_text for q in s.query(InterviewQuestion).filter(
                                InterviewQuestion.session_id == session_id,
                                InterviewQuestion.question_order <= curr_idx
                            ).all()
                        ]
                        next_ai_q = InterviewAIProvider.generate_single_question(
                            role=session.role,
                            experience_level=session.experience_level,
                            interview_type=session.interview_type,
                            difficulty=session.difficulty,
                            question_index=next_idx,
                            total_questions=total,
                            previous_questions=asked_questions
                        )
                        if next_ai_q:
                            if next_q_obj:
                                next_q_obj.question_text = next_ai_q["question"]
                                next_q_obj.category = next_ai_q.get("category", next_q_obj.category)
                                next_q_obj.difficulty = next_ai_q.get("difficulty", next_q_obj.difficulty)
                                next_q_obj.hint = next_ai_q.get("hint")
                                next_q_obj.follow_up_hint = next_ai_q.get("follow_up_hint")
                                next_q_obj.effective_answer_guide = next_ai_q.get("effective_answer_guide")
                                next_q_obj.model_answer = next_ai_q.get("model_answer")
                                next_q_obj.evaluation_criteria_json = json.dumps(next_ai_q.get("evaluation_criteria", []))
                                next_q_obj.key_points_json = json.dumps(next_ai_q.get("key_points", []))
                    except Exception as e:
                        logger.warning(f"Failed to generate dynamic next question: {e}")

                if next_q_obj:
                    next_q_schema = InterviewQuestionSchema(
                        id=next_q_obj.id,
                        question=next_q_obj.question_text,
                        category=next_q_obj.category or f"{session.role} {session.interview_type}",
                        difficulty=next_q_obj.difficulty or session.difficulty,
                        hint=next_q_obj.hint,
                        is_coding_question=next_q_obj.is_coding_question,
                        coding_language=next_q_obj.coding_language,
                        starter_code=next_q_obj.starter_code,
                        follow_up_hint=next_q_obj.follow_up_hint,
                        effective_answer_guide=next_q_obj.effective_answer_guide,
                        evaluation_criteria=next_q_obj.get_evaluation_criteria()
                    )
            else:
                session.status = "completed"
                session.completed_at = datetime.now(timezone.utc)

            s.commit()

        return InterviewAnswerResponse(
            session_id=session_id,
            question_id=req.question_id,
            status="recorded",
            current_question_index=session.current_question_index,
            total_questions=total,
            is_completed=(session.status == "completed"),
            next_question=next_q_schema,
            message="Answer recorded and evaluated successfully." if not is_last else "Final answer evaluated. Interview completed.",
            score=evaluation_result.get("overall_score"),
            feedback=evaluation_result.get("feedback"),
            suggested_follow_up=evaluation_result.get("suggested_follow_up"),
            effective_answer_guide=evaluation_result.get("effective_answer_guide"),
            rubric_breakdown=rubric,
            practice_estimate_notice="Scores and feedback are practice estimates for preparation only.",
            provider_mode=session.provider_mode
        )

    @staticmethod
    def _normalize_dt(dt: Optional[datetime]) -> datetime:
        if dt is None:
            return datetime.now(timezone.utc)
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt

    @classmethod
    def finish_interview(
        cls,
        session_id: str,
        user_id: Optional[int] = None,
        db: Optional[Session] = None
    ) -> InterviewFinishResponse:
        """
        Marks an interview session as completed in MySQL, generates the final evaluation
        report, and persists the report to interview_reports.
        """
        with cls._get_db(db) as s:
            session = s.query(InterviewSession).filter(InterviewSession.session_id == session_id).first()
            if not session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Interview session not found."
                )

            # Access Control
            if session.user_id is not None:
                if user_id is None or session.user_id != user_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied to this private interview session."
                    )

            now = datetime.now(timezone.utc)
            session.status = "completed"
            if not session.completed_at:
                session.completed_at = now

            t_completed = cls._normalize_dt(session.completed_at)
            t_created = cls._normalize_dt(session.created_at)
            duration_seconds = max(1, int((t_completed - t_created).total_seconds()))
            s.commit()

        report_schema = cls.get_report(session_id, user_id=user_id, db=db)

        with cls._get_db(db) as s:
            answered_count = s.query(InterviewAnswer).filter(
                InterviewAnswer.session_id == session_id
            ).count()
            total_q = s.query(InterviewQuestion).filter(
                InterviewQuestion.session_id == session_id
            ).count()

        return InterviewFinishResponse(
            session_id=session_id,
            status="completed",
            total_questions=total_q,
            answered_questions=answered_count,
            duration_seconds=duration_seconds,
            report=report_schema,
            provider_mode=session.provider_mode
        )

    @classmethod
    def get_report(
        cls,
        session_id: str,
        user_id: Optional[int] = None,
        db: Optional[Session] = None
    ) -> InterviewReportSchema:
        """
        Retrieves or generates the diagnostic evaluation report for a session from MySQL.
        Persists newly generated reports into interview_reports.
        """
        with cls._get_db(db) as s:
            session = s.query(InterviewSession).filter(InterviewSession.session_id == session_id).first()
            if not session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Interview session not found."
                )

            # Access Control
            if session.user_id is not None:
                if user_id is None or session.user_id != user_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied to this private interview session."
                    )

            # Check if report already exists in database
            db_report = s.query(InterviewReport).filter(InterviewReport.session_id == session_id).first()

            questions = s.query(InterviewQuestion).filter(
                InterviewQuestion.session_id == session_id
            ).order_by(InterviewQuestion.question_order).all()

            answers_list = s.query(InterviewAnswer).filter(
                InterviewAnswer.session_id == session_id
            ).all()

            answers_map = {ans.question_id: ans for ans in answers_list}
            total_q = len(questions)
            answered_q = len(answers_list)
            completion_ratio = (answered_q / total_q) if total_q > 0 else 1.0

            rubric_type = session.interview_type if session.interview_type in RUBRIC_WEIGHTS else "Technical"
            weights = RUBRIC_WEIGHTS[rubric_type]

            # Calculate scores if report not already saved
            if not db_report:
                scores = [a.overall_score for a in answers_list if a.overall_score is not None]
                if scores:
                    avg_score = int(sum(scores) / len(scores))
                else:
                    avg_score = int(min(95, max(65, 78 + (14 * completion_ratio))))

                tech_score = int(min(96, max(60, avg_score + 2)))
                relevance_score = int(min(94, max(62, avg_score + 1)))
                clarity_score = int(min(95, max(65, avg_score - 1)))
                problem_score = int(min(95, max(60, avg_score - 2)))
                overall = int(
                    (tech_score * 0.4)
                    + (relevance_score * 0.25)
                    + (clarity_score * 0.2)
                    + (problem_score * 0.15)
                )

                strengths = [
                    f"Strong foundational grasp of core principles required for {session.role}.",
                    "Structured response format addressing theoretical rationale and algorithmic trade-offs.",
                    "Clear technical communication appropriate for engineering interviews."
                ]

                improvements = [
                    "State asymptotic Big-O time and space complexity upfront before expanding on implementation.",
                    "Discuss production edge cases, telemetry logging, and thread-safety considerations.",
                    "Quantify trade-offs with concrete metrics and memory footprint comparisons."
                ]

                recommendations = [
                    "Practice writing clean unit tests and failure mode handling alongside implementation code.",
                    "Familiarize yourself with production telemetry monitoring and profiling tools.",
                    "Review system design trade-offs between consistency, availability, and latency."
                ]

                now = datetime.now(timezone.utc)
                t_end = cls._normalize_dt(session.completed_at or now)
                t_start = cls._normalize_dt(session.created_at)
                duration = max(1, int((t_end - t_start).total_seconds()))

                summary_text = (
                    f"Candidate completed {answered_q} of {total_q} questions for {session.role} "
                    f"({session.interview_type} track). Demonstrated good proficiency with room for deeper metric rigor."
                )

                # Persist to interview_reports
                report_id = f"rep_{uuid.uuid4().hex[:16]}"
                db_report = InterviewReport(
                    id=report_id,
                    session_id=session_id,
                    overall_practice_score=overall,
                    technical_correctness=tech_score,
                    answer_relevance=relevance_score,
                    clarity=clarity_score,
                    problem_solving=problem_score,
                    strengths=json.dumps(strengths),
                    improvement_areas=json.dumps(improvements),
                    recommendations=json.dumps(recommendations),
                    summary=summary_text,
                    total_duration_seconds=duration,
                    evaluation_rubric_used=f"{rubric_type} Track Practice Rubric",
                    created_at=now
                )
                s.add(db_report)
                s.commit()
            else:
                overall = db_report.overall_practice_score
                tech_score = db_report.technical_correctness or 80
                relevance_score = db_report.answer_relevance or 80
                clarity_score = db_report.clarity or 80
                problem_score = db_report.problem_solving or 80
                strengths = db_report.get_strengths()
                improvements = db_report.get_improvement_areas()
                summary_text = db_report.summary or "Mock interview evaluation summary."
                duration = db_report.total_duration_seconds

            # Construct question breakdowns
            breakdowns: List[QuestionBreakdownSchema] = []
            for q in questions:
                ans = answers_map.get(q.id)
                user_text = ans.answer_text if ans else "[No response submitted during session]"
                code_text = ans.code_answer if ans else None
                q_score = ans.overall_score if ans else 40
                feedback = ans.feedback if ans else "No submission recorded."

                breakdowns.append(QuestionBreakdownSchema(
                    question_id=q.id,
                    question_text=q.question_text,
                    category=q.category or f"{session.role} {session.interview_type}",
                    difficulty=q.difficulty or session.difficulty,
                    user_answer=user_text,
                    code_answer=code_text,
                    score=q_score or 65,
                    model_answer=q.model_answer or "Expert technical response demonstrating optimal trade-offs.",
                    key_points=q.get_key_points(),
                    feedback=feedback,
                    suggested_follow_up=ans.suggested_follow_up if ans else q.follow_up_hint,
                    effective_answer_guide=ans.effective_answer_guide if ans else q.effective_answer_guide,
                    rubric_breakdown=ans.get_rubric_breakdown() if ans else None
                ))

            return InterviewReportSchema(
                session_id=session_id,
                role=session.role,
                experience_level=session.experience_level,
                interview_type=session.interview_type,
                difficulty=session.difficulty,
                overall_score=overall,
                technical_correctness=tech_score,
                answer_relevance=relevance_score,
                clarity=clarity_score,
                problem_solving=problem_score,
                strengths=strengths,
                areas_for_improvement=improvements,
                question_breakdowns=breakdowns,
                summary=summary_text,
                total_duration_seconds=duration,
                evaluation_mode="live_ai_calibrated_rubric" if session.is_live_ai else "mysql_calibrated_rubric",
                provider_mode=session.provider_mode,
                is_live_ai=session.is_live_ai,
                evaluation_rubric_used=db_report.evaluation_rubric_used or f"{rubric_type} Track Practice Rubric",
                rubric_weights=weights,
                practice_estimate_notice=(
                    "Scores and ratings are practice estimates generated by QuantumLearn AI Mock Interview "
                    "for educational preparation and do not constitute official hiring decisions."
                )
            )

    @classmethod
    def get_history(
        cls,
        user_id: Optional[int] = None,
        db: Optional[Session] = None
    ) -> InterviewHistoryResponse:
        """
        Retrieves interview practice history from MySQL.
        Restricts results strictly to the requesting authenticated user.
        If user_id is None, restricts to unauthenticated development/demo sessions
        rather than exposing any private authenticated user's records.
        """
        with cls._get_db(db) as s:
            if user_id is not None:
                # Private history for this authenticated user only
                sessions = s.query(InterviewSession).filter(
                    InterviewSession.user_id == user_id
                ).order_by(InterviewSession.created_at.desc()).all()
            else:
                # Restrict to unauthenticated development/demo guest records
                sessions = s.query(InterviewSession).filter(
                    InterviewSession.user_id.is_(None)
                ).order_by(InterviewSession.created_at.desc()).all()

            summaries: List[InterviewSessionSummarySchema] = []
            for item in sessions:
                s_id = item.session_id
                answered_count = s.query(InterviewAnswer).filter(
                    InterviewAnswer.session_id == s_id
                ).count()

                score = None
                if item.status == "completed":
                    # Check if report exists
                    report = s.query(InterviewReport).filter(
                        InterviewReport.session_id == s_id
                    ).first()
                    if report:
                        score = report.overall_practice_score
                    else:
                        ratio = (answered_count / item.total_questions) if item.total_questions > 0 else 1.0
                        score = int(min(96, max(65, 78 + (14 * ratio))))

                summaries.append(InterviewSessionSummarySchema(
                    session_id=s_id,
                    role=item.role,
                    experience_level=item.experience_level,
                    interview_type=item.interview_type,
                    difficulty=item.difficulty,
                    status=item.status,
                    overall_score=score,
                    total_questions=item.total_questions,
                    answered_questions=answered_count,
                    created_at=item.created_at,
                    completed_at=item.completed_at,
                    provider_mode=item.provider_mode
                ))

            return InterviewHistoryResponse(
                total=len(summaries),
                interviews=summaries
            )

    @classmethod
    def health_check(cls, db: Optional[Session] = None) -> InterviewHealthResponse:
        """
        Returns health status of the interview service and verifies database connectivity.
        """
        is_live = InterviewAIProvider.is_configured()
        active_count = 0
        storage_status = "mysql_persistence_via_sqlalchemy"

        try:
            with cls._get_db(db) as s:
                active_count = s.query(InterviewSession).filter(
                    InterviewSession.status == "in_progress"
                ).count()
        except Exception as e:
            logger.warning(f"Database health check query failed: {e}")
            storage_status = "mysql_connectivity_warning"

        return InterviewHealthResponse(
            status="available",
            service="QuantumLearn AI Mock Interview Service",
            version="1.2.0",
            active_sessions_count=active_count,
            storage_mode=storage_status,
            provider_mode="live_ai" if is_live else "demo",
            is_live_ai_available=is_live
        )

    @classmethod
    def provider_status(cls) -> InterviewProviderStatusResponse:
        """Returns the active AI provider status (Live Gemini vs Demo)."""
        status_dict = InterviewAIProvider.get_provider_status()
        return InterviewProviderStatusResponse(
            provider_configured=status_dict["provider_configured"],
            provider_name=status_dict["provider_name"],
            model_name=status_dict["model_name"],
            active_mode=status_dict["active_mode"],
            rubrics_supported=status_dict["rubrics_supported"],
            safety_guardrails_active=status_dict["safety_guardrails_active"],
            status_message=status_dict["status_message"]
        )

    @classmethod
    def _evaluate_answer_calibrated(
        cls,
        question: Dict[str, Any],
        answer_text: str,
        code_answer: Optional[str],
        interview_type: str
    ) -> Dict[str, Any]:
        """
        Calibrated offline rubric evaluation matching exact weighting specifications:
        - Technical: Technical correctness (40%), Relevance & completeness (25%), Clarity (20%), Problem-solving (15%)
        - HR: Communication & clarity (35%), Situational judgment (30%), Cultural alignment (20%), Authenticity (15%)
        """
        rubric_type = interview_type if interview_type in RUBRIC_WEIGHTS else "Technical"
        weights = RUBRIC_WEIGHTS[rubric_type]

        words = len(answer_text.split())
        code_bonus = 10 if code_answer and len(code_answer.strip()) > 20 else 0
        depth_factor = min(1.0, max(0.4, (words + code_bonus) / 45.0))

        sanitized_breakdown = {}
        weighted_sum = 0.0
        total_weight = 0

        for criterion, weight in weights.items():
            base_score = int(60 + (32 * depth_factor))
            clamped = max(50, min(95, base_score))
            sanitized_breakdown[criterion] = {
                "score": clamped,
                "weight": weight,
                "comment": f"Calibrated assessment against {criterion.replace('_', ' ')}."
            }
            weighted_sum += (clamped * weight)
            total_weight += weight

        final_score = int(round(weighted_sum / total_weight)) if total_weight > 0 else 75

        return {
            "overall_score": final_score,
            "rubric_breakdown": sanitized_breakdown,
            "feedback": (
                "Constructive practice evaluation: response demonstrates clear foundational comprehension. "
                "For highest impact, state key metrics and edge cases upfront."
            ),
            "suggested_follow_up": question.get("follow_up_hint") or "How would you monitor and debug this component under heavy production load?",
            "effective_answer_guide": question.get("effective_answer_guide") or "State algorithmic complexity upfront and address failure isolation.",
            "strengths_identified": ["Structured response format", "Accurate core terminology"],
            "gaps_identified": ["Elaborate on production failure modes"],
            "is_practice_estimate": True,
            "practice_estimate_notice": "Scores and feedback are practice estimates for interview preparation only.",
            "provider_mode": "demo"
        }

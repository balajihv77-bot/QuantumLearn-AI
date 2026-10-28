-- ==============================================================================
-- QuantumLearn AI — Migration 002: AI Mock Interview Persistence
-- Target: MySQL 8.0+ / MariaDB / SQLAlchemy
-- Description: Creates interview_sessions, interview_questions,
--              interview_answers, and interview_reports tables.
-- ==============================================================================

USE `quantumlearn_db`;

-- 1. Create interview_sessions table
CREATE TABLE IF NOT EXISTS `interview_sessions` (
  `session_id` VARCHAR(64) PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `role` VARCHAR(100) NOT NULL,
  `experience_level` VARCHAR(50) NOT NULL,
  `interview_type` VARCHAR(50) NOT NULL,
  `difficulty` VARCHAR(50) NOT NULL,
  `total_questions` INT NOT NULL DEFAULT 5,
  `status` VARCHAR(50) NOT NULL DEFAULT 'in_progress',
  `current_question_index` INT NOT NULL DEFAULT 0,
  `provider_mode` VARCHAR(50) NOT NULL DEFAULT 'demo',
  `is_live_ai` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME DEFAULT NULL,
  CONSTRAINT `fk_interview_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_interview_user` (`user_id`),
  INDEX `idx_interview_status` (`status`),
  INDEX `idx_interview_user_created` (`user_id`, `created_at`),
  INDEX `idx_interview_status_created` (`status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create interview_questions table
CREATE TABLE IF NOT EXISTS `interview_questions` (
  `id` VARCHAR(64) PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL,
  `question_text` TEXT NOT NULL,
  `question_type` VARCHAR(50) NOT NULL DEFAULT 'technical',
  `question_order` INT NOT NULL DEFAULT 0,
  `category` VARCHAR(100) DEFAULT NULL,
  `difficulty` VARCHAR(50) DEFAULT NULL,
  `hint` TEXT DEFAULT NULL,
  `is_coding_question` TINYINT(1) NOT NULL DEFAULT 0,
  `coding_language` VARCHAR(50) DEFAULT NULL,
  `starter_code` TEXT DEFAULT NULL,
  `follow_up_hint` TEXT DEFAULT NULL,
  `effective_answer_guide` TEXT DEFAULT NULL,
  `model_answer` TEXT DEFAULT NULL,
  `evaluation_criteria_json` LONGTEXT DEFAULT NULL,
  `key_points_json` LONGTEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_question_session` FOREIGN KEY (`session_id`) REFERENCES `interview_sessions` (`session_id`) ON DELETE CASCADE,
  INDEX `idx_question_session` (`session_id`),
  INDEX `idx_session_question_order` (`session_id`, `question_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create interview_answers table
CREATE TABLE IF NOT EXISTS `interview_answers` (
  `id` VARCHAR(64) PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL,
  `question_id` VARCHAR(64) NOT NULL,
  `answer_text` TEXT NOT NULL,
  `code_answer` TEXT DEFAULT NULL,
  `correctness_score` INT DEFAULT NULL,
  `relevance_score` INT DEFAULT NULL,
  `clarity_score` INT DEFAULT NULL,
  `problem_solving_score` INT DEFAULT NULL,
  `overall_score` INT DEFAULT NULL,
  `feedback` TEXT DEFAULT NULL,
  `suggested_follow_up` TEXT DEFAULT NULL,
  `effective_answer_guide` TEXT DEFAULT NULL,
  `rubric_breakdown_json` LONGTEXT DEFAULT NULL,
  `strengths_json` LONGTEXT DEFAULT NULL,
  `gaps_json` LONGTEXT DEFAULT NULL,
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_answer_session` FOREIGN KEY (`session_id`) REFERENCES `interview_sessions` (`session_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_answer_question` FOREIGN KEY (`question_id`) REFERENCES `interview_questions` (`id`) ON DELETE CASCADE,
  INDEX `idx_answer_session` (`session_id`),
  INDEX `idx_answer_question` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create interview_reports table
CREATE TABLE IF NOT EXISTS `interview_reports` (
  `id` VARCHAR(64) PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL UNIQUE,
  `overall_practice_score` INT NOT NULL,
  `technical_correctness` INT DEFAULT NULL,
  `answer_relevance` INT DEFAULT NULL,
  `clarity` INT DEFAULT NULL,
  `problem_solving` INT DEFAULT NULL,
  `strengths` LONGTEXT DEFAULT NULL,
  `improvement_areas` LONGTEXT DEFAULT NULL,
  `recommendations` LONGTEXT DEFAULT NULL,
  `summary` TEXT DEFAULT NULL,
  `total_duration_seconds` INT NOT NULL DEFAULT 0,
  `evaluation_rubric_used` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_report_session` FOREIGN KEY (`session_id`) REFERENCES `interview_sessions` (`session_id`) ON DELETE CASCADE,
  INDEX `idx_report_session` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

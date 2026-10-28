-- ==============================================================================
-- QuantumLearn AI — MySQL Database Schema Setup
-- Database: quantumlearn_db
-- Target: MySQL 8.0+
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `quantumlearn_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `quantumlearn_db`;

-- ------------------------------------------------------------------------------
-- Table 1: users
-- Registered student accounts, hashed credentials, roles, and XP
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `hashed_password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) DEFAULT NULL,
  `institution` VARCHAR(255) DEFAULT 'Self-Taught / Quantum Student',
  `role` VARCHAR(50) NOT NULL DEFAULT 'Student',
  `xp` INT NOT NULL DEFAULT 0,
  `level` INT NOT NULL DEFAULT 1,
  `streak_days` INT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table 2: learning_modules
-- 9 Core quantum curriculum modules with objectives and metadata
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `learning_modules` (
  `id` VARCHAR(50) PRIMARY KEY,
  `module_number` INT NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `category` VARCHAR(100) NOT NULL DEFAULT 'Fundamentals',
  `level` VARCHAR(50) NOT NULL DEFAULT 'Beginner',
  `duration_minutes` INT NOT NULL DEFAULT 25,
  `description` TEXT NOT NULL,
  `beginner_explanation` TEXT DEFAULT NULL,
  `content_json` LONGTEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_modules_number` (`module_number`),
  INDEX `idx_modules_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table 3: user_progress
-- Student module completion tracking with unique constraint per user & module
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_progress` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `module_id` VARCHAR(50) NOT NULL,
  `is_completed` TINYINT(1) NOT NULL DEFAULT 0,
  `score` INT NOT NULL DEFAULT 100,
  `completed_at` DATETIME DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_progress_module` FOREIGN KEY (`module_id`) REFERENCES `learning_modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `uq_user_module_progress` UNIQUE (`user_id`, `module_id`),
  INDEX `idx_progress_user` (`user_id`),
  INDEX `idx_progress_module` (`module_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table 4: quantum_circuits
-- Saved student circuit grids and presets
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quantum_circuits` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `num_qubits` INT NOT NULL DEFAULT 2,
  `num_steps` INT NOT NULL DEFAULT 6,
  `grid_json` LONGTEXT NOT NULL,
  `is_public` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_circuits_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_circuits_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table 5: quiz_results
-- Recorded scores, timestamps, and answer submissions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quiz_results` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `quiz_id` VARCHAR(100) NOT NULL,
  `score` INT NOT NULL,
  `total_questions` INT NOT NULL,
  `percentage` FLOAT NOT NULL,
  `answers_json` LONGTEXT DEFAULT NULL,
  `completed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_quizzes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_quizzes_user` (`user_id`),
  INDEX `idx_quizzes_quiz_id` (`quiz_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table 6: challenge_submissions
-- Hands-on coding/circuit challenge submissions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `challenge_submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `challenge_id` VARCHAR(100) NOT NULL,
  `circuit_json` LONGTEXT NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'completed',
  `passed` TINYINT(1) NOT NULL DEFAULT 0,
  `execution_time_ms` FLOAT NOT NULL DEFAULT 0.0,
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_challenges_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_challenges_user` (`user_id`),
  INDEX `idx_challenges_id` (`challenge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table 7: interview_sessions
-- AI Mock Interview sessions with role, difficulty, status, and timestamps
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- Table 8: interview_questions
-- Interview questions per session with question type, hints, and rubric criteria
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- Table 9: interview_answers
-- Candidate answers with rubric score breakdown and diagnostic feedback
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- Table 10: interview_reports
-- Final evaluation reports with overall practice score, strengths, and advice
-- ------------------------------------------------------------------------------
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

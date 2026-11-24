-- 004 — community Q&A: students ask, anyone can answer.
--
-- Depends on 002 (users need role/status) and 003 (files/departments taxonomy).
-- Nothing here is destructive.

-- ---------------------------------------------------------------------------
-- 1. Questions
--
-- "Unanswered" is deliberately NOT a stored column. It is derived from the
-- absence of published answers, so the two can never disagree; a denormalised
-- counter would drift the first time an answer was removed. At this scale the
-- EXISTS subquery behind the badge is a non-issue, and every query that needs
-- it already filters on status.
-- ---------------------------------------------------------------------------

CREATE TABLE `questions` (
  `id`                 INT AUTO_INCREMENT PRIMARY KEY,
  `title`              VARCHAR(200) NOT NULL,
  `body`               TEXT NOT NULL,
  `category_id`        INT DEFAULT NULL,
  `department_id`      INT DEFAULT NULL,
  `asked_by`           INT NOT NULL,
  `status`             ENUM('open','closed','removed') NOT NULL DEFAULT 'open',
  -- Set when the asker (or staff) marks the answer that solved it.
  `accepted_answer_id` INT DEFAULT NULL,
  `views`              INT NOT NULL DEFAULT 0,
  `created_at`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_questions_newest` (`status`, `created_at`),
  KEY `idx_questions_asker` (`asked_by`, `created_at`),
  KEY `idx_questions_category` (`category_id`, `status`),
  CONSTRAINT `fk_questions_asker` FOREIGN KEY (`asked_by`)
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_questions_category` FOREIGN KEY (`category_id`)
    REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_questions_department` FOREIGN KEY (`department_id`)
    REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 2. Answers
-- ---------------------------------------------------------------------------

CREATE TABLE `answers` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `question_id` INT NOT NULL,
  `body`        TEXT NOT NULL,
  `answered_by` INT NOT NULL,
  `status`      ENUM('published','removed') NOT NULL DEFAULT 'published',
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_answers_question` (`question_id`, `status`, `created_at`),
  KEY `idx_answers_author` (`answered_by`),
  CONSTRAINT `fk_answers_question` FOREIGN KEY (`question_id`)
    REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_answers_author` FOREIGN KEY (`answered_by`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Questions and answers reference each other, so this second constraint can only
-- be added once both tables exist. ON DELETE SET NULL keeps the question alive
-- if the accepted answer is hard-deleted.
ALTER TABLE `questions`
  ADD CONSTRAINT `fk_questions_accepted` FOREIGN KEY (`accepted_answer_id`)
    REFERENCES `answers` (`id`) ON DELETE SET NULL;

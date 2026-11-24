-- 002 — community platform: roles, approval, categories, ratings, comments,
-- votes, reports and an audit log.
--
-- Migrations run with multipleStatements so this file can be one transaction
-- of intent. MySQL DDL is not transactional, so keep destructive steps last.

-- ---------------------------------------------------------------------------
-- 1. Users: role, approval status, profile fields
-- ---------------------------------------------------------------------------

ALTER TABLE `users`
  ADD COLUMN `role`       ENUM('user','moderator','admin') NOT NULL DEFAULT 'user'    AFTER `password`,
  ADD COLUMN `status`     ENUM('pending','active','suspended') NOT NULL DEFAULT 'pending' AFTER `role`,
  ADD COLUMN `full_name`  VARCHAR(120) DEFAULT NULL AFTER `img`,
  ADD COLUMN `batch`      VARCHAR(20)  DEFAULT NULL AFTER `full_name`,
  ADD COLUMN `bio`        VARCHAR(300) DEFAULT NULL AFTER `batch`,
  ADD INDEX `idx_users_role` (`role`),
  ADD INDEX `idx_users_status` (`status`);
-- Note: department is deliberately NOT a column here. 003 introduces a
-- departments table and users.department_id, so a free-text field would only
-- create two sources of truth.

-- Every account that exists before this migration predates the approval flow,
-- so leaving the 'pending' default would lock all of them out.
UPDATE `users` SET `status` = 'active';

-- ---------------------------------------------------------------------------
-- 2. Categories: admin-managed, with code / name / banner
-- ---------------------------------------------------------------------------

CREATE TABLE `categories` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `code`        VARCHAR(45)  NOT NULL,
  `name`        VARCHAR(120) NOT NULL,
  `slug`        VARCHAR(140) NOT NULL,
  `description` VARCHAR(300) DEFAULT NULL,
  `banner_img`  VARCHAR(255) DEFAULT NULL,
  `accent_hue`  SMALLINT NOT NULL DEFAULT 220,
  `sort_order`  INT      NOT NULL DEFAULT 0,
  `is_active`   TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_categories_code` (`code`),
  UNIQUE KEY `uniq_categories_slug` (`slug`),
  KEY `idx_categories_active_sort` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Carries over the six hardcoded categories that were previously duplicated in
-- src/backend/schemas.js and src/frontend/src/utils/categories.js.
INSERT INTO `categories` (`code`, `name`, `slug`, `description`, `accent_hue`, `sort_order`) VALUES
  ('art',        'Art',        'art',        'Creative work, photography and visual culture',   340, 10),
  ('science',    'Science',    'science',    'Research, discoveries and how things work',       210, 20),
  ('technology', 'Technology', 'technology', 'Software, hardware and engineering',              265, 30),
  ('cinema',     'Cinema',     'cinema',     'Film, series and reviews',                         28, 40),
  ('design',     'Design',     'design',     'Interfaces, typography and product thinking',     168, 50),
  ('food',       'Food',       'food',       'Campus food, recipes and reviews',                 96, 60),
  ('general',    'General',    'general',    'Anything that does not fit another category',     220, 99);

-- ---------------------------------------------------------------------------
-- 3. Posts: category FK, moderation status, view counter
-- ---------------------------------------------------------------------------

ALTER TABLE `posts`
  ADD COLUMN `category_id` INT DEFAULT NULL AFTER `img`,
  ADD COLUMN `status` ENUM('draft','published','removed') NOT NULL DEFAULT 'published' AFTER `category_id`,
  ADD COLUMN `views`  INT NOT NULL DEFAULT 0 AFTER `status`,
  ADD COLUMN `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `date`;

UPDATE `posts` p
  JOIN `categories` c ON c.`code` = p.`cat`
  SET p.`category_id` = c.`id`;

-- Anything with a category code we did not just insert lands in 'general'
-- rather than failing the NOT NULL change below.
UPDATE `posts`
  SET `category_id` = (SELECT `id` FROM `categories` WHERE `code` = 'general')
  WHERE `category_id` IS NULL;

-- Only now is it safe to drop the old text column.
ALTER TABLE `posts`
  DROP INDEX `idx_posts_cat`,
  DROP COLUMN `cat`,
  MODIFY COLUMN `category_id` INT NOT NULL,
  ADD KEY `idx_posts_category` (`category_id`),
  ADD KEY `idx_posts_status_date` (`status`, `date`),
  ADD CONSTRAINT `fk_posts_category` FOREIGN KEY (`category_id`)
    REFERENCES `categories` (`id`);

-- ---------------------------------------------------------------------------
-- 4. Ratings — the composite primary key is what enforces
--    "one rating per user per post", not application code.
-- ---------------------------------------------------------------------------

CREATE TABLE `post_ratings` (
  `post_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `value`   TINYINT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`, `user_id`),
  KEY `idx_post_ratings_user` (`user_id`),
  CONSTRAINT `chk_post_ratings_value` CHECK (`value` BETWEEN 1 AND 5),
  CONSTRAINT `fk_post_ratings_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_post_ratings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 5. Comments (one level of replies) and their votes
-- ---------------------------------------------------------------------------

CREATE TABLE `comments` (
  `id`      INT AUTO_INCREMENT PRIMARY KEY,
  `post_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `parent_id` INT DEFAULT NULL,
  `body`    TEXT NOT NULL,
  `status`  ENUM('visible','removed') NOT NULL DEFAULT 'visible',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_comments_post` (`post_id`, `created_at`),
  KEY `idx_comments_parent` (`parent_id`),
  KEY `idx_comments_user` (`user_id`),
  CONSTRAINT `fk_comments_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `comment_votes` (
  `comment_id` INT NOT NULL,
  `user_id`    INT NOT NULL,
  `value`      TINYINT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`, `user_id`),
  KEY `idx_comment_votes_user` (`user_id`),
  CONSTRAINT `chk_comment_votes_value` CHECK (`value` IN (-1, 1)),
  CONSTRAINT `fk_comment_votes_comment` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comment_votes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 6. Reports — what gives the moderator role something to do
-- ---------------------------------------------------------------------------

CREATE TABLE `reports` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `reporter_id` INT NOT NULL,
  `post_id`     INT DEFAULT NULL,
  `comment_id`  INT DEFAULT NULL,
  `reason`      VARCHAR(300) NOT NULL,
  `status`      ENUM('open','resolved','dismissed') NOT NULL DEFAULT 'open',
  `resolved_by` INT DEFAULT NULL,
  `resolved_at` DATETIME DEFAULT NULL,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_reports_status` (`status`, `created_at`),
  KEY `idx_reports_post` (`post_id`),
  KEY `idx_reports_comment` (`comment_id`),
  CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reports_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reports_comment` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reports_resolver` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 7. Audit log — every privileged action, so moderation is accountable
-- ---------------------------------------------------------------------------

CREATE TABLE `audit_log` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `actor_id`    INT DEFAULT NULL,
  `action`      VARCHAR(60) NOT NULL,
  `entity_type` VARCHAR(40) NOT NULL,
  `entity_id`   INT DEFAULT NULL,
  `detail`      JSON DEFAULT NULL,
  `ip`          VARCHAR(45) DEFAULT NULL,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_audit_created` (`created_at`),
  KEY `idx_audit_actor` (`actor_id`),
  KEY `idx_audit_entity` (`entity_type`, `entity_id`),
  CONSTRAINT `fk_audit_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

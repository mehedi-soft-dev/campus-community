-- 003 — content hub: departments, file attachments, notices, exam routines,
-- events / academic calendar, and study materials.
--
-- Depends on 002 (users must already have role/status before these tables can
-- reference an author). Nothing here is destructive.

-- ---------------------------------------------------------------------------
-- 1. Departments — the taxonomy every content type filters on
-- ---------------------------------------------------------------------------

CREATE TABLE `departments` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `code`       VARCHAR(20)  NOT NULL,       -- 'CSE'
  `name`       VARCHAR(140) NOT NULL,       -- 'Computer Science & Engineering'
  `faculty`    VARCHAR(140) DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active`  TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_departments_code` (`code`),
  KEY `idx_departments_active` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `users`
  ADD COLUMN `department_id` INT DEFAULT NULL AFTER `bio`,
  ADD KEY `idx_users_department` (`department_id`),
  ADD CONSTRAINT `fk_users_department` FOREIGN KEY (`department_id`)
    REFERENCES `departments` (`id`) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 2. Files — one attachment store shared by notices, routines and materials,
--    because all three need the original filename and size for downloads.
-- ---------------------------------------------------------------------------

CREATE TABLE `files` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `filename`      VARCHAR(255) NOT NULL,   -- name on disk inside uploads/
  `original_name` VARCHAR(255) NOT NULL,   -- what the uploader chose, for downloads
  `mime_type`     VARCHAR(120) NOT NULL,
  `size_bytes`    INT NOT NULL,
  `kind`          ENUM('image','document') NOT NULL,
  `uploaded_by`   INT NOT NULL,
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_files_kind` (`kind`),
  KEY `idx_files_uploader` (`uploaded_by`),
  CONSTRAINT `fk_files_uploader` FOREIGN KEY (`uploaded_by`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 3. Notices — official, admin/moderator authored, pinnable and expiring.
--    Results and admission announcements are notice categories rather than
--    separate tables: they are announcements, and this is how the real thing works.
-- ---------------------------------------------------------------------------

CREATE TABLE `notices` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `title`         VARCHAR(200) NOT NULL,
  `body`          TEXT NOT NULL,
  `category`      ENUM('general','exam','admission','result','event','scholarship')
                    NOT NULL DEFAULT 'general',
  `priority`      ENUM('normal','important','urgent') NOT NULL DEFAULT 'normal',
  `is_pinned`     TINYINT(1) NOT NULL DEFAULT 0,
  `attachment_id` INT DEFAULT NULL,
  `publish_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at`    DATETIME DEFAULT NULL,
  `status`        ENUM('draft','published','archived') NOT NULL DEFAULT 'published',
  `author_id`     INT NOT NULL,
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_notices_board` (`status`, `is_pinned`, `publish_at`),
  KEY `idx_notices_category` (`category`, `publish_at`),
  KEY `idx_notices_expiry` (`expires_at`),
  CONSTRAINT `fk_notices_attachment` FOREIGN KEY (`attachment_id`)
    REFERENCES `files` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notices_author` FOREIGN KEY (`author_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 4. Exam routines — the official document plus its metadata.
--    Deliberately not a structured timetable: the registrar publishes a PDF,
--    and students want that exact file.
-- ---------------------------------------------------------------------------

CREATE TABLE `exam_routines` (
  `id`             INT AUTO_INCREMENT PRIMARY KEY,
  `title`          VARCHAR(200) NOT NULL,
  `department_id`  INT DEFAULT NULL,          -- NULL = applies to every department
  `semester`       VARCHAR(30) DEFAULT NULL,  -- 'Spring 2026'
  `exam_type`      ENUM('midterm','final','quiz','practical') NOT NULL DEFAULT 'final',
  `file_id`        INT NOT NULL,
  `effective_from` DATE DEFAULT NULL,
  `notes`          VARCHAR(300) DEFAULT NULL,
  `status`         ENUM('draft','published','archived') NOT NULL DEFAULT 'published',
  `created_by`     INT NOT NULL,
  `created_at`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_routines_browse` (`status`, `department_id`, `exam_type`),
  CONSTRAINT `fk_routines_file` FOREIGN KEY (`file_id`)
    REFERENCES `files` (`id`),
  CONSTRAINT `fk_routines_department` FOREIGN KEY (`department_id`)
    REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_routines_author` FOREIGN KEY (`created_by`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 5. Events + academic calendar — one table, `kind` separates them
-- ---------------------------------------------------------------------------

CREATE TABLE `events` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `title`         VARCHAR(200) NOT NULL,
  `description`   TEXT DEFAULT NULL,
  `starts_at`     DATETIME NOT NULL,
  `ends_at`       DATETIME DEFAULT NULL,
  `all_day`       TINYINT(1) NOT NULL DEFAULT 0,
  `location`      VARCHAR(160) DEFAULT NULL,
  `department_id` INT DEFAULT NULL,
  `kind`          ENUM('event','holiday','exam_week','deadline','registration','result')
                    NOT NULL DEFAULT 'event',
  `is_featured`   TINYINT(1) NOT NULL DEFAULT 0,
  `status`        ENUM('draft','published','archived') NOT NULL DEFAULT 'published',
  `created_by`    INT NOT NULL,
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_events_calendar` (`status`, `starts_at`),
  KEY `idx_events_featured` (`is_featured`, `starts_at`),
  CONSTRAINT `fk_events_department` FOREIGN KEY (`department_id`)
    REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_events_author` FOREIGN KEY (`created_by`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 6. Study materials — community-contributed, so `status` is moderation and the
--    page carries a "not official" disclaimer.
-- ---------------------------------------------------------------------------

CREATE TABLE `materials` (
  `id`             INT AUTO_INCREMENT PRIMARY KEY,
  `title`          VARCHAR(200) NOT NULL,
  `description`    VARCHAR(300) DEFAULT NULL,
  `course_code`    VARCHAR(20) DEFAULT NULL,
  `department_id`  INT DEFAULT NULL,
  `semester`       VARCHAR(30) DEFAULT NULL,
  `material_type`  ENUM('notes','slides','past_paper','syllabus','reference','other')
                     NOT NULL DEFAULT 'notes',
  `file_id`        INT NOT NULL,
  `download_count` INT NOT NULL DEFAULT 0,
  `uploaded_by`    INT NOT NULL,
  `status`         ENUM('published','removed') NOT NULL DEFAULT 'published',
  `created_at`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_materials_browse` (`status`, `department_id`, `material_type`),
  FULLTEXT KEY `ft_materials` (`title`, `description`, `course_code`),
  CONSTRAINT `fk_materials_file` FOREIGN KEY (`file_id`)
    REFERENCES `files` (`id`),
  CONSTRAINT `fk_materials_department` FOREIGN KEY (`department_id`)
    REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_materials_uploader` FOREIGN KEY (`uploaded_by`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

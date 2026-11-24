-- 001 — original blog schema.
--
-- Recorded as-is so an existing database matches this history and future
-- installs replay the same steps. Column order and index names must stay
-- exactly as they were, or the checksum comparison will complain.

CREATE TABLE IF NOT EXISTS `users` (
  `id`       INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(45)  NOT NULL,
  `email`    VARCHAR(120) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `img`      VARCHAR(255) DEFAULT NULL,
  UNIQUE KEY `uniq_users_username` (`username`),
  UNIQUE KEY `uniq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `posts` (
  `id`    INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  -- `desc` is a reserved word in MySQL and must be backticked in every query.
  `desc`  TEXT         NOT NULL,
  `img`   VARCHAR(255) DEFAULT NULL,
  `cat`   VARCHAR(45)  NOT NULL,
  `date`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `uid`   INT          NOT NULL,
  KEY `idx_posts_cat` (`cat`),
  KEY `idx_posts_uid` (`uid`),
  CONSTRAINT `fk_posts_user` FOREIGN KEY (`uid`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

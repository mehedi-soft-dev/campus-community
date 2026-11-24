-- 005 — view counting that a refresh cannot inflate.
--
-- posts.views used to be incremented on every GET /api/posts/:id, so a reload,
-- a back-navigation, a crawler, or a React StrictMode double-invoked effect all
-- added to it. This table records who has seen what, so one visitor counts once
-- per post per window regardless of how many times the page is fetched.

CREATE TABLE `post_views` (
  `post_id`        INT NOT NULL,
  -- sha256 of ip + user-agent: enough to tell visitors apart, no personal data
  -- stored in the clear.
  `visitor_key`    CHAR(64) NOT NULL,
  `last_viewed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`, `visitor_key`),
  KEY `idx_post_views_recent` (`post_id`, `last_viewed_at`),
  CONSTRAINT `fk_post_views_post` FOREIGN KEY (`post_id`)
    REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

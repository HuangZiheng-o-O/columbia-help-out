-- users
CREATE TABLE users (
uid            VARCHAR(64) PRIMARY KEY,
email          VARCHAR(255) NOT NULL UNIQUE,
display_name   VARCHAR(120),
is_verified    BOOLEAN NOT NULL DEFAULT FALSE,
photo_url      VARCHAR(500),
created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- tasks
CREATE TABLE tasks (
id                BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
uid               VARCHAR(64) NOT NULL, -- FK -> users.uid (publisher)
title             VARCHAR(160) NOT NULL,
short_description TEXT,
category          ENUM('campus','daily','academic','other') NOT NULL,
credits           INT UNSIGNED NOT NULL,
location          VARCHAR(255) NOT NULL,
duration_minutes  INT UNSIGNED NOT NULL,
status            ENUM('open','claimed','completed','cancelled') NOT NULL DEFAULT 'open',
is_verified       BOOLEAN NOT NULL DEFAULT FALSE,
is_online         BOOLEAN NOT NULL DEFAULT FALSE,
urgency           ENUM('urgent','flexible','normal') DEFAULT NULL,
created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
claimed_by_uid    VARCHAR(64) DEFAULT NULL,
claimed_at        DATETIME DEFAULT NULL,
completed_at      DATETIME DEFAULT NULL,
INDEX idx_tasks_owner_created (uid, created_at DESC),
INDEX idx_tasks_status_created (status, created_at DESC),
INDEX idx_tasks_claimed (claimed_by_uid, claimed_at),
FULLTEXT INDEX ft_tasks_search (title, short_description, location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE tasks
ADD CONSTRAINT fk_tasks_owner FOREIGN KEY (uid) REFERENCES users(uid),
ADD CONSTRAINT fk_tasks_claimed FOREIGN KEY (claimed_by_uid) REFERENCES users(uid);

-- task_tags (多对多标签)
CREATE TABLE task_tags (
task_id   BIGINT UNSIGNED NOT NULL,
tag       VARCHAR(64) NOT NULL,
PRIMARY KEY (task_id, tag),
CONSTRAINT fk_task_tags_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- task_events (状态流转与审计)
CREATE TABLE task_events (
id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
task_id     BIGINT UNSIGNED NOT NULL,
actor_uid   VARCHAR(64) NOT NULL,
from_status ENUM('open','claimed','completed','cancelled') NULL,
to_status   ENUM('open','claimed','completed','cancelled') NOT NULL,
note        VARCHAR(255),
created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_task_events_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
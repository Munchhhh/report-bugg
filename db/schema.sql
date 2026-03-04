-- E-Report (ereport2) schema
-- Create the database first in phpMyAdmin (or run this in MySQL client):
--   CREATE DATABASE ereport2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Then select it and run this file.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  school_id VARCHAR(50) NULL,
  grade VARCHAR(80) NULL,
  contact VARCHAR(50) NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(120) NOT NULL,
  incident_date DATE NOT NULL,
  incident_time TIME NULL,
  privacy ENUM('anonymous','confidential','public') NOT NULL DEFAULT 'confidential',
  status ENUM('Draft','Pending','Under Review','In Progress','Resolved','Withdrawn') NOT NULL DEFAULT 'Pending',
  priority ENUM('Low','Medium','High') NOT NULL DEFAULT 'Medium',
  admin_notes TEXT NULL,
  assigned_to VARCHAR(100) NULL,
  withdrawn_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reports_user_id (user_id),
  KEY idx_reports_status (status),
  KEY idx_reports_priority (priority),
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS report_attachments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_id INT UNSIGNED NOT NULL,
  path VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NULL,
  mime VARCHAR(120) NULL,
  size_bytes INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_attach_report_id (report_id),
  CONSTRAINT fk_attach_report FOREIGN KEY (report_id) REFERENCES reports(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS report_updates (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  message TEXT NOT NULL,
  attachment_path VARCHAR(255) NULL,
  attachment_name VARCHAR(255) NULL,
  attachment_mime VARCHAR(120) NULL,
  attachment_size_bytes INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_updates_report_id (report_id),
  KEY idx_updates_user_id (user_id),
  CONSTRAINT fk_updates_report FOREIGN KEY (report_id) REFERENCES reports(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_updates_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'info',
  title VARCHAR(190) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  report_id INT UNSIGNED NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user (user_id),
  KEY idx_notifications_unread (user_id, is_read),
  KEY idx_notifications_created (created_at),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_notifications_report FOREIGN KEY (report_id) REFERENCES reports(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

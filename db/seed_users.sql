-- Seed default accounts (run AFTER schema.sql)
-- NOTE: password_hash stores temporary plain passwords here for first login compatibility.
-- They are auto-upgraded to secure hashes after successful login.

INSERT INTO users (email, password_hash, full_name, school_id, grade, contact, role)
VALUES
  ('admin@spusm.edu.ph', 'Admin123!', 'System Administrator', 'ADM-001', NULL, '09170000001', 'admin'),
  ('student@spusm.edu.ph', 'Student123!', 'Juan Dela Cruz', 'STU-001', 'Grade 10', '09170000002', 'user')
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  school_id = VALUES(school_id),
  grade = VALUES(grade),
  contact = VALUES(contact),
  role = VALUES(role);

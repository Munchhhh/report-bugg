# Backend Setup (InfinityFree Ready)

## 1) Database config
1. Copy `api/config.local.example.php` to `api/config.local.php`
2. Put your InfinityFree MySQL credentials in `api/config.local.php`

## 2) Database schema
- Import `db/schema.sql` in phpMyAdmin.
- The backend auto-creates `report_categories` on first API request.

## 2.1) Seed admin + user accounts
- Import `db/seed_users.sql` in phpMyAdmin after `schema.sql`.
- Default login:
  - Admin: `admin@school.local` / `Admin@123`
  - User: `student@school.local` / `Student@123`
- On first successful login, the backend auto-upgrades these temporary plain passwords into secure hashes.
- Change both passwords immediately from your admin tools or directly in DB.

## 3) Default login
- This backend uses records from your existing `users` table.
- Password check supports both:
  - hashed passwords (`password_hash`)
  - plain passwords (legacy), and auto-upgrades to hash after first successful login.

## 4) URL behavior when domain/path changes
- All frontend API calls are relative (e.g. `api/login.php`), so moving to another domain/subfolder keeps working.
- `.htaccess` also maps clean URLs:
  - `/login` -> `login.php`
  - `/user-dashboard` -> `user-dashboard.php`
  - `/admin-dashboard` -> `admin-dashboard.php`
  - `/profile` -> `profile.php`
  - `/report-details` -> `report-details.php`

## 5) Upload folders
- Keep `uploads/` writable by PHP.
- New files are stored under `uploads/reports/{report_id}/` and `uploads/reports/{report_id}/updates/`.

## 6) Included APIs
- Auth: `api/login.php`, `api/logout.php`, `api/me.php`
- Profile: `api/profile_get.php`, `api/profile_update.php`
- Reports: `api/reports_list.php`, `api/reports_stats.php`, `api/report_get.php`, `api/report_create.php`, `api/report_save_draft.php`, `api/report_add_update.php`, `api/report_withdraw.php`
- Categories: `api/categories_list.php`
- Notifications: `api/notifications_list.php`, `api/notifications_mark_read.php`, `api/notifications_mark_all_read.php`, `api/notifications_delete.php`
- Admin: `api/admin/stats.php`, `api/admin/reports_list.php`, `api/admin/report_update.php`, `api/admin/students_list.php`, `api/admin/student_password_update.php`, `api/admin/categories_create.php`, `api/admin/categories_update.php`, `api/admin/categories_delete.php`, `api/admin/export_reports.php`

## 7) Deployment note
- Upload all files as-is.
- Ensure `vendor/` is present for export (`dompdf`, `phpspreadsheet`).

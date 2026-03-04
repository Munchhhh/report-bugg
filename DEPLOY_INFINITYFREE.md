# Deploy to InfinityFree (No Local Hosting)

## 1) Upload project files
- Open InfinityFree File Manager (or FTP via FileZilla).
- Upload this project into your domain folder (usually `htdocs/`).
- Keep this structure inside `htdocs/`:
  - `login.php`, `user-dashboard.php`, `admin-dashboard.php`, `profile.php`, `report-details.php`
  - `api/`
  - `uploads/`
  - `vendor/`
  - `.htaccess`

## 2) Create MySQL database
- In InfinityFree control panel, create a MySQL database.
- Open phpMyAdmin from InfinityFree and import:
  1. `db/schema.sql`
  2. `db/seed_users.sql`

## 3) Configure production DB credentials
- Create file: `api/config.local.php`
- Paste this and replace values from InfinityFree panel:

```php
<?php

return [
    'DB_HOST' => 'sqlXXX.infinityfree.com',
    'DB_NAME' => 'if0_XXXXXXXX_ereport2',
    'DB_USER' => 'if0_XXXXXXXX',
    'DB_PASS' => 'YOUR_DB_PASSWORD',
    'UPLOAD_ROOT' => __DIR__ . '/../uploads',
    'APP_DEBUG' => '0',
];
```

## 4) Ensure writable uploads
- `uploads/` must be writable.
- New report files go to:
  - `uploads/reports/{id}/`
  - `uploads/reports/{id}/updates/`

## 5) Use your live URL
- Open your deployed URL (example: `https://yourdomain.epizy.com/login.php`).
- Do **not** open files directly from your computer.

## 6) Seed login accounts
- Admin: `admin@spusm.edu.ph` / `Admin123!`
- User: `student@spusm.edu.ph` / `Student123!`

## 7) If login fails on hosting
- Recheck `api/config.local.php` values.
- Confirm database import completed with no errors.
- Confirm `users` table contains seeded accounts.
- Confirm `vendor/` exists (required for export endpoints).

<?php

declare(strict_types=1);

$config = require __DIR__ . '/config.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function db(): PDO
{
    static $pdo = null;
    global $config;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $db = $config['db'];
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', $db['host'], $db['name'], $db['charset']);
    try {
        $pdo = new PDO($dsn, $db['user'], $db['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (PDOException $e) {
        $payload = [
            'success' => false,
            'error' => 'Database connection failed. Check deployed DB credentials.',
        ];

        if (!empty($config['debug'])) {
            $payload['detail'] = $e->getMessage();
        }

        jsonResponse($payload, 500);
    }

    ensureSchemaExtensions($pdo);

    return $pdo;
}

function ensureSchemaExtensions(PDO $pdo): void
{
    static $done = false;
    if ($done) {
        return;
    }

    $pdo->exec("CREATE TABLE IF NOT EXISTS report_categories (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_report_categories_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $count = (int) $pdo->query("SELECT COUNT(*) FROM report_categories")->fetchColumn();
    if ($count === 0) {
        $defaults = ['Bullying', 'Harassment', 'Discrimination', 'Violence', 'Academic Misconduct', 'Facilities', 'Cyber Incident', 'Other'];
        $ins = $pdo->prepare("INSERT IGNORE INTO report_categories(name) VALUES(:name)");
        foreach ($defaults as $name) {
            $ins->execute(['name' => $name]);
        }

        $stmt = $pdo->query("SELECT DISTINCT category FROM reports WHERE category IS NOT NULL AND category <> ''");
        foreach ($stmt->fetchAll() as $row) {
            $ins->execute(['name' => (string) $row['category']]);
        }
    }

    $done = true;
}

function jsonResponse(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload);
    exit;
}

function readJson(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function requireMethod(string $method): void
{
    if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') !== strtoupper($method)) {
        jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
    }
}

function currentUser(): ?array
{
    $uid = (int) ($_SESSION['user_id'] ?? 0);
    if ($uid <= 0) {
        return null;
    }

    $stmt = db()->prepare('SELECT id, email, full_name, school_id, grade, contact, role FROM users WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $uid]);
    $user = $stmt->fetch();

    return $user ?: null;
}

function requireAuth(?string $role = null): array
{
    $user = currentUser();
    if (!$user) {
        jsonResponse(['success' => false, 'error' => 'Unauthorized'], 401);
    }

    if ($role !== null && strtolower((string) $user['role']) !== strtolower($role)) {
        jsonResponse(['success' => false, 'error' => 'Forbidden'], 403);
    }

    return $user;
}

function normalizeUploadPublicPath(string $path): string
{
    $p = str_replace('\\', '/', $path);
    $p = ltrim($p, '/');
    if (!str_starts_with($p, 'uploads/')) {
        $p = 'uploads/' . $p;
    }
    return $p;
}

function reportDisplayId(int $id): string
{
    return '#' . str_pad((string) $id, 6, '0', STR_PAD_LEFT);
}

function saveUploadedFile(array $file, string $targetDir, string $prefix = 'file_'): ?array
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        return null;
    }

    $originalName = (string) ($file['name'] ?? 'attachment');
    $tmp = (string) ($file['tmp_name'] ?? '');
    if ($tmp === '' || !is_uploaded_file($tmp)) {
        return null;
    }

    if (!is_dir($targetDir) && !mkdir($targetDir, 0775, true) && !is_dir($targetDir)) {
        throw new RuntimeException('Unable to create upload directory');
    }

    $ext = pathinfo($originalName, PATHINFO_EXTENSION);
    $ext = $ext ? '.' . preg_replace('/[^a-zA-Z0-9]/', '', $ext) : '';
    $name = $prefix . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . $ext;
    $dest = rtrim($targetDir, '/\\') . DIRECTORY_SEPARATOR . $name;

    if (!move_uploaded_file($tmp, $dest)) {
        throw new RuntimeException('Unable to save uploaded file');
    }

    $mime = (string) ($file['type'] ?? 'application/octet-stream');
    $size = (int) ($file['size'] ?? 0);

    return [
        'path' => $dest,
        'original_name' => $originalName,
        'mime' => $mime,
        'size_bytes' => $size,
    ];
}

function buildPublicUrlPath(string $relativePath): string
{
    return '/' . ltrim(str_replace('\\', '/', $relativePath), '/');
}

function uploadRoot(): string
{
    global $config;
    return (string) $config['upload_root'];
}

function isFinalStatus(string $status): bool
{
    $s = strtolower(trim($status));
    return str_contains($s, 'resolved') || str_contains($s, 'withdraw');
}

function addNotification(int $userId, string $type, string $title, string $message, ?int $reportId = null): void
{
    $stmt = db()->prepare('INSERT INTO notifications (user_id, type, title, message, report_id) VALUES (:user_id, :type, :title, :message, :report_id)');
    $stmt->execute([
        'user_id' => $userId,
        'type' => $type,
        'title' => $title,
        'message' => $message,
        'report_id' => $reportId,
    ]);
}

function reportBelongsToUser(int $reportId, int $userId): bool
{
    $stmt = db()->prepare('SELECT id FROM reports WHERE id = :id AND user_id = :user_id LIMIT 1');
    $stmt->execute(['id' => $reportId, 'user_id' => $userId]);
    return (bool) $stmt->fetchColumn();
}

function fetchReportById(int $id): ?array
{
    $sql = "SELECT r.*, u.full_name AS user_name, u.email AS user_email, u.school_id AS user_school_id
            FROM reports r
            INNER JOIN users u ON u.id = r.user_id
            WHERE r.id = :id
            LIMIT 1";
    $stmt = db()->prepare($sql);
    $stmt->execute(['id' => $id]);
    $report = $stmt->fetch();

    if (!$report) {
        return null;
    }

    $aStmt = db()->prepare('SELECT path, original_name FROM report_attachments WHERE report_id = :rid ORDER BY id ASC');
    $aStmt->execute(['rid' => $id]);
    $attachments = [];
    foreach ($aStmt->fetchAll() as $row) {
        $attachments[] = buildPublicUrlPath((string) $row['path']);
    }

    $uStmt = db()->prepare("SELECT ru.id, ru.message, ru.created_at, ru.attachment_path, ru.attachment_name, ru.attachment_mime, ru.attachment_size_bytes,
                                   us.full_name AS author_name, us.role AS author_role
                            FROM report_updates ru
                            INNER JOIN users us ON us.id = ru.user_id
                            WHERE ru.report_id = :rid
                            ORDER BY ru.created_at DESC, ru.id DESC");
    $uStmt->execute(['rid' => $id]);
    $updates = $uStmt->fetchAll();
    foreach ($updates as &$u) {
        $u['attachment_path'] = $u['attachment_path'] ? buildPublicUrlPath((string) $u['attachment_path']) : null;
    }

    return [
        'id' => (int) $report['id'],
        'id_display' => reportDisplayId((int) $report['id']),
        'title' => (string) $report['title'],
        'category' => (string) $report['category'],
        'description' => (string) $report['description'],
        'location' => (string) $report['location'],
        'submitted' => (string) $report['created_at'],
        'incident_date' => (string) ($report['incident_date'] ?? ''),
        'incident_time' => (string) ($report['incident_time'] ?? ''),
        'privacy' => (string) $report['privacy'],
        'status' => (string) $report['status'],
        'priority' => (string) $report['priority'],
        'admin_notes' => (string) ($report['admin_notes'] ?? ''),
        'assigned_to' => (string) ($report['assigned_to'] ?? ''),
        'user_id' => (int) $report['user_id'],
        'user_name' => (string) $report['user_name'],
        'user_email' => (string) $report['user_email'],
        'user_school_id' => (string) ($report['user_school_id'] ?? ''),
        'attachments' => $attachments,
        'updates' => $updates,
    ];
}

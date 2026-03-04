<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
requireMethod('POST');

$user = requireAuth();
$pdo = db();

$reportId = (int) ($_POST['id'] ?? 0);
$message = trim((string) ($_POST['message'] ?? ''));

if ($reportId <= 0 || $message === '') {
    jsonResponse(['success' => false, 'error' => 'Invalid update payload'], 422);
}

$report = fetchReportById($reportId);
if (!$report) {
    jsonResponse(['success' => false, 'error' => 'Report not found'], 404);
}

$isAdmin = strtolower((string) $user['role']) === 'admin';
if (!$isAdmin && (int) $report['user_id'] !== (int) $user['id']) {
    jsonResponse(['success' => false, 'error' => 'Forbidden'], 403);
}

if (isFinalStatus((string) $report['status'])) {
    jsonResponse(['success' => false, 'error' => 'Resolved or withdrawn reports cannot be updated'], 422);
}

$attachmentPath = null;
$attachmentName = null;
$attachmentMime = null;
$attachmentSize = null;

if (isset($_FILES['attachment'])) {
    $root = uploadRoot();
    $dir = rtrim($root, '/\\') . DIRECTORY_SEPARATOR . 'reports' . DIRECTORY_SEPARATOR . $reportId . DIRECTORY_SEPARATOR . 'updates';
    $saved = saveUploadedFile($_FILES['attachment'], $dir, 'update_');
    if ($saved) {
        $attachmentPath = normalizeUploadPublicPath('reports/' . $reportId . '/updates/' . basename((string) $saved['path']));
        $attachmentName = (string) $saved['original_name'];
        $attachmentMime = (string) $saved['mime'];
        $attachmentSize = (int) $saved['size_bytes'];
    }
}

$ins = $pdo->prepare('INSERT INTO report_updates (report_id, user_id, message, attachment_path, attachment_name, attachment_mime, attachment_size_bytes) VALUES (:rid, :uid, :message, :path, :name, :mime, :size)');
$ins->execute([
    'rid' => $reportId,
    'uid' => (int) $user['id'],
    'message' => $message,
    'path' => $attachmentPath,
    'name' => $attachmentName,
    'mime' => $attachmentMime,
    'size' => $attachmentSize,
]);

if ($isAdmin) {
    addNotification((int) $report['user_id'], 'info', 'Report updated by admin', 'An admin added an update to your report ' . reportDisplayId($reportId), $reportId);
} else {
    $admins = $pdo->query("SELECT id FROM users WHERE role = 'admin'")->fetchAll();
    foreach ($admins as $admin) {
        addNotification((int) $admin['id'], 'info', 'Student added update', 'A student added an update to report ' . reportDisplayId($reportId), $reportId);
    }
}

jsonResponse(['success' => true]);

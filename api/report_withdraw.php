<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
requireMethod('POST');

$user = requireAuth();
$data = readJson();
$reportId = (int) ($data['id'] ?? 0);

if ($reportId <= 0) {
    jsonResponse(['success' => false, 'error' => 'Invalid report id'], 422);
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
    jsonResponse(['success' => false, 'error' => 'Report already finalized'], 422);
}

$stmt = db()->prepare("UPDATE reports SET status = 'Withdrawn', withdrawn_at = NOW() WHERE id = :id");
$stmt->execute(['id' => $reportId]);

$admins = db()->query("SELECT id FROM users WHERE role = 'admin'")->fetchAll();
foreach ($admins as $admin) {
    if ((int) $admin['id'] === (int) $user['id']) {
        continue;
    }
    addNotification((int) $admin['id'], 'warn', 'Report withdrawn', 'Report ' . reportDisplayId($reportId) . ' has been withdrawn.', $reportId);
}

if ($isAdmin) {
    addNotification((int) $report['user_id'], 'warn', 'Report withdrawn', 'Your report ' . reportDisplayId($reportId) . ' was withdrawn by admin.', $reportId);
}

jsonResponse(['success' => true]);

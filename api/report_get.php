<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$user = requireAuth();
$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) {
    jsonResponse(['success' => false, 'error' => 'Invalid report id'], 422);
}

$report = fetchReportById($id);
if (!$report) {
    jsonResponse(['success' => false, 'error' => 'Report not found'], 404);
}

if (strtolower((string) $user['role']) !== 'admin' && (int) $report['user_id'] !== (int) $user['id']) {
    jsonResponse(['success' => false, 'error' => 'Forbidden'], 403);
}

jsonResponse(['success' => true, 'report' => $report]);

<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
requireMethod('POST');

$admin = requireAuth('admin');
$data = readJson();

$id = (int) ($data['id'] ?? 0);
$status = trim((string) ($data['status'] ?? ''));
$priority = trim((string) ($data['priority'] ?? ''));
$assignedTo = trim((string) ($data['assigned_to'] ?? ''));
$adminNotes = trim((string) ($data['admin_notes'] ?? ''));

if ($id <= 0 || $status === '' || $priority === '') {
    jsonResponse(['success' => false, 'error' => 'Invalid report update payload'], 422);
}

$report = fetchReportById($id);
if (!$report) {
    jsonResponse(['success' => false, 'error' => 'Report not found'], 404);
}

$stmt = db()->prepare('UPDATE reports SET status = :status, priority = :priority, assigned_to = :assigned_to, admin_notes = :admin_notes WHERE id = :id');
$stmt->execute([
    'status' => $status,
    'priority' => $priority,
    'assigned_to' => $assignedTo,
    'admin_notes' => $adminNotes,
    'id' => $id,
]);

$oldNote = trim((string) ($report['admin_notes'] ?? ''));
if ($adminNotes !== '' && $adminNotes !== $oldNote) {
    $ins = db()->prepare('INSERT INTO report_updates(report_id, user_id, message) VALUES(:rid, :uid, :msg)');
    $ins->execute([
        'rid' => $id,
        'uid' => (int) $admin['id'],
        'msg' => 'Admin Comment: ' . $adminNotes,
    ]);
}

if (strtolower((string) $status) === 'resolved') {
    addNotification((int) $report['user_id'], 'ok', 'Report resolved', 'Your report ' . reportDisplayId($id) . ' has been marked as resolved.', $id);
} else {
    addNotification((int) $report['user_id'], 'info', 'Report updated', 'Your report ' . reportDisplayId($id) . ' was updated by admin.', $id);
}

jsonResponse(['success' => true]);

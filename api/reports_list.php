<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$user = requireAuth();
$mine = (int) ($_GET['mine'] ?? 0) === 1;
$limit = (int) ($_GET['limit'] ?? 50);
$limit = max(1, min(200, $limit));

$params = ['limit' => $limit];
$sql = 'SELECT r.id, r.title, r.category, r.status, r.priority, r.location, r.admin_notes, r.privacy, r.incident_date, r.incident_time, r.created_at, r.updated_at
        FROM reports r';

if ($mine || strtolower((string) $user['role']) !== 'admin') {
    $sql .= ' WHERE r.user_id = :uid';
    $params['uid'] = (int) $user['id'];
}

$sql .= ' ORDER BY r.updated_at DESC, r.id DESC LIMIT :limit';
$stmt = db()->prepare($sql);
if (isset($params['uid'])) {
    $stmt->bindValue(':uid', $params['uid'], PDO::PARAM_INT);
}
$stmt->bindValue(':limit', $params['limit'], PDO::PARAM_INT);
$stmt->execute();
$rows = $stmt->fetchAll();

$reports = array_map(static function (array $r): array {
    return [
        'id' => (int) $r['id'],
        'id_display' => reportDisplayId((int) $r['id']),
        'title' => (string) $r['title'],
        'category' => (string) $r['category'],
        'submitted' => date('Y-m-d', strtotime((string) $r['created_at'])),
        'status' => (string) $r['status'],
        'priority' => (string) $r['priority'],
        'location' => (string) $r['location'],
        'admin_notes' => (string) ($r['admin_notes'] ?? ''),
        'privacy' => (string) ($r['privacy'] ?? 'public'),
        'incident_date' => (string) ($r['incident_date'] ?? ''),
        'incident_time' => (string) ($r['incident_time'] ?? ''),
        'updated_at' => (string) $r['updated_at'],
    ];
}, $rows);

jsonResponse([
    'success' => true,
    'reports' => $reports,
]);

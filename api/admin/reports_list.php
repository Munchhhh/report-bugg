<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

requireAuth('admin');

$q = trim((string) ($_GET['q'] ?? ''));
$status = trim((string) ($_GET['status'] ?? ''));
$category = trim((string) ($_GET['category'] ?? ''));
$assignedTo = trim((string) ($_GET['assigned_to'] ?? ''));

$where = [];
$params = [];

if ($q !== '') {
    $where[] = '(r.title LIKE :q OR r.category LIKE :q OR r.status LIKE :q OR r.priority LIKE :q OR u.full_name LIKE :q OR u.email LIKE :q OR CAST(r.id AS CHAR) LIKE :q)';
    $params['q'] = '%' . $q . '%';
}
if ($status !== '') {
    $where[] = 'r.status = :status';
    $params['status'] = $status;
}
if ($category !== '') {
    $where[] = 'r.category = :category';
    $params['category'] = $category;
}
if ($assignedTo !== '') {
    $where[] = 'r.assigned_to = :assigned_to';
    $params['assigned_to'] = $assignedTo;
}

$sql = "SELECT r.id, r.title, r.category, r.priority, r.status, r.privacy, r.created_at, r.updated_at, r.assigned_to,
               u.full_name AS user_name, u.email AS user_email
        FROM reports r
        INNER JOIN users u ON u.id = r.user_id";
if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}
$sql .= ' ORDER BY r.updated_at DESC, r.id DESC';

$stmt = db()->prepare($sql);
foreach ($params as $k => $v) {
    $stmt->bindValue(':' . $k, $v, PDO::PARAM_STR);
}
$stmt->execute();
$rows = $stmt->fetchAll();

$reports = array_map(static function (array $r): array {
    return [
        'id' => (int) $r['id'],
        'id_display' => reportDisplayId((int) $r['id']),
        'title' => (string) $r['title'],
        'category' => (string) $r['category'],
        'priority' => (string) $r['priority'],
        'status' => (string) $r['status'],
        'privacy' => (string) $r['privacy'],
        'user_name' => (string) $r['user_name'],
        'user_email' => (string) $r['user_email'],
        'date' => date('Y-m-d', strtotime((string) $r['created_at'])),
        'updated_at' => (string) $r['updated_at'],
        'assigned_to' => (string) ($r['assigned_to'] ?? ''),
    ];
}, $rows);

jsonResponse([
    'success' => true,
    'reports' => $reports,
]);

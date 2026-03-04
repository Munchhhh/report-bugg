<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$user = requireAuth();
$mine = (int) ($_GET['mine'] ?? 0) === 1;

$where = '';
$params = [];
if ($mine || strtolower((string) $user['role']) !== 'admin') {
    $where = 'WHERE user_id = :uid';
    $params['uid'] = (int) $user['id'];
}

$stmt = db()->prepare("SELECT status, COUNT(*) AS c FROM reports $where GROUP BY status");
if (isset($params['uid'])) {
    $stmt->bindValue(':uid', $params['uid'], PDO::PARAM_INT);
}
$stmt->execute();
$rows = $stmt->fetchAll();

$counts = [
    'total' => 0,
    'pending' => 0,
    'in_progress' => 0,
    'resolved' => 0,
];

foreach ($rows as $row) {
    $status = strtolower((string) $row['status']);
    $c = (int) $row['c'];
    $counts['total'] += $c;

    if (str_contains($status, 'resolved')) {
        $counts['resolved'] += $c;
    } elseif (str_contains($status, 'progress')) {
        $counts['in_progress'] += $c;
    } elseif (!str_contains($status, 'withdraw')) {
        $counts['pending'] += $c;
    }
}

jsonResponse(['success' => true, 'counts' => $counts]);

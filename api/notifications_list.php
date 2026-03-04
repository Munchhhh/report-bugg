<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$user = requireAuth();
$limit = (int) ($_GET['limit'] ?? 25);
$limit = max(1, min(100, $limit));

$stmt = db()->prepare('SELECT id, report_id, type, title, message, is_read, created_at FROM notifications WHERE user_id = :uid ORDER BY created_at DESC, id DESC LIMIT :limit');
$stmt->bindValue(':uid', (int) $user['id'], PDO::PARAM_INT);
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->execute();

jsonResponse([
    'success' => true,
    'notifications' => $stmt->fetchAll(),
]);

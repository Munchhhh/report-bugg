<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
requireMethod('POST');

$user = requireAuth();
$data = readJson();
$id = (int) ($data['id'] ?? 0);

if ($id <= 0) {
    jsonResponse(['success' => false, 'error' => 'Invalid notification id'], 422);
}

$stmt = db()->prepare('UPDATE notifications SET is_read = 1 WHERE id = :id AND user_id = :uid');
$stmt->execute([
    'id' => $id,
    'uid' => (int) $user['id'],
]);

jsonResponse(['success' => true]);

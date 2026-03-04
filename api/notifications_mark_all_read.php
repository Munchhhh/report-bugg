<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
requireMethod('POST');

$user = requireAuth();

$stmt = db()->prepare('UPDATE notifications SET is_read = 1 WHERE user_id = :uid AND is_read = 0');
$stmt->execute(['uid' => (int) $user['id']]);

jsonResponse(['success' => true]);

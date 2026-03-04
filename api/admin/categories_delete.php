<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
requireMethod('POST');

requireAuth('admin');
$data = readJson();
$id = (int) ($data['id'] ?? 0);

if ($id <= 0) {
    jsonResponse(['success' => false, 'error' => 'Invalid category id'], 422);
}

$stmt = db()->prepare('UPDATE report_categories SET is_active = 0 WHERE id = :id');
$stmt->execute(['id' => $id]);

jsonResponse(['success' => true]);

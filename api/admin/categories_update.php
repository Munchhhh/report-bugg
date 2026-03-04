<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
requireMethod('POST');

requireAuth('admin');
$data = readJson();
$id = (int) ($data['id'] ?? 0);
$name = trim((string) ($data['name'] ?? ''));

if ($id <= 0 || $name === '') {
    jsonResponse(['success' => false, 'error' => 'Invalid category payload'], 422);
}

$stmt = db()->prepare('UPDATE report_categories SET name = :name, is_active = 1 WHERE id = :id');
$stmt->execute(['name' => $name, 'id' => $id]);

jsonResponse(['success' => true]);

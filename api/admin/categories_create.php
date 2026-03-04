<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
requireMethod('POST');

requireAuth('admin');
$data = readJson();
$name = trim((string) ($data['name'] ?? ''));

if ($name === '') {
    jsonResponse(['success' => false, 'error' => 'Category name is required'], 422);
}

$stmt = db()->prepare('INSERT INTO report_categories(name, is_active) VALUES(:name, 1)');
try {
    $stmt->execute(['name' => $name]);
} catch (Throwable $e) {
    jsonResponse(['success' => false, 'error' => 'Category already exists'], 409);
}

jsonResponse(['success' => true]);

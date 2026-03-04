<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
requireMethod('POST');

$user = requireAuth();
$data = readJson();

$fullName = trim((string) ($data['full_name'] ?? ''));
$grade = trim((string) ($data['grade'] ?? ''));
$contact = trim((string) ($data['contact'] ?? ''));

if ($fullName === '') {
    jsonResponse(['success' => false, 'error' => 'Full name is required'], 422);
}

$stmt = db()->prepare('UPDATE users SET full_name = :full_name, grade = :grade, contact = :contact WHERE id = :id');
$stmt->execute([
    'full_name' => $fullName,
    'grade' => $grade,
    'contact' => $contact,
    'id' => (int) $user['id'],
]);

jsonResponse(['success' => true]);

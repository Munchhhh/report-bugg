<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
requireMethod('POST');

requireAuth('admin');
$data = readJson();
$studentId = (int) ($data['student_id'] ?? 0);
$newPassword = (string) ($data['new_password'] ?? '');

if ($studentId <= 0 || strlen($newPassword) < 8) {
    jsonResponse(['success' => false, 'error' => 'Invalid student or password'], 422);
}

$hash = password_hash($newPassword, PASSWORD_DEFAULT);
$stmt = db()->prepare("UPDATE users SET password_hash = :hash WHERE id = :id AND role = 'user'");
$stmt->execute([
    'hash' => $hash,
    'id' => $studentId,
]);

if ($stmt->rowCount() < 1) {
    jsonResponse(['success' => false, 'error' => 'Student not found'], 404);
}

jsonResponse(['success' => true]);

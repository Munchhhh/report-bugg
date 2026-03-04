<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
requireMethod('POST');

$data = readJson();
$email = strtolower(trim((string) ($data['email'] ?? '')));
$password = (string) ($data['password'] ?? '');

if ($email === '' || $password === '') {
    jsonResponse(['success' => false, 'error' => 'Email and password are required'], 422);
}

$stmt = db()->prepare('SELECT id, email, password_hash, full_name, role FROM users WHERE LOWER(email) = :email LIMIT 1');
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();

if (!$user) {
    jsonResponse(['success' => false, 'error' => 'Invalid credentials'], 401);
}

$hash = (string) $user['password_hash'];
$valid = password_verify($password, $hash) || hash_equals($hash, $password);

if (!$valid) {
    jsonResponse(['success' => false, 'error' => 'Invalid credentials'], 401);
}

if (!password_get_info($hash)['algo']) {
    $newHash = password_hash($password, PASSWORD_DEFAULT);
    $up = db()->prepare('UPDATE users SET password_hash = :h WHERE id = :id');
    $up->execute(['h' => $newHash, 'id' => (int) $user['id']]);
}

$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['role'] = (string) $user['role'];

jsonResponse([
    'success' => true,
    'role' => (string) $user['role'],
    'user' => [
        'id' => (int) $user['id'],
        'email' => (string) $user['email'],
        'full_name' => (string) $user['full_name'],
        'role' => (string) $user['role'],
    ],
]);

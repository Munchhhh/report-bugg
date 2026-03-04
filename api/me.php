<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$user = currentUser();
if (!$user) {
    jsonResponse(['success' => true, 'authenticated' => false]);
}

jsonResponse([
    'success' => true,
    'authenticated' => true,
    'user' => [
        'id' => (int) $user['id'],
        'email' => (string) $user['email'],
        'full_name' => (string) $user['full_name'],
        'school_id' => (string) ($user['school_id'] ?? ''),
        'grade' => (string) ($user['grade'] ?? ''),
        'contact' => (string) ($user['contact'] ?? ''),
        'role' => (string) $user['role'],
    ],
]);

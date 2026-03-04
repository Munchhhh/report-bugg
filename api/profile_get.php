<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$user = requireAuth();

jsonResponse([
    'success' => true,
    'profile' => [
        'id' => (int) $user['id'],
        'full_name' => (string) $user['full_name'],
        'school_id' => (string) ($user['school_id'] ?? ''),
        'grade' => (string) ($user['grade'] ?? ''),
        'email' => (string) $user['email'],
        'contact' => (string) ($user['contact'] ?? ''),
        'role' => (string) $user['role'],
    ],
]);

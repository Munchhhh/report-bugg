<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

requireAuth('admin');

$stmt = db()->query("SELECT id, full_name, school_id, email FROM users WHERE role = 'user' ORDER BY full_name ASC, id ASC");
jsonResponse([
    'success' => true,
    'students' => $stmt->fetchAll(),
]);

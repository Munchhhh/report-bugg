<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

requireAuth();
$stmt = db()->query('SELECT id, name FROM report_categories WHERE is_active = 1 ORDER BY name ASC');

jsonResponse([
    'success' => true,
    'categories' => $stmt->fetchAll(),
]);

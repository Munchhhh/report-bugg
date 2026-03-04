<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

requireAuth('admin');

$total = (int) db()->query('SELECT COUNT(*) FROM reports')->fetchColumn();
$pending = (int) db()->query("SELECT COUNT(*) FROM reports WHERE status IN ('Pending','Under Review','Draft')")->fetchColumn();
$high = (int) db()->query("SELECT COUNT(*) FROM reports WHERE priority = 'High' AND status NOT IN ('Resolved','Withdrawn')")->fetchColumn();
$resolved = (int) db()->query("SELECT COUNT(*) FROM reports WHERE status = 'Resolved'")->fetchColumn();
$rate = $total > 0 ? (int) round(($resolved / $total) * 100) : 0;

jsonResponse([
    'success' => true,
    'stats' => [
        'total' => $total,
        'pending' => $pending,
        'high' => $high,
        'resolution_rate' => $rate,
    ],
]);

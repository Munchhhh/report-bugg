<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
requireMethod('POST');

$user = requireAuth();
$data = readJson();

$id = (int) ($data['id'] ?? 0);
$category = trim((string) ($data['category'] ?? ''));
$titleInput = trim((string) ($data['title'] ?? ''));
$title = $category === 'Other' ? $titleInput : ($category !== '' ? $category : $titleInput);
$description = trim((string) ($data['description'] ?? ''));
$location = trim((string) ($data['location'] ?? ''));
$incidentDate = trim((string) ($data['incidentDate'] ?? ''));
$incidentTime = trim((string) ($data['incidentTime'] ?? ''));
$privacy = trim((string) ($data['privacy'] ?? 'public'));

if ($title === '') {
    $title = 'Untitled Draft';
}
if ($category === '') {
    $category = 'Other';
}
if ($description === '') {
    $description = 'Draft description';
}
if ($location === '') {
    $location = 'TBD';
}
if ($incidentDate === '') {
    $incidentDate = date('Y-m-d');
}
if ($incidentTime === '') {
    $incidentTime = date('H:i:s');
}

$pdo = db();

if ($id > 0) {
    if (!reportBelongsToUser($id, (int) $user['id'])) {
        jsonResponse(['success' => false, 'error' => 'Draft not found'], 404);
    }

    $stmt = $pdo->prepare("UPDATE reports
        SET title = :title, category = :category, description = :description, location = :location,
            incident_date = :incident_date, incident_time = :incident_time, privacy = :privacy,
            status = 'Draft'
        WHERE id = :id AND user_id = :user_id");

    $stmt->execute([
        'title' => $title,
        'category' => $category,
        'description' => $description,
        'location' => $location,
        'incident_date' => $incidentDate,
        'incident_time' => $incidentTime,
        'privacy' => $privacy,
        'id' => $id,
        'user_id' => (int) $user['id'],
    ]);
} else {
    $stmt = $pdo->prepare("INSERT INTO reports
        (user_id, title, category, description, location, incident_date, incident_time, privacy, status, priority)
        VALUES (:user_id, :title, :category, :description, :location, :incident_date, :incident_time, :privacy, 'Draft', 'Medium')");

    $stmt->execute([
        'user_id' => (int) $user['id'],
        'title' => $title,
        'category' => $category,
        'description' => $description,
        'location' => $location,
        'incident_date' => $incidentDate,
        'incident_time' => $incidentTime,
        'privacy' => $privacy,
    ]);

    $id = (int) $pdo->lastInsertId();
}

jsonResponse([
    'success' => true,
    'report_id' => $id,
    'id_display' => reportDisplayId($id),
]);

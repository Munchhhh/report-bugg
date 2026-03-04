<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
requireMethod('POST');

$user = requireAuth();
$pdo = db();

$category = trim((string) ($_POST['category'] ?? ''));
$titleInput = trim((string) ($_POST['reportTitle'] ?? ''));
$description = trim((string) ($_POST['description'] ?? ''));
$location = trim((string) ($_POST['location'] ?? ''));
$incidentDate = trim((string) ($_POST['incidentDate'] ?? ''));
$incidentTime = trim((string) ($_POST['incidentTime'] ?? ''));
$privacy = trim((string) ($_POST['privacy'] ?? 'public'));
$draftId = (int) ($_POST['draft_id'] ?? 0);

$title = $category === 'Other' ? $titleInput : ($category !== '' ? $category : $titleInput);
if ($title === '' || $description === '' || $location === '' || $incidentDate === '') {
    jsonResponse(['success' => false, 'error' => 'Missing required fields'], 422);
}

$incidentDateTime = $incidentDate . ' ' . ($incidentTime !== '' ? $incidentTime : '00:00:00');
if (strtotime($incidentDateTime) > time()) {
    jsonResponse(['success' => false, 'error' => 'Incident date/time cannot be in the future'], 422);
}

$pdo->beginTransaction();
try {
    if ($draftId > 0 && reportBelongsToUser($draftId, (int) $user['id'])) {
        $up = $pdo->prepare("UPDATE reports
            SET title = :title, category = :category, description = :description, location = :location,
                incident_date = :incident_date, incident_time = :incident_time, privacy = :privacy,
                status = 'Pending', withdrawn_at = NULL
            WHERE id = :id AND user_id = :user_id");
        $up->execute([
            'title' => $title,
            'category' => $category,
            'description' => $description,
            'location' => $location,
            'incident_date' => $incidentDate,
            'incident_time' => $incidentTime !== '' ? $incidentTime : null,
            'privacy' => $privacy,
            'id' => $draftId,
            'user_id' => (int) $user['id'],
        ]);
        $reportId = $draftId;
    } else {
        $ins = $pdo->prepare("INSERT INTO reports
            (user_id, title, category, description, location, incident_date, incident_time, privacy, status, priority)
            VALUES (:user_id, :title, :category, :description, :location, :incident_date, :incident_time, :privacy, 'Pending', 'Medium')");

        $ins->execute([
            'user_id' => (int) $user['id'],
            'title' => $title,
            'category' => $category,
            'description' => $description,
            'location' => $location,
            'incident_date' => $incidentDate,
            'incident_time' => $incidentTime !== '' ? $incidentTime : null,
            'privacy' => $privacy,
        ]);

        $reportId = (int) $pdo->lastInsertId();
    }

    $upd = $pdo->prepare('INSERT INTO report_updates(report_id, user_id, message) VALUES(:rid, :uid, :msg)');
    $upd->execute([
        'rid' => $reportId,
        'uid' => (int) $user['id'],
        'msg' => 'Report submitted',
    ]);

    $root = uploadRoot();
    $reportDir = rtrim($root, '/\\') . DIRECTORY_SEPARATOR . 'reports' . DIRECTORY_SEPARATOR . $reportId;

    if (isset($_FILES['attachments'])) {
        $files = $_FILES['attachments'];
        if (is_array($files['name'] ?? null)) {
            $count = count($files['name']);
            for ($i = 0; $i < $count; $i++) {
                $f = [
                    'name' => $files['name'][$i] ?? '',
                    'type' => $files['type'][$i] ?? '',
                    'tmp_name' => $files['tmp_name'][$i] ?? '',
                    'error' => $files['error'][$i] ?? UPLOAD_ERR_NO_FILE,
                    'size' => $files['size'][$i] ?? 0,
                ];
                $saved = saveUploadedFile($f, $reportDir, 'attach_');
                if ($saved) {
                    $relativePath = normalizeUploadPublicPath('reports/' . $reportId . '/' . basename((string) $saved['path']));
                    $aIns = $pdo->prepare('INSERT INTO report_attachments(report_id, path, original_name, mime, size_bytes) VALUES(:rid, :path, :name, :mime, :size)');
                    $aIns->execute([
                        'rid' => $reportId,
                        'path' => $relativePath,
                        'name' => $saved['original_name'],
                        'mime' => $saved['mime'],
                        'size' => $saved['size_bytes'],
                    ]);
                }
            }
        }
    }

    $admins = $pdo->query("SELECT id FROM users WHERE role = 'admin'")->fetchAll();
    foreach ($admins as $admin) {
        addNotification((int) $admin['id'], 'info', 'New report submitted', 'A new report requires review: ' . reportDisplayId($reportId), $reportId);
    }

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    jsonResponse(['success' => false, 'error' => 'Unable to submit report'], 500);
}

jsonResponse([
    'success' => true,
    'report_id' => $reportId,
    'id_display' => reportDisplayId($reportId),
]);

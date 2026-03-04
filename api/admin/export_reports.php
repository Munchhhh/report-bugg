<?php

declare(strict_types=1);

require dirname(__DIR__, 2) . '/vendor/autoload.php';
require dirname(__DIR__) . '/bootstrap.php';

use Dompdf\Dompdf;
use Dompdf\Options;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

requireAuth('admin');

$format = strtolower(trim((string) ($_GET['format'] ?? 'xlsx')));
if (!in_array($format, ['xlsx', 'pdf'], true)) {
    jsonResponse(['success' => false, 'error' => 'Invalid export format'], 422);
}

$q = trim((string) ($_GET['q'] ?? ''));
$status = trim((string) ($_GET['status'] ?? ''));
$category = trim((string) ($_GET['category'] ?? ''));
$assignedTo = trim((string) ($_GET['assigned_to'] ?? ''));

$where = [];
$params = [];
if ($q !== '') {
    $where[] = '(r.title LIKE :q OR r.category LIKE :q OR r.status LIKE :q OR r.priority LIKE :q OR u.full_name LIKE :q OR u.email LIKE :q OR CAST(r.id AS CHAR) LIKE :q)';
    $params['q'] = '%' . $q . '%';
}
if ($status !== '') {
    $where[] = 'r.status = :status';
    $params['status'] = $status;
}
if ($category !== '') {
    $where[] = 'r.category = :category';
    $params['category'] = $category;
}
if ($assignedTo !== '') {
    $where[] = 'r.assigned_to = :assigned_to';
    $params['assigned_to'] = $assignedTo;
}

$sql = "SELECT r.id, r.title, r.category, r.priority, r.status, r.privacy, r.location, r.assigned_to, r.created_at,
               u.full_name AS user_name, u.email AS user_email
        FROM reports r
        INNER JOIN users u ON u.id = r.user_id";
if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}
$sql .= ' ORDER BY r.updated_at DESC, r.id DESC';

$stmt = db()->prepare($sql);
foreach ($params as $k => $v) {
    $stmt->bindValue(':' . $k, $v, PDO::PARAM_STR);
}
$stmt->execute();
$rows = $stmt->fetchAll();

$exportRows = array_map(static function (array $r): array {
    return [
        reportDisplayId((int) $r['id']),
        (string) $r['title'],
        (string) $r['category'],
        (string) $r['priority'],
        (string) $r['status'],
        (string) $r['user_name'],
        (string) $r['user_email'],
        (string) ($r['assigned_to'] ?? ''),
        (string) $r['location'],
        date('Y-m-d H:i', strtotime((string) $r['created_at'])),
    ];
}, $rows);

if ($format === 'xlsx') {
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Reports');

    $headers = ['Report ID', 'Title', 'Category', 'Priority', 'Status', 'Submitted By', 'Email', 'Assigned To', 'Location', 'Created At'];
    $sheet->fromArray($headers, null, 'A1');
    if (!empty($exportRows)) {
        $sheet->fromArray($exportRows, null, 'A2');
    }

    foreach (range('A', 'J') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    $filename = 'spusm_ereport_export_' . date('Ymd_His') . '.xlsx';
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="' . $filename . '"');

    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}

$html = '<h2>SPUSM E-Report Export</h2>';
$html .= '<p>Generated: ' . htmlspecialchars(date('Y-m-d H:i:s')) . '</p>';
$html .= '<table border="1" cellspacing="0" cellpadding="6" width="100%">';
$html .= '<thead><tr>';
foreach (['Report ID', 'Title', 'Category', 'Priority', 'Status', 'Submitted By', 'Email', 'Assigned To', 'Location', 'Created At'] as $h) {
    $html .= '<th>' . htmlspecialchars($h) . '</th>';
}
$html .= '</tr></thead><tbody>';

if (empty($exportRows)) {
    $html .= '<tr><td colspan="10">No records found.</td></tr>';
} else {
    foreach ($exportRows as $row) {
        $html .= '<tr>';
        foreach ($row as $cell) {
            $html .= '<td>' . htmlspecialchars((string) $cell) . '</td>';
        }
        $html .= '</tr>';
    }
}

$html .= '</tbody></table>';

$options = new Options();
$options->set('isRemoteEnabled', true);
$dompdf = new Dompdf($options);
$dompdf->loadHtml($html);
$dompdf->setPaper('A4', 'landscape');
$dompdf->render();

$filename = 'spusm_ereport_export_' . date('Ymd_His') . '.pdf';
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
echo $dompdf->output();
exit;

<?php

declare(strict_types=1);

$cfg = [];
$localConfig = __DIR__ . '/config.local.php';
if (is_file($localConfig)) {
    $cfg = require $localConfig;
}

function cfg_value(array $cfg, string $key, string $fallback = ''): string
{
    if (isset($cfg[$key]) && $cfg[$key] !== '') {
        return (string) $cfg[$key];
    }

    $env = getenv($key);
    if ($env !== false && $env !== '') {
        return (string) $env;
    }

    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
        return (string) $_SERVER[$key];
    }

    return $fallback;
}

$dbHost = cfg_value($cfg, 'DB_HOST', 'localhost');
$dbName = cfg_value($cfg, 'DB_NAME', 'ereport2');
$dbUser = cfg_value($cfg, 'DB_USER', 'root');
$dbPass = cfg_value($cfg, 'DB_PASS', '');
$appDebug = strtolower(cfg_value($cfg, 'APP_DEBUG', '0'));
$debugEnabled = in_array($appDebug, ['1', 'true', 'yes', 'on'], true);

$uploadRoot = cfg_value($cfg, 'UPLOAD_ROOT', realpath(__DIR__ . '/../uploads') ?: (__DIR__ . '/../uploads'));

return [
    'db' => [
        'host' => $dbHost,
        'name' => $dbName,
        'user' => $dbUser,
        'pass' => $dbPass,
        'charset' => 'utf8mb4',
    ],
    'upload_root' => $uploadRoot,
    'debug' => $debugEnabled,
];

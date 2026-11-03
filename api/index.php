<?php

// Vercel Serverless Entry Point for Laravel
// Create required temporary writable directories in /tmp
$dirs = [
    '/tmp/views',
    '/tmp/storage/framework/views',
    '/tmp/storage/framework/cache/data',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/logs',
];

foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

// Forward all requests to Laravel's public/index.php
require __DIR__ . '/../public/index.php';

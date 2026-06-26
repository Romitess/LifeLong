<?php
define('CLI_SCRIPT', true);
require('/opt/bitnami/moodle/public/config.php');

$logopath = '/opt/bitnami/moodle/public/theme/lifelong2/pix/logo.png';

if (!file_exists($logopath)) {
    echo "ERROR: logo.png not found at $logopath\n";
    exit(1);
}

$context = context_system::instance();
$fs = get_file_storage();

// Clear existing logo files
$fs->delete_area_files($context->id, 'core_admin', 'logo', 0);
$fs->delete_area_files($context->id, 'core_admin', 'logocompact', 0);

// Upload logo
$fileinfo = [
    'contextid' => $context->id,
    'component' => 'core_admin',
    'filearea'  => 'logo',
    'itemid'    => 0,
    'filepath'  => '/',
    'filename'  => 'logo.png',
];
$fs->create_file_from_pathname($fileinfo, $logopath);
set_config('logo', 'logo.png', 'core_admin');

// Upload compact logo (same file)
$fileinfo2 = [
    'contextid' => $context->id,
    'component' => 'core_admin',
    'filearea'  => 'logocompact',
    'itemid'    => 0,
    'filepath'  => '/',
    'filename'  => 'logo.png',
];
$fs->create_file_from_pathname($fileinfo2, $logopath);
set_config('logocompact', 'logo.png', 'core_admin');

// Purge theme caches
theme_reset_all_caches();
purge_all_caches();

echo "Logo set successfully!\n";

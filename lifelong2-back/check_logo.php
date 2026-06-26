<?php
define('CLI_SCRIPT', true);
require('/opt/bitnami/moodle/public/config.php');

echo 'logo config: ' . var_export(get_config('core_admin', 'logo'), true) . PHP_EOL;
echo 'logocompact config: ' . var_export(get_config('core_admin', 'logocompact'), true) . PHP_EOL;

$ctx = context_system::instance();
$fs = get_file_storage();
$files = $fs->get_area_files($ctx->id, 'core_admin', 'logo', 0);
echo 'logo files in filestore: ' . count($files) . PHP_EOL;
foreach ($files as $f) {
    echo '  - ' . $f->get_filename() . ' (' . $f->get_filesize() . ' bytes)' . PHP_EOL;
}

// Check what Boost navbar template resolves
echo PHP_EOL . 'Checking get_logo_url output:' . PHP_EOL;
$page = new moodle_page();
$output = $page->get_renderer('core');
$url = $output->get_logo_url();
echo 'Logo URL: ' . ($url ? $url->out() : 'FALSE (not set)') . PHP_EOL;

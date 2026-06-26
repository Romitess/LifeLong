<?php
define('CLI_SCRIPT', true);
require('/opt/bitnami/moodle/public/config.php');

$page = new moodle_page();
$output = $page->get_renderer('core');

echo 'should_display_navbar_logo: ';
var_dump($output->should_display_navbar_logo());

echo 'get_compact_logo_url: ';
var_dump($output->get_compact_logo_url());

echo 'get_logo_url: ';
var_dump($output->get_logo_url());

<?php  // Moodle configuration file

unset($CFG);
global $CFG;
$CFG = new stdClass();

$CFG->dbtype    = 'mariadb';
$CFG->dblibrary = 'native';
$CFG->dbhost    = getenv('MOODLE_DATABASE_HOST') ?: 'moodle_mariadb';
$CFG->dbname    = getenv('MOODLE_DATABASE_NAME') ?: 'LLLv.2';
$CFG->dbuser    = getenv('MOODLE_DATABASE_USER');
$CFG->dbpass    = getenv('MOODLE_DATABASE_PASSWORD');
if (!$CFG->dbuser || !$CFG->dbpass) {
    die("CRITICAL: MOODLE_DATABASE_USER or MOODLE_DATABASE_PASSWORD environment variable is not defined.\n");
}
$CFG->prefix    = 'mdl_';
$CFG->dboptions = [
    'dbpersist' => false,
    'dbport' => getenv('MOODLE_DATABASE_PORT_NUMBER') ?: '3306',
    'dbsocket' => false,
    'dbcollation' => 'utf8mb4_general_ci',
];

$CFG->wwwroot   = getenv('MOODLE_SITE_URL') ?: 'http://localhost:8080';
$CFG->dataroot  = '/bitnami/moodle_data';
$CFG->admin     = 'admin';

$CFG->directorypermissions = 0777;
$CFG->allowframembedding = true;
$CFG->cookiesecure = false;
$CFG->theme = getenv('MOODLE_THEME') ?: 'boost';

require_once(__DIR__ . '/lib/setup.php');

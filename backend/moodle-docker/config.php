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
$CFG->dboptions = array (
  'dbpersist' => 0,
  'dbport'    => 3306,
  'dbsocket'  => '',
  'dbcollation' => 'utf8mb4_unicode_ci',
);

$CFG->wwwroot   = getenv('MOODLE_SITE_URL') ?: 'http://localhost:8080';
$CFG->dataroot  = '/bitnami/moodle_data';
$CFG->admin     = 'admin';

$CFG->directorypermissions = 0777;

require_once('/opt/bitnami/moodle/lib/setup.php');

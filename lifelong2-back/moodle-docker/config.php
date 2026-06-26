<?php  // Moodle configuration file

unset($CFG);
global $CFG;
$CFG = new stdClass();

$CFG->dbtype    = 'mariadb';
$CFG->dblibrary = 'native';
$CFG->dbhost    = 'moodle_mariadb';
$CFG->dbname    = 'LLLv.2';
$CFG->dbuser    = 'bn_moodle';
$CFG->dbpass    = 'moodle_password';
$CFG->prefix    = 'mdl_';
$CFG->dboptions = array (
  'dbpersist' => 0,
  'dbport'    => 3306,
  'dbsocket'  => '',
  'dbcollation' => 'utf8mb4_unicode_ci',
);

$CFG->wwwroot   = 'http://localhost:8080';
$CFG->dataroot  = '/bitnami/moodle_data';
$CFG->admin     = 'admin';

$CFG->directorypermissions = 0777;

require_once('/opt/bitnami/moodle/lib/setup.php');

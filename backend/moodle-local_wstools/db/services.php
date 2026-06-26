<?php
defined('MOODLE_INTERNAL') || die();

$functions = [
    'local_wstools_update_course_image' => [
        'classname' => 'local_wstools_external',
        'methodname' => 'update_course_image',
        'classpath' => 'local/wstools/externallib.php',
        'description' => 'Download an image URL and set it as the course overview image.',
        'type' => 'write',
        'capabilities' => 'moodle/course:update',
    ],
    'local_wstools_update_sections' => [
        'classname' => 'local_wstools_external',
        'methodname' => 'update_sections',
        'classpath' => 'local/wstools/externallib.php',
        'description' => 'Rename course sections by section number.',
        'type' => 'write',
        'capabilities' => 'moodle/course:update',
    ],
    'local_wstools_get_current_user_role' => [
        'classname' => 'local_wstools_external',
        'methodname' => 'get_current_user_role',
        'classpath' => 'local/wstools/externallib.php',
        'description' => 'Get the current user display role for the LLL Moodle header.',
        'type' => 'read',
        'ajax' => true,
    ],
    'local_wstools_trim_sections' => [
        'classname' => 'local_wstools_external',
        'methodname' => 'trim_sections',
        'classpath' => 'local/wstools/externallib.php',
        'description' => 'Delete Moodle sections beyond keepnum, keeping sections 0..keepnum.',
        'type' => 'write',
        'capabilities' => 'moodle/course:update',
    ],
    'local_wstools_get_teaching_courses' => [
        'classname' => 'local_wstools_external',
        'methodname' => 'get_teaching_courses',
        'classpath' => 'local/wstools/externallib.php',
        'description' => 'Get courses the current teacher can manage.',
        'type' => 'read',
        'ajax' => true,
    ],
    'local_wstools_get_forum_module' => [
        'classname' => 'local_wstools_external',
        'methodname' => 'get_forum_module',
        'classpath' => 'local/wstools/externallib.php',
        'description' => 'Get forum intro metadata for a course module.',
        'type' => 'read',
    ],
    'local_wstools_delete_empty_sections' => [
        'classname' => 'local_wstools_external',
        'methodname' => 'delete_empty_sections',
        'classpath' => 'local/wstools/externallib.php',
        'description' => 'Delete orphaned empty sections by section number, skip sections with teacher content.',
        'type' => 'write',
        'capabilities' => 'moodle/course:update',
    ],
];

$services = [
    'LLL Moodle tools' => [
        'functions' => [
            'local_wstools_update_course_image',
            'local_wstools_update_sections',
            'local_wstools_get_current_user_role',
            'local_wstools_trim_sections',
            'local_wstools_get_teaching_courses',
            'local_wstools_get_forum_module',
            'local_wstools_delete_empty_sections',
        ],
        'restrictedusers' => 1,
        'enabled' => 1,
    ],
];

<?php
defined('MOODLE_INTERNAL') || die();

function xmldb_local_wstools_upgrade($oldversion) {
    if ($oldversion < 2026052101) {
        // Ensure local_wstools_update_sections is added to the LLL Moodle tools service.
        external_update_descriptions('local_wstools');
        upgrade_plugin_savepoint(true, 2026052101, 'local', 'wstools');
    }
    if ($oldversion < 2026060801) {
        // Ensure local_wstools_get_forum_module is available in the LLL Moodle tools service.
        external_update_descriptions('local_wstools');
        upgrade_plugin_savepoint(true, 2026060801, 'local', 'wstools');
    }
    if ($oldversion < 2026060802) {
        // Refresh local_wstools_get_forum_module after making it a restricted-service read tool.
        external_update_descriptions('local_wstools');
        upgrade_plugin_savepoint(true, 2026060802, 'local', 'wstools');
    }
    if ($oldversion < 2026060803) {
        global $DB;

        external_update_descriptions('local_wstools');

        $service = $DB->get_record('external_services', ['name' => 'TEST']);
        if ($service && !$DB->record_exists('external_services_functions', [
            'externalserviceid' => $service->id,
            'functionname' => 'local_wstools_get_forum_module',
        ])) {
            $record = (object)[
                'externalserviceid' => $service->id,
                'functionname' => 'local_wstools_get_forum_module',
            ];
            $DB->insert_record('external_services_functions', $record);
        }

        upgrade_plugin_savepoint(true, 2026060803, 'local', 'wstools');
    }
    return true;
}

<?php
// Admin settings for local_usertoken.

defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig) {
    $settings = new admin_settingpage('local_usertoken', get_string('pluginname', 'local_usertoken'));
    $ADMIN->add('localplugins', $settings);

    // Shortname of the external service the per-user tokens are issued for
    // (e.g. the service exposing the quiz/assign functions). Configured by an
    // admin so the target service is never client-controllable.
    $settings->add(new admin_setting_configtext(
        'local_usertoken/serviceshortname',
        get_string('serviceshortname', 'local_usertoken'),
        get_string('serviceshortname_desc', 'local_usertoken'),
        '',
        PARAM_ALPHANUMEXT
    ));
}

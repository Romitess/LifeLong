<?php
// Privacy provider for local_usertoken.

namespace local_usertoken\privacy;

defined('MOODLE_INTERNAL') || die();

/**
 * Privacy provider.
 *
 * This plugin stores no personal data of its own. It issues Web Service tokens
 * through Moodle core, and those tokens are stored and disclosed by the core
 * web service subsystem (which has its own privacy provider).
 */
class provider implements \core_privacy\local\metadata\null_provider {

    /**
     * Reason why this plugin stores no personal data.
     *
     * @return string
     */
    public static function get_reason(): string {
        return 'privacy:metadata';
    }
}

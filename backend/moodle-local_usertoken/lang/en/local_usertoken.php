<?php
// Language strings for local_usertoken.

defined('MOODLE_INTERNAL') || die();

$string['pluginname'] = 'LLL per-user token service';

// Capability.
$string['usertoken:generate'] = 'Generate or retrieve a per-user web service token';

// Settings.
$string['serviceshortname'] = 'Target external service shortname';
$string['serviceshortname_desc'] =
    'Shortname of the external service that per-user tokens are issued for ' .
    '(for example the service exposing the quiz/assign functions). The calling ' .
    'service account never receives the target service token for itself — tokens ' .
    'are always minted for the requested target user.';

// Errors.
$string['servicenotconfigured'] =
    'The target external service shortname is not configured. Set it in ' .
    'Site administration > Plugins > Local plugins > LLL per-user token service.';
$string['servicenotfound'] = 'The configured target external service was not found or is disabled.';
$string['usernotfound'] = 'The requested target user does not exist.';
$string['cannotgeneratetoken'] = 'A token cannot be generated for a guest or site administrator account.';
$string['missingidentifier'] = 'Either userid or username must be provided.';

// Privacy.
$string['privacy:metadata'] =
    'The LLL per-user token service plugin does not store any personal data itself; ' .
    'it issues tokens via Moodle core, which are stored by the core web service subsystem.';

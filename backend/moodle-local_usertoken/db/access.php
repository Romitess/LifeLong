<?php
// Capability definitions for local_usertoken.
//
// `local/usertoken:generate` is intentionally NOT granted to any archetype.
// A site administrator must assign it to a dedicated backend service-account
// role only. This is the single gate that authorises minting per-user tokens,
// so it must never be handed to learner/teacher/manager roles.

defined('MOODLE_INTERNAL') || die();

$capabilities = [
    'local/usertoken:generate' => [
        'riskbitmask' => RISK_PERSONAL | RISK_DATALOSS,
        'captype' => 'write',
        'contextlevel' => CONTEXT_SYSTEM,
        // No archetypes: nobody gets this by default; assign explicitly to the
        // backend service-account role.
        'archetypes' => [],
    ],
];

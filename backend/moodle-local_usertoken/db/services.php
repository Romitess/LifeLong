<?php
// Web service + external function registration for local_usertoken.

defined('MOODLE_INTERNAL') || die();

$functions = [
    'local_usertoken_get_user_token' => [
        'classname' => 'local_usertoken\external',
        'methodname' => 'get_user_token',
        // Autoloaded class — no classpath needed.
        'description' => 'Securely generate or retrieve a per-user Web Service token '
            . 'for a target user without their password. Caller must hold '
            . 'local/usertoken:generate at system context.',
        'type' => 'write',
        'capabilities' => 'local/usertoken:generate',
        'ajax' => false,
    ],
];

// Service the BACKEND SERVICE ACCOUNT uses to call get_user_token.
// restrictedusers = 1: only explicitly authorised users (the service account)
// may obtain a token for this service.
$services = [
    'LLL user token service' => [
        'shortname' => 'lll_usertoken',
        'functions' => [
            'local_usertoken_get_user_token',
        ],
        'restrictedusers' => 1,
        'enabled' => 1,
    ],
];

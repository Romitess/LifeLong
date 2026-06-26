<?php
// This file is part of the local_usertoken plugin for Moodle.
//
// Issues per-user Web Service tokens for the LLL platform without requiring
// the user's password, replacing a temporary direct external_tokens DB write
// in the LLL backend with a capability-protected Web Service.

defined('MOODLE_INTERNAL') || die();

$plugin->component = 'local_usertoken';
$plugin->version = 2026060500;       // YYYYMMDDXX.
$plugin->requires = 2025041400;      // Moodle 5.0+ (matches local_wstools).
$plugin->maturity = MATURITY_ALPHA;
$plugin->release = '0.1.0';

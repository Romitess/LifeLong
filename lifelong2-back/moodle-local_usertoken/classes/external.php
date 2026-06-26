<?php
// External Web Service for local_usertoken.

namespace local_usertoken;

defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_value;
use core_external\external_single_structure;
use context_system;
use moodle_exception;
use invalid_parameter_exception;

/**
 * Per-user token external service.
 *
 * SECURITY MODEL (read before changing):
 *  - This function lets a trusted backend service account obtain a Web Service
 *    token *for another user* without that user's password. That is a privileged
 *    operation, so it is gated by the `local/usertoken:generate` capability which
 *    is granted to NO role by default (see db/access.php) and must be assigned
 *    only to a dedicated service-account role at system context.
 *  - It always runs in the system context and re-validates the caller's context
 *    and capability on every call (defence in depth — the WS layer also checks
 *    the function capability, this is the second gate).
 *  - The target user is resolved with Moodle DML (`$DB->get_record`, parameterised)
 *    — never with raw/concatenated SQL — preventing SQL injection. Guest and site
 *    administrator accounts are refused to limit IDOR blast radius.
 *  - The actual token is created with the Moodle core token API
 *    (`\core_external\util::generate_token`), so all core invariants (hashing,
 *    service authorisation, event logging) are preserved. Existing permanent
 *    tokens are reused to keep the operation idempotent.
 *
 * This replaces a temporary direct `external_tokens` INSERT in the LLL backend.
 */
class external extends external_api {

    /**
     * Parameter definition for {@see get_user_token()}.
     *
     * @return external_function_parameters
     */
    public static function get_user_token_parameters(): external_function_parameters {
        return new external_function_parameters([
            'userid' => new external_value(
                PARAM_INT,
                'Target Moodle user id (use this OR username).',
                VALUE_DEFAULT,
                0
            ),
            'username' => new external_value(
                PARAM_USERNAME,
                'Target Moodle username (used when userid is 0).',
                VALUE_DEFAULT,
                ''
            ),
        ]);
    }

    /**
     * Generate or retrieve a per-user Web Service token for the target user.
     *
     * @param int $userid Target user id (0 to look up by username).
     * @param string $username Target username (used when $userid is 0).
     * @return array{token: string}
     * @throws moodle_exception|invalid_parameter_exception
     */
    public static function get_user_token(int $userid = 0, string $username = ''): array {
        global $DB, $CFG;
        require_once($CFG->libdir . '/externallib.php'); // EXTERNAL_TOKEN_PERMANENT + legacy fallback.

        // 1. Strict input validation.
        $params = self::validate_parameters(self::get_user_token_parameters(), [
            'userid' => $userid,
            'username' => $username,
        ]);

        // 2. Context + capability gate (defence in depth).
        $context = context_system::instance();
        self::validate_context($context);
        require_capability('local/usertoken:generate', $context);

        // 3. Resolve the target user safely (parameterised DML, reject deleted).
        if (!empty($params['userid'])) {
            $user = $DB->get_record('user',
                ['id' => $params['userid'], 'deleted' => 0], '*', MUST_EXIST);
        } else if ($params['username'] !== '') {
            $user = $DB->get_record('user',
                ['username' => \core_text::strtolower($params['username']),
                 'mnethostid' => $CFG->mnet_localhost_id,
                 'deleted' => 0], '*', MUST_EXIST);
        } else {
            throw new invalid_parameter_exception(get_string('missingidentifier', 'local_usertoken'));
        }

        // Refuse privileged / non-real accounts.
        if (isguestuser($user) || is_siteadmin($user)) {
            throw new moodle_exception('cannotgeneratetoken', 'local_usertoken');
        }

        // 4. Resolve the configured target external service (admin-controlled, not client input).
        $shortname = get_config('local_usertoken', 'serviceshortname');
        if (empty($shortname)) {
            throw new moodle_exception('servicenotconfigured', 'local_usertoken');
        }
        $service = $DB->get_record('external_services',
            ['shortname' => $shortname, 'enabled' => 1], '*', IGNORE_MISSING);
        if (!$service) {
            throw new moodle_exception('servicenotfound', 'local_usertoken');
        }

        // 5. Idempotent: reuse an existing permanent token, otherwise mint via core API.
        $tokentype = defined('EXTERNAL_TOKEN_PERMANENT') ? EXTERNAL_TOKEN_PERMANENT : 0;
        $existing = $DB->get_record('external_tokens', [
            'userid' => $user->id,
            'externalserviceid' => $service->id,
            'tokentype' => $tokentype,
        ], 'token', IGNORE_MULTIPLE);

        if ($existing) {
            $token = $existing->token;
        } else if (method_exists('\core_external\util', 'generate_token')) {
            // Moodle 4.3+ namespaced core API (preferred).
            $token = \core_external\util::generate_token(
                $tokentype, $service, $user->id, $context);
        } else {
            // Legacy fallback for older cores.
            $token = external_generate_token($tokentype, $service, $user->id, $context);
        }

        return ['token' => $token];
    }

    /**
     * Return definition for {@see get_user_token()}.
     *
     * @return external_single_structure
     */
    public static function get_user_token_returns(): external_single_structure {
        return new external_single_structure([
            'token' => new external_value(PARAM_ALPHANUM, 'The per-user Web Service token.'),
        ]);
    }
}

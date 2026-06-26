# local_usertoken — LLL per-user token service (Moodle local plugin)

Production-ready replacement for the temporary **direct `external_tokens` DB write**
in the LLL backend (`MoodleUserTokenService`). Exposes one capability-protected Web
Service function that mints/retrieves a per-user WS token **without the user's
password**, using Moodle core APIs only.

## Why
Native quiz/assign must act **as the student** (attempts/submissions are per-user
runtime data). Moodle has no core WS to create a token for another user without a
password, so the backend previously inserted into `external_tokens` directly. This
plugin moves that privileged operation behind a Moodle WS with proper capability,
context, validation, and core token generation — so it can pass security review.

## Function
`local_usertoken_get_user_token(userid?: int, username?: string) -> { token: string }`
- Caller must hold **`local/usertoken:generate`** at system context.
- Resolves the target user with parameterised DML (`$DB->get_record`), rejects
  deleted/guest/admin accounts.
- Mints via core `\core_external\util::generate_token` (legacy fallback included),
  reusing an existing permanent token (idempotent).
- The **target service** (which service the issued token is for, e.g. the
  quiz/assign service) is an admin setting `local_usertoken | serviceshortname`,
  never client input.

## Files
- `version.php` · `lang/en/local_usertoken.php`
- `db/access.php` — capability `local/usertoken:generate` (granted to **no** role by default)
- `db/services.php` — function + `lll_usertoken` service (`restrictedusers=1`)
- `settings.php` — `serviceshortname` target-service setting
- `classes/external.php` — the external function (security model in its PHPDoc)
- `classes/privacy/provider.php` — null provider (stores no personal data itself)

## Install
1. Copy this folder into the Moodle codebase as `local/usertoken`:
   ```bash
   docker cp lifelong2-back/moodle-local_usertoken \
     moodle_web:/opt/bitnami/moodle/local/usertoken
   ```
2. Run the upgrade (installs capability + service):
   ```bash
   docker exec moodle_web /opt/bitnami/php/bin/php \
     /opt/bitnami/moodle/admin/cli/upgrade.php --non-interactive
   ```
3. **Config** (Site admin):
   - Set `serviceshortname` to the shortname of the quiz/assign service
     (give the existing "TEST" service a shortname, or use the dedicated one).
   - Create a backend **service-account** Moodle user.
   - Create a role with `local/usertoken:generate` at system context and assign
     it to the service account; add the account to the `lll_usertoken` service’s
     authorised users; issue that account a token on `lll_usertoken`.

## Backend integration (next step)
`MoodleUserTokenService.getTokenForMoodleUserId()` will call
`local_usertoken_get_user_token` via `callMoodleApi(..., serviceAccountToken)`
instead of the direct DB pool. The `mysql2` Moodle-DB path is kept only as a
clearly-flagged fallback and is removed for production once the plugin is live.

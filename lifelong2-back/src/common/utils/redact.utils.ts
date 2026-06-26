/**
 * Redacts sensitive URLSearchParams keys before logging.
 * Matches exact key names OR keys whose name contains any of the sensitive strings (case-insensitive).
 * Example: sensitiveKeys=['wstoken','password'] will redact 'wstoken' and 'users[0][password]'.
 */
export function redactParams(params: URLSearchParams, sensitiveKeys: string[]): string {
  const parts: string[] = [];
  params.forEach((value, key) => {
    const isSensitive = sensitiveKeys.some(
      (s) => key === s || key.toLowerCase().includes(s.toLowerCase()),
    );
    parts.push(
      `${encodeURIComponent(key)}=${isSensitive ? '[REDACTED]' : encodeURIComponent(value)}`,
    );
  });
  return parts.join('&');
}

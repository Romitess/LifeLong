/**
 * Returns first 3 chars of a citizen ID followed by asterisks.
 * Thai national ID is 13 digits; other formats receive the same treatment.
 * Example: "1234567890123" → "123**********"
 */
export function maskCitizenId(id: string): string {
  if (!id) return '[empty]';
  return id.slice(0, 3) + '*'.repeat(Math.max(id.length - 3, 0));
}

/**
 * Masks the local-part of an email address.
 * Example: "example@domain.com" → "exa*****@domain.com"
 */
export function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return '***';
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex);
  const visible = local.slice(0, Math.min(3, local.length));
  return visible + '*'.repeat(Math.max(local.length - visible.length, 5)) + domain;
}

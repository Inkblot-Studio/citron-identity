import { allowedRedirectOrigins } from '@/lib/deploy-tier';

/**
 * Cross-domain redirect flow for IS (Identity Service).
 *
 * Apps (Domain A, C, etc.) send users to auth with:
 *   ?redirect_uri=https://app.example.com/callback&state=optional_csrf
 *
 * After login, auth redirects to that URL with a token/session.
 * Dashboard is only used when no redirect_uri (localhost/testing).
 */

const ALLOWED_ORIGINS: string[] = allowedRedirectOrigins();

/** localhost is always allowed for dev/testing */
function isLocalhostOrigin(origin: string): boolean {
  return (
    origin.startsWith('http://localhost') ||
    origin.startsWith('http://127.0.0.1') ||
    origin.startsWith('https://localhost') ||
    origin.startsWith('https://127.0.0.1')
  );
}

/**
 * Validate that a redirect URI is allowed (prevents open redirect).
 * Returns the validated URL or null if invalid.
 */
export function validateRedirectUri(uri: string | null | undefined): string | null {
  if (!uri || typeof uri !== 'string') return null;
  try {
    const url = new URL(uri);
    const origin = url.origin.toLowerCase();
    if (isLocalhostOrigin(origin)) return uri;
    if (ALLOWED_ORIGINS.some((o) => origin === o || origin.startsWith(o + ':'))) return uri;
    return null;
  } catch {
    return null;
  }
}

/**
 * Get redirect_uri from URL search params.
 */
export function getRedirectUriFromSearch(search: string): string | null {
  const params = new URLSearchParams(search);
  const uri = params.get('redirect_uri') ?? params.get('return_url') ?? params.get('returnUrl');
  return validateRedirectUri(uri);
}

const REDIRECT_URI_KEY = 'is_redirect_uri';
const REMEMBER_ME_KEY = 'is_remember_me';

/** Persist redirect_uri across auth flow (e.g. through MFA step). */
export function setPendingRedirectUri(uri: string): void {
  sessionStorage.setItem(REDIRECT_URI_KEY, uri);
}

export function getPendingRedirectUri(): string | null {
  return sessionStorage.getItem(REDIRECT_URI_KEY);
}

export function clearPendingRedirectUri(): void {
  sessionStorage.removeItem(REDIRECT_URI_KEY);
}

/** Persist "remember me" across the MFA step (password → OTP). */
export function setRememberMe(value: boolean): void {
  if (value) sessionStorage.setItem(REMEMBER_ME_KEY, '1');
  else sessionStorage.removeItem(REMEMBER_ME_KEY);
}

export function getRememberMe(): boolean {
  return sessionStorage.getItem(REMEMBER_ME_KEY) === '1';
}

export function clearRememberMe(): void {
  sessionStorage.removeItem(REMEMBER_ME_KEY);
}

/**
 * Build the post-login redirect URL. The token travels in the URL fragment so
 * it never reaches server logs or Referer headers.
 */
export function buildRedirectUrl(
  redirectUri: string,
  token?: string,
  options?: { rememberMe?: boolean }
): string {
  try {
    const url = new URL(redirectUri);
    const parts: string[] = [];
    if (token) parts.push(`token=${encodeURIComponent(token)}`);
    if (options?.rememberMe) parts.push('remember=1');
    if (parts.length > 0) url.hash = parts.join('&');
    return url.toString();
  } catch {
    return redirectUri;
  }
}

/**
 * `?prompt=login` — the relying app demands a fresh sign-in (e.g. its token
 * exchange failed with a stale session), so skip the auto-redirect for an
 * already-authenticated user and show the login form.
 */
export function shouldForceLogin(search: string): boolean {
  return new URLSearchParams(search).get('prompt') === 'login';
}

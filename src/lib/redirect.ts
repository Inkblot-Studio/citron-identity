/**
 * Cross-domain redirect flow for IS (Identity Service).
 *
 * Apps (Domain A, C, etc.) send users to auth with:
 *   ?redirect_uri=https://app.example.com/callback&state=optional_csrf
 *
 * After login, auth redirects to that URL with a token/session.
 * Dashboard is only used when no redirect_uri (localhost/testing).
 */

const ALLOWED_ORIGINS_ENV = import.meta.env.VITE_ALLOWED_REDIRECT_ORIGINS ?? '';
const ALLOWED_ORIGINS: string[] = ALLOWED_ORIGINS_ENV
  ? (ALLOWED_ORIGINS_ENV as string).split(',').map((o) => o.trim().toLowerCase()).filter(Boolean)
  : [];

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

/**
 * Build the post-login redirect URL. The token travels in the URL fragment so
 * it never reaches server logs or Referer headers.
 */
export function buildRedirectUrl(redirectUri: string, token?: string): string {
  try {
    const url = new URL(redirectUri);
    if (token) url.hash = `token=${encodeURIComponent(token)}`;
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

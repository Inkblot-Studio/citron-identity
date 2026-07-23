import {
  buildRedirectUrl,
  clearPendingRedirectUri,
  resolveExternalPostLoginUrl,
} from '@/lib/redirect';
import { getAccessToken } from '@/lib/token-storage';

/**
 * Where to send the user after a successful login / MFA / email verify.
 * Prefers OAuth-style redirect_uri, then VITE_DEFAULT_POST_LOGIN_URL, then
 * internal returnUrl, then dashboard.
 */
export function resolvePostAuthRedirect(search: string): {
  type: 'external' | 'internal';
  url: string;
} {
  const external = resolveExternalPostLoginUrl();
  if (external) {
    clearPendingRedirectUri();
    return {
      type: 'external',
      url: buildRedirectUrl(external, getAccessToken() ?? undefined),
    };
  }

  const params = new URLSearchParams(search);
  const returnUrl = params.get('returnUrl');
  if (returnUrl) {
    try {
      const decoded = decodeURIComponent(returnUrl);
      if (decoded.startsWith('/') && !decoded.startsWith('//')) {
        return { type: 'internal', url: decoded };
      }
    } catch {
      /* ignore malformed */
    }
  }

  return { type: 'internal', url: '/dashboard' };
}

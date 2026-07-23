import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import {
  clearPendingRedirectUri,
  getRedirectUriFromSearch,
  validateRedirectUri,
  DEFAULT_POST_LOGIN_URL,
} from '@/lib/redirect';

/**
 * Clears the Identity portal session and sends the user back to the relying
 * app — WITHOUT attaching a #token= (that would immediately sign them back in).
 */
export const LogoutPage: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuthStore();

  useEffect(() => {
    logout();
    clearPendingRedirectUri();

    const fromQuery = getRedirectUriFromSearch(location.search);
    // Prefer an explicit redirect_uri; otherwise send them to the default app
    // root (strip /auth/callback so we don't bounce through SSO again).
    let dest = fromQuery;
    if (!dest && DEFAULT_POST_LOGIN_URL) {
      try {
        const u = new URL(DEFAULT_POST_LOGIN_URL);
        dest = validateRedirectUri(`${u.origin}/`);
      } catch {
        dest = null;
      }
    }

    window.location.replace(dest || '/login');
  }, [logout, location.search]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Signing out…
      </p>
    </main>
  );
};

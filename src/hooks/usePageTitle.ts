import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getLegalDoc } from '@/lib/legal';

const APP_NAME = 'Citron Identity';

const ROUTE_TITLES: [match: (path: string) => boolean, title: string][] = [
  [(p) => p === '/' || p === '/login', 'Sign in'],
  [(p) => p === '/signup', 'Create account'],
  [(p) => p === '/forgot-password', 'Reset password'],
  [(p) => p.startsWith('/reset-password'), 'New password'],
  [(p) => p.startsWith('/verify-email'), 'Verify email'],
  [(p) => p === '/mfa/setup', 'Two-factor setup'],
  [(p) => p === '/mfa/verify', 'Two-factor authentication'],
  [(p) => p === '/dashboard', 'Dashboard'],
];

function titleForPath(pathname: string): string {
  if (pathname.startsWith('/legal/')) {
    const slug = pathname.split('/')[2];
    const doc = slug ? getLegalDoc(slug) : undefined;
    if (doc) return `${APP_NAME} — ${doc.title}`;
    return `${APP_NAME} — Legal`;
  }

  for (const [match, title] of ROUTE_TITLES) {
    if (match(pathname)) return `${APP_NAME} — ${title}`;
  }
  return `${APP_NAME} — Sign in`;
}

/**
 * Keeps document.title in sync with the active auth route.
 */
export function usePageTitle(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = titleForPath(pathname);
  }, [pathname]);
}

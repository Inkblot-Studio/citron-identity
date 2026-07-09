import type { AccountCheck, User } from '@/types/auth';
import type { Tenant } from '@/types/tenant';
import {
  mockLogin,
  mockSignup,
  mockSendMagicLink,
  mockVerifyMagicLink,
  mockSendPasswordReset,
  mockResetPassword,
  mockVerifyEmail,
  mockSetupMFA,
  mockConfirmMFA,
  mockVerifyMFA,
  mockGetTenantsForUser,
  mockCheckUsernameAvailability,
  mockCheckAccount,
} from '@/mocks/auth';
import {
  ACCESS_TOKEN_STORAGE_KEY,
  clearTokens,
  getAccessToken,
  setTokens,
} from '@/lib/token-storage';

import { resolveIdentityApiUrl } from '@/lib/deploy-tier';

export { ACCESS_TOKEN_STORAGE_KEY };

const useMock =
  import.meta.env.VITE_USE_MOCK_AUTH !== 'false' || !resolveIdentityApiUrl();

const MFA_TICKET_KEY = 'is_mfa_ticket';

function apiBaseUrl(): string {
  return resolveIdentityApiUrl();
}

export function setMfaTicket(ticket: string): void {
  sessionStorage.setItem(MFA_TICKET_KEY, ticket);
}

export function getMfaTicket(): string | null {
  return sessionStorage.getItem(MFA_TICKET_KEY);
}

export function clearMfaTicket(): void {
  sessionStorage.removeItem(MFA_TICKET_KEY);
}

export interface AuthApi {
  checkAccount(email: string): Promise<AccountCheck>;
  login(email: string, password: string, tenantId: string): Promise<{ user: User; requiresMfa?: boolean }>;
  signup(payload: {
    email: string;
    password: string;
    name?: string;
    username: string;
    tenantId: string;
  }): Promise<{ user: User; verificationToken: string; requiresEmailVerification?: boolean }>;
  checkUsernameAvailability(username: string): Promise<boolean>;
  sendMagicLink(email: string, tenantId: string): Promise<void>;
  verifyMagicLink(token: string): Promise<User>;
  sendPasswordReset(email: string, tenantId: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  verifyEmail(token: string): Promise<User>;
  setupMFA(userId: string): Promise<{ secret: string; otpAuthUri: string }>;
  confirmMFA(userId: string, code: string): Promise<void>;
  verifyMFA(code: string): Promise<User>;
  disableMFA(password: string): Promise<void>;
  getTenantsForUser(userId: string): Promise<Tenant[]>;
  getSession(): Promise<User | null>;
}

// citron-identity-api (POST /api/auth/login, /api/auth/register, GET /api/auth/me)
interface IdentityAuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
}

interface IdentityLoginResponse {
  mfaRequired: boolean;
  mfaTicket: string | null;
  authentication: IdentityAuthResponse | null;
}

interface IdentityRegisterResponse {
  userId: string;
  emailVerificationRequired: boolean;
  message: string;
}

interface IdentityMeResponse {
  userId: string;
  email: string;
  displayName?: string;
  emailVerified?: boolean;
  mfaTotpEnabled?: boolean;
}

interface TotpEnrollmentStartResponse {
  secretBase32: string;
  otpAuthUri: string;
}

async function readProblemMessage(res: Response, fallback: string): Promise<string> {
  const problem = (await res.json().catch(() => null)) as { detail?: string; title?: string } | null;
  return problem?.detail ?? problem?.title ?? fallback;
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// POST /api/auth/check — email-first sign-in routing (password vs signup step).
async function realCheckAccount(email: string): Promise<AccountCheck> {
  const res = await fetch(`${apiBaseUrl()}/api/auth/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error(await readProblemMessage(res, 'Could not look up this email'));
  }

  const data = (await res.json()) as { exists: boolean; displayName: string | null; hasPassword: boolean };
  // identity-api has no SSO-only accounts surfaced here yet — provider stays null.
  return { exists: data.exists, name: data.displayName ?? undefined, provider: null };
}

function mapMeToUser(data: IdentityMeResponse, tenantId: string): User {
  return {
    id: data.userId,
    email: data.email,
    name: data.displayName,
    isAuthenticated: true,
    isEmailVerified: data.emailVerified ?? true,
    twoFactorEnabled: data.mfaTotpEnabled ?? false,
    createdAt: new Date().toISOString(),
    tenants: [{ tenantId, role: 'member' }],
  };
}

function mapAuthToUser(auth: IdentityAuthResponse, email: string, tenantId: string): User {
  return {
    id: auth.userId,
    email,
    isAuthenticated: true,
    isEmailVerified: true,
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    tenants: [{ tenantId, role: 'member' }],
  };
}

// citron-identity-api has no tenant concept — tenantId is kept for signature
// compatibility with the mock API and callers, and only stored on the client.
async function realLogin(
  email: string,
  password: string,
  tenantId: string
): Promise<{ user: User; requiresMfa?: boolean }> {
  const res = await fetch(`${apiBaseUrl()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(await readProblemMessage(res, 'Invalid email or password'));
  }

  const data = (await res.json()) as IdentityLoginResponse;

  if (data.mfaRequired) {
    if (data.mfaTicket) setMfaTicket(data.mfaTicket);
    return {
      user: {
        id: '',
        email,
        isAuthenticated: false,
        isEmailVerified: true,
        twoFactorEnabled: true,
        createdAt: new Date().toISOString(),
        tenants: [{ tenantId, role: 'member' }],
      },
      requiresMfa: true,
    };
  }

  const auth = data.authentication as IdentityAuthResponse;
  setTokens(auth.accessToken);

  return {
    user: mapAuthToUser(auth, email, tenantId),
  };
}

async function realSignup(payload: {
  email: string;
  password: string;
  name?: string;
  username: string;
  tenantId: string;
}): Promise<{ user: User; verificationToken: string; requiresEmailVerification?: boolean }> {
  const res = await fetch(`${apiBaseUrl()}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      displayName: payload.name || payload.username,
    }),
  });

  if (!res.ok) {
    if (res.status === 409) {
      throw new Error('An account with this email already exists');
    }
    throw new Error(await readProblemMessage(res, 'Signup failed'));
  }

  const data = (await res.json()) as IdentityRegisterResponse;

  return {
    user: {
      id: data.userId,
      email: payload.email,
      name: payload.name ?? '',
      username: payload.username,
      isAuthenticated: false,
      isEmailVerified: !data.emailVerificationRequired,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      tenants: [{ tenantId: payload.tenantId, role: 'member' }],
    },
    verificationToken: '',
    requiresEmailVerification: data.emailVerificationRequired,
  };
}

async function realGetSession(): Promise<User | null> {
  const token = getAccessToken();
  if (!token) return null;

  const res = await fetch(`${apiBaseUrl()}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = (await res.json()) as IdentityMeResponse;
  return mapMeToUser(data, 'citron');
}

async function realVerifyMFA(code: string): Promise<User> {
  const mfaTicket = getMfaTicket();
  if (!mfaTicket) {
    throw new Error('MFA session expired. Sign in with your password again.');
  }

  const res = await fetch(`${apiBaseUrl()}/api/auth/login/mfa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mfaTicket, code }),
  });

  if (!res.ok) {
    throw new Error(await readProblemMessage(res, 'Invalid code'));
  }

  const auth = (await res.json()) as IdentityAuthResponse;
  setTokens(auth.accessToken);
  clearMfaTicket();

  const session = await realGetSession();
  if (session) return session;

  return {
    id: auth.userId,
    email: '',
    isAuthenticated: true,
    isEmailVerified: true,
    twoFactorEnabled: true,
    createdAt: new Date().toISOString(),
    tenants: [{ tenantId: 'citron', role: 'member' }],
  };
}

async function realSetupMFA(_userId: string): Promise<{ secret: string; otpAuthUri: string }> {
  const res = await fetch(`${apiBaseUrl()}/api/mfa/totp/enrollment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error(await readProblemMessage(res, 'Failed to setup MFA'));
  }

  const data = (await res.json()) as TotpEnrollmentStartResponse;
  return { secret: data.secretBase32, otpAuthUri: data.otpAuthUri };
}

async function realConfirmMFA(_userId: string, code: string): Promise<void> {
  const res = await fetch(`${apiBaseUrl()}/api/mfa/totp/enrollment/confirmation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    throw new Error(await readProblemMessage(res, 'Invalid code'));
  }
}

async function realDisableMFA(password: string): Promise<void> {
  const res = await fetch(`${apiBaseUrl()}/api/mfa/totp/disable`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ password }),
  });

  if (!res.ok) {
    throw new Error(await readProblemMessage(res, 'Failed to disable MFA'));
  }
}

// Real auth when VITE_USE_MOCK_AUTH=false AND VITE_AUTH_API_URL is set; mocks
// otherwise (UI-only dev). Magic link and tenant listing stay mocked.
export const authApi: AuthApi = useMock
  ? {
      checkAccount: mockCheckAccount,
      login: mockLogin,
      signup: mockSignup,
      checkUsernameAvailability: mockCheckUsernameAvailability,
      sendMagicLink: mockSendMagicLink,
      verifyMagicLink: mockVerifyMagicLink,
      sendPasswordReset: mockSendPasswordReset,
      resetPassword: mockResetPassword,
      verifyEmail: mockVerifyEmail,
      setupMFA: mockSetupMFA,
      confirmMFA: mockConfirmMFA,
      verifyMFA: mockVerifyMFA,
      disableMFA: async () => {},
      getTenantsForUser: mockGetTenantsForUser,
      getSession: async () => null,
    }
  : {
      checkAccount: realCheckAccount,
      login: realLogin,
      signup: realSignup,
      checkUsernameAvailability: mockCheckUsernameAvailability,
      sendMagicLink: mockSendMagicLink,
      verifyMagicLink: mockVerifyMagicLink,
      sendPasswordReset: mockSendPasswordReset,
      resetPassword: mockResetPassword,
      verifyEmail: mockVerifyEmail,
      setupMFA: realSetupMFA,
      confirmMFA: realConfirmMFA,
      verifyMFA: realVerifyMFA,
      disableMFA: realDisableMFA,
      getTenantsForUser: mockGetTenantsForUser,
      getSession: realGetSession,
    };

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

const useMock =
  import.meta.env.VITE_USE_MOCK_AUTH !== 'false' || !resolveIdentityApiUrl();

function apiBaseUrl(): string {
  return resolveIdentityApiUrl();
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
  setupMFA(userId: string): Promise<{ secret: string; qrDataUrl: string }>;
  confirmMFA(userId: string, code: string): Promise<void>;
  verifyMFA(userId: string, code: string): Promise<boolean>;
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
  mfaEnabled?: boolean;
}

async function readProblemMessage(res: Response, fallback: string): Promise<string> {
  const problem = (await res.json().catch(() => null)) as { detail?: string; title?: string } | null;
  return problem?.detail ?? problem?.title ?? fallback;
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
    twoFactorEnabled: data.mfaEnabled ?? false,
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
    user: {
      id: auth.userId,
      email,
      isAuthenticated: true,
      isEmailVerified: true,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      tenants: [{ tenantId, role: 'member' }],
    },
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

// Real auth when VITE_USE_MOCK_AUTH=false AND VITE_AUTH_API_URL is set; mocks
// otherwise (UI-only dev). Magic link, MFA setup/verify-by-userId, and tenant
// listing stay mocked — citron-identity-api doesn't support tenants or magic
// links, and completes MFA via a ticket, not a userId.
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
      getTenantsForUser: mockGetTenantsForUser,
      getSession: async () => null,
    }
  : {
      // Email-first routing hits the real POST /api/auth/check.
      checkAccount: realCheckAccount,
      login: realLogin,
      signup: realSignup,
      checkUsernameAvailability: mockCheckUsernameAvailability,
      sendMagicLink: mockSendMagicLink,
      verifyMagicLink: mockVerifyMagicLink,
      sendPasswordReset: mockSendPasswordReset,
      resetPassword: mockResetPassword,
      verifyEmail: mockVerifyEmail,
      setupMFA: mockSetupMFA,
      confirmMFA: mockConfirmMFA,
      verifyMFA: mockVerifyMFA,
      getTenantsForUser: mockGetTenantsForUser,
      getSession: realGetSession,
    };

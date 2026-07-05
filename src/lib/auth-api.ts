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

export const ACCESS_TOKEN_STORAGE_KEY = 'inkid_access_token';

const API_BASE_URL = (import.meta.env.VITE_AUTH_API_URL as string | undefined)?.replace(/\/$/, '');

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
}

// Shapes returned by citron-identity-api (POST /api/auth/login, /api/auth/register).
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

async function readProblemMessage(res: Response, fallback: string): Promise<string> {
  const problem = await res.json().catch(() => null) as { detail?: string; title?: string } | null;
  return problem?.detail ?? problem?.title ?? fallback;
}

// citron-identity-api has no tenant concept — tenantId is kept for signature
// compatibility with the mock API and callers, and only stored on the client.
async function realLogin(
  email: string,
  password: string,
  tenantId: string
): Promise<{ user: User; requiresMfa?: boolean }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(await readProblemMessage(res, 'Invalid email or password'));
  }

  const data = (await res.json()) as IdentityLoginResponse;

  if (data.mfaRequired) {
    // citron-identity-api completes MFA via POST /api/auth/login/mfa + mfaTicket,
    // not by userId — full MFA-during-login wiring is out of scope for now.
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
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, auth.accessToken);

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
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
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

// Real login/signup when VITE_AUTH_API_URL is set; mocks otherwise (e.g. UI-only dev).
// Magic link, MFA setup/verify-by-userId, and tenant listing stay mocked — citron-identity-api
// doesn't support tenants or magic links, and completes MFA via a ticket, not a userId.
export const authApi: AuthApi = {
  // Email-first lookup is a client UX concern; always mocked until the backend
  // exposes a dedicated endpoint (safe to override in real integration).
  checkAccount: mockCheckAccount,
  login: API_BASE_URL ? realLogin : mockLogin,
  signup: API_BASE_URL ? realSignup : mockSignup,
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
};

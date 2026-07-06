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

export { ACCESS_TOKEN_STORAGE_KEY };

const API_BASE_URL = (import.meta.env.VITE_AUTH_API_URL as string | undefined)?.replace(/\/$/, '');

const useMock =
  import.meta.env.VITE_USE_MOCK_AUTH !== 'false' || !import.meta.env.VITE_AUTH_API_URL;

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

async function realGetSession(): Promise<User | null> {
  const token = getAccessToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = (await res.json()) as IdentityMeResponse;
  return mapMeToUser(data, 'citron');
}

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
      checkAccount: mockCheckAccount,
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

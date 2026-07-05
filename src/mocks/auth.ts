import type { AccountCheck, User } from '@/types/auth';
import type { Tenant } from '@/types/tenant';
import { findUserByEmail, findUserById, findUserByUsername, MOCK_USERS, MOCK_BACKUP_CODES } from './users';
import { getTenantById } from './tenants';

const MOCK_DELAY_MS = 800;

// In-memory storage for magic link and reset tokens (mock)
const pendingMagicLinkTokens = new Map<string, { email: string; expiresAt: number }>();
const pendingResetTokens = new Map<string, { email: string; expiresAt: number }>();
const pendingEmailVerifyTokens = new Map<string, { userId: string; expiresAt: number }>();
const mfaSecrets = new Map<string, string>();
const mockSignedUpUsers = new Map<string, User & { password: string }>();

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateToken(): string {
  return `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function findUserByEmailOrSignedUp(email: string): (User & { password: string }) | undefined {
  const fromMock = findUserByEmail(email);
  if (fromMock) return fromMock;
  return Array.from(mockSignedUpUsers.values()).find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
}

function isUsernameTaken(username: string): boolean {
  if (!username?.trim()) return false;
  const lower = username.trim().toLowerCase();
  if (findUserByUsername(username)) return true;
  return Array.from(mockSignedUpUsers.values()).some(
    (u) => u.username?.toLowerCase() === lower
  );
}

export async function mockCheckUsernameAvailability(username: string): Promise<boolean> {
  await delay(300);
  return !isUsernameTaken(username);
}

export async function mockCheckAccount(email: string): Promise<AccountCheck> {
  await delay(450);
  const user = findUserByEmailOrSignedUp(email);
  if (!user) return { exists: false };
  return {
    exists: true,
    name: user.name?.trim().split(/\s+/)[0] || undefined,
    provider: user.authProvider ?? null,
  };
}

export async function mockLogin(
  email: string,
  password: string,
  tenantId: string
): Promise<{ user: User; requiresMfa?: boolean }> {
  await delay();
  const trimmedEmail = email?.trim() ?? '';
  const trimmedPassword = password?.trim() ?? '';
  const mockUser = findUserByEmailOrSignedUp(trimmedEmail);
  if (mockUser?.authProvider) {
    throw new Error(`This account signs in with ${mockUser.authProvider}. Use that provider instead.`);
  }
  if (!mockUser || mockUser.password !== trimmedPassword) {
    throw new Error('Invalid email or password');
  }
  const trimmedTenantId = tenantId?.trim() || 'citron';
  const tenant = mockUser.tenants.find((t) => t.tenantId === trimmedTenantId || t.tenantId === 'citron');
  if (!tenant) {
    throw new Error('Invalid email or password');
  }
  const { password: _p, ...userData } = mockUser;
  const user: User = {
    ...userData,
    isAuthenticated: true,
  };
  if (mockUser.twoFactorEnabled) {
    return { user: { ...user, isAuthenticated: false }, requiresMfa: true };
  }
  return { user };
}

export async function mockSignup(payload: {
  email: string;
  password: string;
  name?: string;
  username: string;
  tenantId: string;
}): Promise<{ user: User; verificationToken: string }> {
  await delay();
  if (findUserByEmailOrSignedUp(payload.email)) {
    throw new Error('An account with this email already exists');
  }
  if (isUsernameTaken(payload.username)) {
    throw new Error('This username is already taken');
  }
  const userId = `user_${Date.now()}`;
  const user: User = {
    id: userId,
    email: payload.email,
    name: payload.name ?? '',
    username: payload.username,
    isAuthenticated: false,
    isEmailVerified: false,
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    tenants: [{ tenantId: payload.tenantId, role: 'member' }],
  };
  const userWithPassword = { ...user, password: payload.password };
  mockSignedUpUsers.set(userId, userWithPassword);
  const token = generateToken();
  pendingEmailVerifyTokens.set(token, {
    userId,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });
  return { user, verificationToken: token };
}

export async function mockSendMagicLink(email: string, _tenantId: string): Promise<void> {
  await delay();
  const token = generateToken();
  pendingMagicLinkTokens.set(token, {
    email,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });
  console.log('[Mock] Magic link token:', token, 'for', email);
}

export async function mockVerifyMagicLink(token: string): Promise<User> {
  await delay();
  const pending = pendingMagicLinkTokens.get(token);
  if (!pending || pending.expiresAt < Date.now()) {
    throw new Error('Invalid or expired link');
  }
  const mockUser = findUserByEmailOrSignedUp(pending.email);
  if (!mockUser) {
    throw new Error('User not found');
  }
  pendingMagicLinkTokens.delete(token);
  const { password: _p2, ...userData } = mockUser;
  return { ...userData, isAuthenticated: true };
}

export async function mockSendPasswordReset(email: string, _tenantId: string): Promise<void> {
  await delay();
  const token = generateToken();
  pendingResetTokens.set(token, {
    email,
    expiresAt: Date.now() + 60 * 60 * 1000,
  });
  console.log('[Mock] Reset token:', token, 'for', email);
}

export async function mockResetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  await delay();
  const pending = pendingResetTokens.get(token);
  if (!pending || pending.expiresAt < Date.now()) {
    throw new Error('Invalid or expired reset link');
  }
  const user = findUserByEmailOrSignedUp(pending.email);
  if (user) {
    user.password = newPassword;
  }
  pendingResetTokens.delete(token);
}

export async function mockVerifyEmail(token: string): Promise<User> {
  await delay();
  const pending = pendingEmailVerifyTokens.get(token);
  if (!pending || pending.expiresAt < Date.now()) {
    throw new Error('Invalid or expired verification link');
  }
  const user =
    findUserById(pending.userId) ??
    MOCK_USERS.find((u) => u.id === pending.userId) ??
    mockSignedUpUsers.get(pending.userId);
  if (!user) {
    throw new Error('User not found');
  }
  pendingEmailVerifyTokens.delete(token);
  const { password: _p3, ...userData } = user;
  return { ...userData, isEmailVerified: true, isAuthenticated: true };
}

export async function mockSetupMFA(userId: string): Promise<{ secret: string; qrDataUrl: string }> {
  await delay();
  const secret = 'MOCK' + Math.random().toString(36).slice(2, 18).toUpperCase();
  mfaSecrets.set(userId, secret);
  const qrDataUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
  return { secret, qrDataUrl };
}

export async function mockConfirmMFA(userId: string, code: string): Promise<void> {
  await delay();
  if (code.length !== 6 || !/^\d+$/.test(code)) {
    throw new Error('Invalid code format');
  }
  mfaSecrets.set(userId, 'confirmed');
}

export async function mockVerifyMFA(
  userId: string,
  code: string
): Promise<boolean> {
  await delay();
  const backupCodes = MOCK_BACKUP_CODES[userId];
  if (backupCodes?.includes(code)) {
    return true;
  }
  if (code.length === 6 && /^\d+$/.test(code)) {
    const secret = mfaSecrets.get(userId);
    if (secret === 'confirmed') {
      return true;
    }
  }
  return false;
}

export async function mockGetTenantsForUser(userId: string): Promise<Tenant[]> {
  await delay(300);
  const user = findUserById(userId) ?? mockSignedUpUsers.get(userId);
  if (!user) return [];
  return user.tenants
    .map((t) => getTenantById(t.tenantId))
    .filter((t): t is Tenant => t !== undefined);
}

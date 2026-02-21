import type { User } from '@/types/auth';

export interface MockUserCredentials {
  email: string;
  password: string;
}

export const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 'user_alice',
    email: 'alice@test.com',
    name: 'Alice Smith',
    username: 'alice_smith',
    password: 'password123',
    isAuthenticated: false,
    isEmailVerified: true,
    twoFactorEnabled: true,
    createdAt: '2024-01-15T10:00:00Z',
    tenants: [{ tenantId: 'citron', role: 'admin' }, { tenantId: 'acme-corp', role: 'admin' }],
  },
  {
    id: 'user_bob',
    email: 'bob@test.com',
    name: 'Bob Johnson',
    username: 'bob_j',
    password: 'password123',
    isAuthenticated: false,
    isEmailVerified: true,
    twoFactorEnabled: false,
    createdAt: '2024-02-01T14:30:00Z',
    tenants: [{ tenantId: 'citron', role: 'member' }, { tenantId: 'acme-corp', role: 'member' }, { tenantId: 'startup-xyz', role: 'member' }],
  },
  {
    id: 'user_carol',
    email: 'carol@test.com',
    name: 'Carol Williams',
    username: 'carol_w',
    password: 'password123',
    isAuthenticated: false,
    isEmailVerified: false,
    twoFactorEnabled: false,
    createdAt: '2024-02-10T09:00:00Z',
    tenants: [{ tenantId: 'citron', role: 'member' }, { tenantId: 'enterprise-demo', role: 'member' }],
  },
  {
    id: 'user_dave',
    email: 'dave@test.com',
    name: 'Dave Brown',
    username: 'dave_b',
    password: 'password123',
    isAuthenticated: false,
    isEmailVerified: true,
    twoFactorEnabled: false,
    createdAt: '2024-01-20T11:00:00Z',
    tenants: [{ tenantId: 'citron', role: 'admin' }, { tenantId: 'inkblot-studio', role: 'admin' }],
  },
  {
    id: 'user_eve',
    email: 'eve@test.com',
    name: 'Eve Davis',
    username: 'eve_d',
    password: 'password123',
    isAuthenticated: false,
    isEmailVerified: true,
    twoFactorEnabled: true,
    createdAt: '2024-02-05T16:00:00Z',
    tenants: [{ tenantId: 'citron', role: 'member' }, { tenantId: 'tech-co', role: 'member' }],
  },
];

export const MOCK_BACKUP_CODES: Record<string, string[]> = {
  user_alice: ['12345678', '87654321', '11223344'],
  user_eve: ['11111111', '22222222'],
};

export function findUserByEmail(email: string): (User & { password: string }) | undefined {
  return MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): (User & { password: string }) | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

export function findUserByUsername(username: string): (User & { password: string }) | undefined {
  if (!username?.trim()) return undefined;
  const lower = username.trim().toLowerCase();
  return MOCK_USERS.find((u) => u.username?.toLowerCase() === lower);
}

import type { User } from '@/types/auth';
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
} from '@/mocks/auth';

export interface AuthApi {
  login(email: string, password: string, tenantId: string): Promise<{ user: User; requiresMfa?: boolean }>;
  signup(payload: {
    email: string;
    password: string;
    name: string;
    username?: string;
    tenantId: string;
  }): Promise<{ user: User; verificationToken: string }>;
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

export const authApi: AuthApi = {
  login: mockLogin,
  signup: mockSignup,
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

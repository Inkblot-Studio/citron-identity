import { create } from 'zustand';
import type { User } from '@/types/auth';

export type { User };
import { authApi } from '@/lib/auth-api';
import { useTenantStore } from './tenant';

const STORAGE_KEY = 'inkid_user';
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitializing: boolean;
  pendingMFA: boolean;
  pendingEmailVerification: boolean;
  mfaSecret?: string;
  mfaQrDataUrl?: string;
}

export interface AuthActions {
  login: (email: string, password: string, tenantId: string) => Promise<void>;
  signup: (payload: {
    email: string;
    password: string;
    name?: string;
    username: string;
    tenantId: string;
  }) => Promise<void>;
  sendMagicLink: (email: string, tenantId: string) => Promise<void>;
  verifyMagicLink: (token: string) => Promise<void>;
  sendPasswordReset: (email: string, tenantId: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  setupMFA: (userId: string) => Promise<void>;
  confirmMFA: (userId: string, code: string) => Promise<void>;
  verifyMFA: (userId: string, code: string) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
  logout: () => void;
  initialize: () => Promise<void>;
  completeTestimonials?: () => void;
  selectPlan?: (plan: 'monthly' | 'yearly') => void;
  skipSubscription?: () => void;
}

function persistUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...user,
      _expiresAt: Date.now() + SESSION_TTL,
    }));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function loadPersistedUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data._expiresAt && data._expiresAt < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    delete data._expiresAt;
    return data;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isInitializing: true,
  pendingMFA: false,
  pendingEmailVerification: false,
  mfaSecret: undefined,
  mfaQrDataUrl: undefined,

  login: async (email, password, tenantId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authApi.login(email, password, tenantId);
      if (result.requiresMfa) {
        set({
          user: result.user,
          pendingMFA: true,
          isLoading: false,
        });
      } else {
        persistUser(result.user);
        useTenantStore.getState().loadTenantsForUser(result.user.id);
        useTenantStore.getState().setTenant({ id: tenantId, slug: tenantId, name: tenantId });
        set({ user: result.user, isLoading: false, pendingMFA: false });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Login failed',
        isLoading: false,
      });
      throw err;
    }
  },

  signup: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.signup(payload);
      set({ user, isLoading: false, pendingEmailVerification: true });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Signup failed',
        isLoading: false,
      });
      throw err;
    }
  },

  sendMagicLink: async (email, tenantId) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.sendMagicLink(email, tenantId);
      set({ isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to send magic link',
        isLoading: false,
      });
      throw err;
    }
  },

  verifyMagicLink: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authApi.verifyMagicLink(token);
      persistUser(user);
      useTenantStore.getState().loadTenantsForUser(user.id);
      set({ user, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Invalid or expired link',
        isLoading: false,
      });
      throw err;
    }
  },

  sendPasswordReset: async (email, tenantId) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.sendPasswordReset(email, tenantId);
      set({ isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to send reset email',
        isLoading: false,
      });
      throw err;
    }
  },

  resetPassword: async (token, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.resetPassword(token, newPassword);
      set({ isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Invalid or expired reset link',
        isLoading: false,
      });
      throw err;
    }
  },

  verifyEmail: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authApi.verifyEmail(token);
      persistUser(user);
      set({ user, isLoading: false, pendingEmailVerification: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Invalid or expired verification link',
        isLoading: false,
      });
      throw err;
    }
  },

  setupMFA: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { secret, qrDataUrl } = await authApi.setupMFA(userId);
      set({ mfaSecret: secret, mfaQrDataUrl: qrDataUrl, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to setup MFA',
        isLoading: false,
      });
      throw err;
    }
  },

  confirmMFA: async (userId, code) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.confirmMFA(userId, code);
      const { user } = get();
      if (user) {
        const updated = { ...user, twoFactorEnabled: true };
        persistUser(updated);
        set({ user: updated, mfaSecret: undefined, mfaQrDataUrl: undefined, isLoading: false });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Invalid code',
        isLoading: false,
      });
      throw err;
    }
  },

  verifyMFA: async (userId, code) => {
    set({ isLoading: true, error: null });
    try {
      const valid = await authApi.verifyMFA(userId, code);
      if (!valid) {
        set({ error: 'Invalid code', isLoading: false });
        throw new Error('Invalid code');
      }
      const { user } = get();
      if (user) {
        const updated = { ...user, isAuthenticated: true };
        persistUser(updated);
        useTenantStore.getState().loadTenantsForUser(user.id);
        set({ user: updated, pendingMFA: false, isLoading: false });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Invalid code',
        isLoading: false,
      });
      throw err;
    }
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  logout: () => {
    persistUser(null);
    useTenantStore.getState().clearTenants();
    set({
      user: null,
      error: null,
      pendingMFA: false,
      pendingEmailVerification: false,
      mfaSecret: undefined,
      mfaQrDataUrl: undefined,
    });
  },

  completeTestimonials: () => set({}),
  selectPlan: () => set({}),
  skipSubscription: () => set({}),

  initialize: async () => {
    set({ isInitializing: true });
    try {
      const user = loadPersistedUser();
      if (user) {
        useTenantStore.getState().loadTenantsForUser(user.id);
        set({ user, isInitializing: false });
      } else {
        set({ isInitializing: false });
      }
    } catch {
      set({ isInitializing: false });
    }
  },
}));

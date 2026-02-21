import { create } from 'zustand';
import type { Tenant } from '@/types/tenant';
import { authApi } from '@/lib/auth-api';

interface TenantState {
  currentTenant: Tenant | null;
  availableTenants: Tenant[];
  isLoading: boolean;
}

interface TenantActions {
  setTenant: (tenant: Tenant | null) => void;
  loadTenantsForUser: (userId: string) => Promise<void>;
  clearTenants: () => void;
}

export const useTenantStore = create<TenantState & TenantActions>((set) => ({
  currentTenant: null,
  availableTenants: [],
  isLoading: false,

  setTenant: (tenant) => set({ currentTenant: tenant }),

  loadTenantsForUser: async (userId: string) => {
    set({ isLoading: true });
    try {
      const tenants = await authApi.getTenantsForUser(userId);
      set({ availableTenants: tenants, isLoading: false });
    } catch {
      set({ availableTenants: [], isLoading: false });
    }
  },

  clearTenants: () => set({ currentTenant: null, availableTenants: [] }),
}));

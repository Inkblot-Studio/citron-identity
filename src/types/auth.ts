export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  tenants: { tenantId: string; role: string }[];
  hasSubscription?: boolean;
  subscriptionPlan?: 'monthly' | 'yearly';
  trialEndsAt?: Date;
}

export interface TenantMembership {
  tenantId: string;
  role: string;
}

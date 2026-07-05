export type AuthProviderId = 'google' | 'microsoft' | 'apple';

export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  /** When set, the account signs in through this SSO provider — never a password. */
  authProvider?: AuthProviderId;
  createdAt: string;
  tenants: { tenantId: string; role: string }[];
  hasSubscription?: boolean;
  subscriptionPlan?: 'monthly' | 'yearly';
  trialEndsAt?: Date;
}

/** Result of the email-first account lookup that drives the branching flow. */
export interface AccountCheck {
  exists: boolean;
  /** First name for the "Welcome back, {name}" greeting. */
  name?: string;
  /** When set, the account is SSO-only — prompt the provider, never a password. */
  provider?: AuthProviderId | null;
}

export interface TenantMembership {
  tenantId: string;
  role: string;
}

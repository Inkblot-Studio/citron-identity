export interface TenantBranding {
  logoUrl?: string;
  primaryColor?: string;
  name: string;
}

export interface TenantApp {
  id: string;
  name: string;
  url: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  redirectUrl?: string;
  allowedAppIds?: string[];
}

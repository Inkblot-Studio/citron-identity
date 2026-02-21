import type { Tenant } from '@/types/tenant';

export const DEFAULT_TENANT_ID = 'citron';

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 'citron',
    slug: 'citron',
    name: 'IS',
    primaryColor: '#c4a030',
    redirectUrl: '/',
    allowedAppIds: [],
  },
  {
    id: 'acme-corp',
    slug: 'acme-corp',
    name: 'Acme Corporation',
    logoUrl: '/logos/acme.svg',
    primaryColor: '#c4a030',
    redirectUrl: 'https://app.acme.example.com',
    allowedAppIds: ['app-1', 'app-2'],
  },
  {
    id: 'startup-xyz',
    slug: 'startup-xyz',
    name: 'Startup XYZ',
    logoUrl: '/logos/startup.svg',
    primaryColor: '#358c46',
    redirectUrl: 'https://startup.example.com',
    allowedAppIds: ['app-1'],
  },
  {
    id: 'enterprise-demo',
    slug: 'enterprise-demo',
    name: 'Enterprise Demo',
    logoUrl: '/logos/enterprise.svg',
    primaryColor: '#5790ad',
    redirectUrl: 'https://enterprise.example.com',
    allowedAppIds: ['app-1', 'app-2', 'app-3'],
  },
  {
    id: 'inkblot-studio',
    slug: 'inkblot-studio',
    name: 'Inkblot Studio',
    logoUrl: '/logos/inkblot.svg',
    primaryColor: '#c4a030',
    redirectUrl: 'https://inkblot.example.com',
    allowedAppIds: ['app-1', 'app-2', 'app-3', 'app-4'],
  },
  {
    id: 'tech-co',
    slug: 'tech-co',
    name: 'Tech Co',
    logoUrl: '/logos/tech.svg',
    primaryColor: '#a38427',
    redirectUrl: 'https://tech.example.com',
    allowedAppIds: ['app-1'],
  },
  { id: 'design-studio', slug: 'design-studio', name: 'Design Studio', primaryColor: '#8B5CF6', redirectUrl: 'https://design.example.com', allowedAppIds: ['app-1', 'app-2'] },
  { id: 'media-hub', slug: 'media-hub', name: 'Media Hub', primaryColor: '#EC4899', redirectUrl: 'https://media.example.com', allowedAppIds: ['app-1'] },
  { id: 'finance-pro', slug: 'finance-pro', name: 'Finance Pro', primaryColor: '#358c46', redirectUrl: 'https://finance.example.com', allowedAppIds: ['app-1', 'app-2', 'app-3'] },
  { id: 'health-care', slug: 'health-care', name: 'Health Care Plus', primaryColor: '#5790ad', redirectUrl: 'https://health.example.com', allowedAppIds: ['app-1'] },
  { id: 'edu-platform', slug: 'edu-platform', name: 'Edu Platform', primaryColor: '#c4a030', redirectUrl: 'https://edu.example.com', allowedAppIds: ['app-1', 'app-2'] },
];

export function getTenantById(id: string): Tenant | undefined {
  return MOCK_TENANTS.find((t) => t.id === id || t.slug === id);
}

export function getTenantBySlug(slug: string): Tenant | undefined {
  return MOCK_TENANTS.find((t) => t.slug === slug);
}

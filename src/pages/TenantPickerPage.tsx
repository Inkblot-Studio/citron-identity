import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_TENANTS } from '@/mocks/tenants';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export const TenantPickerPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [search, setSearch] = useState('');

  const filteredTenants = useMemo(() => {
    if (!search.trim()) return MOCK_TENANTS;
    const q = search.toLowerCase();
    return MOCK_TENANTS.filter((t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className={cn('min-h-screen bg-neutral-50 dark:bg-[var(--inkblot-dark-color-background-primary)] p-6', theme === 'dark' && 'dark')} data-theme={theme}>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-[var(--inkblot-dark-color-text-primary)] mb-2">
          Select your organization
        </h1>
        <p className="text-neutral-500 dark:text-[var(--inkblot-dark-color-text-secondary)] mb-4">
          Choose an organization to sign in or create an account
        </p>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 dark:border-[var(--inkblot-dark-color-border-default)] bg-white dark:bg-[var(--inkblot-dark-color-background-secondary)] text-neutral-900 dark:text-[var(--inkblot-dark-color-text-primary)] placeholder-neutral-400"
          />
        </div>
        <div className="grid gap-4">
          {filteredTenants.map((tenant) => (
            <button
              key={tenant.id}
              onClick={() => navigate(`/auth/${tenant.id}/login`)}
              className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 dark:border-[var(--inkblot-dark-color-border-default)] bg-white dark:bg-[var(--inkblot-dark-color-background-secondary)] hover:shadow-md transition-all text-left w-full"
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: tenant.primaryColor || 'var(--inkblot-color-accent-citron-500)' }}
              >
                {tenant.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-neutral-900 dark:text-[var(--inkblot-dark-color-text-primary)]">
                  {tenant.name}
                </div>
                <div className="text-sm text-neutral-500 dark:text-[var(--inkblot-dark-color-text-secondary)]">
                  Sign in or sign up
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

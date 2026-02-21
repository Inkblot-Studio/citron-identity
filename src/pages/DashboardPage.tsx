import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useTenantStore } from '@/store/tenant';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { currentTenant, availableTenants, setTenant } = useTenantStore();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[var(--inkblot-dark-color-background-primary)] p-6" data-theme="dark">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {availableTenants.length > 1 && (
          <select
            value={currentTenant?.id ?? ''}
            onChange={(e) => {
              const t = availableTenants.find((x) => x.id === e.target.value);
              if (t) setTenant(t);
            }}
            className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-[var(--inkblot-dark-color-border-default)] bg-white dark:bg-[var(--inkblot-dark-color-background-secondary)] text-neutral-900 dark:text-[var(--inkblot-dark-color-text-primary)]"
          >
            {availableTenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}
        <ThemeToggle />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8 pb-6 border-b border-neutral-200 dark:border-[var(--inkblot-dark-color-border-default)]">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: 'var(--inkblot-color-accent-citron-500)' }}
            >
              {user.name?.charAt(0) ?? user.email.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-[var(--inkblot-dark-color-text-primary)]">
                Welcome, {user.name ?? user.email}
              </h1>
              <p className="text-neutral-500 dark:text-[var(--inkblot-dark-color-text-secondary)]">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-[var(--inkblot-dark-color-border-default)] bg-white dark:bg-[var(--inkblot-dark-color-background-secondary)]">
            <h3 className="font-semibold text-neutral-900 dark:text-[var(--inkblot-dark-color-text-primary)] mb-1">
              Email verified
            </h3>
            <p className="text-sm text-neutral-500 dark:text-[var(--inkblot-dark-color-text-secondary)]">
              {user.isEmailVerified ? 'Yes' : 'No'}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-[var(--inkblot-dark-color-border-default)] bg-white dark:bg-[var(--inkblot-dark-color-background-secondary)]">
            <h3 className="font-semibold text-neutral-900 dark:text-[var(--inkblot-dark-color-text-primary)] mb-1">
              Two-factor authentication
            </h3>
            <p className="text-sm text-neutral-500 dark:text-[var(--inkblot-dark-color-text-secondary)]">
              {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

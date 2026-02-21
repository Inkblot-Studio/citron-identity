import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useTenantStore } from '@/store/tenant';
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
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {availableTenants.length > 1 && (
          <select
            value={currentTenant?.id ?? ''}
            onChange={(e) => {
              const t = availableTenants.find((x) => x.id === e.target.value);
              if (t) setTenant(t);
            }}
            className="px-3 py-2 rounded-lg border bg-white text-neutral-900"
            style={{ borderColor: 'var(--color-border-primary)' }}
          >
            {availableTenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8 pb-6 border-b" style={{ borderColor: 'var(--color-border-primary)' }}>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: 'var(--inkblot-color-accent-citron-500)' }}
            >
              {user.name?.charAt(0) ?? user.email.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Welcome, {user.name ?? user.email}
              </h1>
              <p className="text-neutral-500" style={{ color: 'var(--color-text-secondary)' }}>
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="p-4 rounded-xl border bg-white" style={{ borderColor: 'var(--color-border-primary)' }}>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Email verified
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {user.isEmailVerified ? 'Yes' : 'No'}
            </p>
          </div>
          <div className="p-4 rounded-xl border bg-white" style={{ borderColor: 'var(--color-border-primary)' }}>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Two-factor authentication
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
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

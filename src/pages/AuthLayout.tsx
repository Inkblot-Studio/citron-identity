import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { getTenantById } from '@/mocks/tenants';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

export const AuthLayout: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { theme } = useTheme();
  const tenant = tenantId ? getTenantById(tenantId) : null;

  return (
    <div
      className={cn(
        'min-h-screen bg-neutral-50 dark:bg-[var(--inkblot-dark-color-background-primary)]',
        theme === 'dark' && 'dark'
      )}
      data-theme={theme}
      style={
        tenant?.primaryColor
          ? { ['--tenant-primary' as string]: tenant.primaryColor }
          : undefined
      }
    >
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {tenant && (
            <div className="mb-6 flex justify-center">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: tenant.primaryColor || 'var(--inkblot-color-accent-citron-500)' }}
              >
                {tenant.name.charAt(0)}
              </div>
            </div>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

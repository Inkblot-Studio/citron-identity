import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getTenantById } from '@/mocks/tenants';

interface TenantRouteProps {
  children: React.ReactNode;
}

export const TenantRoute: React.FC<TenantRouteProps> = ({ children }) => {
  const { tenantId } = useParams<{ tenantId: string }>();

  if (!tenantId) {
    return <Navigate to="/" replace />;
  }

  const tenant = getTenantById(tenantId);
  if (!tenant) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

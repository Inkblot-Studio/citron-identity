import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user?.isAuthenticated) {
    const returnPath = location.pathname + location.search;
    const params = new URLSearchParams();
    params.set('returnUrl', returnPath);
    return <Navigate to={`/login?${params.toString()}`} replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

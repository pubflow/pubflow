// src/adapters/react/components/Guards/RoleGuard.tsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: string | string[];
  fallback?: React.ReactNode;
  onUnauthorized?: () => void;
}

export function RoleGuard({ children, roles, fallback, onUnauthorized }: RoleGuardProps) {
  const { session, isAuthorized } = useAuth();
  const hasAccess = isAuthorized(roles);

  useEffect(() => {
    if (!hasAccess && onUnauthorized) {
      onUnauthorized();
    }
  }, [hasAccess, onUnauthorized]);

  if (!session || !hasAccess) {
    return fallback || null;
  }

  return <>{children}</>;
}
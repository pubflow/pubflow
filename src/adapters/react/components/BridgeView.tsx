// src/adapters/react/components/BridgeView.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePubFlow, useAuth } from '../hooks';

interface BridgeViewProps {
  children: React.ReactNode;
  userTypes?: string | string[];
  requireAuth?: boolean;
  loginPath?: string;
  unauthorized?: React.ReactNode;
  loading?: React.ReactNode;
}

export function BridgeView({
  children,
  userTypes,
  requireAuth = true,
  loginPath = '/login',
  unauthorized,
  loading
}: BridgeViewProps) {
  const { session, loading: authLoading } = useAuth();
  const client = usePubFlow();
  const location = useLocation();

  if (authLoading) {
    return loading || <div>Loading...</div>;
  }

  // Not authenticated
  if (requireAuth && !session) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Check user types if specified
  if (userTypes && !client.auth.hasUserType(userTypes)) {
    return unauthorized || (
      <div className="unauthorized-message">
        Acceso restringido: Su usuario no tiene acceso a este recurso.
      </div>
    );
  }

  return <>{children}</>;
}
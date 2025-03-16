// src/adapters/react/components/Guards/AuthGuard.tsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUnauthenticated?: () => void;
}

export function AuthGuard({ children, fallback, onUnauthenticated }: AuthGuardProps) {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session && onUnauthenticated) {
      onUnauthenticated();
    }
  }, [loading, session, onUnauthenticated]);

  if (loading) {
    return fallback || null;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
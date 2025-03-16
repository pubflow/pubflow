// src/adapters/react/hoc/withAuth.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface WithAuthOptions {
  roles?: string | string[];
  redirectTo?: string;
  LoadingComponent?: React.ComponentType;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  return function WrappedComponent(props: P) {
    const { session, loading, isAuthorized } = useAuth();

    if (loading) {
      return options.LoadingComponent ? <options.LoadingComponent /> : null;
    }

    if (!session || (options.roles && !isAuthorized(options.roles))) {
      return null;
    }

    return <Component {...props} session={session} />;
  };
}
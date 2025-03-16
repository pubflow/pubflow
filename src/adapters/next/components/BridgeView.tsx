// src/adapters/next/components/BridgeView.tsx
import { useRouter } from 'next/router';
import { useNextAuth } from '../hooks/useNextAuth';

export interface BridgeViewProps {
  children: React.ReactNode;
  userTypes?: string | string[];
  requireAuth?: boolean;
  loginPath?: string;
  unauthorized?: React.ReactNode;
  loading?: React.ReactNode;
  fallback?: React.ReactNode;
  onAuthError?: (error: any) => void;
}

export function BridgeView({
  children,
  userTypes,
  requireAuth = true,
  loginPath = '/login',
  unauthorized,
  loading,
  fallback,
  onAuthError
}: BridgeViewProps) {
  const router = useRouter();
  const { session, loading: authLoading, isAuthorized } = useNextAuth();

  // Handle loading state
  if (authLoading) {
    return loading || <div>Loading...</div>;
  }

  // Handle authentication requirement
  if (requireAuth && !session) {
    if (typeof window !== 'undefined') {
      router.push({
        pathname: loginPath,
        query: { returnUrl: router.asPath }
      });
    }
    return fallback || null;
  }

  // Handle user type requirements
  if (userTypes && !isAuthorized(userTypes)) {
    return unauthorized || (
      <div className="unauthorized-container">
        <h2>Acceso Restringido</h2>
        <p>Su usuario no tiene acceso a este recurso.</p>
      </div>
    );
  }

  return <>{children}</>;
}
// src/adapters/next/index.tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import React from 'react';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { PubFlow } from '../..';
import { SessionStorage } from '../../core/storage';
import { PubFlowProvider } from '../react';
import { useAuth } from '../react/hooks/useAuth';
import { PubFlowSession } from '../../types/core';


// Types
export interface NextPubFlowConfig {
  loginPath?: string;
  unauthorizedPath?: string;
  loadingComponent?: React.ComponentType;
  apiUrl?: string;
}

export interface WithAuthProps {
  initialSession?: PubFlowSession;
  userTypes?: string | string[];
  redirectIfAuthenticated?: boolean;
  loadingComponent?: React.ComponentType;
}

// Server-side utilities
export const createServerSideClient = (context: GetServerSidePropsContext) => {
  const client = new PubFlow({
    baseUrl: typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_API_URL || '' : '',
    // Pass cookies from context for server-side authentication
    headers: {
      cookie: context.req.headers.cookie || ''
    }
  });

  return client;
};

export const withServerSideAuth = (
  getServerSideProps?: GetServerSideProps,
  options: {
    userTypes?: string | string[];
    redirectTo?: string;
  } = {}
) => {
  return async (context: GetServerSidePropsContext) => {
    const client = createServerSideClient(context);

    try {
      const session: PubFlowSession | null = await client.auth.getSession();

      // Check user types if specified
      if (options.userTypes && !client.auth.hasUserType(options.userTypes)) {
        return {
          redirect: {
            destination: options.redirectTo || '/unauthorized',
            permanent: false
          }
        };
      }

      // Call original getServerSideProps if provided
      if (getServerSideProps) {
        const result = await getServerSideProps(context);
        
        if ('props' in result) {
          return {
            ...result,
            props: {
              ...result.props,
              initialSession: session
            }
          };
        }
        return result;
      }

      return {
        props: {
          initialSession: session
        }
      };
    } catch (error) {
      return {
        redirect: {
          destination: '/login',
          permanent: false
        }
      };
    }
  };
};

// Client-side components and hooks
export function NextPubFlowProvider({
  children,
  client,
  config = {}
}: {
  children: React.ReactNode;
  client: PubFlow;
  config?: NextPubFlowConfig;
}) {
  return (
    <PubFlowProvider 
      client={client}
      options={{
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        ...config
      }}
    >
      {children}
    </PubFlowProvider>
  );
}

// Enhanced hooks for Next.js
export function useNextAuth(options: {
  redirectTo?: string;
  redirectIfAuthenticated?: boolean;
} = {}) {
  const { session, loading, ...authUtils } = useAuth(); // Make sure useAuth is properly imported
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!session && options.redirectTo) {
        router.push(options.redirectTo);
      } else if (session && options.redirectIfAuthenticated) {
        router.push('/dashboard');
      }
    }
  }, [session, loading, router]);

  return { session, loading, ...authUtils };
}

// HOC for protecting pages
// In the withNextAuth function
export function withNextAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthProps = {}
) {
  return function ProtectedPage(props: P) {
    const router = useRouter();
    const { session, loading } = useNextAuth({
      redirectTo: '/login'
    });

    if (loading) {
      return options.loadingComponent ? <options.loadingComponent /> : null;
    }

    if (!session) {
      return null;
    }

    // This line uses 'client' which is not defined in this scope
    // Should use the auth context instead
    if (options.userTypes && !options.userTypes.includes(session.user.userType)) {
      router.push('/unauthorized');
      return null;
    }

    return <Component {...props} session={session} />;
  };
}

// API Route Middleware
export function withApiAuth(handler: any, options: { userTypes?: string | string[] } = {}) {
  return async (req: any, res: any) => {
    try {
      const sessionId = req.cookies['sessionId'] || req.headers['x-session-id'];

      if (!sessionId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const client = new PubFlow({
        baseUrl: typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_API_URL || '' : ''
      });

      const session = await client.auth.validateSession(sessionId);

      if (!session) {
        return res.status(401).json({ error: 'Invalid session' });
      }

      if (options.userTypes && !client.auth.hasUserType(options.userTypes)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.session = session;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
}

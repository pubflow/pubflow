// src/adapters/next/hoc/withNextAuth.tsx
import { useRouter } from 'next/router';
import { useNextAuth } from '../hooks/useNextAuth';

export interface WithNextAuthOptions {
  userTypes?: string | string[];
  loginPath?: string;
  unauthorizedPath?: string;
  loading?: React.ComponentType;
  redirectIfAuthenticated?: boolean;
}

export function withNextAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithNextAuthOptions = {}
) {
  return function WrappedComponent(props: P) {
    const router = useRouter();
    const {
      session,
      loading,
      isAuthorized
    } = useNextAuth({
      redirectTo: options.loginPath || '/login'
    });

    useEffect(() => {
      if (!loading) {
        if (!session) {
          router.push({
            pathname: options.loginPath || '/login',
            query: { returnUrl: router.asPath }
          });
        } else if (options.userTypes && !isAuthorized(options.userTypes)) {
          router.push(options.unauthorizedPath || '/unauthorized');
        } else if (options.redirectIfAuthenticated && session) {
          const returnUrl = router.query.returnUrl as string;
          router.push(returnUrl || '/dashboard');
        }
      }
    }, [session, loading]);

    if (loading) {
      return options.loading ? <options.loading /> : null;
    }

    if (!session || (options.userTypes && !isAuthorized(options.userTypes))) {
      return null;
    }

    return <Component {...props} session={session} />;
  };
}
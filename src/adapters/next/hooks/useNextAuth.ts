// src/adapters/next/hooks/useNextAuth.ts
import { useRouter } from 'next/router';
import { useAuth } from '../../react';

export interface UseNextAuthOptions {
  redirectTo?: string;
  redirectIfAuthenticated?: boolean;
  onAuthError?: (error: any) => void;
}

export function useNextAuth(options: UseNextAuthOptions = {}) {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.session && options.redirectTo) {
        router.push({
          pathname: options.redirectTo,
          query: { returnUrl: router.asPath }
        });
      } else if (auth.session && options.redirectIfAuthenticated) {
        const returnUrl = router.query.returnUrl as string;
        router.push(returnUrl || '/dashboard');
      }
    }
  }, [auth.session, auth.loading, router]);

  return {
    ...auth,
    redirect: (path: string) => router.push(path)
  };
}

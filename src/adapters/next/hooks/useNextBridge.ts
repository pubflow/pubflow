// src/adapters/next/hooks/useNextBridge.ts
import { useBridge } from '../../react';
import { useRouter } from 'next/router';

export function useNextBridge<T>(
  resourceName: string,
  options: UseBridgeOptions<T> = {}
) {
  const router = useRouter();
  const bridge = useBridge<T>(resourceName, {
    ...options,
    onError: (error) => {
      if (error?.status === 401) {
        router.push('/login');
      }
      options.onError?.(error);
    }
  });

  const queryWithParams = useCallback((params?: any) => {
    // Support Next.js query params
    const queryParams = router.query;
    return bridge.query({
      ...queryParams,
      ...params
    });
  }, [router.query, bridge]);

  return {
    ...bridge,
    query: queryWithParams
  };
}

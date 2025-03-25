// src/adapters/next/hooks/useNextBridge.ts
import { useCallback } from 'react';
import { useBridge, WithId } from '../../react';
import { useRouter } from 'next/router';
import type { UseBridgeOptions } from '../../../types/adapters';

export function useNextBridge<T extends WithId>(
  resourceName: string,
  options: UseBridgeOptions<T> = {}
) {
  const router = useRouter();
  const bridge = useBridge<T>(resourceName, {
    ...options,
    onError: (error: any) => {
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

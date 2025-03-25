// src/adapters/next/hooks/useNextQuery.ts
import { useQuery } from '../../react';
import { useRouter } from 'next/router';

interface UseQueryOptions {
  initialData?: any;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  cacheTime?: number;
}

export function useNextQuery<T>(
  queryFn: () => Promise<T>,
  options: UseQueryOptions = {}
) {
  const router = useRouter();
  
  return useQuery<T>(queryFn, {
    ...options,
    onError: (error: any) => {
      if (error?.status === 401) {
        router.push('/login');
      }
      options.onError?.(error);
    }
  });
}

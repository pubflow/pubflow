// src/adapters/react-native/hooks/useQuery.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { usePubFlowContext } from '../components/PubFlowProvider';

export interface UseQueryOptions<T> {
  initialData?: T;
  enabled?: boolean;
  refreshInterval?: number;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  onSettled?: (data: T | null, error: any | null) => void;
}

export function useQuery<T>(
  queryFn: () => Promise<T>,
  options: UseQueryOptions<T> = {}
) {
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const retryCount = useRef(0);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
      options.onSuccess?.(result);
      options.onSettled?.(result, null);
      retryCount.current = 0;
      return result;
    } catch (err) {
      setError(err);
      options.onError?.(err);
      options.onSettled?.(null, err);

      if (options.retry && retryCount.current < options.retry) {
        retryCount.current += 1;
        setTimeout(() => {
          execute();
        }, options.retryDelay || 1000);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [queryFn, options]);

  useEffect(() => {
    if (options.enabled !== false) {
      execute();
    }
  }, [options.enabled]);

  useEffect(() => {
    if (!options.refreshInterval) return;

    const interval = setInterval(() => {
      if (options.enabled !== false) {
        execute();
      }
    }, options.refreshInterval);

    return () => clearInterval(interval);
  }, [options.refreshInterval, options.enabled]);

  return {
    data,
    loading,
    error,
    execute,
    refresh: execute
  };
}


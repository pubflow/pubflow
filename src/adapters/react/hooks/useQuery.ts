// src/adapters/react/hooks/useQuery.ts
import { useState, useCallback } from 'react';
import { usePubFlowContext } from '../components/PubFlowProvider';

interface UseQueryOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  cacheTime?: number;
}

export function useQuery<T>(
  queryFn: () => Promise<T>,
  options: UseQueryOptions<T> = {}
) {
  const { client } = usePubFlowContext();
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      options.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [queryFn, options]);

  return {
    data,
    loading,
    error,
    execute,
    setData
  };
}

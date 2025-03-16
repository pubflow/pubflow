// src/adapters/react-native/hooks/useBridge.ts
import { useState, useCallback, useEffect } from 'react';
import { usePubFlowContext } from '../components/PubFlowProvider';
import type { BridgeSchema } from '../../../core/schema';

export interface UseBridgeOptions<T> {
  schema?: BridgeSchema;
  autoLoad?: boolean;
  pageSize?: number;
  refreshInterval?: number;
  onError?: (error: any) => void;
  onSuccess?: (data: T[]) => void;
  defaultParams?: Record<string, any>;
}

export function useBridge<T>(
  resourceName: string,
  options: UseBridgeOptions<T> = {}
) {
  const { client } = usePubFlowContext();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<any>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    hasMore: true,
    totalPages: 1
  });

  const query = useCallback(async (params?: Record<string, any>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await client.bridge.query<T>(resourceName, {
        ...options.defaultParams,
        ...params,
        page: pagination.page,
        limit: options.pageSize || 10
      });

      setData(response.data);
      setPagination({
        page: response.meta.page || 1,
        hasMore: response.meta.hasMore || false,
        totalPages: response.meta.totalPages || 1
      });

      options.onSuccess?.(response.data);
      return response;
    } catch (err) {
      setError(err);
      options.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, resourceName, pagination.page, options]);

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setPagination({ page: 1, hasMore: true, totalPages: 1 });
      await query();
    } finally {
      setRefreshing(false);
    }
  }, [query]);

  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || loading) return;
    
    try {
      const nextPage = pagination.page + 1;
      const response = await client.bridge.query<T>(resourceName, {
        ...options.defaultParams,
        page: nextPage,
        limit: options.pageSize || 10
      });

      setData(prev => [...prev, ...response.data]);
      setPagination({
        page: nextPage,
        hasMore: response.meta.hasMore || false,
        totalPages: response.meta.totalPages || 1
      });
    } catch (err) {
      options.onError?.(err);
    }
  }, [pagination, loading, client, resourceName, options]);

  useEffect(() => {
    if (options.autoLoad) {
      query();
    }
  }, [options.autoLoad]);

  useEffect(() => {
    if (!options.refreshInterval) return;

    const interval = setInterval(() => {
      query();
    }, options.refreshInterval);

    return () => clearInterval(interval);
  }, [options.refreshInterval, query]);

  return {
    data,
    loading,
    refreshing,
    error,
    query,
    refresh,
    pagination: {
      ...pagination,
      loadMore
    }
  };
}
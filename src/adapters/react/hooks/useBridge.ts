// src/adapters/react/hooks/useBridge.ts
import { useState, useCallback, useEffect } from 'react';
import { usePubFlowContext } from '../components/PubFlowProvider';
import type { BridgeSchema } from '../../../core/schema';
import type { PubFlowResponse } from '../../../types/core';

// Base interface to ensure T has an id property
export interface WithId {
  id: string;
}

export interface UseBridgeOptions<T> {
  schema?: BridgeSchema;
  autoLoad?: boolean;
  pageSize?: number;
  refreshInterval?: number;
  onError?: (error: any) => void;
  onSuccess?: (data: T[]) => void;
  defaultParams?: Record<string, any>;
}

export function useBridge<T extends WithId>(
  resourceName: string,
  options: UseBridgeOptions<T> = {}
) {
  const { client } = usePubFlowContext();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [selected, setSelected] = useState<T[]>([]);
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

      // Ensure data is an array even if undefined
      setData(response.data ?? []);
      setPagination({
        page: response.meta?.page || 1,
        hasMore: response.meta?.hasMore || false,
        totalPages: response.meta?.totalPages || 1
      });

      if (options.onSuccess && response.data) {
        options.onSuccess(response.data);
      }

      return response;
    } catch (err) {
      setError(err);
      if (options.onError) {
        options.onError(err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, resourceName, pagination.page, options]);

  const create = useCallback(async (data: Partial<T>) => {
    try {
      if (options.schema) {
        options.schema.validate(data);
      }
      const response = await client.bridge.create<T>(resourceName, data);
      // Type assertion to ensure response is treated as T
      setData(prev => [...prev, response as unknown as T]);
      return response;
    } catch (err) {
      if (options.onError) {
        options.onError(err);
      }
      throw err;
    }
  }, [client, resourceName, options]);

  const update = useCallback(async (id: string, data: Partial<T>) => {
    try {
      if (options.schema) {
        options.schema.validate(data);
      }
      const response = await client.bridge.update<T>(resourceName, id, data);
      // Type assertion to ensure response is treated as T
      setData(prev => prev.map(item => item.id === id ? response as unknown as T : item));
      return response;
    } catch (err) {
      if (options.onError) {
        options.onError(err);
      }
      throw err;
    }
  }, [client, resourceName, options]);

  const remove = useCallback(async (id: string) => {
    try {
      await client.bridge.delete(resourceName, id);
      setData(prev => prev.filter(item => item.id !== id));
      setSelected(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      if (options.onError) {
        options.onError(err);
      }
      throw err;
    }
  }, [client, resourceName]);

  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || loading) return;
    
    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    const response = await query();
    // Ensure data is an array even if undefined
    setData(prev => [...prev, ...(response.data ?? [])]);
  }, [pagination.hasMore, loading, query]);

  const refresh = useCallback(async () => {
    setPagination({ page: 1, hasMore: true, totalPages: 1 });
    return query();
  }, [query]);

  // Bulk operations
  const bulkActions = {
    delete: async (ids: string[]) => {
      try {
        await Promise.all(ids.map(id => client.bridge.delete(resourceName, id)));
        setData(prev => prev.filter(item => !ids.includes(item.id)));
        setSelected([]);
      } catch (err) {
        if (options.onError) {
          options.onError(err);
        }
        throw err;
      }
    },
    update: async (ids: string[], updateData: Partial<T>) => {
      try {
        if (options.schema) {
          options.schema.validate(updateData);
        }
        const results = await Promise.all(
          ids.map(id => client.bridge.update<T>(resourceName, id, updateData))
        );
        setData((prev: T[]) => {
          // Create a map of id to item for quick lookup
          const updated = new Map(results.map((response: PubFlowResponse<T>) => {
            const item = response.data as T;
            return [item.id, item];
          }));
          return prev.map((item: T) => {
            const updatedItem = updated.get(item.id);
            return updatedItem || item;
          }) as T[];
        });
        return results;
      } catch (err) {
        if (options.onError) {
          options.onError(err);
        }
        throw err;
      }
    }
  };

  // Auto-load on mount
  useEffect(() => {
    if (options.autoLoad) {
      query();
    }
  }, [options.autoLoad]);

  // Refresh interval
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
    error,
    query,
    create,
    update,
    remove,
    selected,
    setSelected,
    pagination: {
      ...pagination,
      loadMore,
      refresh
    },
    bulkActions
  };
}

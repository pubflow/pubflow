// src/adapters/svelte/stores/bridge.ts
import { writable, derived } from 'svelte/store';
import type { PubFlow } from '../../../core/client';
import type { BridgeSchema } from '../../../core/schema';

interface BridgeState<T> {
  data: T[];
  loading: boolean;
  error: any | null;
  pagination: {
    page: number;
    hasMore: boolean;
    totalPages: number;
  };
  selected: T[];
}

interface BridgeStoreOptions<T> {
  schema?: BridgeSchema;
  pageSize?: number;
  autoLoad?: boolean;
  refreshInterval?: number;
  onError?: (error: any) => void;
  onSuccess?: (data: T[]) => void;
}

function createBridgeStore<T>(
  resourceName: string,
  client: PubFlow,
  options: BridgeStoreOptions<T> = {}
) {
  const { subscribe, set, update } = writable<BridgeState<T>>({
    data: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      hasMore: true,
      totalPages: 1
    },
    selected: []
  });

  let refreshTimer: NodeJS.Timeout | null = null;

  async function query(params?: Record<string, any>) {
    try {
      update(s => ({ ...s, loading: true, error: null }));
      
      const response = await client.bridge.query<T>(resourceName, {
        ...params,
        page: params?.page || 1,
        limit: options.pageSize || 10
      });

      update(s => ({
        ...s,
        data: response.data,
        loading: false,
        pagination: {
          page: response.meta.page || 1,
          hasMore: response.meta.hasMore || false,
          totalPages: response.meta.totalPages || 1
        }
      }));

      if (options.onSuccess) {
        options.onSuccess(response.data);
      }

      return response;
    } catch (error) {
      update(s => ({ ...s, loading: false, error }));
      if (options.onError) {
        options.onError(error);
      }
      throw error;
    }
  }

  async function create(data: Partial<T>) {
    try {
      if (options.schema) {
        options.schema.validate(data);
      }
      const response = await client.bridge.create<T>(resourceName, data);
      update(s => ({
        ...s,
        data: [...s.data, response]
      }));
      return response;
    } catch (error) {
      if (options.onError) {
        options.onError(error);
      }
      throw error;
    }
  }

  async function update(id: string, data: Partial<T>) {
    try {
      if (options.schema) {
        options.schema.validate(data);
      }
      const response = await client.bridge.update<T>(resourceName, id, data);
      update(s => ({
        ...s,
        data: s.data.map(item => item.id === id ? response : item)
      }));
      return response;
    } catch (error) {
      if (options.onError) {
        options.onError(error);
      }
      throw error;
    }
  }

  async function remove(id: string) {
    try {
      await client.bridge.delete(resourceName, id);
      update(s => ({
        ...s,
        data: s.data.filter(item => item.id !== id),
        selected: s.selected.filter(item => item.id !== id)
      }));
    } catch (error) {
      if (options.onError) {
        options.onError(error);
      }
      throw error;
    }
  }

  async function loadMore() {
    let state: BridgeState<T>;
    subscribe(s => (state = s))();

    if (!state.pagination.hasMore || state.loading) return;

    try {
      update(s => ({ ...s, loading: true }));
      
      const response = await client.bridge.query<T>(resourceName, {
        page: state.pagination.page + 1,
        limit: options.pageSize || 10
      });

      update(s => ({
        ...s,
        data: [...s.data, ...response.data],
        loading: false,
        pagination: {
          page: response.meta.page || 1,
          hasMore: response.meta.hasMore || false,
          totalPages: response.meta.totalPages || 1
        }
      }));

      return response;
    } catch (error) {
      update(s => ({ ...s, loading: false, error }));
      if (options.onError) {
        options.onError(error);
      }
      throw error;
    }
  }

  function setSelected(items: T[]) {
    update(s => ({ ...s, selected: items }));
  }

  function toggleSelected(item: T) {
    update(s => {
      const isSelected = s.selected.some(i => i.id === item.id);
      return {
        ...s,
        selected: isSelected
          ? s.selected.filter(i => i.id !== item.id)
          : [...s.selected, item]
      };
    });
  }

  function setupRefreshInterval() {
    if (options.refreshInterval && !refreshTimer) {
      refreshTimer = setInterval(() => {
        query();
      }, options.refreshInterval);
    }
  }

  function cleanup() {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  }

  if (options.autoLoad) {
    query();
  }

  setupRefreshInterval();

  return {
    subscribe,
    query,
    create,
    update,
    remove,
    loadMore,
    setSelected,
    toggleSelected,
    reset: () => {
      set({
        data: [],
        loading: false,
        error: null,
        pagination: {
          page: 1,
          hasMore: true,
          totalPages: 1
        },
        selected: []
      });
    },
    destroy: () => {
      cleanup();
    }
  };
}

export const createBridgeStore = <T>(
  resourceName: string,
  options?: BridgeStoreOptions<T>
) => {
  return (client: PubFlow) => createBridgeStore<T>(resourceName, client, options);
};
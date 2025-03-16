// src/adapters/svelte/stores/query.ts
import { writable } from 'svelte/store';

export function createQuery<T>(
  queryFn: () => Promise<T>,
  options: {
    enabled?: boolean;
    initialData?: T;
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
  } = {}
) {
  const store = writable({
    data: options.initialData,
    loading: false,
    error: null
  });

  async function execute() {
    try {
      store.update(s => ({ ...s, loading: true, error: null }));
      const data = await queryFn();
      store.update(s => ({ ...s, data, loading: false }));
      if (options.onSuccess) options.onSuccess(data);
      return data;
    } catch (error) {
      store.update(s => ({ ...s, loading: false, error }));
      if (options.onError) options.onError(error);
      throw error;
    }
  }

  if (options.enabled !== false) {
    execute();
  }

  return {
    ...store,
    execute,
    refresh: execute
  };
}

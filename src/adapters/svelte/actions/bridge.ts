// src/adapters/svelte/actions/bridge.ts
import { get } from 'svelte/store';
import { createBridgeStore } from '../stores/bridge';

export interface BridgeActionOptions {
  resource: string;
  autoLoad?: boolean;
  pageSize?: number;
  refreshInterval?: number;
  loadingClass?: string;
  errorClass?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function bridge(node: HTMLElement, options: BridgeActionOptions) {
  const store = createBridgeStore(options.resource);
  let unsubscribe: () => void;
  let refreshInterval: NodeJS.Timeout | null = null;

  async function loadData() {
    try {
      node.classList.add(options.loadingClass || 'loading');
      await store.query({ pageSize: options.pageSize });
      node.classList.remove(options.loadingClass || 'loading');
      options.onSuccess?.(get(store).data);
    } catch (error) {
      node.classList.remove(options.loadingClass || 'loading');
      node.classList.add(options.errorClass || 'error');
      options.onError?.(error);
    }
  }

  function setupRefreshInterval() {
    if (options.refreshInterval && !refreshInterval) {
      refreshInterval = setInterval(loadData, options.refreshInterval);
    }
  }

  function clearRefreshInterval() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }

  unsubscribe = store.subscribe(state => {
    node.classList.toggle(options.loadingClass || 'loading', state.loading);
    node.classList.toggle(options.errorClass || 'error', !!state.error);
  });

  if (options.autoLoad) {
    loadData();
  }

  setupRefreshInterval();

  return {
    update(newOptions: BridgeActionOptions) {
      clearRefreshInterval();
      options = newOptions;
      if (options.autoLoad) {
        loadData();
      }
      setupRefreshInterval();
    },
    destroy() {
      unsubscribe();
      clearRefreshInterval();
    }
  };
}
// src/runtime/cloudflare.ts
import type { RuntimeAdapter, FetchOptions, StorageInterface } from './types';

/**
 * KV-based storage implementation for Cloudflare Workers
 * Note: This is a simplified implementation. In a real Cloudflare Workers environment,
 * you would use KV namespaces which need to be bound to the worker.
 */
class CloudflareStorage implements StorageInterface {
  private storage = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    // In a real implementation, this would use KV.get(key)
    return this.storage.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    // In a real implementation, this would use KV.put(key, value)
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    // In a real implementation, this would use KV.delete(key)
    this.storage.delete(key);
  }
}

/**
 * Cloudflare Workers runtime adapter implementation
 */
export class CloudflareAdapter implements RuntimeAdapter {
  type = 'cloudflare' as const;
  private storage: CloudflareStorage;

  constructor() {
    this.storage = new CloudflareStorage();
  }

  async fetch(url: string, options?: FetchOptions): Promise<Response> {
    // Cloudflare Workers have native fetch implementation
    return fetch(url, options);
  }

  getStorage(): StorageInterface {
    return this.storage;
  }

  supportsFeature(feature: string): boolean {
    switch (feature) {
      case 'fetch':
        return true; // Cloudflare Workers have native fetch
      case 'localStorage':
        return false; // Cloudflare Workers don't have localStorage
      case 'cache':
        return typeof caches !== 'undefined'; // Check for Cache API
      default:
        return false;
    }
  }
}
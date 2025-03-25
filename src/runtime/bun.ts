// src/runtime/bun.ts
import type { RuntimeAdapter, FetchOptions, StorageInterface } from './types';

/**
 * In-memory storage implementation for Bun
 */
class BunStorage implements StorageInterface {
  private storage = new Map<string, string>();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }
}

/**
 * Bun runtime adapter implementation
 */
export class BunAdapter implements RuntimeAdapter {
  type = 'bun' as const;
  private storage: BunStorage;

  constructor() {
    this.storage = new BunStorage();
  }

  async fetch(url: string, options?: FetchOptions): Promise<Response> {
    // Bun has native fetch implementation
    return fetch(url, options);
  }

  getStorage(): StorageInterface {
    return this.storage;
  }

  supportsFeature(feature: string): boolean {
    switch (feature) {
      case 'fetch':
        return true; // Bun has native fetch
      case 'localStorage':
        return false; // Bun doesn't have localStorage in non-browser environments
      default:
        return false;
    }
  }
}
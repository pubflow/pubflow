// src/runtime/browser.ts
import type { RuntimeAdapter, FetchOptions, StorageInterface } from './types';

/**
 * LocalStorage-based storage implementation for browsers
 */
class BrowserStorage implements StorageInterface {
  getItem(key: string): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }

  setItem(key: string, value: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
}

/**
 * Browser runtime adapter implementation
 */
export class BrowserAdapter implements RuntimeAdapter {
  type = 'browser' as const;
  private storage: BrowserStorage;

  constructor() {
    this.storage = new BrowserStorage();
  }

  async fetch(url: string, options?: FetchOptions): Promise<Response> {
    return fetch(url, options);
  }

  getStorage(): StorageInterface {
    return this.storage;
  }

  supportsFeature(feature: string): boolean {
    switch (feature) {
      case 'fetch':
        return typeof fetch === 'function';
      case 'localStorage':
        return typeof localStorage !== 'undefined';
      case 'sessionStorage':
        return typeof sessionStorage !== 'undefined';
      default:
        return false;
    }
  }
}
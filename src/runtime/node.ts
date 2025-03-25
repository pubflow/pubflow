// src/runtime/node.ts
import type { RuntimeAdapter, FetchOptions, StorageInterface } from './types';

/**
 * In-memory storage implementation for Node.js
 */
class NodeStorage implements StorageInterface {
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
 * Node.js runtime adapter implementation
 */
export class NodeAdapter implements RuntimeAdapter {
  type = 'node' as const;
  private storage: NodeStorage;

  constructor() {
    this.storage = new NodeStorage();
  }

  async fetch(url: string, options?: FetchOptions): Promise<Response> {
    // Use native fetch in Node.js 18+ or fallback to node-fetch
    if (typeof global.fetch === 'function') {
      return global.fetch(url, options);
    }
    
    // For older Node.js versions, we would need to use a polyfill
    // This would typically be handled by a bundler or dependency
    throw new Error('Fetch API is not available in this Node.js environment. Please use Node.js 18+ or install a fetch polyfill.');
  }

  getStorage(): StorageInterface {
    return this.storage;
  }

  supportsFeature(feature: string): boolean {
    switch (feature) {
      case 'fetch':
        return typeof global.fetch === 'function';
      case 'localStorage':
        return false; // Node.js doesn't have localStorage
      default:
        return false;
    }
  }
}
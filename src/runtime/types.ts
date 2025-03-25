// src/runtime/types.ts

/**
 * Supported runtime environments
 */
export type RuntimeType = 'node' | 'bun' | 'cloudflare' | 'browser';

/**
 * Storage interface for different runtime environments
 */
export interface StorageInterface {
  /**
   * Get a value from storage
   */
  getItem(key: string): Promise<string | null> | string | null;
  
  /**
   * Set a value in storage
   */
  setItem(key: string, value: string): Promise<void> | void;
  
  /**
   * Remove a value from storage
   */
  removeItem(key: string): Promise<void> | void;
}

/**
 * Fetch options interface compatible with all runtimes
 */
export interface FetchOptions extends RequestInit {
  // Additional options specific to our implementation
  timeout?: number;
}

/**
 * Runtime adapter interface for different JavaScript environments
 */
export interface RuntimeAdapter {
  /**
   * The type of runtime
   */
  type: RuntimeType;
  
  /**
   * Fetch implementation for the runtime
   */
  fetch(url: string, options?: FetchOptions): Promise<Response>;
  
  /**
   * Get a storage implementation for the runtime
   */
  getStorage(): StorageInterface;
  
  /**
   * Check if the runtime supports a specific feature
   */
  supportsFeature(feature: string): boolean;
}
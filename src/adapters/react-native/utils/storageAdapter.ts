// src/adapters/react-native/utils/storageAdapter.ts
import { ExpoStorage } from './expo';
import { NativeStorage } from './storage';

/**
 * Adapter class that wraps ExpoStorage or NativeStorage to implement the standard Storage interface
 */
export class ReactNativeStorageAdapter implements Storage {
  private storage: ExpoStorage | NativeStorage;
  
  constructor(storage: ExpoStorage | NativeStorage) {
    this.storage = storage;
  }

  // Required Storage interface properties
  get length(): number {
    return 0; // Not applicable for our use case, but required by the interface
  }

  clear(): void {
    this.storage.clearSession();
  }

  getItem(key: string): string | null {
    // This is synchronous in the Storage interface, but our underlying storage is async
    // For the interface compatibility, we return null and handle the async nature elsewhere
    return null;
  }

  key(index: number): string | null {
    // Not applicable for our use case, but required by the interface
    return null;
  }

  removeItem(key: string): void {
    // Handle this as a no-op since our specific keys are handled by the underlying storage
  }

  setItem(key: string, value: string): void {
    // This is synchronous in the Storage interface, but our underlying storage is async
    // For the interface compatibility, we handle it as a no-op here
  }

  // Additional methods to access the underlying async storage
  async getSessionAsync(): Promise<any> {
    return this.storage.getSession();
  }

  async setSessionAsync(session: any): Promise<void> {
    return this.storage.setSession(session);
  }

  async clearSessionAsync(): Promise<void> {
    return this.storage.clearSession();
  }

  async getTokenAsync(): Promise<string | null> {
    return this.storage.getToken();
  }

  async setTokenAsync(token: string): Promise<void> {
    return this.storage.setToken(token);
  }
}

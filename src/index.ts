// src/index.ts
import { HttpClient } from './core/http';
import { AuthService } from './services/auth';
import { BridgeService } from './services/bridge';
import { runtime } from './runtime';
import type { PubFlowConfig } from './types/core';
import type { StorageAdapter } from './types/storage';

// Adapter to bridge between our StorageAdapter interface and the runtime storage
class RuntimeStorageAdapter implements StorageAdapter {
  constructor(private customStorage?: Storage | null) {}

  getItem(key: string): string | null | Promise<string | null> {
    if (this.customStorage) {
      try {
        return this.customStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return runtime.getStorage().getItem(key);
  }

  setItem(key: string, value: string): void | Promise<void> {
    if (this.customStorage) {
      this.customStorage.setItem(key, value);
      return;
    }
    return runtime.getStorage().setItem(key, value);
  }

  removeItem(key: string): void | Promise<void> {
    if (this.customStorage) {
      this.customStorage.removeItem(key);
      return;
    }
    return runtime.getStorage().removeItem(key);
  }
}

export class PubFlow {
  private http: HttpClient;
  private storage: StorageAdapter;
  public auth: AuthService;
  public bridge: BridgeService;
  public runtime = runtime.type;

  constructor(config: PubFlowConfig) {
    this.storage = new RuntimeStorageAdapter(config.storage);
    this.http = new HttpClient(config.baseUrl, config.defaultHeaders);
    this.auth = new AuthService(this.http, this.storage);
    this.bridge = new BridgeService(this.http);
  }
}

export * from './types';
export * from './core/errors';
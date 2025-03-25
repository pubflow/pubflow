// src/core/storage.ts
import type { AuthResponse } from '../types/auth';
import { runtime } from '../runtime';

export class SessionStorage {
  static KEY = 'pubflow_session';

  static async save(authResponse: AuthResponse) {
    const storage = runtime.getStorage();
    const value = JSON.stringify(authResponse);
    await storage.setItem(this.KEY, value);
  }

  static async get(): Promise<AuthResponse | null> {
    const storage = runtime.getStorage();
    const data = await storage.getItem(this.KEY);
    return data ? JSON.parse(data) : null;
  }

  static async clear() {
    const storage = runtime.getStorage();
    await storage.removeItem(this.KEY);
  }
}
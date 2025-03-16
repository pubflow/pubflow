// src/adapters/svelte/utils/storage.ts
export class SvelteStorage {
    private readonly SESSION_KEY = 'pubflow_session';
    private readonly TOKEN_KEY = 'pubflow_token';
  
    constructor(private storage: Storage = typeof window !== 'undefined' ? window.localStorage : null) {}
  
    async getSession(): Promise<any> {
      try {
        const data = this.storage?.getItem(this.SESSION_KEY);
        return data ? JSON.parse(data) : null;
      } catch {
        return null;
      }
    }
  
    async setSession(session: any): Promise<void> {
      try {
        this.storage?.setItem(this.SESSION_KEY, JSON.stringify(session));
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
  
    async clearSession(): Promise<void> {
      try {
        this.storage?.removeItem(this.SESSION_KEY);
        this.storage?.removeItem(this.TOKEN_KEY);
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }
  
    async getToken(): Promise<string | null> {
      try {
        return this.storage?.getItem(this.TOKEN_KEY) || null;
      } catch {
        return null;
      }
    }
  
    async setToken(token: string): Promise<void> {
      try {
        this.storage?.setItem(this.TOKEN_KEY, token);
      } catch (error) {
        console.error('Error saving token:', error);
      }
    }
  
    async clearToken(): Promise<void> {
      try {
        this.storage?.removeItem(this.TOKEN_KEY);
      } catch (error) {
        console.error('Error clearing token:', error);
      }
    }
  }
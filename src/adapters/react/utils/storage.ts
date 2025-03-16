// src/adapters/react/utils/storage.ts
export class LocalStorage {
    private storage: Storage;
  
    constructor(storage?: Storage) {
      this.storage = storage || (typeof window !== 'undefined' ? window.localStorage : null);
    }
  
    getSession() {
      try {
        const data = this.storage?.getItem('pubflow_session');
        return data ? JSON.parse(data) : null;
      } catch {
        return null;
      }
    }
  
    setSession(session: any) {
      this.storage?.setItem('pubflow_session', JSON.stringify(session));
    }
  
    clearSession() {
      this.storage?.removeItem('pubflow_session');
    }
  }
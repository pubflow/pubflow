// src/adapters/react/utils/storage.ts
export class LocalStorage {
  private storage: Storage | null;

  constructor(storage?: Storage | null) {
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
    if (this.storage) {
      this.storage.setItem('pubflow_session', JSON.stringify(session));
    }
  }

  clearSession() {
    if (this.storage) {
      this.storage.removeItem('pubflow_session');
    }
  }
}
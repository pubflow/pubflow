// src/core/storage.ts
export class SessionStorage {
    static KEY = 'pubflow_session';
  
    static save(authResponse: AuthResponse) {
      localStorage.setItem(this.KEY, JSON.stringify(authResponse));
    }
  
    static get(): AuthResponse | null {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : null;
    }
  
    static clear() {
      localStorage.removeItem(this.KEY);
    }
  }
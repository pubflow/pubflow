// src/adapters/html/utils/storage.js
export class Storage {
    constructor() {
      this.prefix = 'pubflow_';
    }
  
    async getSession() {
      try {
        const data = localStorage.getItem(this.prefix + 'session');
        return data ? JSON.parse(data) : null;
      } catch {
        return null;
      }
    }
  
    async setSession(session) {
      localStorage.setItem(this.prefix + 'session', JSON.stringify(session));
    }
  
    async clearSession() {
      localStorage.removeItem(this.prefix + 'session');
    }
  }
  
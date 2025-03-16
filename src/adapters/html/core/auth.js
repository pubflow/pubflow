
// src/adapters/html/core/auth.js
export class Auth {
    constructor(client) {
      this.client = client;
      this.storage = new Storage();
    }
  
    async login(credentials) {
      try {
        const response = await this.client.post('/auth/login', credentials);
        if (response.success) {
          await this.storage.setSession(response);
          this.dispatchEvent('auth:login', response);
          return response;
        }
        throw new Error(response.error);
      } catch (error) {
        this.dispatchEvent('auth:error', error);
        throw error;
      }
    }
  
    async logout() {
      try {
        await this.client.post('/auth/logout');
        await this.storage.clearSession();
        this.dispatchEvent('auth:logout');
      } catch (error) {
        this.dispatchEvent('auth:error', error);
        throw error;
      }
    }
  
    async isAuthenticated() {
      const session = await this.storage.getSession();
      return !!session;
    }
  
    async hasRole(roles) {
      const session = await this.storage.getSession();
      if (!session) return false;
      if (!roles) return true;
  
      const userRoles = Array.isArray(session.user.roles)
        ? session.user.roles
        : [session.user.userType];
  
      const requiredRoles = Array.isArray(roles) ? roles : [roles];
      return requiredRoles.some(role => userRoles.includes(role));
    }
  
    dispatchEvent(type, detail = {}) {
      document.dispatchEvent(new CustomEvent(type, { detail }));
    }
  }
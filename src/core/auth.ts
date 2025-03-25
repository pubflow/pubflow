// src/core/auth.ts
import { HttpClient } from './http';
import { AuthResponse } from '../types/auth';
import { SessionStorage } from './storage';
import type { StorageAdapter } from '../types/storage';

export class AuthService {
    constructor(
      private http: HttpClient,
      private storage: StorageAdapter
    ) {}
  
    async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
      const response = await this.http.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: credentials
      });
      if (response.success) {
        await SessionStorage.save(response);
      }
      return response;
    }
  
    async logout() {
      await this.http.request('/auth/logout', { method: 'POST' });
      await SessionStorage.clear();
    }
  
    async getSession(): Promise<AuthResponse | null> {
      return SessionStorage.get();
    }
  
    async hasUserType(requiredTypes?: string | string[]): Promise<boolean> {
      const session = await this.getSession();
      if (!session) return false;
      
      if (!requiredTypes) return true;
      
      const types = Array.isArray(requiredTypes) 
        ? requiredTypes 
        : requiredTypes.split(',').map(t => t.trim());
      
      return types.includes(session.user.userType);
    }
  }
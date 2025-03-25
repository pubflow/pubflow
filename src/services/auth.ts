// src/services/auth.ts
import { HttpClient } from '../core/http';
import { StorageAdapter } from '../types/storage';
import { PubFlowSession, PubFlowResponse } from '../types/core';
import { AuthenticationError } from '../core/errors';
export class AuthService {
    constructor(
      private http: HttpClient,
      private storage: StorageAdapter
    ) {}
  
    async login(credentials: { email?: string; userName?: string; password: string }): Promise<PubFlowSession> {
      const response = await this.http.request<PubFlowResponse<PubFlowSession>>('/auth/login', {
        method: 'POST',
        body: credentials
      });
  
      if (response.success && response.data) {
        await this.storage.setItem('pubflow_session', JSON.stringify(response.data));
        return response.data;
      }
  
      throw new AuthenticationError('Login failed');
    }
  
    async logout(): Promise<void> {
      await this.http.request('/auth/logout', { method: 'POST' });
      await this.storage.removeItem('pubflow_session');
    }
  
    async getSession(): Promise<PubFlowSession | null> {
      const stored = await this.storage.getItem('pubflow_session');
      return stored ? JSON.parse(stored) : null;
    }
  
    async validateSession(sessionId?: string): Promise<PubFlowSession | null> {
      try {
        const response = await this.http.request<PubFlowResponse<PubFlowSession>>('/auth/validation', {
          method: 'POST',
          body: sessionId ? { sessionId } : undefined
        });
        return response.success && response.data ? response.data : null;
      } catch {
        return null;
      }
    }

    async hasUserType(userTypes: string | string[]): Promise<boolean> {
      const session = await this.getSession();
      if (!session) return false;
      
      const types = Array.isArray(userTypes) ? userTypes : [userTypes];
      return types.includes(session.user.userType);
    }
  }
  
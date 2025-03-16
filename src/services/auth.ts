// src/services/auth.ts
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
  
    async validateSession(): Promise<boolean> {
      try {
        await this.http.request('/auth/validation');
        return true;
      } catch {
        return false;
      }
    }
  }
  
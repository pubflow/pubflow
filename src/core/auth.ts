// src/core/auth.ts
export class AuthService {
    constructor(private client: PubFlow) {}
  
    async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
      const response = await this.client.http.post<AuthResponse>('/auth/login', credentials);
      if (response.success) {
        SessionStorage.save(response);
      }
      return response;
    }
  
    async logout() {
      await this.client.http.post('/auth/logout');
      SessionStorage.clear();
    }
  
    getSession(): AuthResponse | null {
      return SessionStorage.get();
    }
  
    hasUserType(requiredTypes?: string | string[]): boolean {
      const session = this.getSession();
      if (!session) return false;
      
      if (!requiredTypes) return true;
      
      const types = Array.isArray(requiredTypes) 
        ? requiredTypes 
        : requiredTypes.split(',').map(t => t.trim());
      
      return types.includes(session.user.userType);
    }
  }
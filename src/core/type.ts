// src/core/types.ts
export interface PubFlowUser {
    email: string;
    name: string;
    userType: string;
    [key: string]: any;
  }
  
  export interface AuthResponse {
    success: boolean;
    user: PubFlowUser;
    sessionId: string;
  }
  
  
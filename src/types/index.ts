// src/types/index.ts
export interface PubFlowConfig {
    baseUrl: string;
    storage?: Storage;
    debug?: boolean;
    defaultHeaders?: Record<string, string>;
    scheduledTaskSecret?: string;
  }
  
  export interface PubFlowUser {
    id: string;
    email: string;
    name: string;
    userType: string;
    avatar?: string;
  }
  
  export interface PubFlowSession {
    sessionId: string;
    user: PubFlowUser;
    expiresAt: string;
    lastUsedAt: string;
  }
  
  export interface PubFlowResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
    meta?: {
      page?: number;
      limit?: number;
      hasMore?: boolean;
      timestamp?: string;
      query?: string;
    }
  }
  
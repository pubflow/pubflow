// src/types/auth.ts
import { PubFlowUser } from './core';

export interface AuthResponse {
  success: boolean;
  user: PubFlowUser;
  sessionId: string;
  expiresAt?: string;
  lastUsedAt?: string;
}
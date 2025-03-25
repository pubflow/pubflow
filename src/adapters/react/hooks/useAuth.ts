// src/adapters/react/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { usePubFlowContext } from '../components/PubFlowProvider';
import { PubFlowSession } from '../../../types/core';
import { AuthResponse } from '../../../types/auth';

export function useAuth() {
  const { client, storage } = usePubFlowContext();
  const [session, setSession] = useState<PubFlowSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    try {
      setLoading(true);
      const response = await client.auth.login(credentials);
      setSession(response);
      storage.setSession(response);
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, storage]);

  const logout = useCallback(async () => {
    try {
      await client.auth.logout();
      setSession(null);
      storage.clearSession();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [client, storage]);

  const isAuthorized = useCallback((roles?: string | string[]) => {
    if (!session) return false;
    if (!roles) return true;

    // Use userType since roles doesn't exist on PubFlowUser
    const userType = session.user.userType;
    
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return requiredRoles.includes(userType);
  }, [session]);

  useEffect(() => {
    const savedSession = storage.getSession();
    if (savedSession) {
      setSession(savedSession as PubFlowSession);
    }
    setLoading(false);
  }, [storage]);

  return {
    session,
    loading,
    error,
    login,
    logout,
    isAuthorized
  };
}

// src/adapters/react/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { usePubFlowContext } from '../components/PubFlowProvider';

export function useAuth() {
  const { client, storage } = usePubFlowContext();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      const response = await client.auth.login(credentials);
      setSession(response);
      storage.setSession(response);
      return response;
    } catch (err) {
      setError(err);
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
      setError(err);
      throw err;
    }
  }, [client, storage]);

  const isAuthorized = useCallback((roles?: string | string[]) => {
    if (!session) return false;
    if (!roles) return true;

    const userRoles = Array.isArray(session.user.roles) 
      ? session.user.roles 
      : [session.user.userType];
    
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return requiredRoles.some(role => userRoles.includes(role));
  }, [session]);

  useEffect(() => {
    const savedSession = storage.getSession();
    if (savedSession) {
      setSession(savedSession);
    }
    setLoading(false);
  }, []);

  return {
    session,
    loading,
    error,
    login,
    logout,
    isAuthorized
  };
}

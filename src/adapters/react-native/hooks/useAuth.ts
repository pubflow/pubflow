// src/adapters/react-native/hooks/useAuth.ts
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { usePubFlowContext } from '../components/PubFlowProvider';

export interface UseAuthOptions {
  onSessionExpired?: () => void;
  onUnauthorized?: () => void;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { client, storage } = usePubFlowContext();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkSession = useCallback(async () => {
    try {
      const savedSession = await storage.getSession();
      if (savedSession) {
        const isValid = await client.auth.validateSession(savedSession.sessionId);
        if (!isValid) {
          await storage.clearSession();
          setSession(null);
          options.onSessionExpired?.();
          return;
        }
        setSession(savedSession);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [client, storage]);

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await client.auth.login(credentials);
      await storage.setSession(response);
      setSession(response);
      return response;
    } catch (err) {
      setError(err);
      Alert.alert('Error', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, storage]);

  const logout = useCallback(async () => {
    try {
      await client.auth.logout();
      await storage.clearSession();
      setSession(null);
    } catch (err) {
      setError(err);
      Alert.alert('Error', err.message);
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
    checkSession();
  }, []);

  return {
    session,
    user: session?.user,
    loading,
    error,
    login,
    logout,
    isAuthorized,
    checkSession
  };
}
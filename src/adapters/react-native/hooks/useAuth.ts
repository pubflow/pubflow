// src/adapters/react-native/hooks/useAuth.ts
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { usePubFlowContext } from '../components/PubFlowProvider';
import { PubFlowSession } from '../../../types/core';

interface LoginCredentials {
  email?: string;
  userName?: string;
  password: string;
}

export function useAuth() {
  const { client, storage } = usePubFlowContext();
  const [session, setSession] = useState<PubFlowSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const checkSession = useCallback(async () => {
    try {
      const savedSession = await storage.getSession();
      if (savedSession) {
        setSession(savedSession as PubFlowSession);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [client, storage]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await client.auth.login(credentials);
      await storage.setSession(response);
      setSession(response);
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error);
      Alert.alert('Error', error.message || 'Login failed');
      throw error;
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
      const error = err as Error;
      setError(error);
      Alert.alert('Error', error.message || 'Logout failed');
      throw error;
    }
  }, [client, storage]);

  const isAuthorized = useCallback((userTypes?: string | string[]) => {
    if (!session) return false;
    if (!userTypes) return true;

    const userType = session.user.userType;
    const requiredTypes = Array.isArray(userTypes) ? userTypes : [userTypes];
    return requiredTypes.includes(userType);
  }, [session]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

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

// src/adapters/react-native/components/PubFlowProvider.tsx
import React, { createContext, useContext } from 'react';
import type { PubFlow } from '../../..';
import { NativeStorage } from '../utils/storage';
import type { ViewStyle } from 'react-native';

interface PubFlowContextValue {
  client: PubFlow;
  storage: NativeStorage;
}

interface PubFlowProviderProps {
  client: PubFlow;
  children: React.ReactNode;
  options?: {
    autoLogin?: boolean;
    loading?: React.ComponentType;
    onError?: (error: any) => void;
    style?: ViewStyle;
  };
}

const PubFlowContext = createContext<PubFlowContextValue | null>(null);

export function PubFlowProvider({ 
  client, 
  children, 
  options = {} 
}: PubFlowProviderProps) {
  const storage = new NativeStorage();

  const [initialized, setInitialized] = React.useState(!options.autoLogin);
  const [error, setError] = React.useState<any>(null);

  React.useEffect(() => {
    if (options.autoLogin) {
      storage.getSession()
        .then((sessionData) => {
          if (sessionData) {
            // Instead of using a non-existent restoreSession method,
            // we'll use the session data directly
            // The session will be available through the storage
            // and the auth service can access it with getSession()
            return client.auth.validateSession();
          }
        })
        .catch((err) => {
          if (options.onError) {
            options.onError(err);
          }
          setError(err);
        })
        .finally(() => {
          setInitialized(true);
        });
    }
  }, [options.autoLogin]);

  if (!initialized && options.loading) {
    const LoadingComponent = options.loading;
    return <LoadingComponent />;
  }

  return (
    <PubFlowContext.Provider value={{ client, storage }}>
      {children}
    </PubFlowContext.Provider>
  );
}

export function usePubFlowContext() {
  const context = useContext(PubFlowContext);
  if (!context) {
    throw new Error('usePubFlowContext must be used within PubFlowProvider');
  }
  return context;
}

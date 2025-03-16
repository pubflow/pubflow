// src/adapters/react/components/PubFlowProvider.tsx
import React, { createContext, useContext } from 'react';
import type { PubFlow } from '../../../core/client';
import { LocalStorage } from '../utils/storage';

interface PubFlowContextValue {
  client: PubFlow;
  storage: LocalStorage;
}

interface PubFlowProviderProps {
  client: PubFlow;
  children: React.ReactNode;
  options?: {
    autoLogin?: boolean;
    loading?: React.ReactNode;
    onError?: (error: any) => void;
    storage?: Storage;
  };
}

const PubFlowContext = createContext<PubFlowContextValue | null>(null);

export function PubFlowProvider({ client, children, options = {} }: PubFlowProviderProps) {
  const storage = new LocalStorage(options.storage);

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
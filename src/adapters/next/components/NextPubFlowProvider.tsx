import React from 'react';
import { PubFlowProvider } from '../../react';
import type { PubFlow } from '../../..';


export interface NextPubFlowProviderProps {
  client: PubFlow;
  children: React.ReactNode;
  options?: {
    autoLogin?: boolean;
    loading?: React.ReactNode;
    onError?: (error: any) => void;
    loginPath?: string;
    unauthorizedPath?: string;
  };
}

export function NextPubFlowProvider({
  client,
  children,
  options = {}
}: NextPubFlowProviderProps) {
  return (
    <PubFlowProvider
      client={client}
      options={{
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        ...options
      }}
    >
      {children}
    </PubFlowProvider>
  );
}

// src/adapters/next/components/NextPubFlowProvider.tsx
import { PubFlowProvider } from '../../react';
import type { PubFlow } from '../../../core/client';

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
        storage: typeof window !== 'undefined' ? window.localStorage : null,
        ...options
      }}
    >
      {children}
    </PubFlowProvider>
  );
}
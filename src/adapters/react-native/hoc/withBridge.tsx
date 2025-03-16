// src/adapters/react-native/hoc/withBridge.tsx
import React from 'react';
import { useBridge } from '../hooks/useBridge';
import type { BridgeSchema } from '../../../core/schema';

interface WithBridgeOptions<T> {
  resourceName: string;
  schema?: BridgeSchema;
  autoLoad?: boolean;
  onError?: (error: any) => void;
  onSuccess?: (data: T[]) => void;
}

export function withBridge<P extends object, T = any>(
  Component: React.ComponentType<P>,
  options: WithBridgeOptions<T>
) {
  return function WrappedComponent(props: P) {
    const bridge = useBridge<T>(options.resourceName, {
      schema: options.schema,
      autoLoad: options.autoLoad,
      onError: options.onError,
      onSuccess: options.onSuccess
    });

    return <Component {...props} bridge={bridge} />;
  };
}
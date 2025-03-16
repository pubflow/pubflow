// src/adapters/react/hoc/withBridge.tsx
import React from 'react';
import { useBridge } from '../hooks/useBridge';

interface WithBridgeOptions {
  resourceName: string;
  immediate?: boolean;
}

export function withBridge<P extends object>(
  Component: React.ComponentType<P>,
  options: WithBridgeOptions
) {
  return function WrappedComponent(props: P) {
    const bridge = useBridge(options.resourceName, {
      autoLoad: options.immediate
    });

    return <Component {...props} bridge={bridge} />;
  };
}

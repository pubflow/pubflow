// src/adapters/next/hoc/withNextBridge.tsx
import { useMemo } from 'react';
import { useNextBridge } from '../hooks/useNextBridge';
import type { UseBridgeOptions } from '../../react';

export interface WithNextBridgeOptions<T> extends UseBridgeOptions<T> {
  resourceName: string;
}

export function withNextBridge<P extends object, T = any>(
  Component: React.ComponentType<P>,
  options: WithNextBridgeOptions<T>
) {
  return function WrappedComponent(props: P) {
    const bridge = useNextBridge<T>(options.resourceName, options);
    
    const enhancedProps = useMemo(() => ({
      ...props,
      bridge
    }), [props, bridge]);

    return <Component {...enhancedProps} />;
  };
}
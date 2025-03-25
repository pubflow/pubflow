import React from 'react';
import { useMemo } from 'react';
import { useNextBridge } from '../hooks/useNextBridge';
import type { UseBridgeOptions } from '../../../types/adapters';
import { WithId } from '../../react/hooks/useBridge';

export interface WithNextBridgeOptions<T> extends UseBridgeOptions<T> {
  resourceName: string;
}

export function withNextBridge<P extends object, T extends WithId = WithId>(
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

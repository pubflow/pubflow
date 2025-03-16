// src/adapters/react-native/hoc/withAuth.tsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import type { ViewStyle } from 'react-native';

interface WithAuthOptions {
  roles?: string | string[];
  redirectTo?: string;
  LoadingComponent?: React.ComponentType;
  onUnauthorized?: () => void;
  style?: ViewStyle;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  return function WrappedComponent(props: P) {
    const { session, loading, isAuthorized } = useAuth();

    React.useEffect(() => {
      if (!loading && !session && options.onUnauthorized) {
        options.onUnauthorized();
      }
    }, [loading, session]);

    if (loading) {
      return options.LoadingComponent ? (
        <options.LoadingComponent />
      ) : (
        <View style={[styles.container, options.style]}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (!session || (options.roles && !isAuthorized(options.roles))) {
      return null;
    }

    return <Component {...props} session={session} />;
  };
}

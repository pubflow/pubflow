// src/adapters/react-native/hoc/withAuth.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import type { ViewStyle } from 'react-native';

// Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

interface WithAuthOptions {
  LoadingComponent?: React.ComponentType;
  style?: ViewStyle;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  return function WrappedComponent(props: P) {
    const { session, loading } = useAuth();

    if (loading) {
      return options.LoadingComponent ? (
        <options.LoadingComponent />
      ) : (
        <View style={[styles.container, options.style]}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    // Simplified: just check if session exists
    if (!session) {
      return null;
    }

    return <Component {...props} session={session} />;
  };
}

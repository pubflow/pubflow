// src/adapters/react-native/components/Guards/AuthGuard.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import type { ViewStyle } from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  onUnauthenticated?: () => void;
  loading?: React.ComponentType;
  style?: ViewStyle;
  loadingStyle?: ViewStyle;
}

export function AuthGuard({
  children,
  fallback: FallbackComponent,
  onUnauthenticated,
  loading: LoadingComponent,
  style,
  loadingStyle,
}: AuthGuardProps) {
  const { session, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !session && onUnauthenticated) {
      onUnauthenticated();
    }
  }, [loading, session, onUnauthenticated]);

  if (loading) {
    return LoadingComponent ? (
      <LoadingComponent />
    ) : (
      <View style={[styles.container, loadingStyle]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return FallbackComponent ? <FallbackComponent /> : null;
  }

  return <View style={style}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


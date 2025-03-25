// src/adapters/react-native/components/BridgeView.tsx
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { useAuth } from '../hooks/useAuth';

interface BridgeViewProps {
  children: React.ReactNode;
  userTypes?: string | string[];
  requireAuth?: boolean;
  onUnauthorized?: () => void;
  loading?: React.ComponentType;
  unauthorized?: React.ComponentType;
  style?: ViewStyle;
  loadingStyle?: ViewStyle;
  unauthorizedStyle?: ViewStyle;
}

export function BridgeView({
  children,
  userTypes,
  requireAuth = true,
  onUnauthorized,
  loading: LoadingComponent,
  unauthorized: UnauthorizedComponent,
  style,
  loadingStyle,
  unauthorizedStyle
}: BridgeViewProps) {
  const { session, loading, isAuthorized } = useAuth();

  React.useEffect(() => {
    if (!loading && requireAuth && !session) {
      onUnauthorized?.();
    }
  }, [loading, session, requireAuth]);

  if (loading) {
    return LoadingComponent ? (
      <LoadingComponent />
    ) : (
      <View style={[styles.container, loadingStyle]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (requireAuth && !session) {
    return null;
  }

  if (userTypes && !isAuthorized(userTypes)) {
    return UnauthorizedComponent ? (
      <UnauthorizedComponent />
    ) : (
      <View style={[styles.container, unauthorizedStyle]}>
        <Text style={styles.unauthorizedText}>
          No tiene acceso a este recurso
        </Text>
      </View>
    );
  }

  return <View style={style}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unauthorizedText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
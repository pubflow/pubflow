// src/adapters/react-native/components/Guards/RoleGuard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import type { ViewStyle } from 'react-native';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: string | string[];
  fallback?: React.ComponentType;
  onUnauthorized?: () => void;
  style?: ViewStyle;
  unauthorizedStyle?: ViewStyle;
}

export function RoleGuard({
  children,
  roles,
  fallback: FallbackComponent,
  onUnauthorized,
  style,
  unauthorizedStyle,
}: RoleGuardProps) {
  const { session, isAuthorized } = useAuth();
  const hasAccess = isAuthorized(roles);

  React.useEffect(() => {
    if (!hasAccess && onUnauthorized) {
      onUnauthorized();
    }
  }, [hasAccess, onUnauthorized]);

  if (!session || !hasAccess) {
    return FallbackComponent ? (
      <FallbackComponent />
    ) : (
      <View style={[styles.container, unauthorizedStyle]}>
        <Text style={styles.unauthorizedText}>
          No tiene permisos suficientes para acceder a este recurso
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
    padding: 20,
  },
  unauthorizedText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
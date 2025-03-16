# PubFlow React Native Documentation

## Table of Contents
1. [Installation](#installation)
2. [Basic Setup](#basic-setup)
3. [React Native Setup](#react-native-setup)
4. [Expo Setup](#expo-setup)
5. [Authentication](#authentication)
6. [Data Management](#data-management)
7. [Guards & Protection](#guards--protection)
8. [Advanced Usage](#advanced-usage)
9. [Best Practices](#best-practices)

## Installation

```bash
# Using npm
npm install pubflow @react-native-async-storage/async-storage

# Using yarn
yarn add pubflow @react-native-async-storage/async-storage

# For Expo projects, also install
expo install expo-secure-store expo-device expo-constants
Basic Setup
React Native Setup
Copy
// app/config/pubflow.ts
import { PubFlow } from 'pubflow/react-native';

export const pubflowClient = new PubFlow({
  baseUrl: 'https://api.example.com',
  debug: __DEV__
});

// App.tsx
import { PubFlowProvider } from 'pubflow/react-native';
import { pubflowClient } from './config/pubflow';

function App() {
  return (
    <PubFlowProvider 
      client={pubflowClient}
      options={{
        autoLogin: true,
        loading: LoadingScreen
      }}
    >
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </PubFlowProvider>
  );
}
Expo Setup
Copy
// app/config/pubflow.ts
import { createExpoPubFlow } from 'pubflow/react-native';

export const pubflowClient = createExpoPubFlow({
  baseUrl: 'https://api.example.com',
  useSecureStorage: true,
  deviceInfo: true
});

// App.tsx
import { PubFlowProvider } from 'pubflow/react-native';
import { pubflowClient } from './config/pubflow';

export default function App() {
  return (
    <PubFlowProvider 
      client={pubflowClient}
      options={{
        autoLogin: true,
        loading: LoadingScreen,
        onError: (error) => {
          Alert.alert('Error', error.message);
        }
      }}
    >
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </PubFlowProvider>
  );
}
Authentication Examples
Login Screen
Copy
// screens/LoginScreen.tsx
import { useAuth } from 'pubflow/react-native';
import { View, TextInput, Button, StyleSheet } from 'react-native';

export function LoginScreen({ navigation }) {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login({ email, password });
      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      <Button
        title={loading ? "Loading..." : "Login"}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}
Protected Navigator
Copy
// navigation/ProtectedNavigator.tsx
import { BridgeView } from 'pubflow/react-native';

export function ProtectedNavigator() {
  return (
    <BridgeView
      requireAuth
      onUnauthorized={() => navigation.replace('Login')}
      loading={LoadingScreen}
    >
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </BridgeView>
  );
}
Data Management Examples
Resource List
Copy
// screens/ResourceListScreen.tsx
import { useBridge } from 'pubflow/react-native';
import { View, FlatList, RefreshControl } from 'react-native';

export function ResourceListScreen() {
  const {
    data,
    loading,
    error,
    pagination,
    query,
    refresh
  } = useBridge('resources', {
    autoLoad: true,
    pageSize: 20
  });

  const renderItem = ({ item }) => (
    <ResourceItem 
      item={item}
      onPress={() => navigation.navigate('ResourceDetail', { id: item.id })}
    />
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refresh}
        />
      }
      onEndReached={() => pagination.loadMore()}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={EmptyState}
      ListFooterComponent={
        pagination.hasMore ? <LoadingIndicator /> : null
      }
    />
  );
}
Form with Validation
Copy
// schemas/resourceSchema.ts
import { BridgeSchema } from 'pubflow/react-native';
import { z } from 'zod';

export const resourceSchema = new BridgeSchema({
  name: 'resources',
  fields: {
    title: z.string().min(3),
    description: z.string(),
    status: z.enum(['active', 'inactive'])
  }
});

// screens/ResourceFormScreen.tsx
import { useBridge } from 'pubflow/react-native';
import { resourceSchema } from '../schemas';

export function ResourceFormScreen({ navigation, route }) {
  const { id } = route.params || {};
  const {
    data,
    loading,
    create,
    update
  } = useBridge('resources', {
    schema: resourceSchema
  });

  const handleSubmit = async (formData) => {
    try {
      if (id) {
        await update(id, formData);
      } else {
        await create(formData);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      {/* Form fields */}
    </FormContainer>
  );
}
Role-Based Access Control
Copy
// screens/AdminScreen.tsx
import { BridgeView } from 'pubflow/react-native';

export function AdminScreen() {
  return (
    <BridgeView
      userTypes={['admin']}
      unauthorized={UnauthorizedScreen}
    >
      <AdminDashboard />
    </BridgeView>
  );
}

// components/UnauthorizedScreen.tsx
export function UnauthorizedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acceso Restringido</Text>
      <Text style={styles.message}>
        No tiene permisos para acceder a este recurso
      </Text>
      <Button
        title="Volver"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}
Expo-Specific Features
Secure Storage
Copy
// utils/storage.ts
import * as SecureStore from 'expo-secure-store';

export async function storeSecureItem(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

// Usage with PubFlow
const pubflow = createExpoPubFlow({
  baseUrl: 'https://api.example.com',
  useSecureStorage: true
});
Device Information
Copy
// screens/ProfileScreen.tsx
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export function ProfileScreen() {
  const { session } = useAuth();

  return (
    <View style={styles.container}>
      <Text>Device Name: {Device.deviceName}</Text>
      <Text>OS Version: {Device.osVersion}</Text>
      <Text>App Version: {Constants.expoConfig?.version}</Text>
      <Text>User: {session.user.name}</Text>
    </View>
  );
}
Best Practices
Session Management

Copy
// hooks/useInitialSession.ts
export function useInitialSession() {
  const { session, loading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!loading) {
      navigation.reset({
        index: 0,
        routes: [{ name: session ? 'Home' : 'Login' }]
      });
    }
  }, [session, loading]);

  return { session, loading };
}
Error Handling

Copy
// utils/errorHandler.ts
export function handleApiError(error: any) {
  if (error.status === 401) {
    navigation.replace('Login');
  } else {
    Alert.alert(
      'Error',
      error.message || 'An unexpected error occurred'
    );
  }
}
Loading States

Copy
// components/LoadingOverlay.tsx
export function LoadingOverlay() {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" />
    </View>
  );
}
Offline Support

Copy
// hooks/useOfflineSync.ts
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const { sync } = useBridge('resources');

  useEffect(() => {
    NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      if (state.isConnected) {
        sync();
      }
    });
  }, []);

  return { isOnline };
}
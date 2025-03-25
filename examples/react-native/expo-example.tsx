// examples/react-native/expo-example.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { createExpoPubFlow } from 'pubflow/react-native';
import { PubFlowProvider, useAuth, useBridge } from 'pubflow/react-native';

// Create the PubFlow client with Expo integration
const pubflowClient = createExpoPubFlow({
  baseUrl: 'https://api.example.com',
  useSecureStorage: true,
  deviceInfo: true
});

// Define Task schema
const taskSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string', minLength: 1 },
    description: { type: 'string' },
    status: { type: 'string', enum: ['todo', 'in-progress', 'done'] },
    dueDate: { type: 'string', format: 'date-time' }
  },
  required: ['title', 'status']
};

// Task interface
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
}

// Login Screen Component
function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email, password });
      navigation.navigate('Tasks');
    } catch (err: any) {
      Alert.alert('Login Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
      {error && <Text style={styles.errorText}>{error.message}</Text>}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button
        title={loading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}

// Task List Component
function TaskListScreen({ navigation }: any) {
  const { data: tasks, loading, error, create, update, remove } = useBridge<Task>({
    schema: taskSchema,
    autoLoad: true,
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    try {
      await create({
        title: newTaskTitle,
        status: 'todo',
        dueDate: new Date().toISOString()
      });
      setNewTaskTitle('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'todo' ? 'in-progress' : 
                      task.status === 'in-progress' ? 'done' : 'todo';
    
    try {
      await update(task.id, { status: newStatus });
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await remove(id);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading && !tasks.length) {
    return (
      <View style={styles.container}>
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Tasks</Text>
      
      {error && <Text style={styles.errorText}>{error.message}</Text>}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New task title"
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
        />
        <Button title="Add" onPress={handleAddTask} />
      </View>
      
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text>Status: {item.status}</Text>
            <View style={styles.taskActions}>
              <Button 
                title="Change Status" 
                onPress={() => handleToggleStatus(item)} 
              />
              <Button 
                title="Delete" 
                onPress={() => handleDeleteTask(item.id)} 
                color="#ff0000" 
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

// App Component with Navigation
export default function App() {
  return (
    <PubFlowProvider 
      client={pubflowClient}
      options={{
        autoLogin: true,
        loading: () => <View style={styles.container}><Text>Loading...</Text></View>,
        onError: (error) => {
          Alert.alert('Error', error.message);
        }
      }}
    >
      {/* In a real app, you would use React Navigation here */}
      <LoginScreen navigation={{ navigate: () => {} }} />
    </PubFlowProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  taskItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  }
});
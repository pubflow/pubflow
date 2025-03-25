# PubFlow React Native Examples

This directory contains examples of using PubFlow with React Native and Expo.

## Task Management Example with Expo

The `task-management-expo.tsx` file demonstrates a complete task management application using Expo with the following features:

- **Create**: Add new tasks with title, description, status, due date, and assignee
- **Read**: Display a list of tasks with their details
- **Update**: Edit existing tasks
- **Delete**: Remove tasks from the system

## Expo Example

The `expo-example.tsx` file demonstrates:

- Setting up PubFlow with Expo integration
- Creating and using schemas for data validation
- Authentication with login screen
- CRUD operations using the Bridge API
- Task management example

## Setup with Expo

1. Install dependencies:

```bash
npm install pubflow zod @react-native-async-storage/async-storage
expo install expo-secure-store expo-device expo-constants
```

2. Configure your API URL in your environment:

```typescript
const pubflowClient = createExpoPubFlow({
  baseUrl: 'https://api.example.com',
  useSecureStorage: true,
  deviceInfo: true
});
```

3. Import the example components into your application

## Setup without Expo

For React Native without Expo, you can use the standard React Native setup:

```bash
npm install pubflow zod @react-native-async-storage/async-storage
```

And initialize the client without Expo-specific features:

```typescript
import { PubFlow } from 'pubflow/react-native';

const pubflowClient = new PubFlow({
  baseUrl: 'https://api.example.com',
  storage: AsyncStorage
});
```

## Key Components

### Schema Definition

The example uses Zod for schema validation:

```typescript
const taskSchema = new BridgeSchema({
  name: 'task',
  fields: {
    id: z.string().optional(),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    status: z.enum(['todo', 'in-progress', 'done']),
    dueDate: z.string().optional(),
    assignedTo: z.string().optional()
  },
  timestamps: true
});
```

### useBridge Hook

The `useBridge` hook provides all CRUD operations with additional React Native specific features like `refresh` and `refreshing` state:

```typescript
const {
  data: tasks,
  loading,
  error,
  refreshing,
  query,
  refresh,
  create,
  update,
  remove
} = useBridge<Task>('tasks', {
  schema: taskSchema,
  autoLoad: true,
  pageSize: 20,
  onError: (err) => Alert.alert('Error', err.message)
});
```

## Running the Examples

1. Import the example in your Expo app:

```jsx
import App from './examples/react-native/task-management-expo';

export default App;
```

## Key Features

- **Secure Storage**: Uses Expo's SecureStore for sensitive data
- **Device Info**: Automatically includes device information in API requests
- **Authentication**: Complete login flow with error handling
- **Data Management**: Full CRUD operations for tasks
- **TypeScript**: Fully typed for better developer experience
- **Pull-to-refresh**: Built-in support for refreshing data with pull gesture
- **Mobile UI Components**: Optimized UI for mobile devices
- **Alert Dialogs**: Using React Native's Alert API for confirmations
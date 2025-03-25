# PubFlow Next.js CRUD Example

This directory contains examples of how to implement CRUD (Create, Read, Update, Delete) operations using PubFlow with Next.js.

## Task Management Example

The `task-management.tsx` file demonstrates a complete task management application with the following features:

- **Create**: Add new tasks with title, description, status, due date, and assignee
- **Read**: Display a list of tasks with their details
- **Update**: Edit existing tasks
- **Delete**: Remove tasks from the system

## Setup

1. Install dependencies:

```bash
npm install pubflow zod
```

2. Configure your API URL in your environment variables:

```
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

3. Set up the PubFlow provider in your `_app.tsx` file:

```typescript
// pages/_app.tsx
import { NextPubFlowProvider } from 'pubflow/next';
import { pubflowClient } from '../config/pubflow';

function MyApp({ Component, pageProps }) {
  return (
    <NextPubFlowProvider 
      client={pubflowClient}
      options={{
        autoLogin: true,
        loading: <div>Loading...</div>
      }}
    >
      <Component {...pageProps} />
    </NextPubFlowProvider>
  );
}

export default MyApp;
```

4. Create your PubFlow client configuration:

```typescript
// config/pubflow.ts
import { PubFlow } from 'pubflow';

export const pubflowClient = new PubFlow({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  debug: process.env.NODE_ENV === 'development',
  devtools: true
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

### useNextBridge Hook

The `useNextBridge` hook provides all CRUD operations with Next.js integration:

```typescript
const {
  data: tasks,
  loading,
  error,
  query,
  create,
  update,
  remove
} = useNextBridge<Task>('tasks', {
  schema: taskSchema,
  autoLoad: true,
  pageSize: 20,
  onError: (err) => console.error('Task operation failed:', err)
});
```

### CRUD Operations

- **Create**: `create(taskData)`
- **Read**: `query()` and access data via the `tasks` variable
- **Update**: `update(id, taskData)`
- **Delete**: `remove(id)`

## Next.js Specific Features

- **Server-side Rendering**: PubFlow works with Next.js SSR
- **API Routes**: You can create API routes to handle PubFlow requests
- **Route Protection**: Use `BridgeView` to protect routes based on authentication

## Best Practices

1. **Schema Validation**: Always define a schema for your resources to ensure data integrity
2. **Error Handling**: Implement proper error handling for all CRUD operations
3. **Loading States**: Show loading indicators during async operations
4. **Optimistic Updates**: Consider implementing optimistic updates for a better user experience
5. **Refresh Strategy**: Decide when to refresh data (after mutations, on interval, etc.)

## Additional Resources

For more information on using PubFlow with Next.js, refer to the [PubFlow Next.js Documentation](../../documentation/adapters/next-doc.md).
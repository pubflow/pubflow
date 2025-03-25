# PubFlow React CRUD Example

This directory contains examples of how to implement CRUD (Create, Read, Update, Delete) operations using PubFlow with React.

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
REACT_APP_API_URL=https://your-api-url.com
```

3. Import the example components into your application

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

The `useBridge` hook provides all CRUD operations:

```typescript
const {
  data: tasks,
  loading,
  error,
  query,
  create,
  update,
  remove
} = useBridge<Task>('tasks', {
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

## Best Practices

1. **Schema Validation**: Always define a schema for your resources to ensure data integrity
2. **Error Handling**: Implement proper error handling for all CRUD operations
3. **Loading States**: Show loading indicators during async operations
4. **Optimistic Updates**: Consider implementing optimistic updates for a better user experience
5. **Refresh Strategy**: Decide when to refresh data (after mutations, on interval, etc.)

## Additional Resources

For more information on using PubFlow with React, refer to the [PubFlow React Documentation](../../documentation/adapters/react-doc.md).
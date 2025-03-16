# PubFlow React Documentation

## Installation

```bash
npm install pubflow
# or
yarn add pubflow
# or
pnpm add pubflow
Basic Setup
Copy
// config/pubflow.ts
import { PubFlow } from 'pubflow';

export const pubflowClient = new PubFlow({
  baseUrl: process.env.REACT_APP_API_URL,
  debug: process.env.NODE_ENV === 'development',
  devtools: true,
  cache: true
});

// App.tsx
import { PubFlowProvider } from 'pubflow/react';
import { pubflowClient } from './config/pubflow';

function App() {
  return (
    <PubFlowProvider 
      client={pubflowClient}
      options={{
        autoLogin: true,
        loading: <LoadingSpinner />,
        onError: (error) => console.error('PubFlow error:', error)
      }}
    >
      {/* Your app content */}
    </PubFlowProvider>
  );
}
Authentication
Using BridgeView for Protected Routes
Copy
import { BridgeView } from 'pubflow/react';

// Basic authentication - requires user to be logged in
function DashboardPage() {
  return (
    <BridgeView requireAuth loginPath="/login">
      <Dashboard />
    </BridgeView>
  );
}

// Role-based access - single role
function AdminPage() {
  return (
    <BridgeView 
      userTypes="admin"
      unauthorized={<UnauthorizedMessage />}
    >
      <AdminDashboard />
    </BridgeView>
  );
}

// Multiple roles allowed
function ReportsPage() {
  return (
    <BridgeView 
      userTypes={['admin', 'manager', 'analyst']}
      unauthorized={<UnauthorizedMessage />}
    >
      <Reports />
    </BridgeView>
  );
}
Authentication Hook
Copy
import { useAuth } from 'pubflow/react';

function LoginPage() {
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({
        email: 'user@example.com',
        password: 'password'
      });
      // Redirect on success
    } catch (err) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
    </form>
  );
}

function UserProfile() {
  const { user, logout, isAuthorized } = useAuth();

  // Check if user has specific permissions
  const canEditSettings = isAuthorized(['admin', 'manager']);

  return (
    <div>
      <h1>Welcome {user.name}</h1>
      {canEditSettings && <SettingsPanel />}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
Data Management with Bridge
Using useBridge Hook
Copy
import { useBridge } from 'pubflow/react';
import { userSchema } from './schemas';

interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
}

function UserList() {
  const {
    data: users,
    loading,
    error,
    pagination,
    query,
    create,
    update,
    remove,
    selected,
    setSelected,
    bulkActions
  } = useBridge<User>('users', {
    schema: userSchema,
    autoLoad: true,
    pageSize: 10,
    refreshInterval: 30000, // 30 seconds
    onError: (error) => console.error('Error:', error)
  });

  // Fetch with filters
  const loadActiveUsers = () => {
    query({ status: 'active' });
  };

  // Create user
  const handleCreate = async (userData: Partial<User>) => {
    try {
      await create(userData);
      // Handle success
    } catch (err) {
      // Handle error
    }
  };

  // Update user
  const handleUpdate = async (id: string, data: Partial<User>) => {
    try {
      await update(id, data);
      // Handle success
    } catch (err) {
      // Handle error
    }
  };

  // Delete user
  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      // Handle success
    } catch (err) {
      // Handle error
    }
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    try {
      await bulkActions.delete(selected.map(user => user.id));
      setSelected([]);
      // Handle success
    } catch (err) {
      // Handle error
    }
  };

  return (
    <div>
      {/* Your UI components */}
    </div>
  );
}
Schema Definition
Copy
import { BridgeSchema } from 'pubflow';
import { z } from 'zod';

export const userSchema = new BridgeSchema({
  name: 'users',
  fields: {
    email: z.string().email(),
    name: z.string().min(2),
    userType: z.enum(['admin', 'user', 'manager']),
    status: z.enum(['active', 'inactive']).default('active')
  },
  timestamps: true
});
Advanced Features
Error Handling
Copy
import { PubFlowErrorBoundary } from 'pubflow/react';

function App() {
  return (
    <PubFlowErrorBoundary
      fallback={<ErrorDisplay />}
      onError={(error) => {
        console.error(error);
        // Additional error handling
      }}
    >
      <YourApp />
    </PubFlowErrorBoundary>
  );
}
Custom Query Hook
Copy
function useCustomQuery() {
  const { query, execute } = useQuery('customResource');

  const fetchFiltered = async (filters) => {
    return execute(
      query()
        .where('status', 'eq', filters.status)
        .orderBy('createdAt', 'desc')
        .limit(10)
    );
  };

  return { fetchFiltered };
}
Route Protection with React Router
Copy
import { Routes, Route, Navigate } from 'react-router-dom';
import { BridgeView } from 'pubflow/react';

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <BridgeView requireAuth loginPath="/login">
            <DashboardPage />
          </BridgeView>
        }
      />

      {/* Role-based routes */}
      <Route
        path="/admin/*"
        element={
          <BridgeView
            userTypes="admin"
            unauthorized={<UnauthorizedPage />}
          >
            <AdminRoutes />
          </BridgeView>
        }
      />

      {/* Multiple roles */}
      <Route
        path="/reports"
        element={
          <BridgeView userTypes={['admin', 'analyst']}>
            <ReportsPage />
          </BridgeView>
        }
      />
    </Routes>
  );
}
Higher-Order Components
Copy
import { withPubFlow, withAuth } from 'pubflow/react';

// Wrap component with PubFlow
const ProtectedComponent = withPubFlow(YourComponent);

// Wrap component with auth protection
const AdminComponent = withAuth(YourComponent, {
  redirectTo: '/login',
  userTypes: 'admin'
});
Best Practices
Always wrap your app with PubFlowProvider

Use BridgeView for route protection

Use schemas for data validation

Handle loading and error states

Implement proper error boundaries

Use type safety with TypeScript

Implement proper authentication flows

Handle unauthorized access gracefully

TypeScript Support
PubFlow is written in TypeScript and provides full type safety:

Copy
interface CustomUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// Type-safe hook usage
const { data, update } = useBridge<CustomUser>('users', {
  schema: userSchema
});

// TypeScript will enforce proper types
update(id, {
  role: 'admin' // Type-safe, only allows 'admin' | 'user'
});
Common Patterns
Loading States
Copy
function LoadingWrapper({ children }) {
  const { loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return children;
}
Error Handling
Copy
function ErrorBoundary({ children }) {
  return (
    <PubFlowErrorBoundary
      fallback={({ error }) => (
        <div className="error-container">
          <h2>Error</h2>
          <p>{error.message}</p>
        </div>
      )}
    >
      {children}
    </PubFlowErrorBoundary>
  );
}
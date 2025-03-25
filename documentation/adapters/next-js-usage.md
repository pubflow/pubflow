# PubFlow Next.js Integration Guide

## Overview

The PubFlow Next.js adapter provides seamless integration with Next.js applications, offering server-side authentication, client-side components, and enhanced hooks for managing authentication state.

## Installation

```bash
npm install pubflow
```

## Basic Setup

### Client Configuration

```tsx
// lib/pubflow.ts
import { PubFlow } from 'pubflow';

export const createPubFlowClient = () => {
  return new PubFlow({
    baseUrl: process.env.NEXT_PUBLIC_API_URL!,
    debug: process.env.NODE_ENV === 'development'
  });
};
```

### Provider Setup

```tsx
// pages/_app.tsx
import { NextPubFlowProvider } from 'pubflow/next';
import { createPubFlowClient } from '../lib/pubflow';

function MyApp({ Component, pageProps }) {
  const client = createPubFlowClient();
  
  return (
    <NextPubFlowProvider 
      client={client}
      options={{
        loginPath: '/login',
        unauthorizedPath: '/unauthorized',
        loading: () => <div>Loading...</div>
      }}
    >
      <Component {...pageProps} />
    </NextPubFlowProvider>
  );
}

export default MyApp;
```

## Server-Side Authentication

### Protected Pages

```tsx
// pages/dashboard.tsx
import { withServerSideAuth } from 'pubflow/next';

export const getServerSideProps = withServerSideAuth(
  async (context) => {
    // Your server-side logic here
    return {
      props: {
        // Additional props
      }
    };
  },
  {
    userTypes: ['admin', 'user'],
    redirectTo: '/login'
  }
);

export default function Dashboard({ initialSession }) {
  return (
    <div>
      <h1>Welcome, {initialSession.user.name}</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

## Client-Side Authentication

### Login Page

```tsx
// pages/login.tsx
import { useNextAuth } from 'pubflow/next';

export default function Login() {
  const { login, loading, error } = useNextAuth({
    redirectIfAuthenticated: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    try {
      await login({ email, password });
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Protected Client-Side Routes

```tsx
// components/ProtectedRoute.tsx
import { withNextAuth } from 'pubflow/next';

function ProtectedComponent({ session }) {
  return (
    <div>
      <h1>Protected Content</h1>
      <p>Hello, {session.user.name}</p>
    </div>
  );
}

export default withNextAuth(ProtectedComponent, {
  userTypes: 'admin',
  loadingComponent: () => <div>Loading...</div>
});
```

## API Route Protection

```tsx
// pages/api/protected-route.js
import { withApiAuth } from 'pubflow/next';

export default withApiAuth(
  async (req, res) => {
    // Your API logic here
    res.status(200).json({ message: 'Protected data', user: req.session.user });
  },
  { userTypes: ['admin'] }
);
```

## Best Practices

1. **Server-Side Authentication**: Use `withServerSideAuth` for pages that need to be protected from the server side.

2. **Client-Side Guards**: Use `withNextAuth` HOC or `useNextAuth` hook for client-side protection.

3. **API Protection**: Always protect your API routes with `withApiAuth` middleware.

4. **Error Handling**: Provide clear error messages and loading states for better user experience.

5. **TypeScript**: Leverage TypeScript for better type safety and developer experience.
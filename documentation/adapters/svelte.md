# PubFlow Svelte Documentation

## Table of Contents
1. [Installation](#installation)
2. [Basic Setup](#basic-setup)
3. [Authentication](#authentication)
4. [Data Management](#data-management)
5. [Guards & Protection](#guards--protection)
6. [Form Handling](#form-handling)
7. [Advanced Usage](#advanced-usage)
8. [Best Practices](#best-practices)

## Installation

```bash
npm install pubflow
# or
yarn add pubflow
Basic Setup
Copy
// src/lib/pubflow.ts
import { PubFlow } from 'pubflow';

export const pubflowClient = new PubFlow({
  baseUrl: import.meta.env.VITE_API_URL,
  debug: import.meta.env.DEV
});
Copy
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { PubFlowProvider } from 'pubflow/svelte';
  import { pubflowClient } from '$lib/pubflow';
</script>

<PubFlowProvider
  client={pubflowClient}
  options={{
    autoLogin: true,
    loading: LoadingComponent,
    onError: (error) => {
      // Handle global errors
    }
  }}
>
  <slot />
</PubFlowProvider>
Authentication
Login Page
Copy
<!-- src/routes/login/+page.svelte -->
<script lang="ts">
  import { auth } from 'pubflow/svelte';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let loading = false;
  let error = null;

  async function handleSubmit() {
    try {
      loading = true;
      await auth.login({ email, password });
      goto('/dashboard');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <div class="form-group">
    <label for="email">Email</label>
    <input
      type="email"
      id="email"
      bind:value={email}
      disabled={loading}
    />
  </div>

  <div class="form-group">
    <label for="password">Password</label>
    <input
      type="password"
      id="password"
      bind:value={password}
      disabled={loading}
    />
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <button type="submit" disabled={loading}>
    {loading ? 'Loading...' : 'Login'}
  </button>
</form>
Protected Routes
Copy
// src/routes/dashboard/+layout.ts
import { auth } from 'pubflow/svelte';
import { redirect } from '@sveltejs/kit';

export const load = async () => {
  const { session } = auth;
  
  if (!session) {
    throw redirect(302, '/login');
  }
};
Using AuthGuard
Copy
<!-- src/routes/admin/+page.svelte -->
<script lang="ts">
  import { AuthGuard, RoleGuard } from 'pubflow/svelte';
  import { goto } from '$app/navigation';
</script>

<AuthGuard
  onUnauthenticated={() => goto('/login')}
  fallback={LoadingSpinner}
>
  <RoleGuard
    roles={['admin']}
    fallback={UnauthorizedComponent}
  >
    <div class="admin-panel">
      <!-- Admin content -->
    </div>
  </RoleGuard>
</AuthGuard>
Data Management
Using Bridge Store
Copy
<!-- src/routes/users/+page.svelte -->
<script lang="ts">
  import { createBridgeStore } from 'pubflow/svelte';
  import { userSchema } from './schemas';

  const users = createBridgeStore('users', {
    schema: userSchema,
    autoLoad: true,
    pageSize: 10,
    refreshInterval: 30000
  });

  let newUser = {
    name: '',
    email: ''
  };

  async function handleCreate() {
    try {
      await users.create(newUser);
      newUser = { name: '', email: '' };
    } catch (error) {
      // Handle error
    }
  }
</script>

<div class="users-list">
  {#if $users.loading}
    <LoadingSpinner />
  {:else if $users.error}
    <ErrorDisplay error={$users.error} />
  {:else}
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each $users.data as user (user.id)}
          <tr>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>
              <button
                on:click={() => users.remove(user.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    {#if $users.pagination.hasMore}
      <button
        on:click={() => users.loadMore()}
        disabled={$users.loading}
      >
        Load More
      </button>
    {/if}
  {/if}

  <form on:submit|preventDefault={handleCreate}>
    <input bind:value={newUser.name} placeholder="Name" />
    <input bind:value={newUser.email} placeholder="Email" />
    <button type="submit">Add User</button>
  </form>
</div>
Using BridgeView Component
Copy
<!-- src/routes/resources/+page.svelte -->
<script lang="ts">
  import { BridgeView } from 'pubflow/svelte';
  import { createBridgeStore } from 'pubflow/svelte';

  const resources = createBridgeStore('resources');
</script>

<BridgeView
  userTypes={['admin', 'manager']}
  unauthorized={UnauthorizedView}
>
  <div class="resources">
    <h1>Resources</h1>
    
    {#if $resources.loading}
      <LoadingSpinner />
    {:else}
      <ResourceList
        items={$resources.data}
        onDelete={(id) => resources.remove(id)}
      />
    {/if}
  </div>
</BridgeView>
Form Handling
With Validation
Copy
<!-- src/lib/components/ResourceForm.svelte -->
<script lang="ts">
  import { validateSchema } from 'pubflow/svelte';
  import { resourceSchema } from './schemas';

  export let onSubmit: (data: any) => Promise<void>;

  let formData = {
    title: '',
    description: ''
  };
  let errors = {};
  let loading = false;

  async function handleSubmit() {
    const result = validateSchema(resourceSchema, formData);
    
    if (result.success) {
      try {
        loading = true;
        await onSubmit(result.data);
        formData = { title: '', description: '' };
      } finally {
        loading = false;
      }
    } else {
      errors = result.errors;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <div class="form-group">
    <input bind:value={formData.title} placeholder="Title" />
    {#if errors.title}
      <span class="error">{errors.title}</span>
    {/if}
  </div>

  <div class="form-group">
    <textarea
      bind:value={formData.description}
      placeholder="Description"
    />
    {#if errors.description}
      <span class="error">{errors.description}</span>
    {/if}
  </div>

  <button type="submit" disabled={loading}>
    {loading ? 'Saving...' : 'Save'}
  </button>
</form>
Advanced Usage
Custom Actions
Copy
<script lang="ts">
  import { authAction, bridgeAction } from 'pubflow/svelte';
</script>

<div
  use:authAction={{
    roles: ['admin'],
    onUnauthorized: () => goto('/unauthorized'),
    loadingClass: 'is-loading'
  }}
>
  <div
    use:bridgeAction={{
      resource: 'users',
      autoLoad: true,
      refreshInterval: 30000,
      loadingClass: 'is-loading',
      errorClass: 'has-error'
    }}
  >
    <!-- Content -->
  </div>
</div>
Error Handling
Copy
<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { ErrorBoundary } from 'pubflow/svelte';
</script>

<ErrorBoundary
  fallback={CustomErrorComponent}
  onError={(error) => {
    // Log error
    console.error('Application error:', error);
  }}
>
  <slot />
</ErrorBoundary>
Real-time Updates
Copy
<script lang="ts">
  import { createBridgeStore } from 'pubflow/svelte';

  const messages = createBridgeStore('messages', {
    autoLoad: true,
    refreshInterval: 5000, // Poll every 5 seconds
    onSuccess: (data) => {
      // Handle new messages
    }
  });
</script>
Best Practices
Store Management
Copy
// src/lib/stores/resources.ts
import { createBridgeStore } from 'pubflow/svelte';
import { resourceSchema } from './schemas';

export const resources = createBridgeStore('resources', {
  schema: resourceSchema,
  pageSize: 20,
  onError: (error) => {
    // Global error handling
  }
});
Type Safety
Copy
// src/lib/types/resource.ts
export interface Resource {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Usage
const resources = createBridgeStore<Resource>('resources', {
  // Type-safe operations
});
Authentication Flow
Copy
// src/lib/auth.ts
import { auth } from 'pubflow/svelte';
import { goto } from '$app/navigation';

export async function handleLogin(credentials: {
  email: string;
  password: string;
}) {
  try {
    const session = await auth.login(credentials);
    goto(session.user.userType === 'admin' ? '/admin' : '/dashboard');
  } catch (error) {
    // Handle error
  }
}

export async function handleLogout() {
  try {
    await auth.logout();
    goto('/login');
  } catch (error) {
    // Handle error
  }
}
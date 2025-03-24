# PubFlow Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Core Concepts](#core-concepts)
4. [Authentication](#authentication)
5. [Bridge System](#bridge-system)
6. [Framework Adapters](#framework-adapters)
7. [Advanced Usage](#advanced-usage)

## Introduction

PubFlow[beta] is a powerful, framework-agnostic API client library designed for modern web and mobile applications. It provides a seamless interface for handling authentication, data management, and real-time updates across different frameworks.

### Key Features

- 🔐 Built-in authentication management
- 📊 Powerful Bridge system for data operations
- 🎯 Framework-specific adapters
- 🔄 Real-time synchronization
- 🛠️ Developer-friendly tools
- 📱 Cross-platform support

## Getting Started

### Installation

```bash
# Using npm
npm install pubflow

# Using yarn
yarn add pubflow

# Using pnpm
pnpm add pubflow
Basic Setup
Copy
import { PubFlow } from 'pubflow';

const client = new PubFlow({
  baseUrl: 'https://api.example.com',
  debug: true,
  devtools: true,
});
Core Concepts
Client Configuration
Copy
interface PubFlowConfig {
  baseUrl: string;
  debug?: boolean;
  devtools?: boolean;
  cache?: boolean;
  cacheTTL?: number;
  storage?: Storage;
  defaultHeaders?: Record<string, string>;
}
Authentication
Copy
// Login
await client.auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// Get current session
const session = await client.auth.getSession();

// Logout
await client.auth.logout();
Bridge System
The Bridge system provides a powerful interface for working with your API resources.

Copy
// Define a schema
const userSchema = new BridgeSchema({
  name: 'users',
  fields: {
    email: z.string().email(),
    name: z.string(),
    role: z.enum(['admin', 'user'])
  },
  timestamps: true
});

// Query builder
const users = await client
  .query('users')
  .where('role', 'eq', 'admin')
  .orderBy('created_at', 'desc')
  .limit(10)
  .get();

// CRUD operations
const user = await client.bridge.create('users', {
  email: 'new@example.com',
  name: 'New User'
});
Framework Adapters
react > next > react-native > svelte > html
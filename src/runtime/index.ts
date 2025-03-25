// src/runtime/index.ts
import { detectRuntime } from './detect';
import type { RuntimeAdapter } from './types';

// Import runtime-specific implementations
import { NodeAdapter } from './node';
import { BunAdapter } from './bun';
import { CloudflareAdapter } from './cloudflare';
import { BrowserAdapter } from './browser';

// Default to browser runtime if detection fails
let currentRuntime: RuntimeAdapter = new BrowserAdapter();

// Detect and set the appropriate runtime adapter
const runtime = detectRuntime();
switch (runtime) {
  case 'node':
    currentRuntime = new NodeAdapter();
    break;
  case 'bun':
    currentRuntime = new BunAdapter();
    break;
  case 'cloudflare':
    currentRuntime = new CloudflareAdapter();
    break;
  case 'browser':
  default:
    currentRuntime = new BrowserAdapter();
    break;
}

export { currentRuntime as runtime };
export * from './types';
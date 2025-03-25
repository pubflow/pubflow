// src/runtime/detect.ts
import type { RuntimeType } from './types';

/**
 * Detects the current JavaScript runtime environment
 * @returns The identified runtime type
 */
export function detectRuntime(): RuntimeType {
  // Check for Bun runtime
  if (typeof process !== 'undefined' && typeof process.versions !== 'undefined' && process.versions.bun) {
    return 'bun';
  }
  
  // Check for Node.js runtime
  if (typeof process !== 'undefined' && typeof process.versions !== 'undefined' && process.versions.node) {
    return 'node';
  }
  
  // Check for Cloudflare Workers runtime
  if (
    typeof globalThis !== 'undefined' && 
    typeof globalThis.Deno === 'undefined' && 
    typeof globalThis.document === 'undefined' && 
    typeof globalThis.navigator === 'undefined' && 
    typeof globalThis.caches !== 'undefined' &&
    typeof globalThis.fetch === 'function'
  ) {
    return 'cloudflare';
  }
  
  // Default to browser runtime
  return 'browser';
}
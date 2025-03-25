// src/runtime/global.d.ts

// Extend the global object type definitions
declare global {
  var Deno: unknown;
  var caches: unknown;
  var navigator: unknown;
  var document: unknown;
  
  interface Process {
    versions?: {
      node?: string;
      bun?: string;
    };
  }
  
  var process: Process;
}

// Ensure this is treated as a module
export {};
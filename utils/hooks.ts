// src/utils/hooks.ts
export class PubFlowHooks {
    private hooks: Map<string, Set<Function>> = new Map();
  
    on(event: string, callback: Function) {
      if (!this.hooks.has(event)) {
        this.hooks.set(event, new Set());
      }
      this.hooks.get(event)!.add(callback);
      return () => this.off(event, callback);
    }
  
    off(event: string, callback: Function) {
      this.hooks.get(event)?.delete(callback);
    }
  
    emit(event: string, ...args: any[]) {
      this.hooks.get(event)?.forEach(callback => callback(...args));
    }
  }
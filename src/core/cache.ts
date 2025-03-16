// src/core/cache.ts
export class PubFlowCache {
    private cache: Map<string, {
      data: any;
      timestamp: number;
      ttl: number;
    }> = new Map();
  
    constructor(private defaultTTL: number = 5 * 60 * 1000) {} // 5 minutes default
  
    set(key: string, data: any, ttl: number = this.defaultTTL) {
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
      });
    }
  
    get(key: string) {
      const entry = this.cache.get(key);
      if (!entry) return null;
  
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        return null;
      }
  
      return entry.data;
    }
  
    clear() {
      this.cache.clear();
    }
  }
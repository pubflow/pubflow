// src/adapters/html/core/query.js
export class Query {
    constructor(client) {
      this.client = client;
      this.cache = new Map();
    }
  
    async execute(queryFn, options = {}) {
      const {
        cacheKey,
        cacheTime = 5000,
        retry = 3,
        onSuccess,
        onError
      } = options;
  
      try {
        if (cacheKey) {
          const cached = this.cache.get(cacheKey);
          if (cached && Date.now() - cached.timestamp < cacheTime) {
            return cached.data;
          }
        }
  
        let attempts = 0;
        let lastError;
  
        while (attempts < retry) {
          try {
            const data = await queryFn();
            
            if (cacheKey) {
              this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
              });
            }
  
            if (onSuccess) onSuccess(data);
            return data;
          } catch (error) {
            lastError = error;
            attempts++;
            if (attempts === retry) break;
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        }
  
        throw lastError;
      } catch (error) {
        if (onError) onError(error);
        throw error;
      }
    }
  
    clearCache() {
      this.cache.clear();
    }
  }
  
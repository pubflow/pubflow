// src/core/devtools.ts
export class PubFlowDevTools {
    private requests: Map<string, any> = new Map();
  
    trackRequest(id: string, request: any) {
      this.requests.set(id, {
        ...request,
        timestamp: new Date(),
      });
    }
  
    getRequestHistory() {
      return Array.from(this.requests.values());
    }
  
    clearHistory() {
      this.requests.clear();
    }
  }
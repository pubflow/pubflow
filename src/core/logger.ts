// src/core/logger.ts
export class PubFlowLogger {
    constructor(private enabled: boolean = false, private prefix: string = '[PubFlow]') {}
  
    info(message: string, ...args: any[]) {
      if (this.enabled) {
        console.info(`${this.prefix} ${message}`, ...args);
      }
    }
  
    error(message: string, error?: any) {
      if (this.enabled) {
        console.error(`${this.prefix} Error: ${message}`, error);
      }
    }
  
    warn(message: string, ...args: any[]) {
      if (this.enabled) {
        console.warn(`${this.prefix} Warning: ${message}`, ...args);
      }
    }
  }
  
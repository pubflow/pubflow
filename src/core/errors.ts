// src/core/errors.ts
export class PubFlowError extends Error {
    constructor(
      public code: string,
      message: string,
      public status?: number,
      public details?: any
    ) {
      super(message);
      this.name = 'PubFlowError';
    }
  }
  
  export class AuthenticationError extends PubFlowError {
    constructor(message: string, details?: any) {
      super('AUTH_ERROR', message, 401, details);
    }
  }
  
  export class ValidationError extends PubFlowError {
    constructor(message: string, details?: any) {
      super('VALIDATION_ERROR', message, 400, details);
    }
  }
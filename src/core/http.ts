// src/core/http.ts
import { runtime } from '../runtime';
import { PubFlowError } from './errors';
import type { FetchOptions } from '../runtime/types';

export class HttpClient {
    constructor(
      private baseUrl: string,
      private defaultHeaders: Record<string, string> = {}
    ) {}
  
    async request<T>(
      endpoint: string,
      options: {
        method?: string;
        headers?: Record<string, string>;
        body?: any;
        params?: Record<string, any>;
        timeout?: number;
      } = {}
    ): Promise<T> {
      const {
        method = 'GET',
        headers = {},
        body,
        params,
        timeout
      } = options;
  
      let url = `${this.baseUrl}${endpoint}`;
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(`${key}[]`, v));
          } else if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        url += `?${searchParams.toString()}`;
      }
      
      // Use the runtime adapter for fetch operations
      const fetchOptions: FetchOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...this.defaultHeaders,
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
        timeout
      };
      
      const response = await runtime.fetch(url, fetchOptions);
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new PubFlowError(
          'REQUEST_ERROR',
          data.error || 'Request failed',
          response.status,
          data.details
        );
      }
  
      return data;
    }
  }
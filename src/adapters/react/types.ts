// src/adapters/react/types.ts
import type { PubFlow, BridgeSchema, QueryBuilder, PaginatedResponse } from '../../core/types';

export interface UseBridgeOptions<T> {
  schema?: BridgeSchema;
  initialData?: T[];
  autoLoad?: boolean;
  pageSize?: number;
  refreshInterval?: number;
  onError?: (error: any) => void;
  onSuccess?: (data: T[]) => void;
}

export interface UseBridgeResult<T> {
  data: T[];
  loading: boolean;
  error: any;
  pagination: {
    page: number;
    totalPages: number;
    hasMore: boolean;
    loadMore: () => Promise<void>;
  };
  refresh: () => Promise<void>;
  query: (params?: any) => Promise<PaginatedResponse<T>>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  selected: T[];
  setSelected: (items: T[]) => void;
  bulkActions: {
    delete: (ids: string[]) => Promise<void>;
    update: (ids: string[], data: Partial<T>) => Promise<void>;
  };
}


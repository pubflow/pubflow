// src/types/adapters.ts
import type { PubFlowSession, PubFlowResponse, PubFlowUser } from './core';

// React/Next.js types
export interface UseBridgeOptions<T> {
    schema?: any;
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
    query: (params?: any) => Promise<PubFlowResponse<T[]>>;
    create: (data: Partial<T>) => Promise<T>;
    update: (id: string, data: Partial<T>) => Promise<T>;
    remove: (id: string) => Promise<void>;
    selected: T[];
    setSelected: (items: T[]) => void;
    pagination: {
        page: number;
        hasMore: boolean;
        loadMore: () => Promise<void>;
    };
}

export interface UseAuthResult {
    session: PubFlowSession | null;
    user: PubFlowUser | null;
    loading: boolean;
    error: any;
    login: (credentials: { email: string; password: string }) => Promise<PubFlowSession>;
    logout: () => Promise<void>;
    isAuthorized: (roles?: string | string[]) => boolean;
}

// React Native specific types
export interface RNStorageAdapter {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
}

// Svelte specific types
export interface SvelteStore<T> {
    subscribe: (run: (value: T) => void) => () => void;
    set?: (value: T) => void;
    update?: (updater: (value: T) => T) => void;
}

export interface SvelteBridgeStore<T> extends SvelteStore<{
    data: T[];
    loading: boolean;
    error: any;
    pagination: {
        page: number;
        hasMore: boolean;
    };
}> {
    query: (params?: any) => Promise<void>;
    create: (data: Partial<T>) => Promise<T>;
    update: (id: string, data: Partial<T>) => Promise<T>;
    remove: (id: string) => Promise<void>;
}

// HTMX/HTML specific types
export interface HtmlAdapterConfig {
    templates: Record<string, (data: any) => string>;
    errorHandler?: (error: any) => void;
    loadingIndicator?: string | HTMLElement;
}

// src/types/index.ts
export * from './core';
export * from './adapters';
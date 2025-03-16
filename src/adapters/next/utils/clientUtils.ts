// src/adapters/next/utils/clientUtils.ts
import { useRouter } from 'next/router';

export function createQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(`${key}[]`, String(v)));
    } else if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
}

export function parseQueryParams(query: Record<string, string | string[]>) {
  const params: Record<string, any> = {};
  
  Object.entries(query).forEach(([key, value]) => {
    if (key.endsWith('[]')) {
      const baseKey = key.slice(0, -2);
      params[baseKey] = Array.isArray(value) ? value : [value];
    } else {
      params[key] = value;
    }
  });
  
  return params;
}

export function useQueryParams<T = Record<string, any>>() {
  const router = useRouter();
  
  const setQueryParams = useCallback((
    params: Partial<T>,
    options: { replace?: boolean; shallow?: boolean } = {}
  ) => {
    const queryString = createQueryString(params);
    const method = options.replace ? router.replace : router.push;
    
    method(
      {
        pathname: router.pathname,
        query: queryString
      },
      undefined,
      { shallow: options.shallow }
    );
  }, [router]);

  return {
    params: parseQueryParams(router.query) as T,
    setParams: setQueryParams
  };
}
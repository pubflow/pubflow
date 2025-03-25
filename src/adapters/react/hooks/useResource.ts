// src/adapters/react/hooks/useResource.ts
import { useMemo, useEffect } from 'react';
import { usePubFlowContext } from '../components/PubFlowProvider';
import { useQuery } from './useQuery';

interface UseResourceOptions {
  immediate?: boolean;
  cacheTime?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useResource(
  resourcePath: string,
  options: UseResourceOptions = {}
) {
  const { client } = usePubFlowContext();

  const resource = useMemo(() => ({
    // For listing resources (without ID)
    list: (params?: {
      page?: number;
      limit?: number;
      orderBy?: string;
      orderDir?: 'asc' | 'desc';
      include?: string[];
    }) => client.bridge.query(resourcePath, params),
    
    // For getting a single resource by ID
    // This is a workaround since the bridge API doesn't directly support querying by ID
    get: async (id?: string) => {
      if (!id) {
        // If no ID is provided, just query all resources
        return client.bridge.query(resourcePath);
      }
      
      // If ID is provided, we'll need to handle it differently
      // We'll use the update method with an empty object to get the resource
      // This is a workaround and might need to be adjusted based on the actual API behavior
      try {
        const response = await client.bridge.update(resourcePath, id, {});
        // Convert the single item response to match the format of a query response
        return {
          success: true,
          data: [response.data],
          meta: {
            page: 1,
            hasMore: false,
            totalPages: 1
          }
        };
      } catch (error) {
        // If the update approach fails, fall back to querying all and filtering client-side
        const response = await client.bridge.query(resourcePath);
        if (response.data) {
          const filtered = response.data.filter((item: any) => item.id === id);
          return {
            ...response,
            data: filtered
          };
        }
        return response;
      }
    },
    create: (data: any) => client.bridge.create(resourcePath, data),
    update: (id: string, data: any) => client.bridge.update(resourcePath, id, data),
    delete: (id: string) => client.bridge.delete(resourcePath, id)
  }), [client, resourcePath]);

  const query = useQuery(
    () => resource.get(),
    {
      cacheTime: options.cacheTime,
      onSuccess: options.onSuccess,
      onError: options.onError
    }
  );

  useEffect(() => {
    if (options.immediate) {
      query.execute();
    }
  }, [options.immediate]);

  return {
    ...query,
    ...resource
  };
}

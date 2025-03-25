// src/adapters/react-native/hooks/useResource.ts
import { useMemo } from 'react';
import { usePubFlowContext } from '../components/PubFlowProvider';
import { useQuery } from './useQuery';

export interface UseResourceOptions {
  immediate?: boolean;
  transform?: (data: any) => any;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useResource<T = any>(
  resourcePath: string,
  options: UseResourceOptions = {}
) {
  const { client } = usePubFlowContext();

  const resource = useMemo(() => ({
    get: async (id?: string) => {
      const response = await client.bridge.query(resourcePath, id ? { include: [id] } : undefined);
      return options.transform ? options.transform(response) : response;
    },
    create: (data: Partial<T>) => client.bridge.create(resourcePath, data),
    update: (id: string, data: Partial<T>) => client.bridge.update(resourcePath, id, data),
    delete: (id: string) => client.bridge.delete(resourcePath, id),
    search: (query: string) => client.bridge.search(resourcePath, query)
  }), [client, resourcePath]);

  const query = useQuery(() => resource.get(), {
    enabled: options.immediate,
    onSuccess: options.onSuccess,
    onError: options.onError
  });

  return {
    ...query,
    ...resource
  };
}
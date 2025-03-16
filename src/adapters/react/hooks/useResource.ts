// src/adapters/react/hooks/useResource.ts
import { useMemo } from 'react';
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
    get: (id?: string) => client.bridge.query(resourcePath, id),
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
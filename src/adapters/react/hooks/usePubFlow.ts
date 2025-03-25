// src/adapters/react/hooks/usePubFlow.ts
import { usePubFlowContext } from '../components/PubFlowProvider';

export function usePubFlow() {
  const { client } = usePubFlowContext();
  return client;
}

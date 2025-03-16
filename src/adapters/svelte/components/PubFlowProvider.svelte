<!-- src/adapters/svelte/components/PubFlowProvider.svelte -->
<script lang="ts">
    import { setContext } from 'svelte';
    import type { PubFlow } from '../../../core/client';
    import { initializeStores } from '../stores';
  
    export let client: PubFlow;
    export let options: {
      autoLogin?: boolean;
      loading?: any;
      onError?: (error: any) => void;
    } = {};
  
    setContext('pubflow', client);
    initializeStores(client);
  </script>
  
  {#if $$slots.default}
    <slot />
  {/if}
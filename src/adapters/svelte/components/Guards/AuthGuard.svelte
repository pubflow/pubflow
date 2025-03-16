<!-- src/adapters/svelte/components/Guards/AuthGuard.svelte -->
<script lang="ts">
    import { auth } from '../../stores/auth';
  
    export let fallback: any = undefined;
    export let onUnauthenticated: () => void = undefined;
  
    $: if (!$auth.loading && !$auth.session && onUnauthenticated) {
      onUnauthenticated();
    }
  </script>
  
  {#if $auth.loading}
    <div>Loading...</div>
  {:else if !$auth.session}
    {#if fallback}
      <svelte:component this={fallback} />
    {/if}
  {:else}
    <slot />
  {/if}
  
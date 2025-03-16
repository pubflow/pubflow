<!-- src/adapters/svelte/components/ErrorBoundary.svelte -->
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
  
    export let fallback: any = undefined;
    export let onError: (error: Error) => void = undefined;
  
    let error: Error | null = null;
    let hasError = false;
  
    function handleError(event: ErrorEvent) {
      error = event.error;
      hasError = true;
      if (onError) onError(event.error);
    }
  
    onMount(() => {
      window.addEventListener('error', handleError);
    });
  
    onDestroy(() => {
      window.removeEventListener('error', handleError);
    });
  
    function reset() {
      error = null;
      hasError = false;
    }
  </script>
  
  {#if hasError}
    {#if fallback}
      <svelte:component this={fallback} {error} {reset} />
    {:else}
      <div class="error-container">
        <h2>Something went wrong</h2>
        <p>{error?.message}</p>
        <button on:click={reset}>Try again</button>
      </div>
    {/if}
  {:else}
    <slot />
  {/if}
<!-- src/adapters/svelte/components/BridgeView.svelte -->
<script lang="ts">
    import { getContext } from 'svelte';
    import { auth } from '../stores/auth';
  
    export let userTypes: string | string[] = undefined;
    export let requireAuth = true;
    export let unauthorized: any = undefined;
    export let loading: any = undefined;
  
    $: isAuthorized = !userTypes || $auth.isAuthorized(userTypes);
    $: showContent = (!requireAuth || $auth.session) && isAuthorized;
  </script>
  
  {#if $auth.loading}
    {#if loading}
      <svelte:component this={loading} />
    {:else}
      <div>Loading...</div>
    {/if}
  {:else if !showContent}
    {#if unauthorized}
      <svelte:component this={unauthorized} />
    {:else}
      <div>No tiene acceso a este recurso</div>
    {/if}
  {:else}
    <slot />
  {/if}
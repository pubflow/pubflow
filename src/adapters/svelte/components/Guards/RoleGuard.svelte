<!-- src/adapters/svelte/components/Guards/RoleGuard.svelte -->
<script lang="ts">
    import { auth } from '../../stores/auth';
  
    export let roles: string | string[];
    export let fallback: any = undefined;
    export let onUnauthorized: () => void = undefined;
  
    $: isAuthorized = $auth.isAuthorized(roles);
    $: if (!isAuthorized && onUnauthorized) {
      onUnauthorized();
    }
  </script>
  
  {#if !isAuthorized}
    {#if fallback}
      <svelte:component this={fallback} />
    {:else}
      <div>No tiene permisos suficientes</div>
    {/if}
  {:else}
    <slot />
  {/if}
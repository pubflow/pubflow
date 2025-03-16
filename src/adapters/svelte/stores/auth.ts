// src/adapters/svelte/stores/auth.ts
import { writable, derived } from 'svelte/store';
import type { PubFlow } from '../../../core/client';
import type { SvelteStorage } from '../utils/storage';

interface AuthState {
  session: any | null;
  loading: boolean;
  error: any | null;
  initialized: boolean;
}

function createAuthStore(client: PubFlow, storage: SvelteStorage) {
  const { subscribe, set, update } = writable<AuthState>({
    session: null,
    loading: true,
    error: null,
    initialized: false
  });

  let currentClient = client;

  async function initialize() {
    try {
      update(s => ({ ...s, loading: true }));
      const session = await storage.getSession();
      
      if (session) {
        const isValid = await currentClient.auth.validateSession(session.sessionId);
        if (!isValid) {
          await storage.clearSession();
          set({ session: null, loading: false, error: null, initialized: true });
          return;
        }
        set({ session, loading: false, error: null, initialized: true });
      } else {
        set({ session: null, loading: false, error: null, initialized: true });
      }
    } catch (error) {
      set({ session: null, loading: false, error, initialized: true });
    }
  }

  async function login(credentials: any) {
    try {
      update(s => ({ ...s, loading: true, error: null }));
      const session = await currentClient.auth.login(credentials);
      await storage.setSession(session);
      set({ session, loading: false, error: null, initialized: true });
      return session;
    } catch (error) {
      update(s => ({ ...s, loading: false, error }));
      throw error;
    }
  }

  async function logout() {
    try {
      update(s => ({ ...s, loading: true }));
      await currentClient.auth.logout();
      await storage.clearSession();
      set({ session: null, loading: false, error: null, initialized: true });
    } catch (error) {
      update(s => ({ ...s, loading: false, error }));
      throw error;
    }
  }

  function isAuthorized(roles?: string | string[]) {
    let state: AuthState;
    subscribe(s => (state = s))();

    if (!state.session) return false;
    if (!roles) return true;

    const userRoles = Array.isArray(state.session.user.roles)
      ? state.session.user.roles
      : [state.session.user.userType];

    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return requiredRoles.some(role => userRoles.includes(role));
  }

  const loading = derived(
    { subscribe },
    $state => $state.loading
  );

  const error = derived(
    { subscribe },
    $state => $state.error
  );

  const session = derived(
    { subscribe },
    $state => $state.session
  );

  return {
    subscribe,
    login,
    logout,
    initialize,
    isAuthorized,
    loading,
    error,
    session,
    setClient: (newClient: PubFlow) => {
      currentClient = newClient;
    }
  };
}

export const auth = createAuthStore(null, null);

// src/adapters/svelte/actions/auth.ts
import { get } from 'svelte/store';
import { auth } from '../stores/auth';

export interface AuthActionOptions {
  requireAuth?: boolean;
  roles?: string | string[];
  onUnauthenticated?: () => void;
  onUnauthorized?: () => void;
  loadingClass?: string;
  unauthorizedClass?: string;
}

export function auth(node: HTMLElement, options: AuthActionOptions) {
  let currentAuth = get(auth);
  let unsubscribe: () => void;

  function updateNode() {
    if (currentAuth.loading) {
      node.classList.add(options.loadingClass || 'loading');
      return;
    } else {
      node.classList.remove(options.loadingClass || 'loading');
    }

    if (options.requireAuth && !currentAuth.session) {
      node.style.display = 'none';
      options.onUnauthenticated?.();
      return;
    }

    if (options.roles && !currentAuth.isAuthorized(options.roles)) {
      node.style.display = 'none';
      node.classList.add(options.unauthorizedClass || 'unauthorized');
      options.onUnauthorized?.();
      return;
    }

    node.style.display = '';
    node.classList.remove(options.unauthorizedClass || 'unauthorized');
  }

  unsubscribe = auth.subscribe(value => {
    currentAuth = value;
    updateNode();
  });

  return {
    update(newOptions: AuthActionOptions) {
      options = newOptions;
      updateNode();
    },
    destroy() {
      unsubscribe();
    }
  };
}
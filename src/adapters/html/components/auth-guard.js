// src/adapters/html/components/auth-guard.js
export class AuthGuard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    static get observedAttributes() {
      return ['redirect-url', 'loading-template'];
    }
  
    async connectedCallback() {
      const redirectUrl = this.getAttribute('redirect-url') || '/login';
      const loadingTemplate = this.getAttribute('loading-template');
  
      if (loadingTemplate) {
        this.shadowRoot.innerHTML = loadingTemplate;
      }
  
      const isAuthenticated = await auth.isAuthenticated();
      if (!isAuthenticated) {
        window.location.href = redirectUrl;
        return;
      }
  
      this.shadowRoot.innerHTML = '<slot></slot>';
    }
  }
  
  customElements.define('auth-guard', AuthGuard);
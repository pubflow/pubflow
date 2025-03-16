// src/adapters/html/components/bridge-view.js
export class BridgeView extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    static get observedAttributes() {
      return ['resource', 'require-auth', 'user-types'];
    }
  
    connectedCallback() {
      this.render();
      this.setupHtmx();
    }
  
    setupHtmx() {
      htmx.process(this.shadowRoot);
    }
  
    async render() {
      const requireAuth = this.getAttribute('require-auth') === 'true';
      const userTypes = this.getAttribute('user-types')?.split(',');
      const resource = this.getAttribute('resource');
  
      if (requireAuth && !await auth.isAuthenticated()) {
        this.shadowRoot.innerHTML = `
          <div class="unauthorized">
            <p>Please login to access this resource</p>
            <a href="/login" class="btn">Login</a>
          </div>
        `;
        return;
      }
  
      if (userTypes && !await auth.hasRole(userTypes)) {
        this.shadowRoot.innerHTML = `
          <div class="unauthorized">
            <p>You don't have permission to access this resource</p>
          </div>
        `;
        return;
      }
  
      this.shadowRoot.innerHTML = `
        <div class="bridge-view">
          <slot></slot>
        </div>
      `;
    }
  }
  
  customElements.define('bridge-view', BridgeView);
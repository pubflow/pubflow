// src/adapters/html/components/role-guard.js
export class RoleGuard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    static get observedAttributes() {
      return ['roles', 'unauthorized-template'];
    }
  
    async connectedCallback() {
      const roles = this.getAttribute('roles')?.split(',');
      const unauthorizedTemplate = this.getAttribute('unauthorized-template');
  
      const hasRole = await auth.hasRole(roles);
      if (!hasRole) {
        this.shadowRoot.innerHTML = unauthorizedTemplate || `
          <div class="unauthorized">
            <p>Unauthorized access</p>
          </div>
        `;
        return;
      }
  
      this.shadowRoot.innerHTML = '<slot></slot>';
    }
  }
  
  customElements.define('role-guard', RoleGuard);
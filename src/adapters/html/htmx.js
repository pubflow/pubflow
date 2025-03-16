// src/adapters/html/htmx.js
export class HtmxAdapter {
    constructor(client) {
      this.client = client;
      this.templates = new Map();
      this.setupHtmxExtensions();
    }
  
    setupHtmxExtensions() {
      htmx.defineExtension('pubflow', {
        onEvent: (name, evt) => {
          switch (name) {
            case 'htmx:configRequest':
              this.handleRequestConfig(evt);
              break;
            case 'htmx:beforeRequest':
              this.handleBeforeRequest(evt);
              break;
            case 'htmx:afterRequest':
              this.handleAfterRequest(evt);
              break;
            case 'htmx:responseError':
              this.handleResponseError(evt);
              break;
          }
        }
      });
    }
  
    handleRequestConfig(evt) {
      const session = this.client.auth.getSession();
      if (session?.sessionId) {
        evt.detail.headers['X-Session-ID'] = session.sessionId;
      }
  
      const resource = evt.detail.elt.getAttribute('bridge-resource');
      if (resource) {
        evt.detail.headers['X-Bridge-Resource'] = resource;
      }
    }
  
    handleBeforeRequest(evt) {
      const target = evt.detail.target;
      target.classList.add('htmx-loading');
      this.showLoadingIndicator(target);
    }
  
    handleAfterRequest(evt) {
      const target = evt.detail.target;
      target.classList.remove('htmx-loading');
      this.hideLoadingIndicator(target);
  
      if (evt.detail.xhr.status === 200) {
        try {
          const response = JSON.parse(evt.detail.xhr.responseText);
          if (response.success) {
            const resource = evt.detail.elt.getAttribute('bridge-resource');
            const html = this.renderResponse(resource, response);
            target.innerHTML = html;
          } else {
            this.handleError(target, response.error);
          }
        } catch (error) {
          console.error('Response parsing error:', error);
        }
      }
    }
  
    handleResponseError(evt) {
      const target = evt.detail.target;
      target.classList.remove('htmx-loading');
      this.hideLoadingIndicator(target);
      this.handleError(target, 'Request failed');
    }
  
    registerTemplate(resource, template) {
      this.templates.set(resource, template);
    }
  
    renderResponse(resource, response) {
      const template = this.templates.get(resource);
      if (template) {
        return template(response.data.rows, response.meta);
      }
      return this.defaultTemplate(response.data.rows, response.meta);
    }
  
    defaultTemplate(rows, meta) {
      return `
        <div class="pubflow-list">
          ${rows.map(item => `
            <div class="pubflow-item" data-id="${item.id}">
              ${Object.entries(item)
                .filter(([key]) => !key.includes('_at'))
                .map(([key, value]) => `
                  <div class="pubflow-field">
                    <span class="pubflow-label">${this.formatLabel(key)}</span>
                    <span class="pubflow-value">${value}</span>
                  </div>
                `).join('')}
              <div class="pubflow-actions">
                <button
                  class="pubflow-edit"
                  hx-get="/api/${resource}/${item.id}/edit"
                  hx-target="closest .pubflow-item"
                >
                  Edit
                </button>
                <button
                  class="pubflow-delete"
                  hx-delete="/api/${resource}/${item.id}"
                  hx-confirm="Are you sure?"
                  hx-target="closest .pubflow-item"
                >
                  Delete
                </button>
              </div>
            </div>
          `).join('')}
          ${this.renderPagination(meta)}
        </div>
      `;
    }
  
    renderPagination(meta) {
      if (!meta.hasMore) return '';
  
      return `
        <div class="pubflow-pagination">
          <button
            class="pubflow-load-more"
            hx-get="${window.location.pathname}"
            hx-target="closest .pubflow-list"
            hx-swap="beforeend"
            hx-vals='{"page": ${meta.page + 1}}'
          >
            Load More
          </button>
        </div>
      `;
    }
  
    formatLabel(key) {
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .trim()
        .replace(/^./, str => str.toUpperCase());
    }
  
    showLoadingIndicator(target) {
      let indicator = target.querySelector('.pubflow-loading');
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'pubflow-loading';
        indicator.innerHTML = `
          <div class="pubflow-spinner"></div>
          <span>Loading...</span>
        `;
        target.appendChild(indicator);
      }
      indicator.style.display = 'flex';
    }
  
    hideLoadingIndicator(target) {
      const indicator = target.querySelector('.pubflow-loading');
      if (indicator) {
        indicator.style.display = 'none';
      }
    }
  
    handleError(target, error) {
      let errorElement = target.querySelector('.pubflow-error');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'pubflow-error';
        target.appendChild(errorElement);
      }
      errorElement.innerHTML = `
        <div class="pubflow-error-message">
          ${error}
          <button onclick="this.parentElement.remove()">Dismiss</button>
        </div>
      `;
    }
  }
  
  // Default styles
  const styles = `
    .pubflow-list {
      position: relative;
    }
  
    .pubflow-item {
      border: 1px solid #ddd;
      margin: 8px 0;
      padding: 16px;
      border-radius: 4px;
    }
  
    .pubflow-field {
      margin: 4px 0;
    }
  
    .pubflow-label {
      font-weight: bold;
      margin-right: 8px;
    }
  
    .pubflow-actions {
      margin-top: 8px;
      display: flex;
      gap: 8px;
    }
  
    .pubflow-loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
  
    .pubflow-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: pubflow-spin 1s linear infinite;
    }
  
    .pubflow-error {
      margin: 8px 0;
      padding: 12px;
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 4px;
      color: #c00;
    }
  
    @keyframes pubflow-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  
  // Usage example:
  ```html
  <!DOCTYPE html>
  <html>
  <head>
      <title>PubFlow HTMX Example</title>
      <script src="htmx.min.js"></script>
      <script src="pubflow.min.js"></script>
      <style>${styles}</style>
  </head>
  <body>
      <div class="container">
          <!-- Subjects List -->
          <div
              id="subjectsList"
              hx-get="/api/subjects"
              hx-trigger="load"
              hx-ext="pubflow"
              bridge-resource="subjects"
          ></div>
  
          <!-- Add Subject Form -->
          <form
              hx-post="/api/subjects"
              hx-target="#subjectsList"
              hx-ext="pubflow"
              bridge-resource="subjects"
          >
              <input name="name" required placeholder="Subject Name">
              <select name="type" required>
                  <option value="academic">Academic</option>
                  <option value="technical">Technical</option>
              </select>
              <button type="submit">Add Subject</button>
          </form>
      </div>
  
      <script>
          // Initialize PubFlow
          const pubflow = new PubFlow({
              baseUrl: 'https://api.example.com'
          });
  
          // Initialize HTMX adapter
          const htmxAdapter = new HtmxAdapter(pubflow);
  
          // Register custom template for subjects
          htmxAdapter.registerTemplate('subjects', (rows, meta) => `
              <div class="subjects-grid">
                  ${rows.map(subject => `
                      <div class="subject-card" data-id="${subject.id}">
                          <h3>${subject.name}</h3>
                          <span class="badge ${subject.type}">
                              ${subject.type}
                          </span>
                          <div class="actions">
                              <button
                                  hx-delete="/api/subjects/${subject.id}"
                                  hx-confirm="Are you sure?"
                                  hx-target="closest .subject-card"
                              >
                                  Delete
                              </button>
                              <button
                                  hx-get="/api/subjects/${subject.id}/edit"
                                  hx-target="closest .subject-card"
                              >
                                  Edit
                              </button>
                          </div>
                      </div>
                  `).join('')}
                  ${meta.hasMore ? `
                      <button
                          hx-get="/api/subjects"
                          hx-target=".subjects-grid"
                          hx-swap="beforeend"
                          hx-vals='{"page": ${meta.page + 1}}'
                      >
                          Load More
                      </button>
                  ` : ''}
              </div>
          `);
      </script>
  </body>
  </html>
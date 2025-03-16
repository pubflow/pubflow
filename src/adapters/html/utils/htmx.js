// src/adapters/html/utils/htmx.js
export const htmxUtils = {
    setupBridgeEndpoints(bridge) {
      htmx.on('htmx:configRequest', (evt) => {
        const session = storage.getSession();
        if (session) {
          evt.detail.headers['X-Session-ID'] = session.sessionId;
        }
      });
  
      htmx.defineExtension('bridge', {
        onEvent(name, evt) {
          if (name === 'htmx:beforeRequest') {
            const resource = evt.detail.elt.getAttribute('bridge-resource');
            if (resource) {
              evt.detail.headers['X-Bridge-Resource'] = resource;
            }
          }
        }
      });
    }
  };
  
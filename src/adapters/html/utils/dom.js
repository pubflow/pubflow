// src/adapters/html/utils/dom.js
export const domUtils = {
    showLoading(element) {
      element.classList.add('loading');
    },
  
    hideLoading(element) {
      element.classList.remove('loading');
    },
  
    showError(element, error) {
      const errorEl = document.createElement('div');
      errorEl.className = 'error-message';
      errorEl.textContent = error.message;
      element.appendChild(errorEl);
    },
  
    clearError(element) {
      const errorEl = element.querySelector('.error-message');
      if (errorEl) errorEl.remove();
    }
  };
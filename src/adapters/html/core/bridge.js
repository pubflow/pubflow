// src/adapters/html/core/bridge.js
export class Bridge {
    constructor(client) {
      this.client = client;
    }
  
    async query(resource, params = {}) {
      try {
        const response = await this.client.get(`/bridge/${resource}`, params);
        this.dispatchEvent('bridge:query', { resource, data: response });
        return response;
      } catch (error) {
        this.dispatchEvent('bridge:error', { resource, error });
        throw error;
      }
    }
  
    async create(resource, data) {
      try {
        const response = await this.client.post(`/bridge/${resource}`, data);
        this.dispatchEvent('bridge:create', { resource, data: response });
        return response;
      } catch (error) {
        this.dispatchEvent('bridge:error', { resource, error });
        throw error;
      }
    }
  
    async update(resource, id, data) {
      try {
        const response = await this.client.put(`/bridge/${resource}/${id}`, data);
        this.dispatchEvent('bridge:update', { resource, id, data: response });
        return response;
      } catch (error) {
        this.dispatchEvent('bridge:error', { resource, error });
        throw error;
      }
    }
  
    async delete(resource, id) {
      try {
        await this.client.delete(`/bridge/${resource}/${id}`);
        this.dispatchEvent('bridge:delete', { resource, id });
      } catch (error) {
        this.dispatchEvent('bridge:error', { resource, error });
        throw error;
      }
    }
  
    dispatchEvent(type, detail = {}) {
      document.dispatchEvent(new CustomEvent(type, { detail }));
    }
  }
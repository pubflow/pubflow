// src/services/bridge.ts
export class BridgeService {
    constructor(private http: HttpClient) {}
  
    async query<T>(
      resource: string,
      params?: {
        page?: number;
        limit?: number;
        orderBy?: string;
        orderDir?: 'asc' | 'desc';
        include?: string[];
      }
    ): Promise<PubFlowResponse<T[]>> {
      return this.http.request(`/bridge/${resource}`, { params });
    }
  
    async search<T>(
      resource: string,
      query: string,
      params?: {
        page?: number;
        limit?: number;
        searchColumns?: string[];
      }
    ): Promise<PubFlowResponse<T[]>> {
      return this.http.request(`/bridge/${resource}/search`, {
        params: { ...params, q: query }
      });
    }
  
    async create<T>(resource: string, data: Record<string, any>): Promise<PubFlowResponse<T>> {
      return this.http.request(`/bridge/${resource}`, {
        method: 'POST',
        body: data
      });
    }
  
    async update<T>(resource: string, id: string, data: Record<string, any>): Promise<PubFlowResponse<T>> {
      return this.http.request(`/bridge/${resource}/${id}`, {
        method: 'PUT',
        body: data
      });
    }
  
    async delete(resource: string, id: string): Promise<PubFlowResponse<{ id: string }>> {
      return this.http.request(`/bridge/${resource}/${id}`, {
        method: 'DELETE'
      });
    }
  }
  
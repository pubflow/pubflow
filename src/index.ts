// src/index.ts
export class PubFlow {
    private http: HttpClient;
    private storage: StorageAdapter;
    public auth: AuthService;
    public bridge: BridgeService;
  
    constructor(config: PubFlowConfig) {
      this.storage = new LocalStorageAdapter(config.storage);
      this.http = new HttpClient(config.baseUrl, config.defaultHeaders);
      this.auth = new AuthService(this.http, this.storage);
      this.bridge = new BridgeService(this.http);
    }
  }
  
  export * from './types';
  export * from './core/errors';
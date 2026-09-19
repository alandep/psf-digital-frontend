// Per-module feature flags for the gateway pattern. Flip a flag to true to
// route that module's calls to the real backend BFF; all default to false so
// the app keeps running fully mocked until the backend is available.
export interface RealApiFlags {
  auth: boolean;
  export: boolean;
  subscription: boolean;
  documents: boolean;
  logistics: boolean;
  finance: boolean;
}

export interface Environment {
  production: boolean;
  useMockServices: boolean;
  // Base URL of the backend. BFF paths already include the '/bff' prefix, so
  // this is just the origin (dev) or '' for same-origin (prod).
  bffBaseUrl: string;
  realApis: RealApiFlags;
}

export const environment: Environment = {
  production: false,
  useMockServices: true,
  bffBaseUrl: 'http://localhost:8080',
  realApis: {
    auth: false,
    export: false,
    subscription: false,
    documents: false,
    logistics: false,
    finance: false
  }
};

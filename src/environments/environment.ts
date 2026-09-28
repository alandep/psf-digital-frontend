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
  // Empty in dev too: requests use relative '/bff/...' paths and the Angular
  // dev-server proxy (proxy.conf.json) forwards them to the backend
  // same-origin, so no CORS and the session cookie flows.
  bffBaseUrl: string;
  realApis: RealApiFlags;
}

export const environment: Environment = {
  production: false,
  useMockServices: false,
  bffBaseUrl: '',
  realApis: {
    auth: true,
    export: true,
    subscription: false,
    documents: false,
    logistics: false,
    finance: false
  }
};

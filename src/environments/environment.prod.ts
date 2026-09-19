import { Environment } from './environment';

export const environment: Environment = {
  production: true,
  useMockServices: true,
  // Same-origin in production: BFF paths already carry the '/bff' prefix.
  bffBaseUrl: '',
  realApis: {
    auth: false,
    export: false,
    subscription: false,
    documents: false,
    logistics: false,
    finance: false
  }
};

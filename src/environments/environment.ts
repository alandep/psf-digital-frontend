export interface Environment {
  production: boolean;
  useMockServices: boolean;
  bffBaseUrl: string;
}

export const environment: Environment = {
  production: false,
  useMockServices: true,
  bffBaseUrl: 'http://localhost:8080/api'
};

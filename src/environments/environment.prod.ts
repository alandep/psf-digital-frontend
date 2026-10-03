// Produção real: o frontend é publicado no Firebase Hosting (iaexport.com.br, apex)
// e fala com o backend REAL via HTTPS em api.iaexport.com.br (Caminho B — HTTP(S)
// Load Balancer gerenciado + certificado TLS gerenciado pelo Google). Sem mocks.
//
// NÃO importar o tipo `Environment` daqui: em produção o Angular substitui
// `environment.ts` por este arquivo (fileReplacements), então `./environment`
// resolveria para este próprio módulo (que não exporta o tipo). A interface
// `Environment` permanece intacta em `environment.ts`; este objeto é
// estruturalmente compatível com ela.
export const environment = {
  production: true,
  useMockServices: false,
  // Backend de produção (Caminho B). As chamadas de BFF usam este host absoluto via HTTPS.
  bffBaseUrl: 'https://api.iaexport.com.br',
  realApis: {
    // Mesmo conjunto habilitado hoje no dev (environment.ts): auth + ai reais.
    auth: true,
    export: false,
    subscription: false,
    documents: false,
    logistics: false,
    finance: false,
    crm: false,
    ai: true
  }
};

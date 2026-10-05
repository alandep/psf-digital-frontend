// Produção real: o frontend é publicado no Firebase Hosting (iaexport.com.br, apex)
// e fala com o backend REAL via HTTPS. Sem mocks.
//
// ⚠️ DEGUSTAÇÃO (TEMPORÁRIO): o backend é consumido pela URL NATIVA do Cloud Run
// (run.app), SEM Load Balancer e SEM domínio custom. iaexport.com.br (Firebase) e
// run.app (Cloud Run) têm registrable domains DIFERENTES → o fluxo é CROSS-SITE,
// por isso o cookie de sessão/CSRF usa SameSite=None; Secure no backend (profile cloud).
// Quando api.iaexport.com.br entrar (via Global External LB + Serverless NEG, same-site),
// reverter bffBaseUrl para 'https://api.iaexport.com.br'.
//
// NÃO importar o tipo `Environment` daqui: em produção o Angular substitui
// `environment.ts` por este arquivo (fileReplacements), então `./environment`
// resolveria para este próprio módulo (que não exporta o tipo). A interface
// `Environment` permanece intacta em `environment.ts`; este objeto é
// estruturalmente compatível com ela.
export const environment = {
  production: true,
  useMockServices: false,
  // Backend de degustação: URL nativa do Cloud Run (run.app). As chamadas de BFF usam
  // este host absoluto via HTTPS. TEMPORÁRIO até api.iaexport.com.br entrar via LB.
  bffBaseUrl: 'https://eip-backend-mturyukj4a-rj.a.run.app',
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

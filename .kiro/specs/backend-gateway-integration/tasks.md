# Implementation Plan: Backend Gateway Integration

## Overview

This plan is an **honest status + forward view** of the already-built, in-progress backend
gateway integration. Much of the architecture is already implemented and marked done below;
the remaining work sequences the final module (CRM), rewiring audits, per-module end-to-end
verification, low-risk additive backend endpoints, and documentation.

Every coding task honors the project's hard constraints:

- **Front build gate**: `npx ng build --configuration=development` MUST exit `0` after each
  coding task. (Req 10.1)
- **Backend boot gate**: backend keeps booting via `docker compose up --build`; backend
  changes are **additive** wherever possible. (Req 8.4, 10.2, 11.3)
- **Reversibility**: flipping any `realApis.<module>` flag back to `false` fully restores
  mock behavior with **no component changes**. (Req 1.5, 11.1, 11.2)
- **Boundaries**: respect hexagonal boundaries and RLS/tenant discipline; **no committed
  secrets**. (Req 5, 6, 11.4)
- **Editing discipline**: edit TS/HTML/SCSS/SQL/Java sources with `str_replace`/`fs_write`
  (never PowerShell). Reserve the terminal for build/boot/verify only.

Language is already fixed by the codebase: **TypeScript/Angular 20** on the front,
**Java 21 / Spring Boot** on the back.

## Tasks

- [x] 1. Front gateway quartets for auth, export, subscription, documents, logistics, finance
  - Interface + mock adapter + HTTP adapter + InjectionToken + provider built per module
    (finance split into pagamentos/câmbio/hedge tokens).
  - _Note: Verified present — tokens under `src/app/services/{auth-flow,exportacao,subscription,documents,logistics,finance}`._
  - _Requirements: 1.1, 1.4_

- [x] 2. Same-origin dev integration (relative paths + dev-server proxy)
  - `bffBaseUrl` is `''`; HTTP adapters use relative `/bff/...`; `proxy.conf.json` forwards
    `/bff`, `/v3/api-docs`, `/swagger-ui` to `http://localhost:8080`; wired in `angular.json`.
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. HTTP cross-cutting interceptors (credentials / csrf / error incl. 401→/login)
  - `credentials.interceptor`, `csrf.interceptor` (SSR-safe, `/bff/auth/**` exempt), and
    `error.interceptor` (envelope normalization + 401→`/login` for non-auth `/bff`).
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 4. Stepped BFF authentication with session binding
  - identify → login → mfa/verify → optional select-organization; single-org auto-select in
    `verifyMfa`; dev seed `alan@eip.exemplo` / `senha123`; MFA accepts any 6 digits.
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 5. Session-based authorization + tenant binding
  - `SessionOrganizationContextFilter` binds `OrganizationContext` + `SecurityContext`
    (ROLE_USER); 401-not-302 via `HttpStatusEntryPoint`; permissive `RbacEvaluator`.
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 6. Multi-tenant RLS enforcement
  - `RlsAspect` sets `app.current_organization` per `@Transactional`; tenant-scoped reads/writes.
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7. Hybrid PARTIAL fallback + dashboard overlay
  - HTTP adapters delegate unsupported methods to the mock (`// PARTIAL`); dashboards use
    `forkJoin(mock$, backend$)` + `map` with `catchError` fallback.
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 8. Additive backend dashboard endpoints
  - `GET /bff/exportacoes/dashboard`, `GET /bff/crm/oportunidades/dashboard`,
    `GET /bff/logistica/embarques/dashboard` added additively (use-case + service + controller).
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 9. Consumption of real endpoints in export + logistics screens
  - export lista + acompanhar-status via `getDashboardData`; logistics embarque-lista
    "Resumo de Embarques" via `getDashboard`.
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 10. Operator documentation
  - `docs/backend-integration.md` documents gateways, flags, endpoints, and verification steps.
  - _Requirements: 10 (verification steps), 11_

- [x] 11. Build the CRM front gateway quartet and wire a CRM screen
  - [x] 11.1 Create the CRM gateway interface and dashboard type
    - Add `src/app/services/crm/crm-service.interface.ts` declaring the component-facing
      contract: `getClientes`, `getLeads`, `getOportunidades`, and `getDashboardData(): Observable<CrmDashboard>`.
    - Add a `CrmDashboard` type (`total`, `valorTotalEstimado`, `porEstagio[]`) in
      `src/types/crm.ts` (or a dedicated dashboard type file) matching the backend
      `GET /bff/crm/oportunidades/dashboard` aggregation shape.
    - _Verify_: `npx ng build --configuration=development` exits `0`.
    - _Requirements: 1.1, 8.2_
  - [x] 11.2 Create the CRM mock adapter
    - Add `src/app/services/crm/crm-mock.service.ts` implementing the interface by delegating
      to the pre-existing `crmMockService`.
    - _Verify_: `npx ng build --configuration=development` exits `0`.
    - _Requirements: 1.1_
  - [x] 11.3 Create the CRM HTTP adapter
    - Add `src/app/services/crm/crm-real.service.ts` calling relative `/bff/crm/...`
      (`clientes`, `leads`, `oportunidades`) and `GET /bff/crm/oportunidades/dashboard`
      with a `forkJoin(mock$, backend$)` + `map` overlay and `catchError` fallback to mock.
    - Delegate any method the backend does not expose to the injected mock, marked `// PARTIAL`.
    - _Verify_: `npx ng build --configuration=development` exits `0`.
    - _Requirements: 1.1, 2.1, 7.1, 7.2, 7.3, 9.3_
  - [x] 11.4 Add the CRM InjectionToken + flag-driven provider
    - Add `src/app/services/crm/crm-service.token.ts` with `CRM_SERVICE` and a provider
      selecting the HTTP adapter when `environment.realApis.crm === true`, else the mock adapter.
    - Add `crm: boolean` to `RealApiFlags` in `src/environments/environment.ts`, defaulting to
      `false`; register `crmServiceProvider` in `app.config.ts`.
    - _Verify_: `npx ng build --configuration=development` exits `0`.
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 11.1_
  - [x] 11.5 Wire a CRM screen to consume the token
    - Update the chosen CRM screen (e.g. the oportunidades/dashboard view) to `@Inject(CRM_SERVICE)`
      instead of any concrete mock service, consuming `getDashboardData()`.
    - _Verify_: `npx ng build --configuration=development` exits `0`; with `realApis.crm = false`,
      confirm the screen renders identical mock behavior (no component changes needed to revert).
    - _Requirements: 1.6, 1.7, 7.4, 9.3, 11.2_

- [x] 12. Rewire-audit: ensure already-built gateways actually honor their flags
  - [x] 12.1 Audit subscription consumers and rewire to the token
    - Find components injecting a concrete subscription mock service and switch them to
      `@Inject(SUBSCRIPTION_SERVICE)` so `realApis.subscription` takes effect.
    - _Verify_: `npx ng build --configuration=development` exits `0`; `realApis.subscription = false`
      preserves mock behavior.
    - _Requirements: 1.6, 1.7, 11.2_
  - [x] 12.2 Audit documents consumers and rewire to the token
    - Find components injecting a concrete documents mock service and switch them to
      `@Inject(DOCUMENTS_SERVICE)` where they must honor the flag. Note any rich document
      screens intentionally staying on mock (invoice, packing-list, bill-of-lading, certificados).
    - _Verify_: `npx ng build --configuration=development` exits `0`; `realApis.documents = false`
      preserves mock behavior.
    - _Requirements: 1.6, 1.7, 11.2_
  - [x] 12.3 Audit finance consumers and rewire to the tokens
    - Find components injecting concrete finance mock services and switch them to
      `@Inject(PAGAMENTOS_SERVICE)` / `@Inject(CAMBIO_SERVICE)` / `@Inject(HEDGE_SERVICE)`.
    - _Verify_: `npx ng build --configuration=development` exits `0`; `realApis.finance = false`
      preserves mock behavior.
    - _Requirements: 1.6, 1.7, 11.2_

- [x] 13. Checkpoint — build green after CRM + rewire
  - Ensure `npx ng build --configuration=development` exits `0` and all flags default to `false`.
    Ask the user if questions arise.
  - _Requirements: 10.1, 11.1_

- [x] 14. Per-module end-to-end verification (flag-flip passes)
  - For each module below: flip its flag to `true` in `src/environments/environment.ts`, run the
    backend (`docker compose up --build`), serve the front (`ng serve --configuration=development`),
    log in (identifier → `senha123` → any 6-digit MFA), confirm core lifecycle calls hit `/bff/...`
    and PARTIAL methods fall back to mock without errors, then **flip the flag back to `false`** and
    confirm mock behavior is fully restored. Record results in `docs/backend-integration.md`.
  - [x] 14.1 Verify `subscription` end-to-end and document results
    - _Requirements: 7.1, 10.4, 11.2_
  - [x] 14.2 Verify `documents` end-to-end and document results
    - _Requirements: 7.1, 10.4, 11.2_
  - [x] 14.3 Verify `logistics` end-to-end and document results
    - _Requirements: 7.1, 9.2, 10.4, 11.2_
  - [x] 14.4 Verify `finance` end-to-end and document results
    - _Requirements: 7.1, 10.4, 11.2_
  - [x] 14.5 Verify `crm` end-to-end and document results
    - _Requirements: 7.1, 9.3, 10.4, 11.2_

- [x] 15. Optional low-risk additive backend endpoints to reduce PARTIAL gaps
  - [x]* 15.1 Add additive read/catalog or generic update/delete endpoints only where additive
    - For a selected low-risk PARTIAL method (e.g. a catalog/list read, or a generic
      update/delete), add a new use-case method + service impl + BFF controller method in the
      relevant module without modifying existing code; keep RBAC + session requirements.
    - Then switch the corresponding HTTP-adapter method off `// PARTIAL` to call the new endpoint.
    - If a method cannot be made additive safely, leave it PARTIAL and note the reason.
    - _Verify_: `docker compose up --build` still boots (logs include `Started EipBackendApplication`,
      `Tomcat started on port 8080`, Flyway applies, `GET /actuator/health` → `UP`); then
      `npx ng build --configuration=development` exits `0`.
    - _Requirements: 7.1, 8.4, 8.5, 10.2, 11.3_

- [x] 16. Keep operator documentation current
  - Update `docs/backend-integration.md` as each module is consumed/verified: flags, newly
    consumed endpoints, PARTIAL surfaces, and e2e results from task 14.
  - _Verify_: documentation reflects the current flag/endpoint/consumption matrix.
  - _Requirements: 9, 10, 11_

- [x] 17. Deferred follow-ups (documented, not implemented in this spec)
  - [x]* 17.1 Note Stripe webhook signature verification as deferred
    - Record in `docs/backend-integration.md` that Stripe webhook signature verification is
      **out of scope** for this spec unless trivial; leave the existing TODO in place with a
      pointer to this note.
    - _Requirements: 11.3_
  - [x]* 17.2 Note RbacEvaluator permissiveness and conditional 403 handling as deferred
    - Record that `RbacEvaluator` remains a permissive placeholder (returns `true`); replacing
      it with a real per-org permission matrix is **out of scope** here. Add a note that, if/when
      real RBAC lands, `error.interceptor` should gain `403` handling — defer the interceptor
      change until then.
    - _Requirements: 5.6_

- [x] 18. Final verification
  - Run `npx ng build --configuration=development` and confirm exit `0` with all `realApis`
    flags defaulting to `false`.
  - Run `docker compose up --build` from `backend/` and confirm successful boot
    (`Started EipBackendApplication`, `Tomcat started on port 8080`, Flyway applies,
    `GET /actuator/health` → `UP`).
  - With `auth` + `export` flags `true`, exercise login + export list + dashboard same-origin via
    the proxy, and spot-check one newly consumed module (CRM).
  - Flip all flags back to `false` and confirm the fully-mocked experience is restored.
  - Ask the user if questions arise.
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 11.1, 11.2_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster path; core tasks are not optional.
- Tasks 1–10 are **already implemented** and marked complete to give an honest status baseline.
- Each remaining coding task keeps the front build green (`ng build` exit 0) and, where backend
  touched, keeps `docker compose up --build` booting.
- Reversibility is a hard invariant: every rewire/consumption task must leave `flag = false`
  behaving exactly like the pre-integration mock.
- This spec documents architecture/integration wiring; verification is build gates, docker boot
  smoke checks, and flag-flip e2e flows rather than property-based tests (see requirements.md
  Correctness Properties Note).

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["11.1"] },
    { "id": 1, "tasks": ["11.2", "11.3"] },
    { "id": 2, "tasks": ["11.4"] },
    { "id": 3, "tasks": ["11.5", "12.1", "12.2", "12.3"] },
    { "id": 4, "tasks": ["14.1", "14.2", "14.3", "14.4", "14.5"] },
    { "id": 5, "tasks": ["15.1"] },
    { "id": 6, "tasks": ["17.1", "17.2"] }
  ]
}
```

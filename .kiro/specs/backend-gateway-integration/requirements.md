# Requirements Document

## Introduction

This document specifies the requirements for the **already-built, in-progress** backend
gateway integration that incrementally migrates the Angular front end from a fully mocked
experience to consuming the real Spring Boot backend-for-frontend (BFF), **module by module,
without breaking the mocked experience**. Requirements are derived from and consistent with
the approved design (`design.md`) and the real implementation (`src/environments/environment.ts`,
the per-module gateway quartets, the HTTP interceptors, the backend security chains, and the
additive BFF dashboard endpoints). They describe the system as it exists and the invariants it
must preserve as migration continues — not a greenfield build.

The front end is Angular 20 (standalone components, functional HTTP interceptors). The backend
is Java 21 / Spring Boot 3.5.6, a modular-monolith hexagonal architecture with PostgreSQL +
Flyway + Row-Level Security (RLS) and Spring Modulith, run via `docker compose up --build`.

The guiding principles are: the default state stays fully mocked; each module is flipped to the
real backend via a per-module feature flag; flipping the flag back fully restores mock behavior
with no component changes; backend changes are additive so the backend keeps building and
booting; and the front build stays green (exit 0) at every increment.

## Glossary

- **Gateway**: The per-module front-end quartet (interface, mock adapter, HTTP adapter,
  InjectionToken + provider) through which components consume a module.
- **Gateway_Provider**: The Angular provider bound to a module's `InjectionToken` that selects
  the mock adapter or the HTTP adapter based on `environment.realApis.<module>`.
- **Mock_Adapter**: The adapter that delegates to the pre-existing rich mock service for a module.
- **HTTP_Adapter**: The real service that calls the backend BFF over relative `/bff/...` paths;
  delegates unsupported methods to the mock (marked `// PARTIAL`).
- **Dev_Proxy**: The Angular dev-server proxy (`proxy.conf.json`, wired in `angular.json`) that
  forwards `/bff`, `/v3/api-docs`, and `/swagger-ui` to `http://localhost:8080`.
- **Credentials_Interceptor**: The functional interceptor that adds `withCredentials: true` on
  `/bff` requests.
- **CSRF_Interceptor**: The functional interceptor that mirrors the `XSRF-TOKEN` cookie into the
  `X-XSRF-TOKEN` header on mutating `/bff` requests except `/bff/auth/**`.
- **Error_Interceptor**: The functional interceptor that normalizes the backend error envelope
  and redirects to `/login` on a 401 for a non-auth `/bff` call.
- **BFF_Chain**: The session-based Spring Security filter chain (order 2) matching `/bff/**`,
  `/login/**`, `/actuator/**`, `/webhooks/**`.
- **API_Chain**: The stateless JWT Spring Security filter chain (order 1) matching `/api/v1/**`;
  not used by the SPA.
- **Session_Org_Filter**: `SessionOrganizationContextFilter`, which reads `EIP_ORG`/`EIP_USER`
  from the session and binds both the tenant `OrganizationContext` and the Spring `SecurityContext`.
- **Organization_Context**: The tenant context (`OrganizationContextHolder`) used by RLS.
- **RLS_Aspect**: `RlsAspect`, which sets `app.current_organization` per `@Transactional`.
- **Rbac_Evaluator**: `RbacEvaluator`, exposed as `@rbac` for `@PreAuthorize("@rbac.can(...)")`;
  currently a permissive placeholder returning `true` for any authenticated principal.
- **Stepped_Auth**: The BFF authentication flow: identify → password → MFA → optional organization
  selection.
- **PARTIAL**: A method on an HTTP_Adapter that the backend does not yet expose and that therefore
  delegates to the mock.
- **Dashboard_Overlay**: The `forkJoin(mock$, backend$)` + `map` strategy that overlays real
  counters onto mock-rich data, with `catchError` fallback to the mock.

## Requirements

### Requirement 1: Gateway pattern and per-module toggling

**User Story:** As a front-end developer, I want each module to be consumed through a flag-driven
gateway, so that I can switch a module between mock and the real backend without changing any
component code and can safely revert.

#### Acceptance Criteria

1. THE Gateway SHALL provide, for each integrated module, an interface, a Mock_Adapter, an
   HTTP_Adapter, and an InjectionToken with a Gateway_Provider.
2. WHERE `environment.realApis.<module>` is `false`, THE Gateway_Provider SHALL resolve the
   module's token to the Mock_Adapter.
3. WHERE `environment.realApis.<module>` is `true`, THE Gateway_Provider SHALL resolve the
   module's token to the HTTP_Adapter.
4. THE `RealApiFlags` type SHALL define a boolean flag for each gateway-enabled module
   (`auth`, `export`, `subscription`, `documents`, `logistics`, `finance`).
5. WHEN a module's flag is changed from `true` back to `false`, THE Gateway_Provider SHALL
   restore full Mock_Adapter behavior for that module with no changes to consuming components.
6. THE consuming components SHALL depend on a module only through its InjectionToken rather than
   the concrete Mock_Adapter class.
7. IF a consuming component injects the concrete mock service directly, THEN THE component SHALL
   be rewired to inject the module through its InjectionToken so the flag takes effect.

### Requirement 2: Same-origin dev integration via relative paths and dev-server proxy

**User Story:** As a developer running the app locally, I want front-end requests to reach the
backend same-origin, so that there is no CORS configuration and the session cookie flows naturally.

#### Acceptance Criteria

1. THE HTTP_Adapter SHALL issue backend requests using relative `/bff/...` paths.
2. WHILE running in development, THE Environment SHALL set `bffBaseUrl` to `''` so requests use
   relative paths.
3. WHILE running in production, THE Environment SHALL set `bffBaseUrl` to `''` for same-origin
   requests.
4. THE Dev_Proxy SHALL forward `/bff`, `/v3/api-docs`, and `/swagger-ui` to
   `http://localhost:8080`.
5. WHEN the Dev_Proxy forwards a `/bff` request, THE request SHALL be treated as same-origin so
   that no CORS handling is required and the session cookie is included.

### Requirement 3: HTTP cross-cutting behavior via interceptors

**User Story:** As a developer, I want credentials, CSRF, and error handling applied consistently
to backend calls, so that session-based security and error normalization work without per-call code.

#### Acceptance Criteria

1. WHEN a request targets a `/bff` path, THE Credentials_Interceptor SHALL set `withCredentials`
   to `true` on that request.
2. WHEN a mutating (`POST`/`PUT`/`PATCH`/`DELETE`) request targets a `/bff` path other than
   `/bff/auth/**` AND an `XSRF-TOKEN` cookie is present, THE CSRF_Interceptor SHALL copy the
   `XSRF-TOKEN` cookie value into the `X-XSRF-TOKEN` request header.
3. WHERE a request targets `/bff/auth/**`, THE CSRF_Interceptor SHALL NOT add the `X-XSRF-TOKEN`
   header.
4. IF an `XSRF-TOKEN` cookie is absent on a mutating `/bff` request, THEN THE CSRF_Interceptor
   SHALL allow the request to proceed without the `X-XSRF-TOKEN` header.
5. WHEN the backend returns an error envelope `{ code, message, correlationId }`, THE
   Error_Interceptor SHALL normalize it into a pt-BR `Error` preserving `code`, `correlationId`,
   and `status`.
6. IF a `/bff` request that is not under `/bff/auth/**` returns HTTP `401` AND the current route
   is not already `/login`, THEN THE Error_Interceptor SHALL redirect the application to `/login`.
7. WHILE the current route is `/login`, THE Error_Interceptor SHALL NOT trigger a further redirect
   to `/login` so that redirect loops are avoided.
8. WHILE executing in a server-side-rendering context without `document`, THE CSRF_Interceptor
   SHALL execute without error.

### Requirement 4: Stepped BFF authentication

**User Story:** As a user, I want to authenticate through a stepped identify/password/MFA flow,
so that I can establish an authenticated session bound to my user and organization.

#### Acceptance Criteria

1. THE Stepped_Auth SHALL proceed through the ordered steps identify (`POST /bff/auth/identify`),
   password (`POST /bff/auth/login`), MFA (`POST /bff/auth/mfa/verify`), and optional organization
   selection (`POST /bff/auth/select-organization`).
2. WHEN the Stepped_Auth reaches the `AUTHENTICATED` state, THE backend SHALL bind the session
   attributes `EIP_USER` and `EIP_ORG`.
3. WHEN an authenticated user belongs to a single organization, THE backend SHALL auto-select that
   organization and bind `EIP_USER` and `EIP_ORG` during MFA verification without a separate
   organization-selection step.
4. WHERE running in development, THE backend SHALL accept the seed credentials
   `alan@eip.exemplo` / `senha123`.
5. WHERE running in development, THE backend SHALL accept any 6-digit value as the MFA code.
6. THE Stepped_Auth SHALL return consistent step responses that do not reveal which factor failed,
   to avoid account enumeration.
7. THE system SHALL NOT store production secrets in the repository for the dev seed credentials.

### Requirement 5: Session-based authorization and tenant binding

**User Story:** As a security engineer, I want each BFF request bound to both a tenant context and
a security context from the session, so that RLS and RBAC both operate correctly off the session.

#### Acceptance Criteria

1. WHEN a `/bff` request carries a valid session, THE Session_Org_Filter SHALL read `EIP_ORG` and
   `EIP_USER` from the session and bind the Organization_Context used by RLS.
2. WHEN a `/bff` request carries a valid session, THE Session_Org_Filter SHALL bind a
   `UsernamePasswordAuthenticationToken` with `ROLE_USER` into the Spring SecurityContext.
3. IF a `/bff` request is unauthenticated, THEN THE BFF_Chain SHALL return HTTP `401` via
   `HttpStatusEntryPoint` rather than an HTTP `302` redirect.
4. THE BFF_Chain SHALL permit without authentication the public set `/bff/auth/**`,
   `/bff/public/**`, swagger, `/v3/api-docs`, and `actuator/health`.
5. WHERE an endpoint is protected by `@PreAuthorize("@rbac.can(...)")`, THE backend SHALL evaluate
   the Rbac_Evaluator before executing the endpoint.
6. THE Rbac_Evaluator SHALL currently return `true` for any authenticated principal as a documented
   permissive placeholder pending a real per-org permission matrix.

### Requirement 6: Multi-tenant isolation via Row-Level Security

**User Story:** As a tenant, I want my data isolated from other organizations, so that reads and
writes are confined to my own organization.

#### Acceptance Criteria

1. WHEN a `@Transactional` operation runs on a `/bff` request, THE RLS_Aspect SHALL set
   `app.current_organization` for that transaction from the Organization_Context.
2. WHILE `app.current_organization` is set, THE database SHALL enforce row-level security on
   tenant tables so that only rows for the current organization are accessible.
3. WHEN a tenant-scoped read is executed, THE backend SHALL return only rows belonging to the
   current organization.
4. WHEN a tenant-scoped write is executed, THE backend SHALL persist rows scoped to the current
   organization.

### Requirement 7: Hybrid PARTIAL fallback

**User Story:** As a developer migrating a module, I want unsupported backend methods and dashboard
rich fields to fall back to the mock, so that screens keep working before the backend reaches parity.

#### Acceptance Criteria

1. WHERE a module flag is `true` AND the backend does not expose a method, THE HTTP_Adapter SHALL
   delegate that method to the injected mock.
2. WHERE a module flag is `true`, THE Dashboard_Overlay SHALL combine mock and backend data via
   `forkJoin` and `map` so that real counters replace mock numbers while mock-rich fields are
   preserved.
3. IF the backend dashboard call fails, THEN THE Dashboard_Overlay SHALL fall back to the mock data
   via `catchError`.
4. WHILE a module flag is `false`, THE Dashboard_Overlay SHALL NOT call the backend and SHALL use
   mock data only.

### Requirement 8: Additive backend dashboard endpoints

**User Story:** As a backend developer, I want aggregation dashboard endpoints added additively,
so that the backend keeps building and booting while new read endpoints are introduced.

#### Acceptance Criteria

1. THE backend SHALL expose `GET /bff/exportacoes/dashboard` returning aggregation fields
   (`total`, `rascunho`, `confirmadas`, `canceladas`, `valorTotal`, `porStatus[]`).
2. THE backend SHALL expose `GET /bff/crm/oportunidades/dashboard` returning aggregation fields
   (`total`, `valorTotalEstimado`, `porEstagio[]`).
3. THE backend SHALL expose `GET /bff/logistica/embarques/dashboard` returning aggregation fields
   (`total`, `porStatus[]`).
4. THE backend SHALL add each dashboard endpoint additively (new use-case method, service
   implementation, and controller method) without modifying existing code.
5. WHEN a dashboard endpoint is requested, THE BFF_Chain SHALL require an authenticated session and
   apply RBAC before returning the payload.

### Requirement 9: Consumption of real endpoints in screens

**User Story:** As a user of the export and logistics screens, I want real backend data overlaid on
the rich mock experience, so that I see real aggregates while retaining rich detail and graceful
fallback.

#### Acceptance Criteria

1. WHERE `realApis.export` is `true`, THE export screens (lista and acompanhar-status) SHALL consume
   `GET /bff/exportacoes` and `GET /bff/exportacoes/dashboard` via the HTTP_Adapter.
2. WHERE `realApis.logistics` is `true`, THE logistics screen (embarque-lista "Resumo de Embarques")
   SHALL consume `GET /bff/logistica/embarques/dashboard` via the HTTP_Adapter.
3. IF a consumed backend endpoint fails, THEN THE consuming screen SHALL fall back to mock data and
   render without an error screen.

### Requirement 10: Build, boot, and verification gates (non-functional)

**User Story:** As a maintainer, I want build, boot, and end-to-end gates enforced at every
increment, so that each migration step is verified and regressions are caught early.

#### Acceptance Criteria

1. WHEN any increment is completed, THE front build `ng build --configuration=development` SHALL
   exit with code `0`.
2. WHEN the backend is started via `docker compose up --build`, THE backend SHALL boot
   successfully (logs include `Started EipBackendApplication` and `Tomcat started on port 8080`,
   Flyway applies migrations, and `GET /actuator/health` returns `UP`).
3. WHEN the `auth` and `export` flags are `true` and the backend is running, THE end-to-end flow of
   login followed by export list and dashboard SHALL succeed same-origin via the Dev_Proxy.
4. WHEN a module's flag is set to `true` for verification, THE module's core lifecycle methods SHALL
   call `/bff/...` while PARTIAL methods return mock data and the screen renders without errors.

### Requirement 11: Reversibility and non-regression (non-functional)

**User Story:** As a maintainer, I want the mocked experience preserved by default and all backend
changes additive, so that integration never regresses the existing app and no secrets are leaked.

#### Acceptance Criteria

1. THE Environment SHALL default each `realApis` flag to `false` so the application runs fully
   mocked by default.
2. WHEN a module flag is `false`, THE module SHALL behave identically to the pre-integration mock
   experience.
3. THE backend integration SHALL make only additive backend changes so the backend continues to
   build and boot.
4. THE repository SHALL NOT contain committed production secrets.

## Known Limitations and Open Items

- **CRM has a backend dashboard but no front gateway yet.** `GET /bff/crm/oportunidades/dashboard`
  is ready on the backend but unconsumed on the front; the CRM gateway quartet has not been built.
  This is a known gap, not a defect of the current integration.
- **Rbac_Evaluator authorization is a placeholder.** `@rbac.can(...)` currently returns `true` for
  any authenticated principal. A real per-org permission matrix is pending; introducing it may add
  403 handling to front behavior and is tracked as an open question in the design.

## Correctness Properties Note

This spec documents architecture/integration wiring (flag-driven provider selection, security
chains, RLS/tenant binding, same-origin proxy behavior) rather than pure input/output
transformation logic. Verification is therefore primarily build gates, docker boot smoke checks,
and end-to-end flows rather than property-based tests. A limited set of genuinely universal
correctness properties (for example, reversibility: for any module, flag `false` ⇒ mock behavior)
will be mapped to these requirements during the design's Correctness Properties phase.

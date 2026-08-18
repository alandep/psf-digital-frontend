# Implementation Plan: EIP Frontend Improvements

## Overview

This plan implements 11 requirements for code quality, architecture, and UX improvements to the EIP Angular 20 frontend. Tasks are ordered by dependency: environment config first (foundation), then service abstraction (depends on env), file cleanup (independent but should precede refactors), component fixes (independent of each other), and finally integration/wiring.

## Tasks

- [x] 1. Create environment configuration files
  - [x] 1.1 Create `src/environments/environment.ts` with `useMockServices: true` and `bffBaseUrl: 'http://localhost:8080/api'`
    - Define the environment interface with `production`, `useMockServices`, and `bffBaseUrl` fields
    - _Requirements: 9.1, 9.2, 9.5_
  - [x] 1.2 Create `src/environments/environment.prod.ts` with `useMockServices: false` and `bffBaseUrl: '/api'`
    - _Requirements: 9.1, 9.2, 9.5_
  - [x] 1.3 Update `angular.json` to add `fileReplacements` for production builds
    - Add file replacement entry: `environment.ts` → `environment.prod.ts` under the production configuration
    - _Requirements: 9.5_

- [x] 2. Remove dead code and backup files from novos-pedidos/
  - [x] 2.1 Delete all backup/stub/dead files from `src/app/components/exportacao/novos-pedidos/`
    - Delete: `novos-pedidos.component.ts`, `novos-pedidos.component.html`, `novos-pedidos.component.scss`, `novos-pedidos.component.backup.ts`, `novos-pedidos.component.backup.html`, `novos-pedidos.component.new.ts`, `novos-pedidos.component.ts.new`, `novos-pedidos-minimal.component.ts`, `novos-pedidos-simple.component.ts`, `novos-pedidos-stub.component.ts`, `novos-pedidos.service.backup.ts`, `BACKUP_README.md`
    - _Requirements: 1.1, 1.2, 6.2_
  - [x] 2.2 Delete dead HTML files from `steps/informacao-basica/`
    - Delete: `informacao-basica-fixed.component.html`, `informacao-basica.stub.html`
    - _Requirements: 1.3_
  - [x] 2.3 Relocate `novos-pedidos.service.ts` to `src/app/services/novos-pedidos.service.ts`
    - Move the service file to the shared services directory
    - Update the import path in `src/app/components/exportacao/novos-pedidos/steps/informacao-basica/informacao-basica.component.ts` to point to the new location
    - Verify compilation succeeds
    - _Requirements: 6.3, 11.4_
  - [x] 2.4 Remove the `novos-pedidos/` directory (now empty except for `steps/`)
    - Move `steps/` directory to `src/app/components/exportacao/steps/` (or keep inside `novos-pedidos/` if the stepper references it from there — verify imports in `novo-pedido-stepper.component.ts` first)
    - If `novos-pedidos/` is now empty after steps relocation, delete it entirely
    - Update any import paths referencing the old location
    - _Requirements: 11.2, 11.3_

- [x] 3. Checkpoint - Verify build after file cleanup
  - Ensure all tests pass, ask the user if questions arise.
  - Run `ng build` to confirm no broken imports after file deletions and relocations

- [x] 4. Implement service abstraction layer
  - [x] 4.1 Create `IExportacaoService` interface at `src/app/services/exportacao/exportacao-service.interface.ts`
    - Define all public methods currently exposed by `ExportacaoMockService` in `src/services/exportacaoMockService.ts`
    - Use the same Observable return types and parameter signatures
    - _Requirements: 3.1_
  - [x] 4.2 Create `ExportacaoMockServiceAdapter` at `src/app/services/exportacao/exportacao-mock.service.ts`
    - Implements `IExportacaoService`
    - Delegates to the existing `ExportacaoMockService` (injected from root)
    - _Requirements: 3.2_
  - [x] 4.3 Create `ExportacaoRealService` stub at `src/app/services/exportacao/exportacao-real.service.ts`
    - Implements `IExportacaoService`
    - All methods throw "Not implemented" or return empty observables with TODO comments
    - Injects `HttpClient` and reads `environment.bffBaseUrl`
    - _Requirements: 3.6_
  - [x] 4.4 Create InjectionToken and factory at `src/app/services/exportacao/exportacao-service.token.ts`
    - Define `EXPORTACAO_SERVICE` InjectionToken
    - Implement factory function that reads `environment.useMockServices`
    - Export provider configuration for use in app config
    - _Requirements: 3.3, 3.5, 3.6, 9.3, 9.4_
  - [x] 4.5 Register the `exportacaoServiceProvider` in `src/app/app.config.ts`
    - Add the provider to the application's provider array
    - _Requirements: 3.4_
  - [x] 4.6 Update `ExportacaoDetalhesComponent` to use the InjectionToken
    - Remove `providers: [ExportacaoMockService]` from the component decorator
    - Inject `EXPORTACAO_SERVICE` token instead of the concrete `ExportacaoMockService`
    - _Requirements: 10.1, 10.2, 10.3, 3.4_
  - [ ]* 4.7 Write unit tests for service abstraction layer
    - Test factory returns `ExportacaoMockServiceAdapter` when `useMockServices` is true
    - Test factory returns `ExportacaoRealService` when `useMockServices` is false
    - Test `ExportacaoDetalhesComponent` shares root-level service instance
    - **Property 3: Service factory environment switching**
    - **Validates: Requirements 3.3, 3.5, 3.6, 9.3, 9.4**

- [x] 5. Fix NotificationService memory leak
  - [x] 5.1 Refactor `getUnreadCount()` in `src/app/services/notification.service.ts`
    - Add `unreadCount$` getter that uses `pipe(map(...))` on `notificationsSubject`
    - Replace the existing `getUnreadCount()` implementation to return `this.unreadCount$`
    - Remove the inner `new Observable` + `subscribe` pattern
    - _Requirements: 8.1, 8.2, 8.3_
  - [ ]* 5.2 Write property test for NotificationService unread count
    - Install `fast-check` as a dev dependency
    - Generate random sequences of add/markAsRead/markAllAsRead operations
    - Verify `unreadCount$` always matches manual filter of notifications for `read === false`
    - **Property 1: NotificationService unread count derivation**
    - **Validates: Requirements 8.1, 8.3**

- [x] 6. Create CambioService and fix hardcoded exchange rate
  - [x] 6.1 Create `src/app/services/cambio.service.ts`
    - Implement `CambioService` with `BehaviorSubject<ExchangeRate>`, `exchangeRate$` observable
    - Implement `startRateSimulation()` using `interval(30000)` with ±0.5% random fluctuation
    - _Requirements: 4.1_
  - [x] 6.2 Update `home-logged.component.ts` to use CambioService
    - Inject `CambioService`
    - Replace the hardcoded `USD: R$ 5.18` in the template with a reactive binding to `exchangeRate$`
    - Update trend icon to use `exchangeRate.trend` value
    - _Requirements: 4.2, 4.3, 4.4_
  - [ ]* 6.3 Write property test for CambioService rate bounds
    - Generate random fluctuation sequences
    - Verify rate stays within bounded range, is always positive, never NaN/Infinity
    - **Property 2: CambioService rate fluctuation bounds**
    - **Validates: Requirements 4.1, 4.4**

- [x] 7. Fix sidenav closing mechanism
  - [x] 7.1 Refactor `handleMenuClick()` in `home-logged.component.ts`
    - Replace current implementation with: close drawer via `drawer.close()`, then navigate in `.then()` callback
    - Remove `forceCloseSidenav()` method entirely
    - Remove `resetSidenavStyles()` method entirely
    - Remove all DOM manipulation code (querySelector, style.visibility, style.transform, style.display)
    - Remove private property access (`_opened`, `_openedStream`, `_changeDetectorRef`)
    - Clean up related console.log statements in toggle/menu methods
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ]* 7.2 Write unit test for sidenav close behavior
    - Verify `drawer.close()` is called before navigation
    - Verify no DOM manipulation occurs
    - Verify navigation happens after close promise resolves
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 8. Remove console.log from route definitions
  - [x] 8.1 Clean up `src/app/app.routes.ts`
    - Remove all `console.log` calls inside `loadComponent` and `loadChildren` callbacks
    - Simplify callbacks to directly return the component: `import(...).then(m => m.ComponentName)`
    - _Requirements: 5.1, 5.2_

- [x] 9. Create Coming Soon component and wire unimplemented routes
  - [x] 9.1 Create `src/app/components/shared/coming-soon/coming-soon.component.ts`
    - Standalone component with `@Input() moduleName`, `@Input() description`, `@Input() features: string[]`
    - Template displays module name, description text, and features list using Angular Material card and list
    - _Requirements: 7.1, 7.3_
  - [x] 9.2 Create a wrapper route component or update `navigateTo()` in `home-logged.component.ts`
    - For unimplemented routes, navigate to a Coming Soon route instead of showing a toast
    - Option A: Add a catch-all child route that renders `ComingSoonComponent` with route data
    - Option B: Register specific routes for each unimplemented section pointing to `ComingSoonComponent` with route data providing module name/features
    - Remove the `showInfo()` toast call for unimplemented routes
    - _Requirements: 7.2, 7.4_
  - [ ]* 9.3 Write unit tests for Coming Soon component
    - Test component renders module name, description, and features inputs
    - Test empty features array shows no list
    - _Requirements: 7.1, 7.3_

- [x] 10. Checkpoint - Full build and test verification
  - Ensure all tests pass, ask the user if questions arise.
  - Run `ng build` and `ng test` to verify everything compiles and passes

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Environment config (Task 1) is the foundation — must be done first
- File cleanup (Task 2) should precede service abstraction to avoid modifying dead files
- Tasks 5-9 are independent of each other and can be done in any order after Task 4
- The `steps/` directory relocation in Task 2.4 requires checking the stepper component's imports first
- Property tests use `fast-check` library which needs to be installed as a dev dependency

# Requirements Document

## Introduction

This document specifies the requirements for improving the Export Intelligence Platform (EIP) frontend application. The EIP is an Angular 20 standalone-component application using Angular Material that currently operates entirely on mock services. These improvements focus on code cleanup, architectural preparation for future backend integration, bug fixes, and UX enhancements — all while keeping existing mock data and services fully functional.

## Glossary

- **EIP**: Export Intelligence Platform — the Angular 20 frontend application for Brazilian agribusiness export management
- **Sidenav**: The Angular Material side navigation drawer component (`MatSidenav`)
- **Mock_Service**: A service class that returns simulated data using RxJS `of()` and `delay()` operators, without making real HTTP calls
- **Real_Service**: A future service class that will make HTTP calls to the BFF backend
- **BFF**: Backend-For-Frontend — the Node.js/Express server at `localhost:8080` that will provide real API endpoints
- **Service_Abstraction_Layer**: A set of TypeScript interfaces and Angular injection tokens that decouple consumers from concrete service implementations
- **Cambio_Service**: A service responsible for providing exchange rate data (mock or real)
- **Coming_Soon_Component**: A reusable Angular component displayed for routes that are not yet implemented
- **Environment_Configuration**: Angular environment files that control application behavior (mock vs real mode)
- **Exportacao_Module**: The collection of components, services, and routes related to export order management
- **Notification_Service**: The singleton Angular service responsible for toast messages, loading states, and notification management

## Requirements

### Requirement 1: Remove Duplicate and Backup Files

**User Story:** As a developer, I want the codebase to contain only active production code, so that I can navigate and maintain the project without confusion from obsolete files.

#### Acceptance Criteria

1. WHEN the build process runs, THE EIP SHALL contain no files with suffixes `.backup`, `.new`, `.minimal`, `.stub`, or `.ts.new` inside the `novos-pedidos/` directory
2. WHEN the build process runs, THE EIP SHALL contain no `BACKUP_README.md` file inside the `novos-pedidos/` directory
3. WHEN the build process runs, THE EIP SHALL contain no `informacao-basica-fixed.component.html` or `informacao-basica.stub.html` files in the `steps/informacao-basica/` directory
4. WHEN duplicate files are removed, THE EIP SHALL retain only the canonical active component for each feature area

### Requirement 2: Fix Sidenav Closing Mechanism

**User Story:** As a user, I want the sidenav to close reliably when I select a menu item, so that I can navigate the application without visual glitches or stuck overlays.

#### Acceptance Criteria

1. WHEN a user clicks a menu item in the Sidenav, THE EIP SHALL close the Sidenav using only the Angular Material public API (`MatSidenav.close()`)
2. WHEN the Sidenav closes, THE EIP SHALL NOT use direct DOM manipulation (e.g., setting `style.visibility`, `style.transform`, or `style.display` on sidenav or backdrop elements)
3. WHEN the Sidenav closes, THE EIP SHALL NOT access Angular Material private properties (e.g., `_opened`, `_openedStream`, `_changeDetectorRef`)
4. WHEN a user clicks a menu item, THE EIP SHALL close the Sidenav and then navigate to the target route after the close animation completes

### Requirement 3: Abstract Service Layer for Mock-to-Real Swap

**User Story:** As a developer, I want a service abstraction layer with interfaces and dependency injection, so that swapping from mock to real BFF calls is a configuration change rather than a code refactor.

#### Acceptance Criteria

1. THE Service_Abstraction_Layer SHALL define a TypeScript interface (`IExportacaoService`) that declares all public methods currently exposed by `ExportacaoMockService`
2. THE Mock_Service SHALL implement the `IExportacaoService` interface
3. THE Service_Abstraction_Layer SHALL provide an Angular `InjectionToken` for `IExportacaoService` that resolves the implementation based on Environment_Configuration
4. WHEN a component requires export data operations, THE component SHALL inject the `IExportacaoService` token rather than a concrete service class
5. WHEN the Environment_Configuration specifies mock mode, THE Service_Abstraction_Layer SHALL provide `ExportacaoMockService` as the implementation
6. WHEN the Environment_Configuration specifies real mode, THE Service_Abstraction_Layer SHALL provide a future `ExportacaoRealService` (stubbed initially) as the implementation

### Requirement 4: Dynamic Exchange Rate via Mock Service

**User Story:** As a user, I want to see a live-updating exchange rate in the toolbar, so that I have current market context without relying on a hardcoded value.

#### Acceptance Criteria

1. THE Cambio_Service SHALL provide an Observable that emits exchange rate data (at minimum USD/BRL)
2. WHEN the toolbar component initializes, THE toolbar SHALL subscribe to the Cambio_Service and display the current exchange rate
3. THE toolbar SHALL NOT contain any hardcoded exchange rate values
4. WHEN the Cambio_Service emits a new exchange rate, THE toolbar SHALL update the displayed value reactively

### Requirement 5: Remove Console.log Statements from Routes

**User Story:** As a developer, I want route definitions free of debug logging, so that production builds do not emit unnecessary console output.

#### Acceptance Criteria

1. THE EIP route definitions in `app.routes.ts` SHALL NOT contain `console.log` calls inside `loadComponent` or `loadChildren` callbacks
2. WHEN a route is lazily loaded, THE route configuration SHALL return the component or routes directly without side-effect logging

### Requirement 6: Consolidate Exportacao Module Structure

**User Story:** As a developer, I want a single clear path for the new-export-order workflow, so that there is no confusion between the old commented-out wizard and the active stepper.

#### Acceptance Criteria

1. THE Exportacao_Module SHALL contain only one active new-order workflow component (the stepper at `novo-pedido/novo-pedido-stepper.component.ts`)
2. WHEN the `novos-pedidos/novos-pedidos.component.ts` is entirely commented out, THE EIP SHALL remove the dead code file
3. WHEN dead code is removed from `novos-pedidos/`, THE EIP SHALL retain the `novos-pedidos.service.ts` only if it is actively imported by the stepper component; otherwise it SHALL be removed
4. THE EIP route for "Novos Pedidos" SHALL point exclusively to the active stepper component

### Requirement 7: Implement Reusable Coming Soon Component

**User Story:** As a user, I want unimplemented menu routes to display an informative "Coming Soon" page rather than just a toast notification, so that I understand what functionality is planned.

#### Acceptance Criteria

1. THE Coming_Soon_Component SHALL accept input parameters for module name and planned features list
2. WHEN a user navigates to an unimplemented route, THE EIP SHALL display the Coming_Soon_Component with the relevant module information
3. THE Coming_Soon_Component SHALL display the module name, a brief description, and a list of planned features
4. WHEN the Coming_Soon_Component is displayed, THE EIP SHALL NOT show a toast notification for unimplemented routes (replacing the current behavior)

### Requirement 8: Fix NotificationService Memory Leak

**User Story:** As a developer, I want the NotificationService to manage subscriptions safely, so that repeated calls to `getUnreadCount()` do not create orphaned subscriptions.

#### Acceptance Criteria

1. THE Notification_Service SHALL provide unread count as a derived observable (using `map` operator or a dedicated `BehaviorSubject`) rather than creating a new inner subscription on each call
2. WHEN `getUnreadCount()` is called multiple times, THE Notification_Service SHALL NOT create additional subscriptions to the internal notifications subject
3. THE Notification_Service unread count observable SHALL emit updated values whenever the notification list changes

### Requirement 9: Add Environment Configuration for Mock vs Real Mode

**User Story:** As a developer, I want environment-based configuration that controls whether mock or real services are used, so that the application is prepared for future backend integration.

#### Acceptance Criteria

1. THE Environment_Configuration SHALL define a boolean flag `useMockServices` that defaults to `true`
2. THE Environment_Configuration SHALL define the BFF base URL as a configurable value
3. WHEN `useMockServices` is `true`, THE EIP SHALL use mock service implementations for all data operations
4. WHEN `useMockServices` is `false`, THE EIP SHALL use real service implementations that call the BFF
5. THE Environment_Configuration SHALL be defined using Angular's environment files pattern (`environment.ts` and `environment.prod.ts`)

### Requirement 10: Fix ExportacaoDetalhesComponent Provider Configuration

**User Story:** As a developer, I want the ExportacaoDetalhesComponent to use the application-wide singleton of ExportacaoMockService, so that data is consistent across components.

#### Acceptance Criteria

1. THE ExportacaoDetalhesComponent SHALL NOT declare `ExportacaoMockService` in its component-level `providers` array
2. WHEN the ExportacaoDetalhesComponent requires export data, THE component SHALL inject the service from the root injector (or via the abstraction token from Requirement 3)
3. WHEN the component-level provider is removed, THE ExportacaoDetalhesComponent SHALL share the same service instance as other components in the application

### Requirement 11: Standardize Exportacao Module Directory Structure

**User Story:** As a developer, I want a single consolidated directory for the export order workflow, so that the module structure is clear and maintainable.

#### Acceptance Criteria

1. WHEN the consolidation is complete, THE Exportacao_Module SHALL have a single directory path for the new-order stepper workflow
2. THE EIP SHALL NOT contain both `exportacao/novos-pedidos/` (with dead code) and `exportacao/novo-pedido/` (with active stepper) if `novos-pedidos/` contains only dead or unused code
3. IF the `novos-pedidos/` directory contains only dead code after cleanup, THEN THE EIP SHALL remove the entire `novos-pedidos/` directory
4. IF the `novos-pedidos/` directory contains the active `novos-pedidos.service.ts` used by other components, THEN THE EIP SHALL relocate that service to a shared services location

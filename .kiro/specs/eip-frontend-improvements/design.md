# Design Document: EIP Frontend Improvements

## Overview

This design addresses a series of architectural and code-quality improvements to the Export Intelligence Platform (EIP) Angular 20 frontend. The changes focus on:

1. Removing dead/duplicate files from the `novos-pedidos/` directory
2. Fixing a broken sidenav closing mechanism that uses DOM manipulation
3. Introducing a service abstraction layer (InjectionToken + factory) to decouple components from concrete mock services
4. Replacing a hardcoded exchange rate with a reactive `CambioService`
5. Removing console.log statements from route definitions
6. Consolidating the export module directory structure
7. Creating a reusable Coming Soon component for unimplemented routes
8. Fixing a memory leak in `NotificationService.getUnreadCount()`
9. Adding environment configuration files for mock vs real mode switching
10. Fixing the `ExportacaoDetalhesComponent` component-level provider issue
11. Standardizing the Exportacao module directory layout

The application uses Angular 20 standalone components, Angular Material, RxJS, and Karma/Jasmine for testing. All data currently comes from mock services.

## Architecture

### Current State

```
src/
├── app/
│   ├── components/
│   │   ├── exportacao/
│   │   │   ├── novos-pedidos/              ← Dead code + active steps
│   │   │   │   ├── novos-pedidos.component.ts  ← Entirely commented out
│   │   │   │   ├── novos-pedidos.service.ts    ← ACTIVE, used by steps
│   │   │   │   ├── *.backup.*, *.stub.*, *.new.*  ← Dead files
│   │   │   │   └── steps/                  ← Active step components
│   │   │   ├── novo-pedido/                ← Active stepper component
│   │   │   └── exportacao-detalhes/        ← Has component-level provider
│   │   ├── home-logged/                    ← Broken sidenav + hardcoded rate
│   │   └── shared/                         ← Shared components
│   ├── services/
│   │   ├── bff.service.ts                  ← Nearly empty
│   │   └── notification.service.ts         ← Memory leak in getUnreadCount()
│   └── app.routes.ts                       ← Console.logs in loadComponent
├── services/
│   └── exportacaoMockService.ts            ← Root-level mock service
└── types/
    └── exportacao.ts                       ← Model types
```

### Target State

```
src/
├── app/
│   ├── components/
│   │   ├── exportacao/
│   │   │   ├── novo-pedido/                ← Active stepper (unchanged)
│   │   │   │   └── novo-pedido-stepper.component.ts
│   │   │   ├── steps/                      ← Relocated from novos-pedidos/steps
│   │   │   │   ├── informacao-basica/
│   │   │   │   ├── produtos/
│   │   │   │   ├── logistica/
│   │   │   │   ├── documentacao/
│   │   │   │   └── revisao-confirmacao/
│   │   │   ├── exportacao-detalhes/        ← Provider removed
│   │   │   ├── exportacao-lista/
│   │   │   └── exportacao-form/
│   │   ├── home-logged/                    ← Fixed sidenav + CambioService
│   │   └── shared/
│   │       ├── coming-soon/                ← NEW
│   │       └── ...existing
│   ├── services/
│   │   ├── cambio.service.ts               ← NEW - exchange rate mock
│   │   ├── novos-pedidos.service.ts        ← Relocated from novos-pedidos/
│   │   ├── notification.service.ts         ← Fixed memory leak
│   │   ├── exportacao/                     ← NEW - abstraction layer
│   │   │   ├── exportacao-service.interface.ts
│   │   │   ├── exportacao-service.token.ts
│   │   │   ├── exportacao-mock.service.ts  ← Wraps existing mock
│   │   │   └── exportacao-real.service.ts  ← Stub for future
│   │   └── bff.service.ts                  ← Updated with env config
│   └── app.routes.ts                       ← Console.logs removed
├── environments/
│   ├── environment.ts                      ← NEW - dev (mock mode)
│   └── environment.prod.ts                 ← NEW - prod (real mode)
├── services/
│   └── exportacaoMockService.ts            ← Retained, wrapped by abstraction
└── types/
    └── exportacao.ts
```

### Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Service abstraction pattern | `InjectionToken` + factory | Angular 20 standalone components; no module hierarchy for abstract class pattern. Factories allow environment-based selection at DI level. |
| Environment configuration | `environment.ts` / `environment.prod.ts` with `fileReplacements` | Standard Angular pattern; well-supported by Angular CLI build system. |
| Coming Soon component location | `src/app/components/shared/coming-soon/` | Follows existing shared component pattern in the project. |
| CambioService rate simulation | `interval` + random fluctuation within ±0.5% | Provides realistic mock behavior; demonstrates reactive subscription pattern. |
| Sidenav fix approach | `drawer.close().then(() => navigate(route))` | Uses only public Angular Material API; promise ensures animation completes before navigation. |
| NovosPedidosService relocation | Move to `src/app/services/novos-pedidos.service.ts` | The service is actively imported by `steps/informacao-basica/` and should be shared across the application. |
| Dead code handling | Delete entirely | Files are fully commented out or are backup/stub copies with no active imports. |

## Components and Interfaces

### 1. Environment Configuration

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  useMockServices: true,
  bffBaseUrl: 'http://localhost:8080/api'
};
```

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  useMockServices: false,
  bffBaseUrl: '/api'
};
```

### 2. IExportacaoService Interface

```typescript
// src/app/services/exportacao/exportacao-service.interface.ts
import { Observable } from 'rxjs';
import { Exportacao, ExportacaoFilterOptions, ExportacaoDashboard, ExportacaoDocumento, SiscomexIntegration, AIAssistantMessage, AISuggestion } from '../../../types/exportacao';

export interface IExportacaoService {
  // CRUD
  getExportacoes(filters?: ExportacaoFilterOptions): Observable<Exportacao[]>;
  getExportacaoById(id: string): Observable<Exportacao | null>;
  createExportacao(exportacao: Partial<Exportacao>): Observable<Exportacao>;
  updateExportacao(id: string, exportacao: Partial<Exportacao>): Observable<Exportacao>;
  deleteExportacao(id: string): Observable<boolean>;

  // Dashboard
  getDashboardData(): Observable<ExportacaoDashboard>;
  getExportacaoDetails(exportId: string): Observable<any>;

  // AI & Automation
  createExportacaoByNLP(text: string): Observable<Exportacao>;
  processOCRDocument(file: File): Observable<Exportacao>;
  generateExportWithAI(basicData: any): Observable<Exportacao>;
  getMasterData(): Observable<any>;
  getAISuggestions(formData: any): Observable<any[]>;
  getAIResponse(query: string): Observable<{message: string, suggestions?: AISuggestion[]}>;
  runAIAnalysis(exportId: string): Observable<any>;
  processAIQuery(query: string, contextExportId?: string): Observable<AIAssistantMessage[]>;

  // Validation & Compliance
  validateExportacao(exportId: string): Observable<{valid: boolean, errors: string[]}>;
  validateCompliance(exportId: string): Observable<{valid: boolean, errors: string[], warnings: string[]}>;

  // Documents
  generateDocuments(exportId: string): Observable<boolean>;
  regenerateDocument(exportId: string, documentId: string): Observable<ExportacaoDocumento>;

  // Siscomex
  sendToSiscomex(exportId: string): Observable<SiscomexIntegration>;
  checkSiscomexStatus(dueNumber: string): Observable<SiscomexIntegration>;

  // Utilities
  getCountries(): Observable<string[]>;
  getProducts(): Observable<{id: string, name: string, ncm: string}[]>;
  getPorts(): Observable<{origin: string[], destination: string[]}>;
}
```

### 3. InjectionToken and Factory

```typescript
// src/app/services/exportacao/exportacao-service.token.ts
import { InjectionToken, inject } from '@angular/core';
import { IExportacaoService } from './exportacao-service.interface';
import { ExportacaoMockServiceAdapter } from './exportacao-mock.service';
import { ExportacaoRealService } from './exportacao-real.service';
import { environment } from '../../../environments/environment';

export const EXPORTACAO_SERVICE = new InjectionToken<IExportacaoService>('ExportacaoService');

export function exportacaoServiceFactory(): IExportacaoService {
  if (environment.useMockServices) {
    return inject(ExportacaoMockServiceAdapter);
  }
  return inject(ExportacaoRealService);
}

export const exportacaoServiceProvider = {
  provide: EXPORTACAO_SERVICE,
  useFactory: exportacaoServiceFactory
};
```

### 4. CambioService

```typescript
// src/app/services/cambio.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ExchangeRate {
  currency: string;
  rate: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

@Injectable({ providedIn: 'root' })
export class CambioService {
  private readonly baseRate = 5.18;
  private rateSubject = new BehaviorSubject<ExchangeRate>({
    currency: 'USD',
    rate: this.baseRate,
    trend: 'stable',
    lastUpdated: new Date()
  });

  constructor() {
    this.startRateSimulation();
  }

  get exchangeRate$(): Observable<ExchangeRate> {
    return this.rateSubject.asObservable();
  }

  private startRateSimulation(): void {
    interval(30000).pipe(
      map(() => this.generateFluctuation())
    ).subscribe(rate => this.rateSubject.next(rate));
  }

  private generateFluctuation(): ExchangeRate {
    const previous = this.rateSubject.value.rate;
    const change = (Math.random() - 0.5) * 0.05; // ±0.5%
    const newRate = Math.round((previous + change) * 100) / 100;
    const trend = newRate > previous ? 'up' : newRate < previous ? 'down' : 'stable';

    return {
      currency: 'USD',
      rate: newRate,
      trend,
      lastUpdated: new Date()
    };
  }
}
```

### 5. Coming Soon Component

```typescript
// src/app/components/shared/coming-soon/coming-soon.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatListModule],
  template: `
    <mat-card class="coming-soon-card">
      <mat-card-header>
        <mat-icon mat-card-avatar>construction</mat-icon>
        <mat-card-title>{{ moduleName }}</mat-card-title>
        <mat-card-subtitle>Em desenvolvimento</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>{{ description }}</p>
        <h4 *ngIf="features.length">Funcionalidades planejadas:</h4>
        <mat-list *ngIf="features.length">
          <mat-list-item *ngFor="let feature of features">
            <mat-icon matListItemIcon>check_circle_outline</mat-icon>
            <span matListItemTitle>{{ feature }}</span>
          </mat-list-item>
        </mat-list>
      </mat-card-content>
    </mat-card>
  `
})
export class ComingSoonComponent {
  @Input() moduleName = 'Módulo';
  @Input() description = 'Este módulo está em desenvolvimento e estará disponível em breve.';
  @Input() features: string[] = [];
}
```

### 6. Fixed NotificationService.getUnreadCount()

```typescript
// Replaces the current implementation that creates a new inner subscription per call
get unreadCount$(): Observable<number> {
  return this.notificationsSubject.asObservable().pipe(
    map(notifications => notifications.filter(n => !n.read).length)
  );
}

// Deprecated - kept for backward compatibility, delegates to unreadCount$
getUnreadCount(): Observable<number> {
  return this.unreadCount$;
}
```

### 7. Fixed Sidenav Navigation (home-logged.component.ts)

```typescript
handleMenuClick(route: string): void {
  this.expandedMenu = '';

  if (this.drawer?.opened) {
    this.drawer.close().then(() => {
      this.navigateTo(route);
    });
  } else {
    this.navigateTo(route);
  }
}
```

Methods to be removed entirely: `forceCloseSidenav()`, `resetSidenavStyles()`.

## Data Models

No new data models are introduced. Existing types in `src/types/exportacao.ts` remain unchanged. The `IExportacaoService` interface mirrors the existing method signatures from `ExportacaoMockService`.

New supporting interfaces:
- `ExchangeRate` (in `cambio.service.ts`) — `{ currency: string, rate: number, trend: 'up'|'down'|'stable', lastUpdated: Date }`
- `environment` object type — `{ production: boolean, useMockServices: boolean, bffBaseUrl: string }`

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: NotificationService unread count derivation

*For any* sequence of notification additions and read-marking operations, calling `getUnreadCount()` (or subscribing to `unreadCount$`) SHALL always return the same value as manually filtering the notifications list for `read === false` and taking the `.length`.

**Validates: Requirements 8.1, 8.3**

### Property 2: CambioService rate fluctuation bounds

*For any* emitted exchange rate value from the CambioService, the rate SHALL always be within a bounded range of the base rate (e.g., ±5% of 5.18, i.e., between 4.92 and 5.44) and SHALL never be NaN, Infinity, or negative.

**Validates: Requirements 4.1, 4.4**

### Property 3: Service factory environment switching

*For any* value of `environment.useMockServices`, the `exportacaoServiceFactory` SHALL return an instance that implements all methods of `IExportacaoService`. When `useMockServices` is `true`, the instance SHALL be `ExportacaoMockServiceAdapter`; when `false`, it SHALL be `ExportacaoRealService`.

**Validates: Requirements 3.3, 3.5, 3.6, 9.3, 9.4**

### Property 4: Route definitions are side-effect free

*For any* route in `app.routes.ts`, the `loadComponent` and `loadChildren` callbacks SHALL NOT produce console output (no `console.log`, `console.warn`, `console.error` calls) — they SHALL only return the component or routes.

**Validates: Requirements 5.1, 5.2**

### Property 5: Sidenav closes via public API only

*For any* navigation action triggered from the sidenav menu, the `HomeLoggedComponent` SHALL only call `MatSidenav.close()` (public API) and SHALL NOT access private properties (`_opened`, `_openedStream`, `_changeDetectorRef`) or perform DOM manipulation on sidenav/backdrop elements.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

## Error Handling

| Scenario | Handling |
|----------|----------|
| CambioService interval error | Catches silently, retains last known rate in BehaviorSubject |
| ExportacaoRealService HTTP failure | Returns error observable; consuming components show toast via NotificationService |
| Route to non-existent component | Coming Soon component is the fallback; no toast |
| Environment configuration missing | Build-time error — TypeScript compiler enforces shape |
| Sidenav close promise rejection | Navigates anyway (fallback behavior) |

## Testing Strategy

### Unit Tests (Karma/Jasmine)

This project uses Karma + Jasmine (as configured in `package.json`). Unit tests will cover:

- **CambioService**: Rate generation produces valid numbers within expected bounds
- **NotificationService**: `unreadCount$` emits correct count after add/markAsRead/markAllAsRead
- **Coming Soon Component**: Renders module name, description, and features list
- **Route cleanup verification**: No `console.log` in route file (lint-level or snapshot test)
- **ExportacaoDetalhesComponent**: Injects from root rather than component-level provider
- **Service factory**: Returns correct instance based on environment flag

### Property-Based Tests (fast-check)

This project does not currently use a property-based testing library. For the correctness properties identified above, we will use [fast-check](https://github.com/dubzzz/fast-check) (a JS/TS property-based testing library that integrates with Jasmine).

- **Minimum 100 iterations** per property test
- **Tag format**: `Feature: eip-frontend-improvements, Property N: {title}`
- Properties 1 and 2 are the best candidates for PBT since they involve data transformation logic with varied inputs
- Properties 3-5 are more structural/static and are better validated via example-based unit tests (verifying code patterns)

### Integration Tests

- Sidenav open/close lifecycle (TestBed with Angular Material sidenav harness)
- Coming Soon route rendering end-to-end with router testing module
- Service token resolution in a TestBed with different environment configs

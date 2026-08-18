# Implementation Plan: Lotes > Controle de Lotes

## Overview

Implement the Lotes Controle module as a standalone Angular 20 component following the CertificacoesComponent pattern. The implementation builds up from types → mock service → component (class, template, styles) → route wiring, with each step validating the previous layer.

## Tasks

- [ ] 1. Define TypeScript interfaces and types
  - [ ] 1.1 Create `src/types/lotes.ts` with all interfaces and types
    - Define `LoteStatus` union type and `MovementType` union type
    - Define `Lote`, `PhysicalLocation`, `QualityInspection`, `StockMovement` interfaces
    - Define `AILotScore`, `ExportSuggestion`, `AnomalyAlert`, `ExpiryPrediction` interfaces
    - Define `LoteFilters`, `KPIMetrics`, `LoteCreatePayload`, `LoteUpdatePayload` interfaces
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [ ] 2. Implement the mock service
  - [ ] 2.1 Create `src/services/lotesMockService.ts` with injectable mock service
    - Implement `@Injectable({ providedIn: 'root' })` service class
    - Create 20+ mock lot records covering soja, milho, café, açúcar, carne bovina across warehouses Santos, Paranaguá, Rio Grande, Itajaí, Vitória
    - Include all 6 statuses represented in mock data
    - Implement `getLotes`, `getLoteById`, `createLote`, `updateLote` methods returning Observables with `delay(randomInt(200, 800))`
    - Implement `blockLote`, `unblockLote`, `reserveLote` with status transition validation and movement history recording
    - Implement `getMovementHistory`, `getQualityInspections`, `saveQualityInspection` methods
    - Implement `getAIInsights` with score calculation logic (humidity deviation, impurity, protein, freshness, certification bonus)
    - Implement `getKPIMetrics` computing totalAvailableQty, blockedCount, expiringSoonCount, avgAIScore
    - Implement helper methods: `getProducts()`, `getHarvests()`, `getWarehouses()`, `getCountries()`
    - Enforce business rules: stock invariant, auto-ESGOTADO transition, block/unblock/reserve preconditions, movement immutability
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 8.2, 8.3, 8.4, 10.1, 10.2, 10.3, 10.5_

  - [ ]* 2.2 Write unit tests for LotesMockService
    - Test CRUD operations persist in-memory state
    - Test status transition validations (block only DISPONÍVEL, unblock only BLOQUEADO, reserve only DISPONÍVEL with qty <= available)
    - Test stock invariant holds after reservations
    - Test auto-ESGOTADO triggers when availableQuantity reaches 0
    - Test movement history is appended correctly and in reverse chronological order
    - Test KPI metrics calculation accuracy
    - _Requirements: 8.2, 8.3, 8.4, 10.1, 10.2, 10.4, 10.5_

- [ ] 3. Checkpoint - Types and service compile
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement the component class and template
  - [ ] 4.1 Create `src/app/components/lotes/lotes-controle/lotes-controle.component.ts`
    - Implement standalone component with `inject()` for LotesMockService, MatSnackBar, and other Angular Material services
    - Implement state: `lots`, `filteredLots`, `selectedLot`, `kpiMetrics`, `aiInsights`, `isLoading`, `isDrawerOpen`
    - Implement `filterForm` reactive FormGroup with all quick filter controls + global search
    - Setup `debounceTime(300)` subscriptions on filter and search value changes with `takeUntil(destroy$)` cleanup
    - Implement filter logic: combined filters (product, harvest, status, warehouse, country, expiry range, AI score range) applied simultaneously
    - Implement global search across loteNumber, productName, warehouseName, harvest, destinationCountry (case-insensitive)
    - Implement KPI recalculation on filter changes
    - Implement drawer open/close logic with lot selection and AI insights loading
    - Implement CRUD handlers: create (dialog form), edit (pre-populated dialog), block, unblock, reserve (with quantity prompt)
    - Implement quality inspection form with validators (humidity 0–100, pH 0–14, temperature -40 to 60)
    - Implement MatSnackBar feedback: success (3000ms), error (5000ms)
    - Implement `ViewChild` for MatPaginator and MatSort, connect to dataSource
    - Implement `ngOnDestroy` with destroy$ Subject for subscription cleanup
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.1, 4.2, 4.3, 4.4, 5.1, 5.8, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8.1, 9.1, 9.2, 9.3, 9.4_

  - [ ] 4.2 Create `src/app/components/lotes/lotes-controle/lotes-controle.component.html`
    - Implement KPI Dashboard section with 4 summary cards (total available qty, blocked count, expiring soon, avg AI score)
    - Implement Quick Filters row: MatSelect for product, harvest, status, warehouse, country; MatDatepicker range for expiry; numeric range for AI score; clear-all button
    - Implement Global Search input with search icon and placeholder, wired to filterForm
    - Implement Smart Grid with MatTable: columns for loteNumber, productName, harvest, status (MatChip colored), warehouseName, quantity, expiryDate, aiScore (badge colored), actions (MatMenu)
    - Implement MatPaginator (10/25/50/100) and MatSort on all columns
    - Implement MatDrawer (right side, mode="over") with 5 MatTabs: Dados Gerais, Estoque, Qualidade, Certificados, Histórico
    - Implement Dados Gerais tab: lot number, product, harvest, warehouse, physical location, created date, status
    - Implement Estoque tab: initial qty, reserved qty, exported qty, available qty, balance display
    - Implement Qualidade tab: latest inspection data display + quality inspection form with all fields
    - Implement Certificados tab: certificate list for the lot
    - Implement Histórico tab: movement history table in reverse chronological order (date, type, user, from status, to status, notes)
    - Implement AI Insights Panel (MatExpansionPanel): score gauge, export suggestions (max 3), anomaly alerts with severity, expiry countdown
    - Implement create/edit form sections (inline in drawer or dialog-like sections): product, harvest, warehouse, quantity, expiry date, physical location, destination country
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.9, 4.1, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6.1, 6.2, 6.3, 6.4, 7.1, 7.3, 8.1, 9.1, 10.4_

  - [ ] 4.3 Create `src/app/components/lotes/lotes-controle/lotes-controle.component.scss`
    - Style KPI cards with responsive grid layout (4 cards in a row, stacking on smaller screens)
    - Style filter row with flex-wrap layout
    - Style MatTable with proper column widths, status chip colors mapped to LoteStatus values
    - Style AI score badge colors (green >= 80, yellow >= 50, red < 50)
    - Style drawer with appropriate width (400–500px) and tab content areas
    - Style AI Insights Panel gauge and alert severity colors
    - Style form sections and validation error states
    - _Requirements: 2.4, 2.5_

- [ ] 5. Register the route and wire everything together
  - [ ] 5.1 Add the lazy-loaded route to `src/app/app.routes.ts`
    - Add `{ path: 'lotes/controle', loadComponent: () => import(...).then(m => m.LotesControleComponent) }` under `home-logged` children
    - Place the route BEFORE the wildcard catch-all route (`**`)
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 6. Final checkpoint - Build verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The component follows the CertificacoesComponent pattern: single large component class (~500+ lines), separate HTML (~800+ lines), separate SCSS (~400+ lines)
- Mock service maintains in-memory state for session persistence
- All Observable returns include simulated delay (200–800ms) for realistic UX
- The template is the heaviest task — it includes KPI cards, filters, table, drawer with 5 tabs, and AI panel

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3"] },
    { "id": 4, "tasks": ["5.1"] }
  ]
}
```

# Implementation Plan: EIP Phase 3 — Connected Platform

## Overview

Implement 8 new modules for the Export Intelligence Platform following established Angular 20 patterns. Each module is built as a self-contained unit (types → service → component → dialogs → route) and wired into the existing navigation. All modules use standalone components, inject() DI, MatTableDataSource, reactive forms with debounceTime(300), and takeUntil(destroy$) lifecycle management.

## Tasks

- [ ] 1. Trade Finance Module
  - [ ] 1.1 Create types, service, component, and dialogs for Trade Finance
    - Create `src/types/trade-finance.ts` with all interfaces (TradeFinanceInstrument, LcDetails, DocumentaryCollectionDetails, BankGuaranteeDetails, TradeFinanceEvent, TradeFinanceMetrics, TradeFinanceFilters) and type unions (InstrumentType, InstrumentStatus)
    - Create `src/services/tradeFinanceMockService.ts` with @Injectable({ providedIn: 'root' }) returning Observable data via of().pipe(delay(300)) for all methods (getInstruments, getInstrumentById, getInstrumentEvents, getMetrics, createLC, createDocumentaryCollection, createBankGuarantee)
    - Create `src/app/components/financeiro/trade-finance/trade-finance.component.ts|html|scss` — standalone component with metric cards, MatTableDataSource grid with MatSort/MatPaginator [10,25,50,100], search input with debounceTime(300), detail side panel on row click, export button, expiry-warning row class for instruments within 30 days of expiry
    - Create `src/app/components/financeiro/dialogs/nova-lc-dialog.component.ts` — reactive form (bank, beneficiary, value, currency, expiry, terms, linked contract), flex layout, NO mat-dialog-content, footer flex-shrink:0
    - Create `src/app/components/financeiro/dialogs/nova-cobranca-dialog.component.ts` — reactive form (collecting bank, presenting bank, value, documents required, payment terms)
    - Create `src/app/components/financeiro/dialogs/nova-garantia-dialog.component.ts` — reactive form (guarantor bank, beneficiary, value, validity period, guarantee type)
    - Register route `financeiro/trade-finance` in app.routes.ts using loadComponent before the ** wildcard
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

  - [ ]* 1.2 Write property tests for Trade Finance
    - **Property 1: Search filter correctness** — generate random instrument arrays and search strings, verify filtered results contain only matching items
    - **Property 2: Summary metric aggregation** — generate random instrument sets, verify activeLCs and totalValueUnderLCs calculations
    - **Property 3: Time-based warning threshold** — generate random expiry dates, verify expiry-warning class applied iff expiryDate - today <= 30 days
    - **Validates: Requirements 1.3, 1.8, 1.10**

- [ ] 2. Hedge Cambial Module
  - [ ] 2.1 Create types, service, component, and dialog for Hedge Cambial
    - Create `src/types/hedge.ts` with all interfaces (HedgeContract, HedgeSettlement, ExposureSummary, HedgeMetrics, HedgeFilters) and type unions (HedgeType, HedgeStatus)
    - Create `src/services/hedgeMockService.ts` with @Injectable({ providedIn: 'root' }) returning Observable data for all methods (getContracts, getContractById, getSettlements, getExposureSummary, getMetrics, createContract)
    - Create `src/app/components/financeiro/hedge/hedge.component.ts|html|scss` — standalone component with exposure summary panel (totalExposed, totalHedged, hedgeRatio%, netOpen), metric cards, MatTableDataSource grid with MatSort/MatPaginator [10,25,50,100], search with debounceTime(300), detail panel, export button, maturity-critical row class for contracts within 7 days of maturity, mark-to-market color coding
    - Create `src/app/components/financeiro/dialogs/novo-hedge-dialog.component.ts` — reactive form (type NDF/Forward/Option, counterparty bank, notional value, currency pair, strike rate, maturity date, linked export), flex layout, NO mat-dialog-content, footer flex-shrink:0
    - Register route `financeiro/hedge` in app.routes.ts before the ** wildcard
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [ ]* 2.2 Write property tests for Hedge Cambial
    - **Property 4: Hedge exposure calculation** — generate random contract values, verify hedgeRatioPercent and netOpenPosition formulas
    - **Property 3: Time-based warning threshold (Hedge)** — generate random maturity dates, verify maturity-critical class iff maturityDate - today <= 7 days
    - **Validates: Requirements 2.5, 2.8**

- [ ] 3. Navios Module
  - [ ] 3.1 Create types, service, component, and dialog for Navios
    - Create `src/types/navios.ts` with all interfaces (Vessel, VesselSchedule, VesselVoyage, NaviosMetrics, NaviosFilters) and type unions (VesselType, VesselStatus)
    - Create `src/services/naviosMockService.ts` with @Injectable({ providedIn: 'root' }) returning Observable data for all methods (getVessels, getVesselById, getVesselSchedule, getVesselVoyages, getMetrics, createVessel)
    - Create `src/app/components/logistica/navios/navios.component.ts|html|scss` — standalone component with metric cards, MatTableDataSource grid with MatSort/MatPaginator [10,25,50,100], search with debounceTime(300), detail panel with tabs (Specifications, Current Voyage, Schedule History, Linked Shipments), export button, delay-alert row class when ETA delta > 24 hours, status icons (ship/anchor/warning)
    - Create `src/app/components/logistica/dialogs/novo-navio-dialog.component.ts` — reactive form (vessel name, IMO number with pattern /^\d{7}$/, flag, type, capacity, shipping line, current schedule), flex layout, NO mat-dialog-content, footer flex-shrink:0
    - Register route `logistica/navios` in app.routes.ts before the ** wildcard
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [ ]* 3.2 Write property tests for Navios
    - **Property 3: Time-based warning threshold (Navios)** — generate random ETA pairs, verify delay-alert class iff |currentETA - originalETA| > 24 hours
    - **Validates: Requirements 3.8**

- [ ] 4. Containers Module
  - [ ] 4.1 Create types, service, component, and dialog for Containers
    - Create `src/types/containers.ts` with all interfaces (Container, ContainerMovement, DemurrageCalculation, ContainersMetrics, ContainersFilters) and type unions (ContainerSize, ContainerType, ContainerStatus)
    - Create `src/services/containersMockService.ts` with @Injectable({ providedIn: 'root' }) returning Observable data for all methods (getContainers, getContainerById, getMovements, getDemurrageCalculation, getMetrics, createContainer)
    - Create `src/app/components/logistica/containers/containers.component.ts|html|scss` — standalone component with metric cards, MatTableDataSource grid with MatSort/MatPaginator [10,25,50,100], search with debounceTime(300), status filter chips (mat-chip-listbox with multi-select for all 8 statuses), detail panel, export button, demurrage-critical row class when freeDaysRemaining <= 0, projected cost calculation
    - Create `src/app/components/logistica/dialogs/novo-container-dialog.component.ts` — reactive form (container number with pattern /^[A-Z]{4}\d{7}$/, size 20ft/40ft/40ftHC, type FCL/LCL, shipping line, booking reference, linked shipment, free days allowed), flex layout, NO mat-dialog-content, footer flex-shrink:0
    - Register route `logistica/containers` in app.routes.ts before the ** wildcard
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [ ]* 4.2 Write property tests for Containers
    - **Property 6: Container status filter correctness** — generate random container lists with varied statuses, verify filter returns only matching containers
    - **Property 14: Container demurrage cost projection** — generate random day/rate values, verify projectedCost = daysOverFree * dailyRate
    - **Property 3: Time-based warning threshold (Containers)** — verify demurrage-critical class iff freeDaysRemaining <= 0
    - **Validates: Requirements 4.8, 4.9**

- [ ] 5. Packing List Module
  - [ ] 5.1 Create types, service, component, and dialog for Packing List
    - Create `src/types/packing-list.ts` with all interfaces (PackingList, PartyInfo, PackingListItem, PackingListMetrics, PackingListFilters, WeightDiscrepancy) and type unions (PackingListStatus, PackageType)
    - Create `src/services/packingListMockService.ts` with @Injectable({ providedIn: 'root' }) returning Observable data for all methods (getPackingLists, getPackingListById, getPackingListItems, getMetrics, getWeightDiscrepancy, createPackingList, generatePdf)
    - Create `src/app/components/documentos/packing-list/packing-list.component.ts|html|scss` — standalone component with metric cards, MatTableDataSource grid with MatSort/MatPaginator [10,25,50,100], search with debounceTime(300), detail panel with item breakdown and weight summary, export button, "Gerar PDF" button, AI completeness score progress bar, weight discrepancy warning when difference > 1%
    - Create `src/app/components/documentos/dialogs/novo-packing-list-dialog.component.ts` — reactive form (linked invoice, exporter data, buyer data, shipping marks, FormArray for package details with type/quantity/dimensions/weight, container assignment), flex layout, NO mat-dialog-content, footer flex-shrink:0
    - Register route `documentos/packing-list` in app.routes.ts before the ** wildcard
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

  - [ ]* 5.2 Write property tests for Packing List
    - **Property 5: Packing list weight discrepancy detection** — generate random weight pairs, verify warning iff |packingListWeight - invoiceWeight| / invoiceWeight > 0.01
    - **Validates: Requirements 5.8, 5.10**

- [ ] 6. Notification Center Module
  - [ ] 6.1 Create types, service, and components for Notification Center
    - Create `src/types/notifications.ts` with all interfaces (Notification, NotificationPreference, NotificationMetrics, NotificationFilters) and type unions (NotificationChannel, NotificationPriority)
    - Create `src/services/notificationsMockService.ts` with @Injectable({ providedIn: 'root' }) returning Observable data for all methods (getNotifications, getMetrics, markAsRead, markAllAsRead, getRecentUnread, getPreferences, updatePreferences)
    - Create `src/app/components/notificacoes/centro/notificacoes-centro.component.ts|html|scss` — standalone component with metric cards, mat-list notification list (NOT table), search with debounceTime(300), filter panel (channel chips, priority chips, read status toggle, date range picker), detail panel on click, "Marcar Todas como Lidas" button, sorted by createdAt descending, escalated pulsing animation for critical unread > 1 hour
    - Create `src/app/components/notificacoes/bell-dropdown/notification-bell.component.ts|html|scss` — standalone component with bell icon, badge count, dropdown panel showing 5 most recent unread, link to full center
    - Register route `notificacoes/centro` in app.routes.ts before the ** wildcard
    - Wire NotificationBellComponent into the app header
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

  - [ ]* 6.2 Write property tests for Notification Center
    - **Property 7: Notification sort order** — generate random timestamps, verify list is sorted by createdAt descending
    - **Property 8: Notification mark-all-as-read** — generate random read/unread sets, verify all visible become read
    - **Property 9: Notification bell dropdown correctness** — generate random notification sets, verify top-5 unread selection
    - **Property 10: Notification escalation rule** — generate random timestamps and priorities, verify escalation iff critical + unread > 1 hour
    - **Validates: Requirements 6.1, 6.6, 6.8, 6.10**

- [ ] 7. Marketplace Module
  - [ ] 7.1 Create types, service, component, and detail dialog for Marketplace
    - Create `src/types/marketplace.ts` with all interfaces (MarketplaceItem, MarketplaceReview, MarketplaceMetrics, MarketplaceFilters) and type unions (MarketplaceCategory, MarketplaceStatus)
    - Create `src/services/marketplaceMockService.ts` with @Injectable({ providedIn: 'root' }) returning Observable data for all methods (getItems, getItemById, getReviews, getFeatured, getMetrics, activateConnector, deactivateConnector)
    - Create `src/app/components/marketplace/marketplace.component.ts|html|scss` — standalone component with metric cards, featured section (top 3 recommended), card grid (CSS grid responsive 1/2/3 columns), filter bar (category chips, status toggle, search with debounceTime(300)), sort dropdown (name, rating, category, recent), status badges, star ratings. Uses ConfirmarAcaoDialogComponent for activate/deactivate
    - Create `src/app/components/marketplace/dialogs/marketplace-detail-dialog.component.ts` — full description, features list, pricing, integration requirements, reviews, activation button, flex layout, NO mat-dialog-content, footer flex-shrink:0
    - Register route `marketplace` in app.routes.ts before the ** wildcard
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [ ]* 7.2 Write property tests for Marketplace
    - **Property 11: Marketplace sort correctness** — generate random items, verify sort by name (alphabetical), rating (descending), category (alphabetical), recent (descending date)
    - **Validates: Requirements 7.8**

- [ ] 8. Knowledge Center Module
  - [ ] 8.1 Create types, service, and component for Knowledge Center
    - Create `src/types/knowledge-center.ts` with all interfaces (KnowledgeArticle, KnowledgeFeedback, KnowledgeMetrics, KnowledgeFilters) and type unions (KnowledgeCategory, KnowledgeModule, ContentType, DifficultyLevel)
    - Create `src/services/knowledgeCenterMockService.ts` with @Injectable({ providedIn: 'root' }) returning Observable data for all methods (getArticles, getArticleById, getMostViewed, getRecentlyUpdated, getMetrics, submitFeedback)
    - Create `src/app/components/conhecimento/centro/knowledge-center.component.ts|html|scss` — standalone component with metric cards, search with debounceTime(300), mat-tab-group for categories (Documentation, FAQs, Video Tutorials, Best Practices), filter sidebar (module checkboxes, content type, difficulty level), "Mais Acessados" section (top 10 by viewCount), "Atualizados Recentemente" section (last 30 days), article detail view, feedback buttons with MatSnackBar confirmation
    - Register route `conhecimento/centro` in app.routes.ts before the ** wildcard
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

  - [ ]* 8.2 Write property tests for Knowledge Center
    - **Property 12: Knowledge Center top-10 most viewed** — generate random view counts, verify correct top-10 selection sorted by viewCount descending
    - **Property 13: Knowledge Center recently updated** — generate random update dates, verify 30-day filter correctness
    - **Validates: Requirements 8.5, 8.6**

- [ ] 9. Navigation Menu Update
  - [ ] 9.1 Update sidebar navigation with all Phase 3 menu items
    - Add "Trade Finance" and "Hedge Cambial" items under the existing "Financeiro" group with routes `financeiro/trade-finance` and `financeiro/hedge`
    - Add "Navios" and "Containers" items under the existing "Logística" group with routes `logistica/navios` and `logistica/containers`
    - Add "Packing List" item under the existing "Documentos" group with route `documentos/packing-list`
    - Add new "Notificações" group with "Centro de Notificações" item with route `notificacoes/centro`
    - Add new top-level "Marketplace" item with route `marketplace`
    - Add new "Conhecimento" group with "Central de Conhecimento" item with route `conhecimento/centro`
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1_

- [ ] 10. Final Build Verification
  - [ ] 10.1 Verify build compiles and all routes resolve
    - Run `ng build` and confirm zero compilation errors
    - Verify all 8 new routes are registered before the ** wildcard in app.routes.ts
    - Confirm all lazy-loaded components use `loadComponent`
    - Ensure all tests pass, ask the user if questions arise.
    - _Requirements: All_

## Notes

- Tasks marked with `*` are optional property-based test tasks and can be skipped for faster MVP
- Each module is self-contained: types → service → component → dialogs → route
- All modules follow the existing project patterns (standalone components, inject() DI, MatTableDataSource, takeUntil(destroy$))
- Domain theming colors are defined in the design document per module
- The project uses Angular 20 with TypeScript — all code should follow existing conventions
- Checkpoints ensure incremental validation

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1", "4.1", "5.1", "6.1", "7.1", "8.1"] },
    { "id": 1, "tasks": ["1.2", "2.2", "3.2", "4.2", "5.2", "6.2", "7.2", "8.2", "9.1"] },
    { "id": 2, "tasks": ["10.1"] }
  ]
}
```

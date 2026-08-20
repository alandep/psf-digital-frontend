# Implementation Plan: EIP Phase 2 Enhancements

## Overview

This plan implements 8 new modules for the Export Intelligence Platform following the established Angular 20 patterns: standalone components, inject() DI, MatTableDataSource with MatSort/MatPaginator, reactive forms with debounceTime(300), and domain-specific theming. Each task group creates types → mock service → component(s) → route registration in dependency order. Build verification (`npx ng build --configuration=development`) is performed at checkpoints.

## Tasks

- [x] 1. CRM Module — Types, Service, and Components
  - [x] 1.1 Create CRM type definitions
    - Create `src/types/crm.ts` with interfaces: Customer, Contact, Opportunity, OpportunityActivity, CrmFilters, and type unions: CustomerSegment, OpportunityStage
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3_

  - [x] 1.2 Create CRM mock service
    - Create `src/services/crmMockService.ts` with Injectable service using inject() pattern
    - Implement methods: getCustomers(), getCustomerById(), createCustomer(), getContacts(), getOpportunities(), createOpportunity(), updateOpportunityStage()
    - Generate 20+ mock customers, 40+ contacts, 15+ opportunities across all pipeline stages
    - _Requirements: 1.2, 1.3, 2.1, 2.2, 2.3, 2.5_

  - [x] 1.3 Implement Visão 360 component
    - Create `src/app/components/crm/visao-360/visao-360.component.ts|html|scss`
    - Standalone component with tabs: Overview, Contracts, Shipments, Financial, Interactions
    - Customer list with MatTableDataSource, MatSort on all columns, MatPaginator [10, 25, 50, 100]
    - Searchable filter form with FormGroup and valueChanges.pipe(debounceTime(300)) for Country, Segment, Revenue Range
    - Customer 360 detail view aggregating related data
    - "Novo Cliente" button opening dialog
    - inject(CrmMockService), inject(ExportService), takeUntil(destroy$) for subscriptions
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6_

  - [x] 1.4 Create Novo Cliente dialog component
    - Create `src/app/components/crm/dialogs/novo-cliente-dialog.component.ts`
    - Reactive form with fields: Company Name, Trade Name, Tax ID, Country, Address, Segment, Primary Contact
    - Validators: required on all fields, pattern on Tax ID
    - _Requirements: 1.4_

  - [x] 1.5 Implement Contatos component
    - Create `src/app/components/crm/contatos/contatos.component.ts|html|scss`
    - Standalone component with contacts grid: Name, Email, Phone, Role, Customer, Status columns
    - MatTableDataSource with MatSort and MatPaginator [10, 25, 50, 100]
    - _Requirements: 2.1_

  - [x] 1.6 Implement Oportunidades component
    - Create `src/app/components/crm/oportunidades/oportunidades.component.ts|html|scss`
    - Standalone component with pipeline view showing stages: Prospecting, Qualification, Proposal, Negotiation, Closed
    - Summary bar displaying opportunity value totals per stage
    - MatTableDataSource with MatSort and MatPaginator
    - Activity history logging stage transitions with timestamp and user
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [x] 1.7 Create Nova Oportunidade dialog component
    - Create `src/app/components/crm/dialogs/nova-oportunidade-dialog.component.ts`
    - Reactive form with fields: Title, Customer, Estimated Value (USD), Probability (%), Expected Close Date, Assigned User
    - Validators: required, min(0), max(100) for probability
    - _Requirements: 2.3_

  - [x] 1.8 Register CRM routes in app.routes.ts
    - Add routes: `clientes/visao-360`, `clientes/contatos`, `clientes/oportunidades`
    - Use loadComponent for lazy loading, place before `**` wildcard
    - _Requirements: 10.1, 10.3_

  - [ ]* 1.9 Write property test for customer filter correctness
    - **Property 1: Customer filter correctness**
    - Use fast-check to generate random customer arrays and filter combinations (Country, Segment, Revenue Range)
    - Verify filtered results contain ONLY matching customers and exclude NONE that match
    - **Validates: Requirements 1.6**

  - [ ]* 1.10 Write property test for opportunity stage totals
    - **Property 2: Opportunity stage totals correctness**
    - Use fast-check to generate random opportunity arrays, verify summary bar totals equal sum of estimatedValue per stage
    - **Validates: Requirements 2.4**

  - [ ]* 1.11 Write property test for opportunity status transition logging
    - **Property 3: Opportunity status transition logging**
    - Use fast-check to generate random valid stage transitions, verify activity log entries contain previous stage, new stage, timestamp, and user
    - **Validates: Requirements 2.5**

- [x] 2. Checkpoint — CRM Module
  - Ensure all tests pass, ask the user if questions arise.
  - Run: `npx ng build --configuration=development`

- [x] 3. Supplier Management Module
  - [x] 3.1 Create Supplier type definitions
    - Create `src/types/supplier.ts` with interfaces: Supplier, SupplierMetrics, SupplierDocument, SupplierAudit, and type unions: SupplierCategory, QualificationStatus
    - _Requirements: 3.1, 3.2, 3.6_

  - [x] 3.2 Create Supplier mock service
    - Create `src/services/supplierMockService.ts` with Injectable service
    - Implement methods: getSuppliers(), getSupplierById(), createSupplier(), getDocuments(), getAuditHistory()
    - Generate 15+ mock suppliers with varying risk scores (some > 70 for warning display)
    - Implement risk score calculation: `delivery*0.30 + quality*0.25 + financial*0.20 + compliance*0.15 + geographic*0.10`
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 3.3 Implement Fornecedores component
    - Create `src/app/components/supply-chain/fornecedores/fornecedores.component.ts|html|scss`
    - Standalone component with supplier grid: Name, Country, Category, Risk Score, Qualification Status, Last Audit Date, Active Contracts columns
    - MatTableDataSource with MatSort and MatPaginator [10, 25, 50, 100]
    - Conditional row styling: orange (#f57c00) highlight when riskScore > 70, warning badge
    - Detail view with tabs: Overview, Documents, Audit History, Performance Metrics, Related Contracts
    - "Novo Fornecedor" button opening dialog
    - _Requirements: 3.1, 3.4, 3.5, 3.6_

  - [x] 3.4 Create Novo Fornecedor dialog component
    - Create `src/app/components/supply-chain/dialogs/novo-fornecedor-dialog.component.ts`
    - Reactive form with fields: Company Name, Tax ID, Country, Category, Contact Name, Email, Phone
    - Validators: required, email format, pattern for Tax ID
    - _Requirements: 3.3_

  - [x] 3.5 Register Supplier routes in app.routes.ts
    - Add route: `supply-chain/fornecedores`
    - Use loadComponent for lazy loading, place before `**` wildcard
    - _Requirements: 10.1, 10.3_

  - [ ]* 3.6 Write property test for supplier risk score calculation
    - **Property 4: Supplier risk score calculation**
    - Use fast-check to generate random SupplierMetrics values in [0, 100], verify weighted sum formula and result in [0, 100]
    - **Validates: Requirements 3.2**

  - [ ]* 3.7 Write property test for supplier risk warning threshold
    - **Property 5: Supplier risk warning threshold**
    - Use fast-check to generate random risk scores, verify warning badge displayed if and only if riskScore > 70
    - **Validates: Requirements 3.4**

- [x] 4. Checkpoint — Supplier Module
  - Ensure all tests pass, ask the user if questions arise.
  - Run: `npx ng build --configuration=development`

- [x] 5. Due Diligence Module
  - [x] 5.1 Create Due Diligence type definitions
    - Create `src/types/due-diligence.ts` with interfaces: Screening, ScreeningResult, ScreeningResolution, and type unions: ScreeningType, ScreeningStatus
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 5.2 Create Due Diligence mock service
    - Create `src/services/dueDiligenceMockService.ts` with Injectable service
    - Implement methods: getScreenings(), getScreeningsByStatus(), createScreening(), submitResolution(), calculateSlaDeadline()
    - Generate mock screenings across all statuses: Pending, In Progress, Completed, Flagged, Expired
    - Implement SLA business day calculation (5 business days, exclude weekends)
    - _Requirements: 4.1, 4.2, 4.3, 4.6_

  - [x] 5.3 Implement Due Diligence component
    - Create `src/app/components/compliance/due-diligence/due-diligence.component.ts|html|scss`
    - Standalone component with tabs: Pending Reviews, Completed, Flagged, Expired
    - Screening grid: Entity Name, Type, Date, Status, Risk Level, Assigned Analyst, Resolution columns
    - MatTableDataSource with MatSort and MatPaginator [10, 25, 50, 100]
    - SLA countdown display for pending screenings (days until expiration)
    - Purple/indigo theme (#4527a0)
    - _Requirements: 4.1, 4.5, 4.6, 4.7_

  - [x] 5.4 Create Nova Screening dialog component
    - Create `src/app/components/compliance/dialogs/nova-screening-dialog.component.ts`
    - Reactive form with fields: Entity Name, Entity Type (Individual/Company), Country, Tax ID, Screening Type (KYC/AML/Sanctions/PEP)
    - Display mock screening results after submission
    - _Requirements: 4.2, 4.3_

  - [x] 5.5 Create Resolução dialog component
    - Create `src/app/components/compliance/dialogs/resolucao-dialog.component.ts`
    - Form requiring: resolution action (Approve/Reject/Escalate), mandatory justification text
    - Only shown when matchStatus is "POTENTIAL_MATCH" or "CONFIRMED_MATCH"
    - Validators: required on action and justification (minLength)
    - _Requirements: 4.4_

  - [x] 5.6 Register Due Diligence route in app.routes.ts
    - Add route: `compliance/due-diligence`
    - Use loadComponent for lazy loading, place before `**` wildcard
    - _Requirements: 10.1, 10.3_

  - [ ]* 5.7 Write property test for screening resolution requirement
    - **Property 6: Screening resolution requirement**
    - Use fast-check to generate screening results with various matchStatus values, verify resolution with non-empty justification is required for POTENTIAL_MATCH and CONFIRMED_MATCH
    - **Validates: Requirements 4.4**

  - [ ]* 5.8 Write property test for SLA countdown business days
    - **Property 7: SLA countdown business days calculation**
    - Use fast-check to generate random creation dates, verify SLA deadline calculates exactly 5 business days excluding weekends
    - **Validates: Requirements 4.6**

- [x] 6. Checkpoint — Due Diligence Module
  - Ensure all tests pass, ask the user if questions arise.
  - Run: `npx ng build --configuration=development`

- [x] 7. ESG / Sustainability Module
  - [x] 7.1 Create ESG type definitions
    - Create `src/types/esg.ts` with interfaces: EsgOperation, EmissionsBreakdown, EsgCertification, EsgMetrics, and type unions: EsgRating, CertificationType
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 7.2 Create ESG mock service
    - Create `src/services/esgMockService.ts` with Injectable service
    - Implement methods: getOperations(), getMetrics(), getCertifications(), registerCertification()
    - Generate 20+ mock operations with carbon footprints, traceability statuses, and ESG ratings
    - Implement emissions breakdown calculation (Production 40%, Transport 35%, Processing 15%, Packaging 10%)
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 7.3 Implement Sustentabilidade component
    - Create `src/app/components/esg/sustentabilidade/sustentabilidade.component.ts|html|scss`
    - Standalone component with KPI cards: Total Carbon Footprint (tCO2e), Operations with Traceability (%), Active Certifications, ESG Score
    - Operations grid: Export ID, Product, Destination, Carbon Footprint, Traceability Status, Certifications, ESG Rating columns
    - Emissions breakdown panel showing Production/Transport/Processing/Packaging proportions
    - MatTableDataSource with MatSort and MatPaginator [10, 25, 50, 100]
    - Green theme (#2e7d32)
    - "Registrar Certificação" button opening dialog
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6_

  - [x] 7.4 Create Registrar Certificação dialog component
    - Create `src/app/components/esg/dialogs/registrar-certificacao-dialog.component.ts`
    - Reactive form with fields: Certification Type (Organic/Fair Trade/Rainforest Alliance/Carbon Neutral), Issuer, Valid From, Valid Until, Certificate Number
    - Validators: required, custom validator ensuring validFrom < validUntil
    - _Requirements: 5.4_

  - [x] 7.5 Register ESG route in app.routes.ts
    - Add route: `esg/sustentabilidade`
    - Use loadComponent for lazy loading, place before `**` wildcard
    - _Requirements: 10.1, 10.3_

  - [ ]* 7.6 Write property test for emissions breakdown consistency
    - **Property 8: Emissions breakdown consistency**
    - Use fast-check to generate random total carbon footprint values, verify breakdown components sum to total (production=40%, transport=35%, processing=15%, packaging=10%)
    - **Validates: Requirements 5.3**

- [x] 8. Checkpoint — ESG Module
  - Ensure all tests pass, ask the user if questions arise.
  - Run: `npx ng build --configuration=development`

- [x] 9. AI Operations Center Module
  - [x] 9.1 Create AI Operations type definitions
    - Create `src/types/ai-operations.ts` with interfaces: AiAgent, AiOperationsMetrics, AiRequestTimeSeries, AiAgentDetail, AiErrorEntry, AiCostBreakdown
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [x] 9.2 Create AI Operations mock service
    - Create `src/services/aiOperationsMockService.ts` with Injectable service
    - Implement methods: getMetrics(), getAgents(), getAgentDetail(), getTimeSeries()
    - Generate 8+ mock AI agents with varying accuracy levels (some < 85% for warning display)
    - Generate 7-day time-series data with hourly granularity
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 9.3 Implement AI Operations Dashboard component
    - Create `src/app/components/ai-operations/dashboard/ai-operations-dashboard.component.ts|html|scss`
    - Standalone component with KPI cards: Total Requests (24h), Avg Response Time (ms), Accuracy Rate (%), Estimated Cost (USD), Active Agents
    - Time-series chart (using canvas or simple HTML/CSS bar chart) for request volume and response time over 7 days
    - Agent performance grid: Agent Name, Module, Requests (24h), Avg Response Time, Accuracy, Cost, Status, Last Error columns
    - MatTableDataSource with MatSort and MatPaginator [10, 25, 50, 100]
    - Warning indicator when accuracy < 85%, "Needs Attention" section
    - Detail view on row click: request history chart, error log, cost breakdown, configuration
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 9.4 Register AI Operations route in app.routes.ts
    - Add route: `ai-operations/dashboard`
    - Use loadComponent for lazy loading, place before `**` wildcard
    - _Requirements: 10.1, 10.3_

  - [ ]* 9.5 Write property test for AI agent accuracy warning threshold
    - **Property 9: AI agent accuracy warning threshold**
    - Use fast-check to generate random accuracy values [0, 100], verify warning indicator appears if and only if accuracy < 85%
    - **Validates: Requirements 6.4**

- [x] 10. Checkpoint — AI Operations Module
  - Ensure all tests pass, ask the user if questions arise.
  - Run: `npx ng build --configuration=development`

- [x] 11. Command Center Module
  - [x] 11.1 Create Command Center type definitions
    - Create `src/types/command-center.ts` with interfaces: ActiveOperation, OperationMilestone, CommandCenterMetrics, and type unions: OperationStatus, MilestoneType
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 11.2 Create Command Center mock service
    - Create `src/services/commandCenterMockService.ts` with Injectable service
    - Implement methods: getActiveOperations(), getMetrics(), getOperationDetail()
    - Generate 15+ mock active operations with various statuses (ON_TIME, AT_RISK, DELAYED) and coordinates
    - Generate milestones for each operation across the full lifecycle
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 11.3 Implement Command Center component
    - Create `src/app/components/command-center/command-center.component.ts|html|scss`
    - Standalone component with:
      - Map visualization (mock with color-coded status markers: Green=on-time, Yellow=at-risk, Red=delayed)
      - Horizontal timeline showing operations with milestones
      - Executive KPI cards: Active Operations, On-Time Delivery Rate, Revenue in Transit, Pending Documents, Compliance Alerts, Avg Cycle Time
      - Operation detail popup on marker click
      - Digital Twin toggle view
      - Auto-refresh with `interval(60000).pipe(takeUntil(destroy$))`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 11.4 Register Command Center route in app.routes.ts
    - Add route: `command-center`
    - Use loadComponent for lazy loading, place before `**` wildcard
    - _Requirements: 10.1, 10.3_

- [x] 12. Checkpoint — Command Center Module
  - Ensure all tests pass, ask the user if questions arise.
  - Run: `npx ng build --configuration=development`

- [x] 13. Dashboard Builder Module
  - [x] 13.1 Create Dashboard Builder type definitions
    - Create `src/types/dashboard-builder.ts` with interfaces: UserDashboard, DashboardWidget, WidgetCatalogItem, SharedDashboard, and type unions: DashboardLayout, WidgetType, WidgetModule
    - _Requirements: 8.1, 8.2, 8.4, 9.1, 9.2_

  - [x] 13.2 Create Dashboard Builder mock service
    - Create `src/services/dashboardBuilderMockService.ts` with Injectable service
    - Implement methods: getUserDashboards(), getDashboardById(), createDashboard(), saveDashboard(), getSharedDashboards(), shareDashboard(), removeSharing(), getWidgetCatalog()
    - Persist per-user configurations in memory (mock localStorage)
    - Generate 3-5 sample dashboards with various widget configurations
    - _Requirements: 8.1, 8.2, 8.3, 8.7, 9.1, 9.2, 9.3, 9.5_

  - [x] 13.3 Implement Meus Dashboards component
    - Create `src/app/components/dashboards/meus-dashboards/meus-dashboards.component.ts|html|scss`
    - Standalone component with grid of saved dashboards: Name, Description, Last Modified, Widget Count
    - "Novo Dashboard" button opening creation dialog
    - Dashboard render view showing configured widgets in saved layout (1-column, 2-column, 3-column CSS grid)
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 13.4 Implement Compartilhados component
    - Create `src/app/components/dashboards/compartilhados/compartilhados.component.ts|html|scss`
    - Standalone component showing shared dashboards: Name, Owner, Shared Date, Permission Level (View/Edit)
    - Disable editing for VIEW_ONLY permission (disable widget config, layout changes, add/remove widget)
    - "Compartilhar" button on personal dashboards opening sharing dialog
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 13.5 Implement Widget Renderer and Catalog components
    - Create `src/app/components/dashboards/widgets/widget-renderer.component.ts` — dynamic renderer based on widget type (KPI_CARD, LINE_CHART, BAR_CHART, PIE_CHART, DATA_TABLE, STATUS_INDICATOR)
    - Create `src/app/components/dashboards/widgets/widget-catalog-dialog.component.ts` — catalog grouped by module (Exports, Financial, Logistics, Compliance, ESG)
    - Create `src/app/components/dashboards/widgets/widget-config-dialog.component.ts` — config form: Data Source, Time Range, Filters, Display Format
    - _Requirements: 8.4, 8.5, 8.6_

  - [x] 13.6 Create Dashboard creation and sharing dialogs
    - Create `src/app/components/dashboards/dialogs/novo-dashboard-dialog.component.ts` — form: Dashboard Name, Description, Layout (1-column, 2-column, 3-column)
    - Create `src/app/components/dashboards/dialogs/compartilhar-dialog.component.ts` — select users/teams, assign permission (View Only, Edit)
    - _Requirements: 8.2, 9.2_

  - [x] 13.7 Register Dashboard routes in app.routes.ts
    - Add routes: `dashboards/meus`, `dashboards/compartilhados`
    - Use loadComponent for lazy loading, place before `**` wildcard
    - Replace existing `dashboards/criar` route if it conflicts or keep both
    - _Requirements: 10.1, 10.3, 10.4_

  - [ ]* 13.8 Write property test for dashboard widget rendering completeness
    - **Property 10: Dashboard widget rendering completeness**
    - Use fast-check to generate random dashboard configs with N widgets, verify exactly N widget components are rendered
    - **Validates: Requirements 8.3**

  - [ ]* 13.9 Write property test for dashboard configuration round-trip persistence
    - **Property 11: Dashboard configuration round-trip persistence**
    - Use fast-check to generate random valid dashboard configs, verify save then load produces equivalent object
    - **Validates: Requirements 8.7**

  - [ ]* 13.10 Write property test for View Only permission enforcement
    - **Property 12: View Only permission enforcement**
    - Use fast-check to generate random permission states, verify all edit actions disabled for VIEW_ONLY
    - **Validates: Requirements 9.4**

- [x] 14. Checkpoint — Dashboard Builder Module
  - Ensure all tests pass, ask the user if questions arise.
  - Run: `npx ng build --configuration=development`

- [x] 15. Navigation Menu Update and Final Integration
  - [x] 15.1 Update sidebar navigation in home-logged component
    - Add new menu groups and items to `home-logged.component.ts`:
      - "Clientes/CRM" group with items: Visão 360, Contatos, Oportunidades
      - "Supply Chain" group with item: Fornecedores
      - "Due Diligence" item under existing "Compliance" group
      - "ESG/Sustentabilidade" group with item: Sustentabilidade
      - "AI Operations" group with item: Dashboard
      - "Command Center" as top-level item
    - Remove "Coming Soon" indicators from "Meus Dashboards" and "Compartilhados" menu items
    - _Requirements: 10.2, 10.4, 10.5_

  - [x] 15.2 Verify all Phase 2 routes are registered before wildcard
    - Confirm all 10 new routes are placed BEFORE the `**` catch-all in app.routes.ts
    - Verify loadComponent is used for all new routes (not eager loading)
    - Verify breadcrumb consistency across all new modules
    - _Requirements: 10.1, 10.3, 10.5_

- [x] 16. Final Checkpoint — Full Build Verification
  - Ensure all tests pass, ask the user if questions arise.
  - Run: `npx ng build --configuration=development`
  - Verify no compilation errors, no circular dependencies, and all lazy-loaded chunks are generated

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation via build verification
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- All components follow existing project patterns: standalone, inject() DI, MatTableDataSource, reactive forms
- Theme colors per module are defined in the design document
- All subscriptions must use takeUntil(destroy$) pattern for cleanup

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.1", "5.1", "7.1", "9.1", "11.1", "13.1"] },
    { "id": 1, "tasks": ["1.2", "3.2", "5.2", "7.2", "9.2", "11.2", "13.2"] },
    { "id": 2, "tasks": ["1.3", "1.4", "1.5", "1.6", "1.7", "3.3", "3.4", "5.3", "5.4", "5.5", "7.3", "7.4", "9.3", "11.3", "13.3", "13.4", "13.5", "13.6"] },
    { "id": 3, "tasks": ["1.8", "3.5", "5.6", "7.5", "9.4", "11.4", "13.7"] },
    { "id": 4, "tasks": ["1.9", "1.10", "1.11", "3.6", "3.7", "5.7", "5.8", "7.6", "9.5", "13.8", "13.9", "13.10"] },
    { "id": 5, "tasks": ["15.1", "15.2"] }
  ]
}
```

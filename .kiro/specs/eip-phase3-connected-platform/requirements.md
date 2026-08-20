# Requirements Document

## Introduction

Phase 3 of the EIP (Export Intelligence Platform) frontend implements the **Connected Platform** layer — a set of high-value modules that complete the platform's coverage of the export lifecycle. This phase adds Trade Finance and Hedge management to the financial layer, advanced logistics capabilities (Navios and Containers), Packing List document management, an omnichannel Notification Center, a Marketplace for partners and connectors, and a Knowledge Center for documentation and self-service support.

All modules follow the established Angular 20 standalone component patterns with Angular Material, mock services, reactive forms, MatTableDataSource with MatSort/MatPaginator, inject() DI, and takeUntil(destroy$) lifecycle management.

## Glossary

- **EIP**: Export Intelligence Platform — the main application being developed
- **Trade_Finance_Module**: The component responsible for managing letters of credit, documentary collections, and bank guarantees
- **Hedge_Module**: The component responsible for managing foreign exchange hedging contracts and exposure monitoring
- **Navios_Module**: The component responsible for vessel tracking, schedules, and berth management
- **Containers_Module**: The component responsible for container lifecycle management including FCL/LCL operations and demurrage tracking
- **Packing_List_Module**: The component responsible for creating and managing packing lists linked to invoices and shipments
- **Notification_Center**: The component responsible for omnichannel notification management (platform, email, push, WhatsApp)
- **Marketplace_Module**: The component responsible for displaying partner services, connectors, and third-party integrations
- **Knowledge_Center**: The component responsible for documentation, FAQs, tutorials, and self-service support content
- **MatTableDataSource**: Angular Material's data source for tables supporting sorting, filtering, and pagination
- **Mock_Service**: An Injectable Angular service providing simulated data via Observables for development
- **ExportService**: Existing shared service for CSV/PDF export functionality
- **ConfirmarAcaoDialogComponent**: Existing shared dialog component used for confirmation actions
- **LC**: Letter of Credit — a bank-issued guarantee of payment in international trade
- **Documentary_Collection**: A trade finance instrument where banks handle document exchange between parties
- **Bank_Guarantee**: A financial instrument ensuring payment obligations are met
- **FCL**: Full Container Load — a container used exclusively by one shipper
- **LCL**: Less than Container Load — a container shared among multiple shippers
- **Demurrage**: Fees charged when containers exceed free storage time at port
- **Detention**: Fees charged when containers exceed free usage time outside port
- **NTF**: Notification entity representing a single platform notification

## Requirements

### Requirement 1: Trade Finance Management

**User Story:** As a financial operations manager, I want to manage letters of credit, documentary collections, and bank guarantees, so that I can track and control all trade finance instruments associated with export operations.

#### Acceptance Criteria

1. WHEN the user navigates to the trade finance route, THE Trade_Finance_Module SHALL display a data table of all trade finance instruments with columns for instrument number, type, status, bank, value, currency, expiry date, linked contract, and actions
2. THE Trade_Finance_Module SHALL support MatSort on all columns and MatPaginator with page size options of 10, 25, 50, and 100
3. WHEN the user types in the search field, THE Trade_Finance_Module SHALL filter results after a debounceTime of 300 milliseconds
4. WHEN the user clicks the "Nova LC" button, THE Trade_Finance_Module SHALL open a dialog with a reactive form to create a new Letter of Credit with fields for bank, beneficiary, value, currency, expiry date, terms, and linked contract
5. WHEN the user clicks the "Nova Cobrança Documentária" button, THE Trade_Finance_Module SHALL open a dialog to create a new Documentary Collection with fields for collecting bank, presenting bank, value, documents required, and payment terms
6. WHEN the user clicks the "Nova Garantia" button, THE Trade_Finance_Module SHALL open a dialog to create a new Bank Guarantee with fields for guarantor bank, beneficiary, value, validity period, and guarantee type
7. WHEN the user selects a trade finance instrument, THE Trade_Finance_Module SHALL display a detail panel showing full instrument data, timeline of events, linked documents, and status history
8. THE Trade_Finance_Module SHALL display summary metric cards showing total active LCs, total value under LCs, pending collections, and expiring instruments count
9. WHEN the user clicks the export button, THE Trade_Finance_Module SHALL export the filtered data via ExportService in CSV or PDF format
10. IF an instrument is within 30 days of expiry, THEN THE Trade_Finance_Module SHALL display a visual warning indicator on the instrument row

### Requirement 2: Hedge Cambial (FX Hedge Management)

**User Story:** As a treasury analyst, I want to manage foreign exchange hedge contracts and monitor currency exposure, so that I can mitigate FX risk on export revenues.

#### Acceptance Criteria

1. WHEN the user navigates to the hedge route, THE Hedge_Module SHALL display a data table of all hedge contracts with columns for contract number, counterparty bank, type (NDF, Forward, Option), notional value, strike rate, maturity date, mark-to-market value, status, and actions
2. THE Hedge_Module SHALL support MatSort on all columns and MatPaginator with page size options of 10, 25, 50, and 100
3. WHEN the user types in the search field, THE Hedge_Module SHALL filter results after a debounceTime of 300 milliseconds
4. WHEN the user clicks "Novo Contrato Hedge", THE Hedge_Module SHALL open a dialog with a reactive form containing fields for type, counterparty bank, notional value, currency pair, strike rate, maturity date, and linked export
5. THE Hedge_Module SHALL display an exposure summary panel showing total exposed value, total hedged value, hedge ratio percentage, and net open position
6. WHEN the user selects a hedge contract, THE Hedge_Module SHALL display a detail panel showing contract terms, settlement history, mark-to-market evolution, and linked exports
7. WHEN the user clicks the export button, THE Hedge_Module SHALL export the filtered data via ExportService in CSV or PDF format
8. IF a hedge contract matures within 7 days, THEN THE Hedge_Module SHALL display a critical warning indicator on the contract row
9. THE Hedge_Module SHALL display summary metric cards showing active contracts count, total notional value, average hedge ratio, and total unrealized P&L

### Requirement 3: Vessel Management (Navios)

**User Story:** As a logistics coordinator, I want to track vessels, their schedules, and berth assignments, so that I can plan shipment logistics and avoid delays.

#### Acceptance Criteria

1. WHEN the user navigates to the navios route, THE Navios_Module SHALL display a data table of vessels with columns for vessel name, IMO number, flag, vessel type, capacity (TEU/DWT), current port, ETA, status, and actions
2. THE Navios_Module SHALL support MatSort on all columns and MatPaginator with page size options of 10, 25, 50, and 100
3. WHEN the user types in the search field, THE Navios_Module SHALL filter results after a debounceTime of 300 milliseconds
4. WHEN the user clicks "Adicionar Navio", THE Navios_Module SHALL open a dialog with a reactive form containing fields for vessel name, IMO number, flag, type, capacity, shipping line, and current schedule
5. WHEN the user selects a vessel, THE Navios_Module SHALL display a detail panel showing vessel specifications, current voyage details, schedule history, and linked shipments
6. THE Navios_Module SHALL display summary metric cards showing total tracked vessels, vessels in transit, vessels at port, and vessels with delay alerts
7. WHEN the user clicks the export button, THE Navios_Module SHALL export the filtered data via ExportService in CSV or PDF format
8. IF a vessel's ETA changes by more than 24 hours from the original schedule, THEN THE Navios_Module SHALL display a delay alert indicator on the vessel row
9. THE Navios_Module SHALL display a schedule tab showing port rotation with ETAs, ETDs, and berth assignments for the selected vessel

### Requirement 4: Container Lifecycle Management

**User Story:** As a logistics operator, I want to manage the full container lifecycle including booking, loading, transit, and return, so that I can minimize demurrage costs and optimize container utilization.

#### Acceptance Criteria

1. WHEN the user navigates to the containers route, THE Containers_Module SHALL display a data table of containers with columns for container number, size (20ft/40ft/40ftHC), type (FCL/LCL), status, current location, vessel, booking reference, free days remaining, and actions
2. THE Containers_Module SHALL support MatSort on all columns and MatPaginator with page size options of 10, 25, 50, and 100
3. WHEN the user types in the search field, THE Containers_Module SHALL filter results after a debounceTime of 300 milliseconds
4. WHEN the user clicks "Novo Container", THE Containers_Module SHALL open a dialog with a reactive form containing fields for container number, size, type, shipping line, booking reference, linked shipment, and free days allowed
5. WHEN the user selects a container, THE Containers_Module SHALL display a detail panel showing container specifications, movement history, linked documents, demurrage/detention calculations, and current status
6. THE Containers_Module SHALL display summary metric cards showing total active containers, containers at risk of demurrage, total demurrage cost accrued, and average dwell time
7. WHEN the user clicks the export button, THE Containers_Module SHALL export the filtered data via ExportService in CSV or PDF format
8. IF a container's free days remaining reaches zero, THEN THE Containers_Module SHALL display a critical demurrage alert on the container row and calculate projected daily cost
9. THE Containers_Module SHALL allow the user to filter containers by status: Booked, Gate-In, Loaded, In Transit, Arrived, Gate-Out, Returned, Detained

### Requirement 5: Packing List Management

**User Story:** As a documentation specialist, I want to create and manage packing lists linked to invoices and shipments, so that I can ensure accurate cargo documentation for customs and logistics.

#### Acceptance Criteria

1. WHEN the user navigates to the packing list route, THE Packing_List_Module SHALL display a data table of packing lists with columns for packing list number, linked invoice, exporter, buyer, total packages, total gross weight, total net weight, status, and actions
2. THE Packing_List_Module SHALL support MatSort on all columns and MatPaginator with page size options of 10, 25, 50, and 100
3. WHEN the user types in the search field, THE Packing_List_Module SHALL filter results after a debounceTime of 300 milliseconds
4. WHEN the user clicks "Novo Packing List", THE Packing_List_Module SHALL open a dialog with a reactive form containing fields for linked invoice, exporter data, buyer data, shipping marks, package details (type, quantity, dimensions, weight), and container assignment
5. WHEN the user selects a packing list, THE Packing_List_Module SHALL display a detail panel showing item breakdown per package, weight summary, linked documents, validations, and AI completeness score
6. THE Packing_List_Module SHALL display summary metric cards showing total packing lists, pending validation count, average completeness score, and lists linked to active shipments
7. WHEN the user clicks the export button, THE Packing_List_Module SHALL export the filtered data via ExportService in CSV or PDF format
8. THE Packing_List_Module SHALL validate that total weights and quantities match the linked invoice and display discrepancies as warnings
9. WHEN the user clicks "Gerar PDF", THE Packing_List_Module SHALL generate a formatted PDF of the selected packing list suitable for customs submission
10. IF total gross weight in the packing list differs from the linked invoice by more than 1%, THEN THE Packing_List_Module SHALL display a validation warning highlighting the discrepancy

### Requirement 6: Notification Center

**User Story:** As a platform user, I want a centralized notification center that aggregates all system alerts across channels (platform, email, push, WhatsApp), so that I can stay informed about critical events without checking multiple sources.

#### Acceptance Criteria

1. WHEN the user navigates to the notification center route, THE Notification_Center SHALL display a list of all notifications sorted by most recent, with columns for channel icon, title, message preview, timestamp, priority, read status, and actions
2. THE Notification_Center SHALL support MatPaginator with page size options of 10, 25, 50, and 100
3. WHEN the user types in the search field, THE Notification_Center SHALL filter notifications by title or message content after a debounceTime of 300 milliseconds
4. THE Notification_Center SHALL allow filtering by channel (Platform, Email, Push, WhatsApp), priority (Critical, High, Medium, Low), read status (Read, Unread), and date range
5. WHEN the user clicks on a notification, THE Notification_Center SHALL mark it as read and display the full notification content in a detail panel
6. WHEN the user clicks "Marcar Todas como Lidas", THE Notification_Center SHALL mark all visible notifications as read
7. THE Notification_Center SHALL display summary metric cards showing total unread count, critical unread count, notifications today, and notifications this week
8. WHEN the user clicks the notification bell icon in the application header, THE Notification_Center SHALL display a dropdown with the 5 most recent unread notifications and a link to the full notification center
9. THE Notification_Center SHALL support notification preferences allowing the user to configure which event types trigger notifications on each channel
10. IF a notification has critical priority and remains unread for more than 1 hour, THEN THE Notification_Center SHALL escalate its visual prominence in the notification list

### Requirement 7: Marketplace

**User Story:** As a platform administrator, I want to browse and manage a marketplace of partner services, connectors, and integrations, so that I can extend platform capabilities with third-party solutions.

#### Acceptance Criteria

1. WHEN the user navigates to the marketplace route, THE Marketplace_Module SHALL display a grid of available partners, services, and connectors as cards showing logo, name, category, rating, description summary, and status (Active, Available, Coming Soon)
2. THE Marketplace_Module SHALL allow filtering by category (Logistics, Finance, Compliance, Analytics, Insurance, Government), status, and search text after a debounceTime of 300 milliseconds
3. WHEN the user clicks on a marketplace card, THE Marketplace_Module SHALL display a detail panel showing full description, features list, pricing information, integration requirements, reviews, and activation button
4. WHEN the user clicks "Ativar" on an available connector, THE Marketplace_Module SHALL open a confirmation dialog using ConfirmarAcaoDialogComponent and upon confirmation update the connector status to Active
5. WHEN the user clicks "Desativar" on an active connector, THE Marketplace_Module SHALL open a confirmation dialog using ConfirmarAcaoDialogComponent and upon confirmation update the connector status to Available
6. THE Marketplace_Module SHALL display summary metric cards showing total active connectors, available connectors, total categories, and recently added count
7. THE Marketplace_Module SHALL display a featured section at the top highlighting recommended connectors based on the user's active modules
8. THE Marketplace_Module SHALL support sorting cards by name, rating, category, or recently added

### Requirement 8: Knowledge Center

**User Story:** As a platform user, I want access to a knowledge base with documentation, FAQs, tutorials, and guides, so that I can find answers to operational questions and learn platform features without contacting support.

#### Acceptance Criteria

1. WHEN the user navigates to the knowledge center route, THE Knowledge_Center SHALL display a categorized content library with sections for Documentation, FAQs, Video Tutorials, and Best Practices
2. THE Knowledge_Center SHALL provide a global search field that filters content across all categories after a debounceTime of 300 milliseconds
3. WHEN the user clicks on a content item, THE Knowledge_Center SHALL display the full article content with formatted text, images, and related articles
4. THE Knowledge_Center SHALL allow filtering content by module (Exportações, Contratos, Financeiro, Logística, Compliance, Documentos), content type, and difficulty level (Básico, Intermediário, Avançado)
5. THE Knowledge_Center SHALL display a "Mais Acessados" section showing the top 10 most viewed articles
6. THE Knowledge_Center SHALL display a "Atualizados Recentemente" section showing articles modified in the last 30 days
7. WHEN the user clicks the feedback buttons (helpful/not helpful) on an article, THE Knowledge_Center SHALL record the feedback and display a thank-you message via MatSnackBar
8. THE Knowledge_Center SHALL display summary metric cards showing total articles count, total FAQs count, total video tutorials count, and average user rating


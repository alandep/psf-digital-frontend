# Requirements Document

## Introduction

This document specifies the Phase 2 enhancements for the Export Intelligence Platform (EIP) frontend. Phase 1 MVP delivered ~43 screens covering core export operations. Phase 2 adds high-value enterprise modules that extend the platform into CRM, supply chain management, advanced compliance (Due Diligence), ESG/sustainability tracking, AI operations monitoring, executive command center, and personalized dashboards. These modules follow the established Angular 20 patterns: standalone components, Angular Material, MatTableDataSource with full sort/paginator support, inject() DI, and reactive forms.

## Glossary

- **EIP**: Export Intelligence Platform — the main application
- **CRM_Module**: Customer Relationship Management module for managing clients, contacts, and opportunities
- **Supplier_Module**: Supply chain supplier management with qualification and risk scoring
- **Due_Diligence_Module**: Compliance module for KYC/AML/Sanctions screening of counterparties
- **ESG_Module**: Environmental, Social, and Governance sustainability tracking module
- **AI_Operations_Center**: Monitoring dashboard for AI agent performance, costs, and accuracy
- **Command_Center**: Executive cockpit providing global timeline and operational Digital Twin view
- **Dashboard_Builder**: User interface for creating, saving, and sharing personalized dashboards
- **Customer_360**: Unified view of all interactions, contracts, shipments, and financials per client
- **Risk_Score**: Numerical assessment (0-100) of a supplier or counterparty's risk profile
- **Screening_Result**: Outcome of a KYC/AML/Sanctions check against watchlists
- **Carbon_Footprint**: Calculated CO2 equivalent emissions per export operation
- **Widget**: A configurable visual component (chart, KPI card, table) within a personalized dashboard

## Requirements

### Requirement 1: CRM Module — Customer 360

**User Story:** As an export manager, I want a unified customer view showing all interactions, contracts, shipments, and financial data per client, so that I can make informed commercial decisions and strengthen relationships.

#### Acceptance Criteria

1. WHEN the user navigates to "clientes/visao-360", THE CRM_Module SHALL display a Customer 360 dashboard with tabs for Overview, Contracts, Shipments, Financial, and Interactions
2. THE CRM_Module SHALL present a searchable and sortable customer list with columns: Company Name, Country, Segment, Total Revenue, Active Contracts, Risk Score, and Last Interaction Date
3. WHEN the user selects a customer, THE CRM_Module SHALL display the Customer_360 view aggregating all related data from Contracts, Exports, Financial, and Compliance modules
4. WHEN the user clicks "Novo Cliente", THE CRM_Module SHALL open a dialog with a reactive form containing fields: Company Name, Trade Name, Tax ID, Country, Address, Segment, and Primary Contact
5. THE CRM_Module SHALL provide MatSort on all columns and MatPaginator with options [10, 25, 50, 100]
6. WHEN the user applies filters by Country, Segment, or Revenue Range, THE CRM_Module SHALL filter the customer list within 300ms using debounceTime

### Requirement 2: CRM Module — Contacts and Opportunities

**User Story:** As a commercial analyst, I want to manage contacts per customer and track sales opportunities, so that I can follow up on pipeline and conversion rates.

#### Acceptance Criteria

1. WHEN the user navigates to "clientes/contatos", THE CRM_Module SHALL display a contacts grid with columns: Name, Email, Phone, Role, Customer, and Status
2. WHEN the user navigates to "clientes/oportunidades", THE CRM_Module SHALL display an opportunities pipeline with stages: Prospecting, Qualification, Proposal, Negotiation, and Closed
3. WHEN the user creates a new opportunity, THE CRM_Module SHALL require fields: Title, Customer, Estimated Value (USD), Probability (%), Expected Close Date, and Assigned User
4. THE CRM_Module SHALL display opportunity value totals per pipeline stage in a summary bar above the grid
5. WHEN an opportunity status changes, THE CRM_Module SHALL log the transition with timestamp and user in an activity history

### Requirement 3: Supplier Management

**User Story:** As a supply chain coordinator, I want to manage suppliers with qualification scoring and risk assessment, so that I can ensure reliable sourcing and mitigate supply chain risks.

#### Acceptance Criteria

1. WHEN the user navigates to "supply-chain/fornecedores", THE Supplier_Module SHALL display a sortable supplier grid with columns: Name, Country, Category, Risk_Score, Qualification Status, Last Audit Date, and Active Contracts
2. THE Supplier_Module SHALL calculate and display a Risk_Score from 0 to 100 based on: delivery performance (30%), quality metrics (25%), financial stability (20%), compliance history (15%), and geographic risk (10%)
3. WHEN the user clicks "Novo Fornecedor", THE Supplier_Module SHALL open a dialog with fields: Company Name, Tax ID, Country, Category, Contact Name, Email, and Phone
4. WHEN a supplier's Risk_Score exceeds 70, THE Supplier_Module SHALL display a warning badge and highlight the row in orange (#f57c00)
5. THE Supplier_Module SHALL provide MatSort on all columns and MatPaginator with options [10, 25, 50, 100]
6. WHEN the user opens a supplier detail view, THE Supplier_Module SHALL show tabs for: Overview, Documents, Audit History, Performance Metrics, and Related Contracts

### Requirement 4: Compliance Due Diligence — KYC/AML Screening

**User Story:** As a compliance officer, I want to perform KYC/AML and sanctions screening on counterparties, so that I can ensure regulatory compliance and prevent prohibited transactions.

#### Acceptance Criteria

1. WHEN the user navigates to "compliance/due-diligence", THE Due_Diligence_Module SHALL display a screening dashboard with tabs: Pending Reviews, Completed, Flagged, and Expired
2. WHEN the user initiates a new screening, THE Due_Diligence_Module SHALL require fields: Entity Name, Entity Type (Individual/Company), Country, Tax ID, and Screening Type (KYC/AML/Sanctions/PEP)
3. WHEN a screening is submitted, THE Due_Diligence_Module SHALL display mock results with a Screening_Result containing: match status (Clear/Potential Match/Confirmed Match), matched watchlists, confidence score, and recommended action
4. WHEN a Screening_Result returns "Potential Match" or "Confirmed Match", THE Due_Diligence_Module SHALL require the user to select a resolution: Approve, Reject, or Escalate, with mandatory justification text
5. THE Due_Diligence_Module SHALL display a sortable grid of all screenings with columns: Entity Name, Type, Date, Status, Risk Level, Assigned Analyst, and Resolution
6. WHILE a screening status is "Pending", THE Due_Diligence_Module SHALL display a countdown showing days until SLA expiration (default: 5 business days)
7. THE Due_Diligence_Module SHALL use purple/indigo (#4527a0) as the primary theme color for compliance domain consistency

### Requirement 5: ESG and Sustainability Tracking

**User Story:** As a sustainability manager, I want to track carbon emissions, origin traceability, and environmental certifications per export operation, so that I can report ESG metrics and meet buyer requirements.

#### Acceptance Criteria

1. WHEN the user navigates to "esg/sustentabilidade", THE ESG_Module SHALL display a sustainability dashboard with KPI cards: Total Carbon_Footprint (tCO2e), Operations with Traceability (%), Active Certifications count, and ESG Score
2. THE ESG_Module SHALL present a sortable grid of export operations with columns: Export ID, Product, Destination, Carbon_Footprint (tCO2e), Traceability Status, Certifications, and ESG Rating (A-E)
3. WHEN the user selects an operation, THE ESG_Module SHALL display a breakdown of emissions by: Production (40%), Transport (35%), Processing (15%), and Packaging (10%)
4. WHEN the user clicks "Registrar Certificação", THE ESG_Module SHALL open a dialog with fields: Certification Type (Organic/Fair Trade/Rainforest Alliance/Carbon Neutral), Issuer, Valid From, Valid Until, and Certificate Number
5. THE ESG_Module SHALL provide MatSort on all columns and MatPaginator with options [10, 25, 50, 100]
6. THE ESG_Module SHALL use green (#2e7d32) as the primary accent color for the sustainability domain

### Requirement 6: AI Operations Center

**User Story:** As a platform administrator, I want to monitor AI agent performance, costs, response times, and accuracy metrics, so that I can ensure AI services are operating within acceptable parameters.

#### Acceptance Criteria

1. WHEN the user navigates to "ai-operations/dashboard", THE AI_Operations_Center SHALL display a monitoring dashboard with real-time KPI cards: Total Requests (24h), Average Response Time (ms), Accuracy Rate (%), Estimated Cost (USD), and Active Agents count
2. THE AI_Operations_Center SHALL display a time-series chart showing request volume and response time over the last 7 days with hourly granularity
3. THE AI_Operations_Center SHALL present a sortable agent performance grid with columns: Agent Name, Module, Requests (24h), Avg Response Time, Accuracy, Cost, Status, and Last Error
4. WHEN an AI agent's accuracy drops below 85%, THE AI_Operations_Center SHALL display a warning indicator and move the agent to a "Needs Attention" section
5. WHEN the user clicks on an agent row, THE AI_Operations_Center SHALL display detailed metrics: request history chart, error log (last 50 entries), cost breakdown by operation type, and configuration parameters
6. THE AI_Operations_Center SHALL provide MatSort on all columns and MatPaginator with options [10, 25, 50, 100]

### Requirement 7: Command Center — Executive Cockpit

**User Story:** As a director of foreign trade, I want an executive cockpit showing a global operational timeline and Digital Twin view of all active operations, so that I can have instant visibility into the entire export chain.

#### Acceptance Criteria

1. WHEN the user navigates to "command-center", THE Command_Center SHALL display a global operations map showing active shipments with color-coded status markers: Green (on-time), Yellow (at-risk), Red (delayed)
2. THE Command_Center SHALL display a horizontal timeline showing all active operations with milestones: Contract Signed, Production, Documentation, Shipment, Transit, Arrival, and Financial Settlement
3. THE Command_Center SHALL present executive KPI cards: Active Operations, On-Time Delivery Rate (%), Revenue in Transit (USD), Pending Documents, Compliance Alerts, and Average Cycle Time (days)
4. WHEN the user clicks on an operation marker on the map, THE Command_Center SHALL display a summary popup with: Export ID, Customer, Product, Current Status, ETA, and Risk Level
5. WHEN the user toggles "Digital Twin" view, THE Command_Center SHALL display a synchronized real-time operational model showing all entities (shipments, documents, payments) and their current states
6. THE Command_Center SHALL auto-refresh data every 60 seconds without requiring user interaction

### Requirement 8: Personalized Dashboards — Meus Dashboards

**User Story:** As a platform user, I want to create personalized dashboards with configurable widgets, so that I can monitor the KPIs most relevant to my role.

#### Acceptance Criteria

1. WHEN the user navigates to "dashboards/meus", THE Dashboard_Builder SHALL display a grid of the user's saved dashboards with: Name, Description, Last Modified Date, and Widget Count
2. WHEN the user clicks "Novo Dashboard", THE Dashboard_Builder SHALL open a creation dialog with fields: Dashboard Name, Description, and Layout (1-column, 2-column, 3-column)
3. WHEN the user opens an existing dashboard, THE Dashboard_Builder SHALL render all configured widgets in the saved layout
4. THE Dashboard_Builder SHALL support Widget types: KPI Card, Line Chart, Bar Chart, Pie Chart, Data Table, and Status Indicator
5. WHEN the user clicks "Adicionar Widget", THE Dashboard_Builder SHALL display a catalog of available widgets grouped by module (Exports, Financial, Logistics, Compliance, ESG)
6. WHEN the user configures a Widget, THE Dashboard_Builder SHALL provide options for: Data Source, Time Range, Filters, and Display Format
7. THE Dashboard_Builder SHALL persist all dashboard configurations per user and restore them on next login

### Requirement 9: Shared Dashboards

**User Story:** As a team lead, I want to share dashboards with my team, so that we can collaborate using the same operational views.

#### Acceptance Criteria

1. WHEN the user navigates to "dashboards/compartilhados", THE Dashboard_Builder SHALL display all dashboards shared with the current user, showing: Name, Owner, Shared Date, and Permission Level (View/Edit)
2. WHEN the user clicks "Compartilhar" on a personal dashboard, THE Dashboard_Builder SHALL open a dialog to select users or teams and assign permission levels (View Only or Edit)
3. WHEN a shared dashboard is updated by the owner, THE Dashboard_Builder SHALL reflect changes for all shared users on their next page load
4. WHILE a user has "View Only" permission, THE Dashboard_Builder SHALL prevent editing of widget configurations and layout
5. WHEN the user removes sharing for a dashboard, THE Dashboard_Builder SHALL remove access for all previously shared users immediately

### Requirement 10: Navigation and Route Registration

**User Story:** As a user, I want all new Phase 2 modules to be accessible through the navigation menu and properly routed, so that I can seamlessly access new features from the existing application shell.

#### Acceptance Criteria

1. THE EIP SHALL register all Phase 2 routes BEFORE the "**" wildcard catch-all route in app.routes.ts
2. THE EIP SHALL add menu items for the new modules in the navigation sidebar: "Clientes/CRM" (under new group), "Supply Chain > Fornecedores", "Compliance > Due Diligence", "ESG/Sustentabilidade", "AI Operations", and "Command Center"
3. WHEN Phase 2 routes are registered, THE EIP SHALL use lazy loading (loadComponent) for each new component to maintain bundle optimization
4. THE EIP SHALL remove "Coming Soon" indicators from "Dashboards > Meus Dashboards" and "Dashboards > Compartilhados" menu items after their implementation
5. THE EIP SHALL maintain consistent breadcrumb navigation for all new modules following the pattern: Module > Submodule > Action

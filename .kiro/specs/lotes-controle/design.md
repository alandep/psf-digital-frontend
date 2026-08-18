# Design Document: Lotes > Controle de Lotes

## Architecture Overview

The Lotes Controle module follows the established project pattern: a standalone Angular 20 component with Angular Material UI, inject()-based DI, reactive forms, and a mock service returning Observables. The module is organized as:

```
src/
├── types/lotes.ts                         # TypeScript interfaces and types
├── services/lotesMockService.ts           # Injectable mock service (providedIn: 'root')
└── app/components/lotes/lotes-controle/
    ├── lotes-controle.component.ts        # Component class (standalone)
    ├── lotes-controle.component.html      # Template
    └── lotes-controle.component.scss      # Styles
```

The route `lotes/controle` is registered under the `home-logged` parent route via lazy-loading (`loadComponent`), placed before the wildcard catch-all.

---

## Components

### LotesControleComponent

**Selector:** `app-lotes-controle`  
**Standalone:** `true`  
**Pattern:** Follows `CertificacoesComponent` — separate HTML + SCSS, `inject()` for services, `ViewChild` for paginator/sort, `takeUntil` for subscription cleanup.

#### Responsibilities

1. **KPI Dashboard** — Renders four summary cards (total available qty, blocked count, expiring-soon count, avg AI score). Recalculates on filter changes.
2. **Smart Grid** — MatTable with MatPaginator (10/25/50/100) and MatSort. Columns: loteNumber, productName, harvest, status (chip), warehouseName, quantity, expiryDate, aiScore (badge), actions (menu).
3. **Quick Filters** — Reactive FormGroup with MatSelect (product, harvest, status, warehouse, country), MatDatepicker range (expiry), numeric range (AI score). Debounced at 300ms.
4. **Global Search** — Text input debounced at 300ms, searches across loteNumber, productName, warehouseName, harvest, destinationCountry (case-insensitive).
5. **Detail Drawer** — MatDrawer (right side) with 5 MatTabs: Dados Gerais, Estoque, Qualidade, Certificados, Histórico.
6. **AI Insights Panel** — MatExpansionPanel displaying quality gauge, export suggestions (max 3), anomaly alerts, expiry countdown.
7. **CRUD Dialogs** — MatDialog for create/edit forms. MatSnackBar for success (3s) and error (5s) feedback.
8. **Quality Inspection** — Form with validated numeric fields (humidity 0–100, pH 0–14, temp -40 to 60).

#### State Management

```typescript
// Key state properties
lots: Lote[] = [];
filteredLots: Lote[] = [];
selectedLot: Lote | null = null;
kpiMetrics: KPIMetrics | null = null;
aiInsights: AILotScore | null = null;
isLoading = false;
isDrawerOpen = false;

// Forms
filterForm: FormGroup;   // Quick Filters + Global Search
```

#### Lifecycle

- `ngOnInit`: Initialize forms, load lots and KPIs from service, setup filter/search subscriptions with `debounceTime(300)` + `takeUntil(destroy$)`.
- `ngOnDestroy`: `destroy$.next(); destroy$.complete();`

---

## Data Models (src/types/lotes.ts)

```typescript
// === STATUS ENUM ===
export type LoteStatus = 'DISPONÍVEL' | 'BLOQUEADO' | 'QUARENTENA' | 'EM_TRÂNSITO' | 'RESERVADO' | 'ESGOTADO';

// === MOVEMENT TYPES ===
export type MovementType = 'ENTRY' | 'BLOCK' | 'UNBLOCK' | 'RESERVE' | 'EXPORT' | 'TRANSFER' | 'STATUS_CHANGE';

// === MAIN LOT INTERFACE ===
export interface Lote {
  id: string;
  loteNumber: string;
  productName: string;
  productId: string;
  harvest: string;           // e.g., "2024/2025"
  status: LoteStatus;
  warehouseId: string;
  warehouseName: string;     // e.g., "Santos", "Paranaguá", "Rio Grande"
  quantity: number;          // initial quantity (kg)
  reservedQuantity: number;
  exportedQuantity: number;
  availableQuantity: number; // computed: quantity - reservedQuantity - exportedQuantity
  expiryDate: Date;
  physicalLocation: PhysicalLocation;
  aiScore: number;           // 0–100
  createdAt: Date;
  updatedAt: Date;
  destinationCountry: string;
}

export interface PhysicalLocation {
  warehouseId: string;
  section: string;
  row: string;
  position: string;
}

export interface QualityInspection {
  id: string;
  loteId: string;
  humidity: number;      // 0–100 %
  impurity: number;      // %
  protein: number;       // %
  pH: number;            // 0–14
  weight: number;        // kg
  temperature: number;   // -40 to 60 °C
  color: string;
  odor: string;
  pestPresence: boolean;
  labResults: string;
  inspectedBy: string;
  inspectedAt: Date;
}

export interface StockMovement {
  id: string;
  loteId: string;
  movementType: MovementType;
  fromStatus: LoteStatus | null;
  toStatus: LoteStatus;
  quantity: number;
  userId: string;
  userName: string;
  timestamp: Date;
  notes: string;
}

export interface AILotScore {
  loteId: string;
  score: number;             // 0–100
  exportSuggestions: ExportSuggestion[];  // max 3
  anomalyAlerts: AnomalyAlert[];
  expiryPrediction: ExpiryPrediction | null;
  calculatedAt: Date;
}

export interface ExportSuggestion {
  destination: string;
  confidence: number;
  reason: string;
}

export interface AnomalyAlert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  detectedAt: Date;
}

export interface ExpiryPrediction {
  daysToExpiry: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface LoteFilters {
  searchText: string;
  product: string;
  harvest: string;
  status: LoteStatus | '';
  warehouseId: string;
  destinationCountry: string;
  expiryDateStart: Date | null;
  expiryDateEnd: Date | null;
  aiScoreMin: number | null;
  aiScoreMax: number | null;
}

export interface KPIMetrics {
  totalAvailableQty: number;
  blockedCount: number;
  expiringSoonCount: number;
  avgAIScore: number;
}

export interface LoteCreatePayload {
  productId: string;
  productName: string;
  harvest: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  expiryDate: Date;
  physicalLocation: PhysicalLocation;
  destinationCountry: string;
}

export interface LoteUpdatePayload {
  productName?: string;
  harvest?: string;
  warehouseId?: string;
  warehouseName?: string;
  expiryDate?: Date;
  physicalLocation?: PhysicalLocation;
  destinationCountry?: string;
}
```

---

## Service Interface (src/services/lotesMockService.ts)

```typescript
@Injectable({ providedIn: 'root' })
export class LotesMockService {
  // Core CRUD
  getLotes(filters?: LoteFilters): Observable<Lote[]>;
  getLoteById(id: string): Observable<Lote>;
  createLote(payload: LoteCreatePayload): Observable<Lote>;
  updateLote(id: string, payload: LoteUpdatePayload): Observable<Lote>;

  // Status transitions
  blockLote(id: string, notes: string): Observable<Lote>;
  unblockLote(id: string, notes: string): Observable<Lote>;
  reserveLote(id: string, quantity: number, destination: string): Observable<Lote>;

  // Movement & Quality
  getMovementHistory(loteId: string): Observable<StockMovement[]>;
  getQualityInspections(loteId: string): Observable<QualityInspection[]>;
  saveQualityInspection(inspection: Omit<QualityInspection, 'id'>): Observable<QualityInspection>;

  // AI & KPIs
  getAIInsights(loteId: string): Observable<AILotScore>;
  getKPIMetrics(lots: Lote[]): KPIMetrics;

  // Filter options
  getProducts(): string[];
  getHarvests(): string[];
  getWarehouses(): { id: string; name: string }[];
  getCountries(): string[];
}
```

### Mock Data Strategy

- **20+ lots** covering 5 products: soja, milho, café, açúcar, carne bovina
- **Warehouses:** Santos, Paranaguá, Rio Grande, Itajaí, Vitória
- **All 6 statuses** represented in the mock data
- **Simulated delay:** `delay(randomInt(200, 800))` on all Observable returns
- **In-memory state:** Array-based store modified by CRUD operations; persists during session

### AI Score Calculation Logic

```
aiScore = (
  (100 - humidity_deviation) * 0.2 +
  (100 - impurity_pct * 10) * 0.2 +
  protein_score * 0.15 +
  freshness_factor * 0.25 +       // based on days to expiry
  certification_bonus * 0.2        // +points per valid cert
)
```

**Export suggestions:** Based on score thresholds + destination compliance rules:
- Score >= 85 → suggest premium markets (Japan, EU)
- Score 60–84 → suggest standard markets (China, Middle East)
- Score < 60 → flag for quality improvement

**Anomaly detection:** Business rule checks:
- Humidity > 14% for grains → anomaly
- Temperature out of range for product type → anomaly
- pH deviation > 1.0 from expected → anomaly

---

## Component Interactions

```
┌─────────────────────────────────────────────────────┐
│ LotesControleComponent                               │
│                                                       │
│  ┌──────────────────────────────────────────┐        │
│  │ KPI Dashboard (4 cards)                   │        │
│  └──────────────────────────────────────────┘        │
│  ┌──────────────────────────────────────────┐        │
│  │ Quick Filters + Global Search             │        │
│  └──────────────────────────────────────────┘        │
│  ┌──────────────────────────────────────────┐        │
│  │ Smart Grid (MatTable + Paginator + Sort)  │        │
│  └──────────────────────────────────────────┘        │
│                                                       │
│  ┌─────────────────────┐  ┌────────────────────┐    │
│  │ Detail Drawer       │  │ AI Insights Panel  │    │
│  │ (MatDrawer right)   │  │ (MatExpansionPanel)│    │
│  │ 5 tabs              │  │ - Score gauge      │    │
│  │                     │  │ - Suggestions      │    │
│  │                     │  │ - Anomalies        │    │
│  │                     │  │ - Expiry countdown │    │
│  └─────────────────────┘  └────────────────────┘    │
└─────────────────────────────────────────────────────┘
         │                           │
         ▼                           ▼
┌──────────────────────────────────────────────┐
│ LotesMockService (providedIn: 'root')        │
│ - In-memory lot array                         │
│ - In-memory movement history                  │
│ - In-memory quality inspections               │
│ - Observable returns with delay               │
└──────────────────────────────────────────────┘
```

---

## Error Handling

| Operation | Error Handling |
|-----------|---------------|
| Service call failure | MatSnackBar error message, 5000ms duration |
| Successful CRUD | MatSnackBar success message, 3000ms duration |
| Form validation failure | Inline mat-error messages on invalid fields |
| Quality inspection range violation | Form control validators (min/max) prevent submission |
| Reserve quantity > available | Service rejects with error, component shows snackbar |

---

## Key Business Rules

1. **Stock invariant:** `availableQuantity = quantity - reservedQuantity - exportedQuantity`
2. **Auto-ESGOTADO:** When `availableQuantity` reaches 0, lot status automatically transitions to `ESGOTADO`
3. **Block precondition:** Only lots with status `DISPONÍVEL` can be blocked
4. **Unblock precondition:** Only lots with status `BLOQUEADO` can be unblocked
5. **Reserve precondition:** Only lots with status `DISPONÍVEL` can be reserved; reservation quantity must be <= `availableQuantity`
6. **Movement immutability:** Movement history entries are append-only, never modified or deleted
7. **Movement ordering:** Movement history is always displayed in reverse chronological order

---

## Route Configuration

Added to `app.routes.ts` under `home-logged` children, before the `**` wildcard:

```typescript
{
  path: 'lotes/controle',
  loadComponent: () =>
    import('./components/lotes/lotes-controle/lotes-controle.component')
      .then((m) => m.LotesControleComponent),
},
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: KPI Aggregation Correctness

*For any* set of lots, the KPI metrics SHALL satisfy:
- `totalAvailableQty` equals the sum of `quantity` for all lots where `status === 'DISPONÍVEL'`
- `blockedCount` equals the count of lots where `status === 'BLOQUEADO'`
- `expiringSoonCount` equals the count of lots where `expiryDate` is within 30 days of today
- `avgAIScore` equals the arithmetic mean of `aiScore` across all lots

When filters are active, the KPIs SHALL be recalculated on the filtered subset only.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

### Property 2: Status and Score Color Mapping

*For any* `LoteStatus` value, the status color mapping function SHALL return a valid Material color string. *For any* AI score in the range [0, 100], the score color mapping SHALL return `'green'` if score >= 80, `'yellow'` if score >= 50 and < 80, and `'red'` if score < 50.

**Validates: Requirements 2.4, 2.5**

### Property 3: Combined Filter Correctness

*For any* combination of active filter criteria and any lot present in the filtered result set, that lot SHALL match ALL active filter criteria simultaneously (product, harvest, status, warehouse, country, expiry date range, AI score range).

**Validates: Requirements 3.8**

### Property 4: Global Search Field Matching

*For any* non-empty search term and any lot in the search result set, at least one of the following fields SHALL contain the search term (case-insensitive): loteNumber, productName, warehouseName, harvest, or destinationCountry.

**Validates: Requirements 4.3**

### Property 5: AI Suggestions Bounded and Well-Formed

*For any* lot, the AI insights SHALL produce between 0 and 3 export suggestions (inclusive). *For any* anomaly alert in the AI insights, it SHALL have a non-empty severity level and a non-empty description string.

**Validates: Requirements 6.2, 6.3**

### Property 6: Expiry Countdown Calculation

*For any* lot with a defined expiry date, the `daysToExpiry` value SHALL equal the integer difference in days between the lot's `expiryDate` and the current date.

**Validates: Requirements 6.4**

### Property 7: Lot Creation Persistence

*For any* valid lot creation payload, after the create operation completes, the lot list SHALL contain a new lot with matching product, harvest, warehouse, quantity, and expiry date, and the list length SHALL increase by exactly one.

**Validates: Requirements 7.2**

### Property 8: Lot Update Persistence

*For any* existing lot and valid update payload, after the update operation completes, querying the lot by its ID SHALL return the updated field values while preserving the original lot ID and creation timestamp.

**Validates: Requirements 7.4**

### Property 9: Status Transition with Audit Trail

*For any* valid status transition (block DISPONÍVEL→BLOQUEADO, unblock BLOQUEADO→DISPONÍVEL, reserve DISPONÍVEL→RESERVADO, or any operation creating a lot), the service SHALL:
1. Change the lot status to the target status
2. Append a new `StockMovement` record with the correct `movementType`, `fromStatus`, `toStatus`, and timestamp

**Validates: Requirements 7.5, 7.6, 7.7, 10.1, 10.2, 10.3**

### Property 10: Stock Calculation Invariant

*For any* lot at any point in time, the `availableQuantity` SHALL equal `quantity - reservedQuantity - exportedQuantity`. This invariant SHALL hold after any operation that modifies stock values.

**Validates: Requirements 8.2**

### Property 11: Auto-ESGOTADO Transition

*For any* lot where the available quantity reaches zero (through reservation or export), the lot status SHALL be automatically set to `ESGOTADO` and a corresponding movement record SHALL be created in the movement history.

**Validates: Requirements 8.3**

### Property 12: Reservation Deduction

*For any* lot with `status === 'DISPONÍVEL'` and a reservation quantity `q` where `0 < q <= availableQuantity`, after the reservation operation, the lot's `availableQuantity` SHALL equal the previous `availableQuantity - q`, and the `reservedQuantity` SHALL increase by `q`.

**Validates: Requirements 8.4**

### Property 13: Quality Inspection Persistence

*For any* valid quality inspection data submitted for a lot, after the save operation completes, querying quality inspections for that lot SHALL include the newly saved inspection with all field values matching the submitted data.

**Validates: Requirements 9.2**

### Property 14: Quality Inspection Validation Ranges

*For any* numeric input value outside the specified valid range (humidity: 0–100, pH: 0–14, temperature: -40 to 60), the quality inspection form SHALL reject the submission by marking the corresponding field as invalid.

**Validates: Requirements 9.4**

### Property 15: Movement History Ordering

*For any* lot's movement history, the entries SHALL be sorted in reverse chronological order — each entry's timestamp SHALL be greater than or equal to the subsequent entry's timestamp in the displayed list.

**Validates: Requirements 10.4**

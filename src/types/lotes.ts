// === STATUS TYPES ===
export type LoteStatus = 'DISPONÍVEL' | 'BLOQUEADO' | 'QUARENTENA' | 'EM_TRÂNSITO' | 'RESERVADO' | 'ESGOTADO';

export type MovementType = 'ENTRY' | 'BLOCK' | 'UNBLOCK' | 'RESERVE' | 'EXPORT' | 'TRANSFER' | 'STATUS_CHANGE';

// === MAIN LOT INTERFACE ===
export interface Lote {
  id: string;
  loteNumber: string;
  productName: string;
  productId: string;
  harvest: string;
  status: LoteStatus;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  reservedQuantity: number;
  exportedQuantity: number;
  availableQuantity: number;
  expiryDate: Date;
  physicalLocation: PhysicalLocation;
  aiScore: number;
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
  humidity: number;
  impurity: number;
  protein: number;
  pH: number;
  weight: number;
  temperature: number;
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
  score: number;
  exportSuggestions: ExportSuggestion[];
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

// === TIMELINE EVENT TYPES ===
export type TimelineEventType =
  'SAFRA' | 'FAZENDA' | 'COLHEITA' | 'RECEBIMENTO' | 'ARMAZEM' |
  'QUALIDADE' | 'CONTAINER' | 'PORTO' | 'NAVIO' | 'EXPORTACAO' | 'CLIENTE';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// === MAIN INTERFACES ===
export interface RastreabilidadeLote {
  id: string;
  loteNumber: string;
  productName: string;
  harvest: string;
  farmName: string;
  farmPlot: string;
  producerName: string;
  quantity: number;
  unit: string;
  productionDate: Date;
  currentStatus: string;
  currentLocation: string;
  destinationCountry: string;
  clientName: string;
  containerNumber: string;
  vesselName: string;
  invoiceNumber: string;
  dueNumber: string;
  bookingNumber: string;
  blNumber: string;
}

export interface TimelineEvent {
  id: string;
  loteId: string;
  eventType: TimelineEventType;
  title: string;
  description: string;
  date: Date;
  location: string;
  responsibleUser: string;
  documents: string[];
  observations: string;
  status: 'completed' | 'current' | 'pending';
}

export interface TraceDocument {
  id: string;
  loteId: string;
  documentType: string;
  documentNumber: string;
  issueDate: Date;
  expiryDate?: Date;
  status: 'valid' | 'expired' | 'pending';
  fileUrl?: string;
}

export interface AITraceInsights {
  loteId: string;
  reliabilityScore: number;       // 0-100
  traceabilityScore: number;      // 0-100 (how much chain is documented)
  regulatoryRisk: RiskLevel;
  alerts: TraceAlert[];
  insights: string[];
  executiveSummary: string;
  chainBreaks: ChainBreak[];
  complianceChecks: ComplianceCheck[];
}

export interface TraceAlert {
  severity: RiskLevel;
  message: string;
  detectedAt: Date;
}

export interface ChainBreak {
  fromEvent: string;
  toEvent: string;
  description: string;
  severity: RiskLevel;
}

export interface ComplianceCheck {
  country: string;
  requirement: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
}

export interface SupplyChainNode {
  id: string;
  type: TimelineEventType;
  label: string;
  sublabel: string;
  date: Date;
  status: 'completed' | 'current' | 'pending';
}

export interface RastreabilidadeFilters {
  searchText: string;
  harvest: string;
  farm: string;
  warehouse: string;
  container: string;
  vessel: string;
  destinationCountry: string;
  client: string;
  status: string;
}

export interface RastreabilidadeMetrics {
  totalLotes: number;
  lotesInTransit: number;
  lotesDelivered: number;
  avgTraceabilityScore: number;
  pendingDocuments: number;
  chainBreaksDetected: number;
}

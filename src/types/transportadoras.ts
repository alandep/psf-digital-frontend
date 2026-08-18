export type ModalType = 'RODOVIÁRIO' | 'FERROVIÁRIO' | 'MARÍTIMO' | 'FLUVIAL' | 'AÉREO' | 'MULTIMODAL';
export type CarrierStatus = 'ATIVA' | 'INATIVA' | 'SUSPENSA' | 'HOMOLOGAÇÃO';

export interface Transportadora {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  modalPrincipal: ModalType;
  country: string;
  state: string;
  city: string;
  address: string;
  commercialContact: string;
  phone: string;
  email: string;
  website: string;
  status: CarrierStatus;
  aiScore: number;
  avgSLA: number;
  overallRating: number;
  totalDeliveries: number;
  onTimeRate: number;
  costPerTon: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarrierService {
  id: string;
  carrierId: string;
  serviceName: string;
  capacity: string;
  coverage: string;
  restrictions: string;
  certifications: string[];
}

export interface CarrierCoverage {
  carrierId: string;
  states: string[];
  countries: string[];
  ports: string[];
  airports: string[];
  railTerminals: string[];
  frequentRoutes: FrequentRoute[];
}

export interface FrequentRoute {
  origin: string;
  destination: string;
  avgTime: number;
  avgCost: number;
  frequency: string;
}

export interface CarrierFleet {
  carrierId: string;
  vehicleCount: number;
  vehicleTypes: string[];
  totalCapacity: number;
  avgFleetAge: number;
  currentAvailability: number;
  specialEquipment: string[];
  trackingAvailable: boolean;
  technologies: string[];
}

export interface TrackingEvent {
  id: string;
  carrierId: string;
  shipmentId: string;
  timestamp: Date;
  latitude: number;
  longitude: number;
  speed: number;
  status: string;
  event: string;
  details: string;
}

export interface PerformanceIndicator {
  carrierId: string;
  punctuality: number;
  sla: number;
  avgDeliveryTime: number;
  damageRate: number;
  incidentRate: number;
  returnRate: number;
  avgResponseTime: number;
  nps: number | null;
  costPerTon: number;
  costPerKm: number;
}

export interface CarrierAIInsights {
  carrierId: string;
  score: number;
  bestCarrier: string;
  recommendedModal: ModalType;
  alerts: CarrierAlert[];
  suggestions: CarrierSuggestion[];
  ranking: CarrierRankItem[];
  executiveSummary: string;
}

export interface CarrierAlert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  detectedAt: Date;
}

export interface CarrierSuggestion {
  action: string;
  reason: string;
  criteria: string[];
  confidence: number;
  financialImpact: string;
  operationalImpact: string;
}

export interface CarrierRankItem {
  carrierName: string;
  score: number;
  cost: number;
  sla: number;
  availability: string;
}

export interface TransportSimulationRequest {
  origin: string;
  destination: string;
  product: string;
  quantity: number;
  modal: ModalType | '';
  incoterm: string;
  desiredDate: Date;
}

export interface TransportSimulationResult {
  bestCarrier: string;
  estimatedCost: number;
  estimatedTime: number;
  eta: Date;
  emissions: number;
  riskLevel: string;
  availability: string;
  ranking: CarrierRankItem[];
}

export interface TransportadoraFilters {
  searchText: string;
  modalPrincipal: ModalType | '';
  status: CarrierStatus | '';
  state: string;
  minScore: number | null;
  maxCostPerTon: number | null;
}

export interface TransportadoraMetrics {
  totalCarriers: number;
  activeCount: number;
  avgScore: number;
  avgSLA: number;
  avgCostPerTon: number;
  totalDeliveriesMonth: number;
}

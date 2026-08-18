export type PortType = 'MARÍTIMO' | 'FLUVIAL' | 'AÉREO' | 'FERROVIÁRIO' | 'MULTIMODAL';
export type OperationalStatus = 'OPERACIONAL' | 'PARCIAL' | 'CONGESTIONADO' | 'INOPERANTE' | 'MANUTENÇÃO';
export type CongestionLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Porto {
  id: string;
  name: string;
  unLocode: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  portType: PortType;
  operator: string;
  annualCapacity: number;
  operationalStatus: OperationalStatus;
  operatingHours: string;
  aiLogisticsScore: number;
  congestionLevel: CongestionLevel;
  lastUpdated: Date;
}

export interface PortInfrastructure {
  portId: string;
  berthCount: number;
  maxDraft: number;
  storageCapacity: number;
  siloCount: number;
  warehouseCount: number;
  containerYardCapacity: number;
  equipment: string[];
  dailyMovementCapacity: number;
  supportedModals: PortType[];
  customsServices: string[];
}

export interface OperationalIndicator {
  portId: string;
  congestionLevel: CongestionLevel;
  avgWaitTime: number;
  avgBerthingTime: number;
  avgClearanceTime: number;
  availableCapacity: number;
  dailyMovement: number;
  currentOccupancy: number;
  lastUpdated: Date;
}

export interface LogisticsRoute {
  id: string;
  portId: string;
  origin: string;
  destination: string;
  segments: RouteSegment[];
  totalDistance: number;
  estimatedTime: number;
  estimatedCost: number;
  estimatedEmissions: number;
  risks: string[];
}

export interface RouteSegment {
  mode: string;
  from: string;
  to: string;
  distance: number;
  time: number;
  cost: number;
}

export interface PortShipment {
  id: string;
  portId: string;
  bookingNumber: string;
  exportNumber: string;
  containerNumber: string;
  vesselName: string;
  eta: Date;
  etd: Date;
  status: 'Programado' | 'Em Trânsito' | 'Atracado' | 'Descarregado' | 'Liberado';
}

export interface PortAIInsights {
  portId: string;
  logisticsScore: number;
  recommendedPort: string;
  recommendedModal: string;
  alerts: PortAlert[];
  suggestions: PortSuggestion[];
  portRanking: PortRankItem[];
  executiveSummary: string;
}

export interface PortAlert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  detectedAt: Date;
}

export interface PortSuggestion {
  action: string;
  reason: string;
  criteria: string[];
  confidence: number;
  estimatedImpact: string;
}

export interface PortRankItem {
  portName: string;
  score: number;
  cost: number;
  time: number;
  congestion: CongestionLevel;
}

export interface SimulationRequest {
  product: string;
  quantity: number;
  origin: string;
  destination: string;
  incoterm: string;
  date: Date;
}

export interface SimulationResult {
  bestPort: string;
  bestRoute: string;
  estimatedCost: number;
  estimatedTime: number;
  eta: Date;
  riskLevel: string;
  emissions: number;
  alternatives: SimulationAlternative[];
}

export interface SimulationAlternative {
  port: string;
  route: string;
  cost: number;
  time: number;
  risk: string;
}

export interface PortFilters {
  searchText: string;
  country: string;
  portType: PortType | '';
  operationalStatus: OperationalStatus | '';
  congestionLevel: CongestionLevel | '';
}

export interface PortMetrics {
  totalPorts: number;
  operationalCount: number;
  congestedCount: number;
  avgLogisticsScore: number;
  activeShipments: number;
}

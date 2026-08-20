export type EsgRating = 'A' | 'B' | 'C' | 'D' | 'E';
export type CertificationType = 'ORGANIC' | 'FAIR_TRADE' | 'RAINFOREST_ALLIANCE' | 'CARBON_NEUTRAL';
export type TraceabilityStatus = 'FULL' | 'PARTIAL' | 'NONE';

export interface EsgOperation {
  id: string;
  exportId: string;
  product: string;
  destination: string;
  carbonFootprint: number;
  traceabilityStatus: TraceabilityStatus;
  certifications: string[];
  esgRating: EsgRating;
  productionEmissions: number;
  transportEmissions: number;
  processingEmissions: number;
  packagingEmissions: number;
}

export interface EsgCertification {
  id: string;
  type: CertificationType;
  issuer: string;
  validFrom: Date;
  validUntil: Date;
  certificateNumber: string;
  operationId: string;
}

export interface EsgMetrics {
  totalCarbonFootprint: number;
  operationsWithTraceability: number;
  totalOperations: number;
  activeCertifications: number;
  esgScore: number;
  avgRating: string;
}

export interface EsgFilters {
  searchText: string;
  rating: EsgRating | '';
  traceability: TraceabilityStatus | '';
  certification: CertificationType | '';
}

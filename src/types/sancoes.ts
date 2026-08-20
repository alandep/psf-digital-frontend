export type SanctionListType = 'OFAC_SDN' | 'EU_SANCTIONS' | 'UN_SANCTIONS' | 'UK_SANCTIONS' | 'BR_COAF';
export type EntityType = 'PESSOA_FISICA' | 'PESSOA_JURIDICA' | 'EMBARCACAO' | 'AERONAVE';
export type ScreeningStatus = 'CLEAR' | 'POTENTIAL_MATCH' | 'CONFIRMED_MATCH' | 'FALSE_POSITIVE' | 'UNDER_REVIEW';

export interface SanctionEntity {
  id: string;
  entityName: string;
  entityType: EntityType;
  listMatched: SanctionListType;
  matchConfidence: number;
  status: ScreeningStatus;
  lastChecked: Date;
  country: string;
  aliases: string[];
  reason: string;
  addedDate: Date;
  reviewedBy: string;
  notes: string;
}

export interface SanctionList {
  id: string;
  name: string;
  type: SanctionListType;
  totalEntities: number;
  lastUpdate: Date;
  isActive: boolean;
}

export interface SancoesMetrics {
  entidadesMonitoradas: number;
  matchesEncontrados: number;
  listasAtivas: number;
  ultimaVerificacao: Date;
}

export interface SancoesFilters {
  searchText: string;
  listType: SanctionListType | '';
  status: ScreeningStatus | '';
  entityType: EntityType | '';
}

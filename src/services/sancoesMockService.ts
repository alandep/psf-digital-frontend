import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  SanctionEntity, SanctionList, SanctionListType, EntityType,
  ScreeningStatus, SancoesMetrics, SancoesFilters
} from '../types/sancoes';

@Injectable({ providedIn: 'root' })
export class SancoesMockService {

  private entities: SanctionEntity[] = this.generateEntities();
  private lists: SanctionList[] = this.generateLists();

  getEntities(filters?: SancoesFilters): Observable<SanctionEntity[]> {
    let result = [...this.entities];
    if (filters) {
      if (filters.searchText) {
        const s = filters.searchText.toLowerCase();
        result = result.filter(e =>
          e.entityName.toLowerCase().includes(s) ||
          e.country.toLowerCase().includes(s) ||
          e.reason.toLowerCase().includes(s)
        );
      }
      if (filters.listType) result = result.filter(e => e.listMatched === filters.listType);
      if (filters.status) result = result.filter(e => e.status === filters.status);
      if (filters.entityType) result = result.filter(e => e.entityType === filters.entityType);
    }
    return of(result).pipe(delay(400));
  }

  getLists(): Observable<SanctionList[]> {
    return of(this.lists).pipe(delay(200));
  }

  getMetrics(): Observable<SancoesMetrics> {
    const metrics: SancoesMetrics = {
      entidadesMonitoradas: this.entities.length,
      matchesEncontrados: this.entities.filter(e => e.status === 'POTENTIAL_MATCH' || e.status === 'CONFIRMED_MATCH').length,
      listasAtivas: this.lists.filter(l => l.isActive).length,
      ultimaVerificacao: new Date(),
    };
    return of(metrics).pipe(delay(200));
  }

  runScreening(entityName: string): Observable<SanctionEntity[]> {
    const matches = this.entities.filter(e =>
      e.entityName.toLowerCase().includes(entityName.toLowerCase())
    );
    return of(matches).pipe(delay(800));
  }

  getListTypes(): { value: SanctionListType; label: string }[] {
    return [
      { value: 'OFAC_SDN', label: 'OFAC SDN' },
      { value: 'EU_SANCTIONS', label: 'EU Sanctions' },
      { value: 'UN_SANCTIONS', label: 'UN Sanctions' },
      { value: 'UK_SANCTIONS', label: 'UK Sanctions' },
      { value: 'BR_COAF', label: 'BR COAF' },
    ];
  }

  getEntityTypes(): { value: EntityType; label: string }[] {
    return [
      { value: 'PESSOA_FISICA', label: 'Pessoa Física' },
      { value: 'PESSOA_JURIDICA', label: 'Pessoa Jurídica' },
      { value: 'EMBARCACAO', label: 'Embarcação' },
      { value: 'AERONAVE', label: 'Aeronave' },
    ];
  }

  getStatuses(): { value: ScreeningStatus; label: string }[] {
    return [
      { value: 'CLEAR', label: 'Limpo' },
      { value: 'POTENTIAL_MATCH', label: 'Match Potencial' },
      { value: 'CONFIRMED_MATCH', label: 'Match Confirmado' },
      { value: 'FALSE_POSITIVE', label: 'Falso Positivo' },
      { value: 'UNDER_REVIEW', label: 'Em Análise' },
    ];
  }

  private generateEntities(): SanctionEntity[] {
    const entities: Partial<SanctionEntity>[] = [
      { entityName: 'Al-Rashid Trading Co.', entityType: 'PESSOA_JURIDICA', listMatched: 'OFAC_SDN', matchConfidence: 92, status: 'CONFIRMED_MATCH', country: 'Irã', reason: 'Proliferação nuclear' },
      { entityName: 'Viktor Petrov', entityType: 'PESSOA_FISICA', listMatched: 'EU_SANCTIONS', matchConfidence: 87, status: 'POTENTIAL_MATCH', country: 'Rússia', reason: 'Conflito armado' },
      { entityName: 'Sunrise Shipping Ltd', entityType: 'PESSOA_JURIDICA', listMatched: 'UN_SANCTIONS', matchConfidence: 76, status: 'UNDER_REVIEW', country: 'Coreia do Norte', reason: 'Evasão de sanções' },
      { entityName: 'Ahmed Al-Fayed', entityType: 'PESSOA_FISICA', listMatched: 'UK_SANCTIONS', matchConfidence: 65, status: 'FALSE_POSITIVE', country: 'Egito', reason: 'Financiamento terrorismo' },
      { entityName: 'Global Arms Corp', entityType: 'PESSOA_JURIDICA', listMatched: 'OFAC_SDN', matchConfidence: 95, status: 'CONFIRMED_MATCH', country: 'Síria', reason: 'Tráfico de armas' },
      { entityName: 'MV Dark Horizon', entityType: 'EMBARCACAO', listMatched: 'UN_SANCTIONS', matchConfidence: 88, status: 'CONFIRMED_MATCH', country: 'Desconhecido', reason: 'Transporte ilegal' },
      { entityName: 'Chen Wei Technologies', entityType: 'PESSOA_JURIDICA', listMatched: 'OFAC_SDN', matchConfidence: 71, status: 'POTENTIAL_MATCH', country: 'China', reason: 'Transferência tecnológica' },
      { entityName: 'Hassan Oil Trading', entityType: 'PESSOA_JURIDICA', listMatched: 'EU_SANCTIONS', matchConfidence: 83, status: 'UNDER_REVIEW', country: 'Venezuela', reason: 'Setor energético' },
      { entityName: 'Sergei Ivanov', entityType: 'PESSOA_FISICA', listMatched: 'UK_SANCTIONS', matchConfidence: 69, status: 'POTENTIAL_MATCH', country: 'Rússia', reason: 'Oligarca designado' },
      { entityName: 'Pacific Star Airlines', entityType: 'AERONAVE', listMatched: 'UN_SANCTIONS', matchConfidence: 56, status: 'FALSE_POSITIVE', country: 'Myanmar', reason: 'Regime militar' },
      { entityName: 'Banco del Sur S.A.', entityType: 'PESSOA_JURIDICA', listMatched: 'BR_COAF', matchConfidence: 78, status: 'UNDER_REVIEW', country: 'Paraguai', reason: 'Lavagem de dinheiro' },
      { entityName: 'Omar Trading Group', entityType: 'PESSOA_JURIDICA', listMatched: 'OFAC_SDN', matchConfidence: 91, status: 'CONFIRMED_MATCH', country: 'Sudão', reason: 'Conflito Darfur' },
      { entityName: 'Li Xing Minerals', entityType: 'PESSOA_JURIDICA', listMatched: 'EU_SANCTIONS', matchConfidence: 62, status: 'CLEAR', country: 'China', reason: 'Minerais de conflito' },
      { entityName: 'Dmitri Volkov', entityType: 'PESSOA_FISICA', listMatched: 'UK_SANCTIONS', matchConfidence: 85, status: 'POTENTIAL_MATCH', country: 'Rússia', reason: 'Energia e defesa' },
      { entityName: 'Caspian Logistics LLC', entityType: 'PESSOA_JURIDICA', listMatched: 'BR_COAF', matchConfidence: 73, status: 'UNDER_REVIEW', country: 'Turquemenistão', reason: 'Operações suspeitas' },
      { entityName: 'Abdelrahman Exports', entityType: 'PESSOA_JURIDICA', listMatched: 'OFAC_SDN', matchConfidence: 80, status: 'POTENTIAL_MATCH', country: 'Líbia', reason: 'Regime designado' },
    ];

    return entities.map((e, i) => ({
      id: `sanction-${String(i + 1).padStart(3, '0')}`,
      entityName: e.entityName!,
      entityType: e.entityType!,
      listMatched: e.listMatched!,
      matchConfidence: e.matchConfidence!,
      status: e.status!,
      lastChecked: new Date(2025, 5, Math.floor(Math.random() * 28) + 1),
      country: e.country!,
      aliases: [`Alias ${i + 1}A`, `Alias ${i + 1}B`],
      reason: e.reason!,
      addedDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      reviewedBy: i % 3 === 0 ? 'compliance@empresa.com' : '',
      notes: i % 4 === 0 ? 'Aguardando documentação adicional' : '',
    } as SanctionEntity));
  }

  private generateLists(): SanctionList[] {
    return [
      { id: 'list-001', name: 'OFAC SDN List', type: 'OFAC_SDN', totalEntities: 12847, lastUpdate: new Date(2025, 5, 20), isActive: true },
      { id: 'list-002', name: 'EU Consolidated Sanctions', type: 'EU_SANCTIONS', totalEntities: 8932, lastUpdate: new Date(2025, 5, 18), isActive: true },
      { id: 'list-003', name: 'UN Security Council Sanctions', type: 'UN_SANCTIONS', totalEntities: 3456, lastUpdate: new Date(2025, 5, 15), isActive: true },
      { id: 'list-004', name: 'UK OFSI Sanctions List', type: 'UK_SANCTIONS', totalEntities: 5621, lastUpdate: new Date(2025, 5, 22), isActive: true },
      { id: 'list-005', name: 'COAF - Lista Nacional', type: 'BR_COAF', totalEntities: 1893, lastUpdate: new Date(2025, 5, 19), isActive: true },
    ];
  }
}

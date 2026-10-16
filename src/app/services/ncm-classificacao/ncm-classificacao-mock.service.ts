import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { INcmClassificacaoService } from './ncm-classificacao-service.interface';
import { NcmClassificacaoApi, SalvarNcmClassificacao, NcmValidacaoResult } from '../../../types/ncm-classificacao-api';

/**
 * Adapter demo-safe para classificações NCM. Mantém uma lista em memória
 * semeada com commodities agrícolas realistas e simula latência de rede. Ativo
 * quando `realApis.export === false`; nenhuma chamada ao backend é feita.
 */
@Injectable({ providedIn: 'root' })
export class NcmClassificacaoMockAdapter implements INcmClassificacaoService {
  private readonly items: NcmClassificacaoApi[] = [
    {
      id: 'ncm-0001',
      productId: 'prod-0001',
      productName: 'Soja em Grão',
      productCode: 'SOJA-001',
      productDescription: 'Soja em grão a granel para exportação',
      scientificName: 'Glycine max',
      commodityType: 'Grãos',
      originCountry: 'Brasil',
      ncmCode: '1201.90.00',
      ncmDescription: 'Soja, mesmo triturada, exceto para semeadura',
      hsCode: '120190',
      hsDescription: 'Soybeans, whether or not broken',
      exportTax: 0,
      exportLicenseRequired: false,
      exportLicenseType: '',
      lpcoRequired: false,
      lpcoType: '',
      requiresInspection: true,
      inspectionAgency: 'MAPA',
      exportRestriction: false,
      restrictionDescription: '',
      aiSuggestedNcm: '1201.90.00',
      aiConfidenceScore: 0.97,
      aiClassificationReason: 'Descrição compatível com soja em grão a granel.',
      aiRequiresHumanReview: false,
      aiClassificationStatus: 'COMPLETED',
      complianceStatus: 'COMPLIANT',
      classificationSource: 'AI',
      approvalStatus: 'APPROVED',
      createdBy: 'usuario-demo',
      createdAt: '2024-01-10T12:00:00.000Z',
      updatedAt: '2024-01-10T12:00:00.000Z'
    },
    {
      id: 'ncm-0002',
      productId: 'prod-0002',
      productName: 'Milho',
      productCode: 'MILHO-001',
      productDescription: 'Milho em grão a granel para exportação',
      scientificName: 'Zea mays',
      commodityType: 'Grãos',
      originCountry: 'Brasil',
      ncmCode: '1005.90.10',
      ncmDescription: 'Milho em grão, exceto para semeadura',
      hsCode: '100590',
      hsDescription: 'Maize (corn), other than seed',
      exportTax: 0,
      exportLicenseRequired: false,
      exportLicenseType: '',
      lpcoRequired: false,
      lpcoType: '',
      requiresInspection: true,
      inspectionAgency: 'MAPA',
      exportRestriction: false,
      restrictionDescription: '',
      aiSuggestedNcm: '1005.90.10',
      aiConfidenceScore: 0.94,
      aiClassificationReason: 'Descrição compatível com milho em grão a granel.',
      aiRequiresHumanReview: false,
      aiClassificationStatus: 'COMPLETED',
      complianceStatus: 'COMPLIANT',
      classificationSource: 'AI',
      approvalStatus: 'APPROVED',
      createdBy: 'usuario-demo',
      createdAt: '2024-01-11T12:00:00.000Z',
      updatedAt: '2024-01-11T12:00:00.000Z'
    }
  ];

  listar(): Observable<NcmClassificacaoApi[]> {
    return of([...this.items]).pipe(delay(300));
  }

  salvar(payload: SalvarNcmClassificacao): Observable<NcmClassificacaoApi> {
    const now = new Date().toISOString();
    if (payload.id) {
      const idx = this.items.findIndex(i => i.id === payload.id);
      if (idx >= 0) {
        const updated: NcmClassificacaoApi = {
          ...this.items[idx],
          ...payload,
          id: payload.id,
          updatedAt: now
        };
        this.items[idx] = updated;
        return of(updated).pipe(delay(300));
      }
    }
    const created: NcmClassificacaoApi = {
      ...payload,
      id: 'ncm-' + Date.now(),
      createdBy: 'usuario-demo',
      createdAt: now,
      updatedAt: now
    };
    this.items.push(created);
    return of(created).pipe(delay(300));
  }

  validarNcm(ncmCode: string, productDescription?: string): Observable<NcmValidacaoResult> {
    return of({
      ncmCode,
      formatValid: /^\d{4}\.?\d{2}\.?\d{2}$/.test(ncmCode),
      notes: 'Validação simulada (mock).',
      source: 'MOCK'
    }).pipe(delay(300));
  }
}

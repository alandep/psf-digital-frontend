import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  EsgOperation,
  EsgCertification,
  EsgMetrics,
  EsgRating,
  CertificationType,
  TraceabilityStatus,
  EsgFilters
} from '../types/esg';

@Injectable({ providedIn: 'root' })
export class EsgMockService {

  private mockOperations: EsgOperation[] = [
    {
      id: 'ESG-001', exportId: 'EXP-2024-001', product: 'Soja em Grãos', destination: 'China',
      carbonFootprint: 1250, traceabilityStatus: 'FULL', certifications: ['ORGANIC', 'CARBON_NEUTRAL'],
      esgRating: 'A', productionEmissions: 500, transportEmissions: 437, processingEmissions: 188, packagingEmissions: 125
    },
    {
      id: 'ESG-002', exportId: 'EXP-2024-002', product: 'Café Arábica', destination: 'Alemanha',
      carbonFootprint: 890, traceabilityStatus: 'FULL', certifications: ['FAIR_TRADE', 'RAINFOREST_ALLIANCE'],
      esgRating: 'A', productionEmissions: 356, transportEmissions: 311, processingEmissions: 134, packagingEmissions: 89
    },
    {
      id: 'ESG-003', exportId: 'EXP-2024-003', product: 'Carne Bovina', destination: 'Arábia Saudita',
      carbonFootprint: 3200, traceabilityStatus: 'PARTIAL', certifications: [],
      esgRating: 'D', productionEmissions: 1280, transportEmissions: 1120, processingEmissions: 480, packagingEmissions: 320
    },
    {
      id: 'ESG-004', exportId: 'EXP-2024-004', product: 'Açúcar Cristal', destination: 'EUA',
      carbonFootprint: 1100, traceabilityStatus: 'FULL', certifications: ['ORGANIC'],
      esgRating: 'B', productionEmissions: 440, transportEmissions: 385, processingEmissions: 165, packagingEmissions: 110
    },
    {
      id: 'ESG-005', exportId: 'EXP-2024-005', product: 'Milho', destination: 'Japão',
      carbonFootprint: 1500, traceabilityStatus: 'PARTIAL', certifications: [],
      esgRating: 'C', productionEmissions: 600, transportEmissions: 525, processingEmissions: 225, packagingEmissions: 150
    },
    {
      id: 'ESG-006', exportId: 'EXP-2024-006', product: 'Soja em Grãos', destination: 'Holanda',
      carbonFootprint: 1180, traceabilityStatus: 'FULL', certifications: ['CARBON_NEUTRAL'],
      esgRating: 'B', productionEmissions: 472, transportEmissions: 413, processingEmissions: 177, packagingEmissions: 118
    },
    {
      id: 'ESG-007', exportId: 'EXP-2024-007', product: 'Algodão', destination: 'Bangladesh',
      carbonFootprint: 2100, traceabilityStatus: 'NONE', certifications: [],
      esgRating: 'E', productionEmissions: 840, transportEmissions: 735, processingEmissions: 315, packagingEmissions: 210
    },
    {
      id: 'ESG-008', exportId: 'EXP-2024-008', product: 'Café Robusta', destination: 'Itália',
      carbonFootprint: 780, traceabilityStatus: 'FULL', certifications: ['FAIR_TRADE', 'ORGANIC'],
      esgRating: 'A', productionEmissions: 312, transportEmissions: 273, processingEmissions: 117, packagingEmissions: 78
    },
    {
      id: 'ESG-009', exportId: 'EXP-2024-009', product: 'Frango Congelado', destination: 'África do Sul',
      carbonFootprint: 1800, traceabilityStatus: 'PARTIAL', certifications: [],
      esgRating: 'C', productionEmissions: 720, transportEmissions: 630, processingEmissions: 270, packagingEmissions: 180
    },
    {
      id: 'ESG-010', exportId: 'EXP-2024-010', product: 'Etanol', destination: 'Coreia do Sul',
      carbonFootprint: 650, traceabilityStatus: 'FULL', certifications: ['CARBON_NEUTRAL'],
      esgRating: 'A', productionEmissions: 260, transportEmissions: 228, processingEmissions: 97, packagingEmissions: 65
    },
    {
      id: 'ESG-011', exportId: 'EXP-2024-011', product: 'Suco de Laranja', destination: 'EUA',
      carbonFootprint: 920, traceabilityStatus: 'FULL', certifications: ['ORGANIC'],
      esgRating: 'B', productionEmissions: 368, transportEmissions: 322, processingEmissions: 138, packagingEmissions: 92
    },
    {
      id: 'ESG-012', exportId: 'EXP-2024-012', product: 'Tabaco', destination: 'Bélgica',
      carbonFootprint: 2800, traceabilityStatus: 'NONE', certifications: [],
      esgRating: 'E', productionEmissions: 1120, transportEmissions: 980, processingEmissions: 420, packagingEmissions: 280
    },
    {
      id: 'ESG-013', exportId: 'EXP-2024-013', product: 'Celulose', destination: 'China',
      carbonFootprint: 1950, traceabilityStatus: 'PARTIAL', certifications: ['RAINFOREST_ALLIANCE'],
      esgRating: 'C', productionEmissions: 780, transportEmissions: 682, processingEmissions: 293, packagingEmissions: 195
    },
    {
      id: 'ESG-014', exportId: 'EXP-2024-014', product: 'Cacau', destination: 'Suíça',
      carbonFootprint: 720, traceabilityStatus: 'FULL', certifications: ['FAIR_TRADE', 'ORGANIC', 'RAINFOREST_ALLIANCE'],
      esgRating: 'A', productionEmissions: 288, transportEmissions: 252, processingEmissions: 108, packagingEmissions: 72
    },
    {
      id: 'ESG-015', exportId: 'EXP-2024-015', product: 'Minério de Ferro', destination: 'China',
      carbonFootprint: 4500, traceabilityStatus: 'PARTIAL', certifications: [],
      esgRating: 'E', productionEmissions: 1800, transportEmissions: 1575, processingEmissions: 675, packagingEmissions: 450
    },
    {
      id: 'ESG-016', exportId: 'EXP-2024-016', product: 'Manga', destination: 'Portugal',
      carbonFootprint: 580, traceabilityStatus: 'FULL', certifications: ['ORGANIC'],
      esgRating: 'A', productionEmissions: 232, transportEmissions: 203, processingEmissions: 87, packagingEmissions: 58
    },
    {
      id: 'ESG-017', exportId: 'EXP-2024-017', product: 'Couro Bovino', destination: 'Itália',
      carbonFootprint: 2400, traceabilityStatus: 'NONE', certifications: [],
      esgRating: 'D', productionEmissions: 960, transportEmissions: 840, processingEmissions: 360, packagingEmissions: 240
    },
    {
      id: 'ESG-018', exportId: 'EXP-2024-018', product: 'Amendoim', destination: 'Holanda',
      carbonFootprint: 850, traceabilityStatus: 'FULL', certifications: ['ORGANIC', 'FAIR_TRADE'],
      esgRating: 'B', productionEmissions: 340, transportEmissions: 298, processingEmissions: 127, packagingEmissions: 85
    }
  ];

  private mockCertifications: EsgCertification[] = [
    { id: 'CERT-001', type: 'ORGANIC', issuer: 'IBD Certificações', validFrom: new Date('2024-01-01'), validUntil: new Date('2025-01-01'), certificateNumber: 'ORG-2024-001', operationId: 'ESG-001' },
    { id: 'CERT-002', type: 'CARBON_NEUTRAL', issuer: 'Verra', validFrom: new Date('2024-03-01'), validUntil: new Date('2025-03-01'), certificateNumber: 'CN-2024-001', operationId: 'ESG-001' },
    { id: 'CERT-003', type: 'FAIR_TRADE', issuer: 'Fairtrade International', validFrom: new Date('2024-02-01'), validUntil: new Date('2025-02-01'), certificateNumber: 'FT-2024-001', operationId: 'ESG-002' },
    { id: 'CERT-004', type: 'RAINFOREST_ALLIANCE', issuer: 'Rainforest Alliance', validFrom: new Date('2024-01-15'), validUntil: new Date('2025-01-15'), certificateNumber: 'RA-2024-001', operationId: 'ESG-002' },
    { id: 'CERT-005', type: 'ORGANIC', issuer: 'IBD Certificações', validFrom: new Date('2024-04-01'), validUntil: new Date('2025-04-01'), certificateNumber: 'ORG-2024-002', operationId: 'ESG-004' },
    { id: 'CERT-006', type: 'CARBON_NEUTRAL', issuer: 'Gold Standard', validFrom: new Date('2024-05-01'), validUntil: new Date('2025-05-01'), certificateNumber: 'CN-2024-002', operationId: 'ESG-006' },
    { id: 'CERT-007', type: 'FAIR_TRADE', issuer: 'Fairtrade International', validFrom: new Date('2024-03-01'), validUntil: new Date('2025-03-01'), certificateNumber: 'FT-2024-002', operationId: 'ESG-008' },
    { id: 'CERT-008', type: 'ORGANIC', issuer: 'Ecocert', validFrom: new Date('2024-06-01'), validUntil: new Date('2025-06-01'), certificateNumber: 'ORG-2024-003', operationId: 'ESG-008' },
    { id: 'CERT-009', type: 'CARBON_NEUTRAL', issuer: 'Verra', validFrom: new Date('2024-07-01'), validUntil: new Date('2025-07-01'), certificateNumber: 'CN-2024-003', operationId: 'ESG-010' },
    { id: 'CERT-010', type: 'ORGANIC', issuer: 'IBD Certificações', validFrom: new Date('2024-02-15'), validUntil: new Date('2025-02-15'), certificateNumber: 'ORG-2024-004', operationId: 'ESG-011' },
    { id: 'CERT-011', type: 'RAINFOREST_ALLIANCE', issuer: 'Rainforest Alliance', validFrom: new Date('2024-04-15'), validUntil: new Date('2025-04-15'), certificateNumber: 'RA-2024-002', operationId: 'ESG-013' },
    { id: 'CERT-012', type: 'FAIR_TRADE', issuer: 'Fairtrade International', validFrom: new Date('2024-01-01'), validUntil: new Date('2025-01-01'), certificateNumber: 'FT-2024-003', operationId: 'ESG-014' },
    { id: 'CERT-013', type: 'ORGANIC', issuer: 'Ecocert', validFrom: new Date('2024-01-01'), validUntil: new Date('2025-01-01'), certificateNumber: 'ORG-2024-005', operationId: 'ESG-014' },
    { id: 'CERT-014', type: 'RAINFOREST_ALLIANCE', issuer: 'Rainforest Alliance', validFrom: new Date('2024-01-01'), validUntil: new Date('2025-01-01'), certificateNumber: 'RA-2024-003', operationId: 'ESG-014' },
    { id: 'CERT-015', type: 'ORGANIC', issuer: 'IBD Certificações', validFrom: new Date('2024-08-01'), validUntil: new Date('2025-08-01'), certificateNumber: 'ORG-2024-006', operationId: 'ESG-016' },
    { id: 'CERT-016', type: 'ORGANIC', issuer: 'Ecocert', validFrom: new Date('2024-05-15'), validUntil: new Date('2025-05-15'), certificateNumber: 'ORG-2024-007', operationId: 'ESG-018' },
    { id: 'CERT-017', type: 'FAIR_TRADE', issuer: 'Fairtrade International', validFrom: new Date('2024-05-15'), validUntil: new Date('2025-05-15'), certificateNumber: 'FT-2024-004', operationId: 'ESG-018' }
  ];

  getOperations(filters?: EsgFilters): Observable<EsgOperation[]> {
    let filtered = [...this.mockOperations];

    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        filtered = filtered.filter(o =>
          o.product.toLowerCase().includes(search) ||
          o.destination.toLowerCase().includes(search) ||
          o.exportId.toLowerCase().includes(search)
        );
      }
      if (filters.rating) {
        filtered = filtered.filter(o => o.esgRating === filters.rating);
      }
      if (filters.traceability) {
        filtered = filtered.filter(o => o.traceabilityStatus === filters.traceability);
      }
      if (filters.certification) {
        filtered = filtered.filter(o => o.certifications.includes(filters.certification!));
      }
    }

    return of(filtered).pipe(delay(300));
  }

  getCertifications(): Observable<EsgCertification[]> {
    return of(this.mockCertifications).pipe(delay(200));
  }

  createCertification(data: Partial<EsgCertification>): Observable<EsgCertification> {
    const newCert: EsgCertification = {
      id: `CERT-${String(this.mockCertifications.length + 1).padStart(3, '0')}`,
      type: data.type || 'ORGANIC',
      issuer: data.issuer || '',
      validFrom: data.validFrom || new Date(),
      validUntil: data.validUntil || new Date(),
      certificateNumber: data.certificateNumber || '',
      operationId: data.operationId || ''
    };
    this.mockCertifications.push(newCert);
    return of(newCert).pipe(delay(500));
  }

  getMetrics(): Observable<EsgMetrics> {
    const totalCarbon = this.mockOperations.reduce((sum, o) => sum + o.carbonFootprint, 0);
    const withTraceability = this.mockOperations.filter(o => o.traceabilityStatus === 'FULL').length;
    const activeCerts = this.mockCertifications.filter(c => new Date(c.validUntil) > new Date()).length;

    const ratingValues: Record<EsgRating, number> = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1 };
    const avgRatingValue = this.mockOperations.reduce((sum, o) => sum + ratingValues[o.esgRating], 0) / this.mockOperations.length;
    const avgRating = avgRatingValue >= 4.5 ? 'A' : avgRatingValue >= 3.5 ? 'B' : avgRatingValue >= 2.5 ? 'C' : avgRatingValue >= 1.5 ? 'D' : 'E';

    const esgScore = Math.round((withTraceability / this.mockOperations.length) * 40 + (activeCerts / 20) * 30 + (1 - totalCarbon / (this.mockOperations.length * 5000)) * 30);

    const metrics: EsgMetrics = {
      totalCarbonFootprint: totalCarbon,
      operationsWithTraceability: withTraceability,
      totalOperations: this.mockOperations.length,
      activeCertifications: activeCerts,
      esgScore: Math.min(100, Math.max(0, esgScore)),
      avgRating
    };
    return of(metrics).pipe(delay(200));
  }

  getEmissionsBreakdown(): Observable<{ production: number; transport: number; processing: number; packaging: number }> {
    const totals = this.mockOperations.reduce((acc, o) => ({
      production: acc.production + o.productionEmissions,
      transport: acc.transport + o.transportEmissions,
      processing: acc.processing + o.processingEmissions,
      packaging: acc.packaging + o.packagingEmissions
    }), { production: 0, transport: 0, processing: 0, packaging: 0 });

    const total = totals.production + totals.transport + totals.processing + totals.packaging;
    return of({
      production: Math.round((totals.production / total) * 100),
      transport: Math.round((totals.transport / total) * 100),
      processing: Math.round((totals.processing / total) * 100),
      packaging: Math.round((totals.packaging / total) * 100)
    }).pipe(delay(200));
  }
}

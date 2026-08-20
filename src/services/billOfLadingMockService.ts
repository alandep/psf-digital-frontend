import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { BillOfLading, BLType, BLStatus, BLMetrics, BLFilters } from '../types/bill-of-lading';

@Injectable({ providedIn: 'root' })
export class BillOfLadingMockService {

  private bls: BillOfLading[] = this.generateBLs();

  getBillsOfLading(filters?: BLFilters): Observable<BillOfLading[]> {
    let result = [...this.bls];
    if (filters) {
      if (filters.searchText) {
        const s = filters.searchText.toLowerCase();
        result = result.filter(bl =>
          bl.blNumber.toLowerCase().includes(s) ||
          bl.shipper.toLowerCase().includes(s) ||
          bl.consignee.toLowerCase().includes(s) ||
          bl.vessel.toLowerCase().includes(s)
        );
      }
      if (filters.type) result = result.filter(bl => bl.type === filters.type);
      if (filters.status) result = result.filter(bl => bl.status === filters.status);
      if (filters.dateStart) result = result.filter(bl => new Date(bl.issueDate) >= new Date(filters.dateStart!));
      if (filters.dateEnd) result = result.filter(bl => new Date(bl.issueDate) <= new Date(filters.dateEnd!));
    }
    return of(result).pipe(delay(400));
  }

  getBLById(id: string): Observable<BillOfLading | null> {
    return of(this.bls.find(bl => bl.id === id) || null).pipe(delay(200));
  }

  getMetrics(): Observable<BLMetrics> {
    const metrics: BLMetrics = {
      totalBLs: this.bls.length,
      emitidos: this.bls.filter(bl => bl.status === 'ISSUED').length,
      pendentes: this.bls.filter(bl => bl.status === 'DRAFT').length,
      surrendered: this.bls.filter(bl => bl.status === 'SURRENDERED').length,
    };
    return of(metrics).pipe(delay(200));
  }

  createBL(data: Partial<BillOfLading>): Observable<BillOfLading> {
    const newBL: BillOfLading = {
      id: `bl-${Date.now()}`,
      blNumber: `BL-2025-${String(this.bls.length + 1).padStart(5, '0')}`,
      type: data.type || 'OBL',
      shipper: data.shipper || '',
      consignee: data.consignee || '',
      notifyParty: data.notifyParty || '',
      vessel: data.vessel || '',
      voyage: data.voyage || '',
      portLoading: data.portLoading || '',
      portDischarge: data.portDischarge || '',
      placeDelivery: data.placeDelivery || '',
      containers: data.containers || [],
      description: data.description || '',
      grossWeight: data.grossWeight || 0,
      measurement: data.measurement || 0,
      freightTerms: data.freightTerms || 'PREPAID',
      status: 'DRAFT',
      issueDate: new Date(),
      shippedOnBoard: null,
      linkedExportId: data.linkedExportId || '',
      linkedInvoiceId: data.linkedInvoiceId || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin@empresa.com',
      observations: data.observations || '',
    };
    this.bls.unshift(newBL);
    return of(newBL).pipe(delay(500));
  }

  getTypes(): { value: BLType; label: string }[] {
    return [
      { value: 'OBL', label: 'Original Bill of Lading' },
      { value: 'SWB', label: 'Sea Waybill' },
      { value: 'TBL', label: 'Telex Release BL' },
    ];
  }

  getStatuses(): { value: BLStatus; label: string }[] {
    return [
      { value: 'DRAFT', label: 'Rascunho' },
      { value: 'ISSUED', label: 'Emitido' },
      { value: 'SURRENDERED', label: 'Surrendered' },
      { value: 'RELEASED', label: 'Liberado' },
    ];
  }

  private generateBLs(): BillOfLading[] {
    const shippers = [
      'Agro Export Brasil Ltda', 'Grãos do Sul S.A.', 'Tropical Foods Exportadora',
      'Cafés Premium Brasil Ltda', 'Minerais do Norte Ltda'
    ];
    const consignees = [
      'Global Grain Corp - USA', 'China Foods Import Co.', 'European Commodities GmbH',
      'Tokyo Trading Ltd - Japan', 'Arabia Foods Import LLC'
    ];
    const vessels = [
      'MV Star of Santos', 'MV Atlantic Pioneer', 'MV Pacific Horizon',
      'MV Nordic Spirit', 'MV Ocean Meridian', 'MV Southern Cross'
    ];
    const voyages = ['V-2025-001', 'V-2025-002', 'V-2025-003', 'V-2025-004', 'V-2025-005', 'V-2025-006'];
    const portsLoad = ['Santos', 'Paranaguá', 'Rio Grande', 'Vitória', 'Itajaí'];
    const portsDisch = ['Houston', 'Shanghai', 'Hamburg', 'Tokyo', 'Jeddah', 'Rotterdam'];
    const types: BLType[] = ['OBL', 'OBL', 'SWB', 'TBL', 'OBL', 'SWB'];
    const statuses: BLStatus[] = ['DRAFT', 'ISSUED', 'ISSUED', 'SURRENDERED', 'RELEASED', 'ISSUED', 'DRAFT', 'SURRENDERED', 'RELEASED', 'ISSUED', 'ISSUED', 'DRAFT'];

    return Array.from({ length: 14 }, (_, i) => {
      const containers = Array.from(
        { length: Math.floor(Math.random() * 5) + 1 },
        (_, j) => `MSKU${String(Math.floor(Math.random() * 9000000) + 1000000).padStart(7, '0')}`
      );

      return {
        id: `bl-${String(i + 1).padStart(3, '0')}`,
        blNumber: `BL-2025-${String(i + 1).padStart(5, '0')}`,
        type: types[i % types.length],
        shipper: shippers[i % shippers.length],
        consignee: consignees[i % consignees.length],
        notifyParty: consignees[(i + 1) % consignees.length],
        vessel: vessels[i % vessels.length],
        voyage: voyages[i % voyages.length],
        portLoading: portsLoad[i % portsLoad.length],
        portDischarge: portsDisch[i % portsDisch.length],
        placeDelivery: portsDisch[i % portsDisch.length],
        containers,
        description: `Commodities agrícolas - Lote ${i + 1}`,
        grossWeight: Math.round((Math.random() * 50000 + 10000) * 100) / 100,
        measurement: Math.round((Math.random() * 200 + 50) * 100) / 100,
        freightTerms: i % 3 === 0 ? 'COLLECT' : 'PREPAID',
        status: statuses[i % statuses.length],
        issueDate: new Date(2025, Math.floor(i / 3), (i % 28) + 1),
        shippedOnBoard: statuses[i % statuses.length] !== 'DRAFT' ? new Date(2025, Math.floor(i / 3), (i % 28) + 2) : null,
        linkedExportId: `exp-${String(i + 1).padStart(3, '0')}`,
        linkedInvoiceId: `inv-${String(i + 1).padStart(3, '0')}`,
        createdAt: new Date(2025, Math.floor(i / 3), (i % 28) + 1),
        updatedAt: new Date(2025, Math.floor(i / 3), (i % 28) + 3),
        createdBy: 'admin@empresa.com',
        observations: i % 4 === 0 ? 'Necessário endosso antes do desembarque' : '',
      } as BillOfLading;
    });
  }
}

import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  PackingList,
  PackingListItem,
  PackingListStatus,
  PackingListMetrics,
  PackingListFilters
} from '../types/packing-list';

@Injectable({ providedIn: 'root' })
export class PackingListMockService {

  private packingLists: PackingList[] = this.generatePackingLists();
  private itemsMap: Map<string, PackingListItem[]> = new Map();

  constructor() {
    this.packingLists.forEach(pl => {
      this.itemsMap.set(pl.id, this.generateItems(pl));
    });
  }

  getPackingLists(filters?: PackingListFilters): Observable<PackingList[]> {
    let result = [...this.packingLists];
    if (filters) {
      if (filters.searchText) {
        const s = filters.searchText.toLowerCase();
        result = result.filter(pl =>
          pl.packingListNumber.toLowerCase().includes(s) ||
          pl.linkedInvoice.toLowerCase().includes(s) ||
          pl.exporter.toLowerCase().includes(s) ||
          pl.buyer.toLowerCase().includes(s)
        );
      }
      if (filters.status) result = result.filter(pl => pl.status === filters.status);
      if (filters.buyer) result = result.filter(pl => pl.buyer === filters.buyer);
      if (filters.dateStart) result = result.filter(pl => new Date(pl.issueDate) >= new Date(filters.dateStart!));
      if (filters.dateEnd) result = result.filter(pl => new Date(pl.issueDate) <= new Date(filters.dateEnd!));
    }
    return of(result).pipe(delay(400));
  }

  getPackingListById(id: string): Observable<PackingList | null> {
    return of(this.packingLists.find(pl => pl.id === id) || null).pipe(delay(200));
  }

  getItems(packingListId: string): Observable<PackingListItem[]> {
    return of(this.itemsMap.get(packingListId) || []).pipe(delay(300));
  }

  getMetrics(): Observable<PackingListMetrics> {
    const metrics: PackingListMetrics = {
      totalPackingLists: this.packingLists.length,
      pendentesValidacao: this.packingLists.filter(pl => pl.status === 'PENDENTE_VALIDACAO').length,
      scoreCompletudeMedia: Math.round(this.packingLists.reduce((sum, pl) => sum + pl.completenessScore, 0) / this.packingLists.length),
      vinculadosEmbarques: this.packingLists.filter(pl => pl.linkedEmbarqueId !== '').length,
    };
    return of(metrics).pipe(delay(200));
  }

  createPackingList(data: Partial<PackingList>): Observable<PackingList> {
    const newPl: PackingList = {
      id: `pl-${Date.now()}`,
      packingListNumber: `PL-2025-${String(this.packingLists.length + 1).padStart(4, '0')}`,
      linkedInvoice: data.linkedInvoice || '',
      linkedInvoiceId: data.linkedInvoiceId || '',
      exporter: data.exporter || 'Agro Export Brasil Ltda',
      exporterCnpj: data.exporterCnpj || '12.345.678/0001-90',
      buyer: data.buyer || '',
      buyerCountry: data.buyerCountry || '',
      portOrigin: data.portOrigin || 'Santos',
      portDestination: data.portDestination || '',
      totalPackages: 0,
      totalGrossWeight: 0,
      totalNetWeight: 0,
      totalVolume: 0,
      status: 'RASCUNHO',
      completenessScore: 10,
      linkedEmbarqueId: '',
      linkedEmbarqueNumber: '',
      invoiceGrossWeight: 0,
      invoiceNetWeight: 0,
      weightDiscrepancyPercent: 0,
      issueDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin@empresa.com',
      observations: data.observations || '',
    };
    this.packingLists.unshift(newPl);
    return of(newPl).pipe(delay(500));
  }

  getBuyers(): string[] {
    return [...new Set(this.packingLists.map(pl => pl.buyer))];
  }

  getStatuses(): { value: PackingListStatus; label: string }[] {
    return [
      { value: 'RASCUNHO', label: 'Rascunho' },
      { value: 'PENDENTE_VALIDACAO', label: 'Pendente Validação' },
      { value: 'VALIDADO', label: 'Validado' },
      { value: 'APROVADO', label: 'Aprovado' },
      { value: 'VINCULADO_EMBARQUE', label: 'Vinculado a Embarque' },
      { value: 'FINALIZADO', label: 'Finalizado' },
    ];
  }

  private generatePackingLists(): PackingList[] {
    const buyers = [
      { name: 'Global Grain Corp', country: 'Estados Unidos' },
      { name: 'China Foods Import Co.', country: 'China' },
      { name: 'European Commodities GmbH', country: 'Alemanha' },
      { name: 'Tokyo Trading Ltd', country: 'Japão' },
      { name: 'Arabia Foods Import', country: 'Arábia Saudita' },
    ];
    const ports = ['Santos', 'Paranaguá', 'Rio Grande'];
    const destPorts = ['Houston', 'Shanghai', 'Hamburg', 'Tokyo', 'Jeddah'];
    const statuses: PackingListStatus[] = [
      'RASCUNHO', 'PENDENTE_VALIDACAO', 'PENDENTE_VALIDACAO', 'VALIDADO', 'APROVADO',
      'VINCULADO_EMBARQUE', 'FINALIZADO', 'PENDENTE_VALIDACAO', 'VALIDADO', 'APROVADO',
      'VINCULADO_EMBARQUE', 'FINALIZADO', 'PENDENTE_VALIDACAO', 'RASCUNHO', 'VALIDADO',
      'APROVADO', 'VINCULADO_EMBARQUE', 'FINALIZADO', 'PENDENTE_VALIDACAO', 'VALIDADO',
    ];

    return Array.from({ length: 20 }, (_, i) => {
      const buyer = buyers[i % buyers.length];
      const status = statuses[i];
      const totalPackages = Math.floor(Math.random() * 150) + 20;
      const totalNetWeight = Math.round((Math.random() * 45000 + 5000) * 100) / 100;
      const totalGrossWeight = Math.round(totalNetWeight * (1 + Math.random() * 0.08 + 0.02) * 100) / 100;
      const invoiceGrossWeight = Math.round(totalGrossWeight * (1 + (Math.random() * 0.03 - 0.015)) * 100) / 100;
      const invoiceNetWeight = Math.round(totalNetWeight * (1 + (Math.random() * 0.03 - 0.015)) * 100) / 100;
      const discrepancy = Math.abs((totalGrossWeight - invoiceGrossWeight) / invoiceGrossWeight * 100);
      const completenessMap: Record<PackingListStatus, number> = {
        'RASCUNHO': Math.floor(Math.random() * 20) + 20,
        'PENDENTE_VALIDACAO': Math.floor(Math.random() * 15) + 55,
        'VALIDADO': Math.floor(Math.random() * 10) + 75,
        'APROVADO': Math.floor(Math.random() * 5) + 85,
        'VINCULADO_EMBARQUE': Math.floor(Math.random() * 5) + 92,
        'FINALIZADO': 100,
      };
      const hasEmbarque = status === 'VINCULADO_EMBARQUE' || status === 'FINALIZADO';

      return {
        id: `pl-${String(i + 1).padStart(3, '0')}`,
        packingListNumber: `PL-2025-${String(i + 1).padStart(4, '0')}`,
        linkedInvoice: `INV-2025-${String(i + 1).padStart(5, '0')}`,
        linkedInvoiceId: `inv-${String(i + 1).padStart(3, '0')}`,
        exporter: 'Agro Export Brasil Ltda',
        exporterCnpj: '12.345.678/0001-90',
        buyer: buyer.name,
        buyerCountry: buyer.country,
        portOrigin: ports[i % ports.length],
        portDestination: destPorts[i % destPorts.length],
        totalPackages,
        totalGrossWeight,
        totalNetWeight,
        totalVolume: Math.round(totalPackages * (Math.random() * 2 + 0.5) * 100) / 100,
        status,
        completenessScore: completenessMap[status],
        linkedEmbarqueId: hasEmbarque ? `emb-${String(i + 1).padStart(3, '0')}` : '',
        linkedEmbarqueNumber: hasEmbarque ? `EMB-2025-${String(i + 1).padStart(4, '0')}` : '',
        invoiceGrossWeight,
        invoiceNetWeight,
        weightDiscrepancyPercent: Math.round(discrepancy * 100) / 100,
        issueDate: new Date(2025, Math.floor(i / 4), (i % 28) + 1),
        createdAt: new Date(2025, Math.floor(i / 4), (i % 28) + 1),
        updatedAt: new Date(2025, Math.floor(i / 4), (i % 28) + 3),
        createdBy: 'admin@empresa.com',
        observations: i % 3 === 0 ? 'Verificar dimensões dos paletes antes do embarque' : '',
      } as PackingList;
    });
  }

  private generateItems(pl: PackingList): PackingListItem[] {
    const products = [
      { name: 'Soja em Grãos', desc: 'Brazilian Soybeans Non-GMO Grade A', ncm: '1201.90.00', pkg: 'Big Bag', unit: 'TON' },
      { name: 'Milho em Grãos', desc: 'Yellow Corn Bulk Grade 1', ncm: '1005.90.10', pkg: 'Big Bag', unit: 'TON' },
      { name: 'Café Arábica', desc: 'Arabica Coffee Beans Screen 17/18', ncm: '0901.11.10', pkg: 'Saca 60kg', unit: 'BAG' },
      { name: 'Açúcar VHP', desc: 'VHP Raw Sugar Pol 99.3', ncm: '1701.14.00', pkg: 'Big Bag', unit: 'TON' },
      { name: 'Carne Bovina Congelada', desc: 'Frozen Boneless Beef Rump & Loin', ncm: '0202.30.00', pkg: 'Caixa Papelão', unit: 'TON' },
    ];

    const numItems = Math.floor(Math.random() * 3) + 2;
    const startIdx = parseInt(pl.id.split('-')[1]) % products.length;
    const items: PackingListItem[] = [];

    for (let j = 0; j < numItems; j++) {
      const p = products[(startIdx + j) % products.length];
      const qty = Math.round(Math.random() * 300 + 50);
      const netWeight = Math.round(qty * (Math.random() * 0.9 + 0.8) * 100) / 100;
      const grossWeight = Math.round(netWeight * (1 + Math.random() * 0.06 + 0.02) * 100) / 100;
      const pkgCount = Math.floor(Math.random() * 40) + 5;

      items.push({
        id: `pli-${pl.id}-${j + 1}`,
        packingListId: pl.id,
        productName: p.name,
        description: p.desc,
        ncm: p.ncm,
        quantity: qty,
        unit: p.unit,
        netWeight,
        grossWeight,
        packageType: p.pkg,
        packageCount: pkgCount,
        dimensions: `${Math.floor(Math.random() * 80 + 80)}x${Math.floor(Math.random() * 80 + 80)}x${Math.floor(Math.random() * 100 + 100)} cm`,
        marks: `LOT-${pl.packingListNumber}-${j + 1}`,
      });
    }
    return items;
  }
}

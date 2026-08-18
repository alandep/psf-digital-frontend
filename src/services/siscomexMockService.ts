import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  SiscomexService,
  SiscomexServiceStatus,
  DueRegistration,
  DueStatus,
  LpcoRecord,
  LpcoStatus,
  SiscomexMetrics,
  SiscomexEvent,
  SiscomexFilters
} from '../types/integracoes-siscomex';

@Injectable({
  providedIn: 'root'
})
export class SiscomexMockService {

  private services: SiscomexService[] = [];
  private dueRegistrations: DueRegistration[] = [];
  private lpcoRecords: LpcoRecord[] = [];
  private events: SiscomexEvent[] = [];

  constructor() {
    this.initializeMockData();
  }

  // ================================
  // PUBLIC API
  // ================================

  getServices(): Observable<SiscomexService[]> {
    return of([...this.services]).pipe(delay(this.randomDelay()));
  }

  getServiceById(id: string): Observable<SiscomexService | null> {
    const service = this.services.find(s => s.id === id) || null;
    return of(service).pipe(delay(this.randomDelay()));
  }

  getDueRegistrations(filters?: SiscomexFilters): Observable<DueRegistration[]> {
    let result = [...this.dueRegistrations];

    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        result = result.filter(d =>
          d.dueNumber.toLowerCase().includes(search) ||
          d.exporterName.toLowerCase().includes(search) ||
          d.exporterCnpj.toLowerCase().includes(search) ||
          d.product.toLowerCase().includes(search) ||
          d.ncm.toLowerCase().includes(search) ||
          d.port.toLowerCase().includes(search)
        );
      }
      if (filters.status) {
        result = result.filter(d => d.status === filters.status);
      }
      if (filters.channel) {
        result = result.filter(d => d.channel === filters.channel);
      }
      if (filters.dateStart) {
        result = result.filter(d => d.registrationDate >= filters.dateStart!);
      }
      if (filters.dateEnd) {
        result = result.filter(d => d.registrationDate <= filters.dateEnd!);
      }
    }

    return of(result).pipe(delay(this.randomDelay()));
  }

  getLpcoRecords(): Observable<LpcoRecord[]> {
    return of([...this.lpcoRecords]).pipe(delay(this.randomDelay()));
  }

  getMetrics(): Observable<SiscomexMetrics> {
    const metrics: SiscomexMetrics = {
      totalDues: this.dueRegistrations.length,
      duesThisMonth: this.dueRegistrations.filter(d => {
        const now = new Date();
        return d.registrationDate.getMonth() === now.getMonth() &&
               d.registrationDate.getFullYear() === now.getFullYear();
      }).length,
      avgClearanceTime: 18.5,
      successRate: 94.2,
      pendingLpcos: this.lpcoRecords.filter(l => l.status === 'SOLICITADA' || l.status === 'EM_ANALISE').length,
      activeLpcos: this.lpcoRecords.filter(l => l.status === 'DEFERIDA').length,
      servicesOnline: this.services.filter(s => s.status === 'ONLINE').length,
      servicesTotal: this.services.length
    };
    return of(metrics).pipe(delay(this.randomDelay()));
  }

  getEvents(): Observable<SiscomexEvent[]> {
    return of([...this.events]).pipe(delay(this.randomDelay()));
  }

  // ================================
  // PRIVATE HELPERS
  // ================================

  private randomDelay(): number {
    return 300 + Math.random() * 500;
  }

  // ================================
  // DATA INITIALIZATION
  // ================================

  private initializeMockData(): void {
    this.initializeServices();
    this.initializeDueRegistrations();
    this.initializeLpcoRecords();
    this.initializeEvents();
  }

  private initializeServices(): void {
    this.services = [
      {
        id: 'SVC-001', name: 'Portal Único DU-E', description: 'Sistema de registro de Declaração Única de Exportação',
        status: 'ONLINE', lastCheck: new Date(), uptime: 99.7, avgResponseTime: 320, lastIncident: new Date('2024-11-15')
      },
      {
        id: 'SVC-002', name: 'Portal Único LPCO', description: 'Licenças, Permissões, Certificados e Outros Documentos',
        status: 'ONLINE', lastCheck: new Date(), uptime: 99.2, avgResponseTime: 450, lastIncident: new Date('2024-11-20')
      },
      {
        id: 'SVC-003', name: 'Receita Federal', description: 'Serviços de despacho aduaneiro e fiscalização',
        status: 'ONLINE', lastCheck: new Date(), uptime: 99.8, avgResponseTime: 280, lastIncident: null
      },
      {
        id: 'SVC-004', name: 'MAPA/Vigiagro', description: 'Vigilância Agropecuária Internacional',
        status: 'DEGRADED', lastCheck: new Date(), uptime: 97.5, avgResponseTime: 1200, lastIncident: new Date()
      },
      {
        id: 'SVC-005', name: 'Bacen', description: 'Banco Central - Controle cambial e registro de operações',
        status: 'ONLINE', lastCheck: new Date(), uptime: 99.9, avgResponseTime: 180, lastIncident: null
      },
      {
        id: 'SVC-006', name: 'SEFAZ', description: 'Secretaria da Fazenda - Nota Fiscal Eletrônica',
        status: 'ONLINE', lastCheck: new Date(), uptime: 99.4, avgResponseTime: 350, lastIncident: new Date('2024-12-01')
      },
      {
        id: 'SVC-007', name: 'INMETRO', description: 'Certificação de conformidade e metrologia',
        status: 'MAINTENANCE', lastCheck: new Date(), uptime: 95.0, avgResponseTime: 0, lastIncident: new Date()
      },
      {
        id: 'SVC-008', name: 'Siscomex Importação', description: 'Sistema integrado de comércio exterior - módulo importação',
        status: 'OFFLINE', lastCheck: new Date(Date.now() - 3600000), uptime: 92.3, avgResponseTime: 0, lastIncident: new Date()
      }
    ];
  }

  private initializeDueRegistrations(): void {
    this.dueRegistrations = [
      {
        id: 'DUE-001', dueNumber: '24BR00001234-5', exporterName: 'AgroBrasil Exportações Ltda',
        exporterCnpj: '12.345.678/0001-90', status: 'AVERBADA', registrationDate: new Date('2024-12-01'),
        country: 'China', totalValue: 2500000, currency: 'USD', ncm: '1201.90.00',
        product: 'Soja em Grãos', port: 'Santos', channel: 'Verde',
        lastUpdate: new Date('2024-12-05'), linkedInvoice: 'INV-2024-0089'
      },
      {
        id: 'DUE-002', dueNumber: '24BR00001235-3', exporterName: 'Café Premium Export S.A.',
        exporterCnpj: '23.456.789/0001-01', status: 'REGISTRADA', registrationDate: new Date('2024-12-10'),
        country: 'Alemanha', totalValue: 850000, currency: 'USD', ncm: '0901.11.10',
        product: 'Café Arábica Cru', port: 'Santos', channel: 'Verde',
        lastUpdate: new Date('2024-12-10'), linkedInvoice: 'INV-2024-0102'
      },
      {
        id: 'DUE-003', dueNumber: '24BR00001236-1', exporterName: 'MeatPack International',
        exporterCnpj: '34.567.890/0001-12', status: 'DESEMBARACADA', registrationDate: new Date('2024-12-08'),
        country: 'Arábia Saudita', totalValue: 1200000, currency: 'USD', ncm: '0202.30.00',
        product: 'Carne Bovina Desossada', port: 'Paranaguá', channel: 'Amarelo',
        lastUpdate: new Date('2024-12-12'), linkedInvoice: 'INV-2024-0098'
      },
      {
        id: 'DUE-004', dueNumber: '24BR00001237-9', exporterName: 'Citrus Valley Ltda',
        exporterCnpj: '45.678.901/0001-23', status: 'COM_EXIGENCIA', registrationDate: new Date('2024-12-05'),
        country: 'EUA', totalValue: 680000, currency: 'USD', ncm: '2009.11.00',
        product: 'Suco de Laranja Concentrado', port: 'Santos', channel: 'Vermelho',
        lastUpdate: new Date('2024-12-11'), linkedInvoice: 'INV-2024-0095'
      },
      {
        id: 'DUE-005', dueNumber: '24BR00001238-7', exporterName: 'Papel & Celulose Brasil',
        exporterCnpj: '56.789.012/0001-34', status: 'REGISTRADA', registrationDate: new Date('2024-12-12'),
        country: 'Japão', totalValue: 3200000, currency: 'USD', ncm: '4703.21.00',
        product: 'Celulose de Eucalipto', port: 'Itaguaí', channel: 'Verde',
        lastUpdate: new Date('2024-12-12'), linkedInvoice: 'INV-2024-0105'
      },
      {
        id: 'DUE-006', dueNumber: '24BR00001239-5', exporterName: 'AgroBrasil Exportações Ltda',
        exporterCnpj: '12.345.678/0001-90', status: 'AVERBADA', registrationDate: new Date('2024-11-28'),
        country: 'Holanda', totalValue: 1800000, currency: 'USD', ncm: '2304.00.10',
        product: 'Farelo de Soja', port: 'Paranaguá', channel: 'Verde',
        lastUpdate: new Date('2024-12-03'), linkedInvoice: 'INV-2024-0087'
      },
      {
        id: 'DUE-007', dueNumber: '24BR00001240-9', exporterName: 'Cotton Trade Exp.',
        exporterCnpj: '67.890.123/0001-45', status: 'RASCUNHO', registrationDate: new Date('2024-12-13'),
        country: 'Turquia', totalValue: 920000, currency: 'USD', ncm: '5201.00.20',
        product: 'Algodão em Pluma', port: 'Santos', channel: 'Cinza',
        lastUpdate: new Date('2024-12-13'), linkedInvoice: 'INV-2024-0108'
      },
      {
        id: 'DUE-008', dueNumber: '24BR00001241-7', exporterName: 'Sugar Mills International',
        exporterCnpj: '78.901.234/0001-56', status: 'DESEMBARACADA', registrationDate: new Date('2024-12-06'),
        country: 'Índia', totalValue: 1500000, currency: 'USD', ncm: '1701.14.00',
        product: 'Açúcar Cristal', port: 'Santos', channel: 'Verde',
        lastUpdate: new Date('2024-12-09'), linkedInvoice: 'INV-2024-0096'
      },
      {
        id: 'DUE-009', dueNumber: '24BR00001242-5', exporterName: 'Ferro & Aço Export S.A.',
        exporterCnpj: '89.012.345/0001-67', status: 'CANCELADA', registrationDate: new Date('2024-11-25'),
        country: 'Coreia do Sul', totalValue: 4500000, currency: 'USD', ncm: '7207.11.10',
        product: 'Ferro-Gusa', port: 'Itaguaí', channel: 'Vermelho',
        lastUpdate: new Date('2024-12-02'), linkedInvoice: 'INV-2024-0082'
      },
      {
        id: 'DUE-010', dueNumber: '24BR00001243-3', exporterName: 'Poultry Global Trade',
        exporterCnpj: '90.123.456/0001-78', status: 'REGISTRADA', registrationDate: new Date('2024-12-11'),
        country: 'Emirados Árabes', totalValue: 750000, currency: 'USD', ncm: '0207.14.00',
        product: 'Frango Congelado', port: 'Paranaguá', channel: 'Amarelo',
        lastUpdate: new Date('2024-12-11'), linkedInvoice: 'INV-2024-0103'
      },
      {
        id: 'DUE-011', dueNumber: '24BR00001244-1', exporterName: 'Tropical Fruits Co.',
        exporterCnpj: '01.234.567/0001-89', status: 'AVERBADA', registrationDate: new Date('2024-11-20'),
        country: 'Reino Unido', totalValue: 420000, currency: 'USD', ncm: '0804.50.00',
        product: 'Manga Fresca', port: 'Salvador', channel: 'Verde',
        lastUpdate: new Date('2024-11-28'), linkedInvoice: 'INV-2024-0078'
      },
      {
        id: 'DUE-012', dueNumber: '24BR00001245-9', exporterName: 'MeatPack International',
        exporterCnpj: '34.567.890/0001-12', status: 'COM_EXIGENCIA', registrationDate: new Date('2024-12-09'),
        country: 'Chile', totalValue: 580000, currency: 'USD', ncm: '0207.27.00',
        product: 'Peru Congelado', port: 'Rio Grande', channel: 'Vermelho',
        lastUpdate: new Date('2024-12-13'), linkedInvoice: 'INV-2024-0100'
      },
      {
        id: 'DUE-013', dueNumber: '24BR00001246-7', exporterName: 'BioEthanol Export Ltd',
        exporterCnpj: '11.222.333/0001-44', status: 'REGISTRADA', registrationDate: new Date('2024-12-13'),
        country: 'EUA', totalValue: 2100000, currency: 'USD', ncm: '2207.10.90',
        product: 'Etanol Anidro', port: 'Santos', channel: 'Verde',
        lastUpdate: new Date('2024-12-13'), linkedInvoice: 'INV-2024-0109'
      },
      {
        id: 'DUE-014', dueNumber: '24BR00001247-5', exporterName: 'Timber Solutions S.A.',
        exporterCnpj: '22.333.444/0001-55', status: 'DESEMBARACADA', registrationDate: new Date('2024-12-04'),
        country: 'Portugal', totalValue: 310000, currency: 'USD', ncm: '4407.11.00',
        product: 'Madeira Serrada de Pinus', port: 'Itajaí', channel: 'Amarelo',
        lastUpdate: new Date('2024-12-07'), linkedInvoice: 'INV-2024-0094'
      },
      {
        id: 'DUE-015', dueNumber: '24BR00001248-3', exporterName: 'Minério Global Trade',
        exporterCnpj: '33.444.555/0001-66', status: 'AVERBADA', registrationDate: new Date('2024-11-30'),
        country: 'China', totalValue: 8500000, currency: 'USD', ncm: '2601.11.00',
        product: 'Minério de Ferro', port: 'Itaguaí', channel: 'Verde',
        lastUpdate: new Date('2024-12-04'), linkedInvoice: 'INV-2024-0088'
      },
      {
        id: 'DUE-016', dueNumber: '24BR00001249-1', exporterName: 'Tobacco Leaf Int.',
        exporterCnpj: '44.555.666/0001-77', status: 'RASCUNHO', registrationDate: new Date('2024-12-14'),
        country: 'Bélgica', totalValue: 620000, currency: 'USD', ncm: '2401.10.30',
        product: 'Tabaco Virginia', port: 'Rio Grande', channel: 'Cinza',
        lastUpdate: new Date('2024-12-14'), linkedInvoice: 'INV-2024-0110'
      }
    ];
  }

  private initializeLpcoRecords(): void {
    this.lpcoRecords = [
      {
        id: 'LPCO-001', lpcoNumber: 'E24/0012345-0', type: 'CSI', organ: 'MAPA',
        product: 'Soja em Grãos', ncm: '1201.90.00', status: 'DEFERIDA',
        requestDate: new Date('2024-11-20'), approvalDate: new Date('2024-11-25'),
        expirationDate: new Date('2025-05-25'), volume: 50000, unit: 'ton',
        usedVolume: 32000, linkedDue: '24BR00001234-5'
      },
      {
        id: 'LPCO-002', lpcoNumber: 'E24/0012346-8', type: 'CSI', organ: 'MAPA',
        product: 'Carne Bovina Desossada', ncm: '0202.30.00', status: 'DEFERIDA',
        requestDate: new Date('2024-11-15'), approvalDate: new Date('2024-11-22'),
        expirationDate: new Date('2025-02-22'), volume: 5000, unit: 'ton',
        usedVolume: 2800, linkedDue: '24BR00001236-1'
      },
      {
        id: 'LPCO-003', lpcoNumber: 'E24/0012347-6', type: 'LPCO', organ: 'ANVISA',
        product: 'Suco de Laranja Concentrado', ncm: '2009.11.00', status: 'EM_ANALISE',
        requestDate: new Date('2024-12-05'), approvalDate: null,
        expirationDate: null, volume: 10000, unit: 'ton',
        usedVolume: 0, linkedDue: '24BR00001237-9'
      },
      {
        id: 'LPCO-004', lpcoNumber: 'E24/0012348-4', type: 'CSI', organ: 'MAPA',
        product: 'Café Arábica Cru', ncm: '0901.11.10', status: 'DEFERIDA',
        requestDate: new Date('2024-11-28'), approvalDate: new Date('2024-12-02'),
        expirationDate: new Date('2025-06-02'), volume: 8000, unit: 'ton',
        usedVolume: 1200, linkedDue: '24BR00001235-3'
      },
      {
        id: 'LPCO-005', lpcoNumber: 'E24/0012349-2', type: 'LPCO', organ: 'IBAMA',
        product: 'Madeira Serrada de Pinus', ncm: '4407.11.00', status: 'DEFERIDA',
        requestDate: new Date('2024-11-10'), approvalDate: new Date('2024-11-18'),
        expirationDate: new Date('2025-03-18'), volume: 3000, unit: 'm³',
        usedVolume: 1500, linkedDue: '24BR00001247-5'
      },
      {
        id: 'LPCO-006', lpcoNumber: 'E24/0012350-6', type: 'CSI', organ: 'MAPA',
        product: 'Frango Congelado', ncm: '0207.14.00', status: 'SOLICITADA',
        requestDate: new Date('2024-12-11'), approvalDate: null,
        expirationDate: null, volume: 4000, unit: 'ton',
        usedVolume: 0, linkedDue: '24BR00001243-3'
      },
      {
        id: 'LPCO-007', lpcoNumber: 'E24/0012351-4', type: 'LI', organ: 'INMETRO',
        product: 'Etanol Anidro', ncm: '2207.10.90', status: 'DEFERIDA',
        requestDate: new Date('2024-11-25'), approvalDate: new Date('2024-12-01'),
        expirationDate: new Date('2025-06-01'), volume: 25000, unit: 'm³',
        usedVolume: 8000, linkedDue: '24BR00001246-7'
      },
      {
        id: 'LPCO-008', lpcoNumber: 'E24/0012352-2', type: 'CSI', organ: 'MAPA',
        product: 'Farelo de Soja', ncm: '2304.00.10', status: 'DEFERIDA',
        requestDate: new Date('2024-11-05'), approvalDate: new Date('2024-11-12'),
        expirationDate: new Date('2025-05-12'), volume: 30000, unit: 'ton',
        usedVolume: 18000, linkedDue: '24BR00001239-5'
      },
      {
        id: 'LPCO-009', lpcoNumber: 'E24/0012353-0', type: 'LPCO', organ: 'ANVISA',
        product: 'Tabaco Virginia', ncm: '2401.10.30', status: 'SOLICITADA',
        requestDate: new Date('2024-12-14'), approvalDate: null,
        expirationDate: null, volume: 2000, unit: 'ton',
        usedVolume: 0, linkedDue: '24BR00001249-1'
      },
      {
        id: 'LPCO-010', lpcoNumber: 'E24/0012354-8', type: 'CSI', organ: 'MAPA',
        product: 'Peru Congelado', ncm: '0207.27.00', status: 'INDEFERIDA',
        requestDate: new Date('2024-12-01'), approvalDate: null,
        expirationDate: null, volume: 1500, unit: 'ton',
        usedVolume: 0, linkedDue: '24BR00001245-9'
      },
      {
        id: 'LPCO-011', lpcoNumber: 'E24/0012355-6', type: 'CSI', organ: 'MAPA',
        product: 'Manga Fresca', ncm: '0804.50.00', status: 'DEFERIDA',
        requestDate: new Date('2024-11-01'), approvalDate: new Date('2024-11-08'),
        expirationDate: new Date('2025-02-08'), volume: 500, unit: 'ton',
        usedVolume: 420, linkedDue: '24BR00001244-1'
      }
    ];
  }

  private initializeEvents(): void {
    this.events = [
      {
        id: 'EVT-001', type: 'DUE_REGISTERED', description: 'DU-E 24BR00001246-7 registrada com sucesso - Etanol Anidro para EUA',
        date: new Date('2024-12-13T14:30:00'), reference: '24BR00001246-7', severity: 'SUCCESS'
      },
      {
        id: 'EVT-002', type: 'EXIGENCIA', description: 'Exigência fiscal na DU-E 24BR00001245-9 - documentação incompleta',
        date: new Date('2024-12-13T11:15:00'), reference: '24BR00001245-9', severity: 'ERROR'
      },
      {
        id: 'EVT-003', type: 'SERVICE_DOWN', description: 'Siscomex Importação fora do ar - manutenção não programada',
        date: new Date('2024-12-13T09:00:00'), reference: 'SVC-008', severity: 'ERROR'
      },
      {
        id: 'EVT-004', type: 'LPCO_APPROVED', description: 'LPCO E24/0012351-4 deferida pelo INMETRO - Etanol Anidro',
        date: new Date('2024-12-12T16:45:00'), reference: 'E24/0012351-4', severity: 'SUCCESS'
      },
      {
        id: 'EVT-005', type: 'DUE_CLEARED', description: 'DU-E 24BR00001241-7 desembaraçada - Açúcar Cristal canal Verde',
        date: new Date('2024-12-12T10:20:00'), reference: '24BR00001241-7', severity: 'SUCCESS'
      },
      {
        id: 'EVT-006', type: 'SERVICE_RESTORED', description: 'MAPA/Vigiagro operando com lentidão - modo degradado',
        date: new Date('2024-12-12T08:30:00'), reference: 'SVC-004', severity: 'WARNING'
      },
      {
        id: 'EVT-007', type: 'EXIGENCIA', description: 'Exigência sanitária na DU-E 24BR00001237-9 - laudo ANVISA pendente',
        date: new Date('2024-12-11T15:00:00'), reference: '24BR00001237-9', severity: 'ERROR'
      },
      {
        id: 'EVT-008', type: 'DUE_REGISTERED', description: 'DU-E 24BR00001243-3 registrada - Frango Congelado para Emirados Árabes',
        date: new Date('2024-12-11T09:30:00'), reference: '24BR00001243-3', severity: 'SUCCESS'
      },
      {
        id: 'EVT-009', type: 'LPCO_APPROVED', description: 'LPCO E24/0012348-4 deferida pelo MAPA - Café Arábica',
        date: new Date('2024-12-10T14:00:00'), reference: 'E24/0012348-4', severity: 'SUCCESS'
      },
      {
        id: 'EVT-010', type: 'DUE_CLEARED', description: 'DU-E 24BR00001236-1 desembaraçada - Carne Bovina canal Amarelo',
        date: new Date('2024-12-10T11:45:00'), reference: '24BR00001236-1', severity: 'INFO'
      },
      {
        id: 'EVT-011', type: 'SERVICE_DOWN', description: 'INMETRO em manutenção programada - previsão de retorno em 4h',
        date: new Date('2024-12-10T06:00:00'), reference: 'SVC-007', severity: 'WARNING'
      },
      {
        id: 'EVT-012', type: 'DUE_REGISTERED', description: 'DU-E 24BR00001242-5 cancelada - problemas documentais Ferro-Gusa',
        date: new Date('2024-12-09T16:30:00'), reference: '24BR00001242-5', severity: 'ERROR'
      },
      {
        id: 'EVT-013', type: 'LPCO_APPROVED', description: 'LPCO E24/0012352-2 deferida pelo MAPA - Farelo de Soja',
        date: new Date('2024-12-09T10:00:00'), reference: 'E24/0012352-2', severity: 'SUCCESS'
      },
      {
        id: 'EVT-014', type: 'DUE_CLEARED', description: 'DU-E 24BR00001247-5 desembaraçada - Madeira Serrada canal Amarelo',
        date: new Date('2024-12-08T14:20:00'), reference: '24BR00001247-5', severity: 'SUCCESS'
      },
      {
        id: 'EVT-015', type: 'SERVICE_RESTORED', description: 'SEFAZ normalizado após instabilidade de 2h',
        date: new Date('2024-12-08T08:00:00'), reference: 'SVC-006', severity: 'INFO'
      },
      {
        id: 'EVT-016', type: 'DUE_REGISTERED', description: 'DU-E 24BR00001238-7 registrada - Celulose de Eucalipto para Japão',
        date: new Date('2024-12-07T11:00:00'), reference: '24BR00001238-7', severity: 'SUCCESS'
      },
      {
        id: 'EVT-017', type: 'LPCO_APPROVED', description: 'LPCO E24/0012349-2 deferida pelo IBAMA - Madeira Serrada',
        date: new Date('2024-12-06T15:30:00'), reference: 'E24/0012349-2', severity: 'SUCCESS'
      },
      {
        id: 'EVT-018', type: 'DUE_CLEARED', description: 'DU-E 24BR00001234-5 averbada - Soja em Grãos canal Verde',
        date: new Date('2024-12-05T09:45:00'), reference: '24BR00001234-5', severity: 'SUCCESS'
      },
      {
        id: 'EVT-019', type: 'DUE_REGISTERED', description: 'DU-E 24BR00001237-9 registrada - Suco de Laranja para EUA',
        date: new Date('2024-12-05T08:00:00'), reference: '24BR00001237-9', severity: 'SUCCESS'
      },
      {
        id: 'EVT-020', type: 'SERVICE_DOWN', description: 'Portal Único LPCO indisponível por 45 minutos',
        date: new Date('2024-12-04T22:00:00'), reference: 'SVC-002', severity: 'ERROR'
      },
      {
        id: 'EVT-021', type: 'DUE_CLEARED', description: 'DU-E 24BR00001239-5 averbada - Farelo de Soja canal Verde',
        date: new Date('2024-12-03T14:00:00'), reference: '24BR00001239-5', severity: 'SUCCESS'
      }
    ];
  }
}

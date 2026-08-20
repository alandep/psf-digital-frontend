import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  TradeFinanceInstrument,
  InstrumentType,
  InstrumentStatus,
  TradeFinanceKPIs,
  TradeFinanceFilters,
  TradeFinanceTimelineEvent
} from '../types/trade-finance';

@Injectable({
  providedIn: 'root'
})
export class TradeFinanceMockService {

  private instruments: TradeFinanceInstrument[] = [];

  constructor() {
    this.initializeMockData();
  }

  getInstruments(filters?: TradeFinanceFilters): Observable<TradeFinanceInstrument[]> {
    let result = [...this.instruments];

    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        result = result.filter(i =>
          i.instrumentNumber.toLowerCase().includes(search) ||
          i.bank.toLowerCase().includes(search) ||
          i.beneficiary.toLowerCase().includes(search) ||
          i.linkedContract.toLowerCase().includes(search)
        );
      }
      if (filters.type) {
        result = result.filter(i => i.type === filters.type);
      }
      if (filters.status) {
        result = result.filter(i => i.status === filters.status);
      }
      if (filters.bank) {
        result = result.filter(i => i.bank === filters.bank);
      }
      if (filters.currency) {
        result = result.filter(i => i.currency === filters.currency);
      }
    }

    return of(result).pipe(delay(this.randomDelay()));
  }

  getKPIs(): Observable<TradeFinanceKPIs> {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const kpis: TradeFinanceKPIs = {
      lcsAtivas: this.instruments.filter(i => i.type === 'LC' && i.status === 'ATIVA').length,
      valorTotalLCs: this.instruments.filter(i => i.type === 'LC' && i.status === 'ATIVA').reduce((sum, i) => sum + i.value, 0),
      cobrancasPendentes: this.instruments.filter(i => i.type === 'COBRANCA_DOCUMENTARIA' && i.status === 'PENDENTE').length,
      instrumentosVencendo: this.instruments.filter(i => new Date(i.expiryDate) <= thirtyDays && i.status === 'ATIVA').length
    };
    return of(kpis).pipe(delay(this.randomDelay()));
  }

  getTimeline(instrumentId: string): Observable<TradeFinanceTimelineEvent[]> {
    const instrument = this.instruments.find(i => i.id === instrumentId);
    return of(instrument?.timelineEvents || []).pipe(delay(this.randomDelay()));
  }

  getBanks(): string[] {
    return ['Banco do Brasil', 'Itaú BBA', 'Bradesco BBI', 'HSBC', 'Citibank', 'Deutsche Bank', 'Standard Chartered', 'Santander'];
  }

  getTypes(): InstrumentType[] {
    return ['LC', 'COBRANCA_DOCUMENTARIA', 'GARANTIA_BANCARIA', 'SBLC', 'AVAL'];
  }

  getStatuses(): InstrumentStatus[] {
    return ['ATIVA', 'PENDENTE', 'VENCIDA', 'CANCELADA', 'EM_NEGOCIACAO', 'UTILIZADA'];
  }

  getCurrencies(): string[] {
    return ['USD', 'EUR', 'GBP', 'BRL'];
  }

  private randomDelay(): number {
    return Math.floor(Math.random() * 300) + 200;
  }

  private initializeMockData(): void {
    this.instruments = [
      {
        id: 'TF-001', instrumentNumber: 'LC-2024-001', type: 'LC', status: 'ATIVA',
        bank: 'HSBC', beneficiary: 'Agro Export Brasil Ltda', applicant: 'Shanghai Trading Co.',
        value: 850000, currency: 'USD', issueDate: new Date('2024-06-01'), expiryDate: new Date('2024-12-15'),
        linkedContract: 'CTR-2024-042', description: 'LC irrevogável para exportação de soja',
        advisingBank: 'Banco do Brasil', confirmingBank: 'Itaú BBA',
        partialShipment: true, transhipment: false, incoterm: 'CIF',
        portOfLoading: 'Santos', portOfDischarge: 'Shanghai',
        lastAmendmentDate: new Date('2024-07-15'), amendments: 1,
        documentsRequired: ['Commercial Invoice', 'Bill of Lading', 'Packing List', 'Certificate of Origin', 'Phytosanitary Certificate'],
        timelineEvents: [
          { id: 'E1', date: new Date('2024-06-01'), event: 'LC Emitida', user: 'HSBC Trade Finance', details: 'Carta de crédito irrevogável emitida' },
          { id: 'E2', date: new Date('2024-06-05'), event: 'LC Avisada', user: 'Banco do Brasil', details: 'LC avisada ao beneficiário' },
          { id: 'E3', date: new Date('2024-07-15'), event: 'Emenda nº1', user: 'HSBC', details: 'Prorrogação de prazo de embarque' },
          { id: 'E4', date: new Date('2024-08-01'), event: 'Documentos Apresentados', user: 'Agro Export', details: 'Documentos de embarque apresentados ao banco' }
        ]
      },
      {
        id: 'TF-002', instrumentNumber: 'LC-2024-002', type: 'LC', status: 'ATIVA',
        bank: 'Citibank', beneficiary: 'Brazilian Commodities SA', applicant: 'Dubai Import LLC',
        value: 1200000, currency: 'USD', issueDate: new Date('2024-07-10'), expiryDate: new Date('2025-01-10'),
        linkedContract: 'CTR-2024-058', description: 'LC para exportação de café premium',
        advisingBank: 'Itaú BBA', confirmingBank: 'Bradesco BBI',
        partialShipment: true, transhipment: true, incoterm: 'FOB',
        portOfLoading: 'Paranaguá', portOfDischarge: 'Jebel Ali',
        lastAmendmentDate: null, amendments: 0,
        documentsRequired: ['Commercial Invoice', 'Bill of Lading', 'Packing List', 'ICO Certificate', 'Quality Certificate'],
        timelineEvents: [
          { id: 'E1', date: new Date('2024-07-10'), event: 'LC Emitida', user: 'Citibank', details: 'LC irrevogável e confirmada' },
          { id: 'E2', date: new Date('2024-07-12'), event: 'LC Confirmada', user: 'Bradesco BBI', details: 'Confirmação adicionada' }
        ]
      },
      {
        id: 'TF-003', instrumentNumber: 'COB-2024-001', type: 'COBRANCA_DOCUMENTARIA', status: 'PENDENTE',
        bank: 'Banco do Brasil', beneficiary: 'Export Excellence Corp', applicant: 'Rotterdam Traders BV',
        value: 420000, currency: 'EUR', issueDate: new Date('2024-08-01'), expiryDate: new Date('2024-11-01'),
        linkedContract: 'CTR-2024-063', description: 'Cobrança documentária D/P à vista',
        advisingBank: 'ING Bank', confirmingBank: '',
        partialShipment: false, transhipment: false, incoterm: 'CFR',
        portOfLoading: 'Santos', portOfDischarge: 'Rotterdam',
        lastAmendmentDate: null, amendments: 0,
        documentsRequired: ['Commercial Invoice', 'Bill of Lading', 'Packing List', 'EUR.1'],
        timelineEvents: [
          { id: 'E1', date: new Date('2024-08-01'), event: 'Cobrança Registrada', user: 'Banco do Brasil', details: 'Documentos enviados para cobrança' },
          { id: 'E2', date: new Date('2024-08-05'), event: 'Documentos Recebidos', user: 'ING Bank', details: 'Banco cobrador confirma recebimento' }
        ]
      },
      {
        id: 'TF-004', instrumentNumber: 'GAR-2024-001', type: 'GARANTIA_BANCARIA', status: 'ATIVA',
        bank: 'Itaú BBA', beneficiary: 'Porto de Santos SA', applicant: 'Agro Export Brasil Ltda',
        value: 500000, currency: 'BRL', issueDate: new Date('2024-05-15'), expiryDate: new Date('2025-05-15'),
        linkedContract: 'CTR-2024-030', description: 'Garantia de performance operacional portuária',
        advisingBank: '', confirmingBank: '',
        partialShipment: false, transhipment: false, incoterm: '',
        portOfLoading: '', portOfDischarge: '',
        lastAmendmentDate: null, amendments: 0,
        documentsRequired: ['Declaração de inadimplência', 'Notificação formal'],
        timelineEvents: [
          { id: 'E1', date: new Date('2024-05-15'), event: 'Garantia Emitida', user: 'Itaú BBA', details: 'Garantia bancária emitida a favor do Porto de Santos' }
        ]
      },
      {
        id: 'TF-005', instrumentNumber: 'LC-2024-003', type: 'LC', status: 'VENCIDA',
        bank: 'Standard Chartered', beneficiary: 'Brazilian Commodities SA', applicant: 'Singapore Agri Pte Ltd',
        value: 680000, currency: 'USD', issueDate: new Date('2024-01-15'), expiryDate: new Date('2024-07-15'),
        linkedContract: 'CTR-2024-012', description: 'LC para exportação de açúcar cristal',
        advisingBank: 'Banco do Brasil', confirmingBank: '',
        partialShipment: true, transhipment: true, incoterm: 'CIF',
        portOfLoading: 'Santos', portOfDischarge: 'Singapore',
        lastAmendmentDate: new Date('2024-04-10'), amendments: 2,
        documentsRequired: ['Commercial Invoice', 'Bill of Lading', 'Packing List', 'SGS Certificate'],
        timelineEvents: [
          { id: 'E1', date: new Date('2024-01-15'), event: 'LC Emitida', user: 'Standard Chartered', details: 'LC emitida' },
          { id: 'E2', date: new Date('2024-07-15'), event: 'LC Vencida', user: 'Sistema', details: 'LC expirou sem utilização total' }
        ]
      },
      {
        id: 'TF-006', instrumentNumber: 'SBLC-2024-001', type: 'SBLC', status: 'ATIVA',
        bank: 'Deutsche Bank', beneficiary: 'Export Excellence Corp', applicant: 'Hamburg Import GmbH',
        value: 2000000, currency: 'EUR', issueDate: new Date('2024-03-01'), expiryDate: new Date('2025-03-01'),
        linkedContract: 'CTR-2024-025', description: 'Standby LC como garantia de pagamento',
        advisingBank: 'Bradesco BBI', confirmingBank: '',
        partialShipment: false, transhipment: false, incoterm: '',
        portOfLoading: '', portOfDischarge: '',
        lastAmendmentDate: null, amendments: 0,
        documentsRequired: ['Declaração de não pagamento', 'Cópia da fatura comercial'],
        timelineEvents: [
          { id: 'E1', date: new Date('2024-03-01'), event: 'SBLC Emitida', user: 'Deutsche Bank', details: 'Standby LC emitida' }
        ]
      },
      {
        id: 'TF-007', instrumentNumber: 'COB-2024-002', type: 'COBRANCA_DOCUMENTARIA', status: 'PENDENTE',
        bank: 'Bradesco BBI', beneficiary: 'Agro Export Brasil Ltda', applicant: 'Tokyo Foods Inc',
        value: 350000, currency: 'USD', issueDate: new Date('2024-08-10'), expiryDate: new Date('2024-11-10'),
        linkedContract: 'CTR-2024-072', description: 'Cobrança documentária D/A 60 dias',
        advisingBank: 'MUFG Bank', confirmingBank: '',
        partialShipment: false, transhipment: true, incoterm: 'FOB',
        portOfLoading: 'Paranaguá', portOfDischarge: 'Yokohama',
        lastAmendmentDate: null, amendments: 0,
        documentsRequired: ['Commercial Invoice', 'Bill of Lading', 'Packing List', 'Health Certificate'],
        timelineEvents: [
          { id: 'E1', date: new Date('2024-08-10'), event: 'Cobrança Enviada', user: 'Bradesco BBI', details: 'Documentos remetidos ao banco cobrador' }
        ]
      },
      {
        id: 'TF-008', instrumentNumber: 'LC-2024-004', type: 'LC', status: 'EM_NEGOCIACAO',
        bank: 'HSBC', beneficiary: 'Brazilian Commodities SA', applicant: 'London Commodities Ltd',
        value: 950000, currency: 'GBP', issueDate: new Date('2024-08-15'), expiryDate: new Date('2025-02-15'),
        linkedContract: 'CTR-2024-078', description: 'LC para exportação de minério de ferro',
        advisingBank: 'Santander', confirmingBank: '',
        partialShipment: true, transhipment: false, incoterm: 'CIF',
        portOfLoading: 'Tubarão', portOfDischarge: 'London',
        lastAmendmentDate: null, amendments: 0,
        documentsRequired: ['Commercial Invoice', 'Bill of Lading', 'Certificate of Analysis', 'Weight Certificate'],
        timelineEvents: [
          { id: 'E1', date: new Date('2024-08-15'), event: 'LC em Negociação', user: 'HSBC', details: 'Termos sendo negociados entre as partes' }
        ]
      },
      {
        id: 'TF-009', instrumentNumber: 'GAR-2024-002', type: 'GARANTIA_BANCARIA', status: 'ATIVA',
        bank: 'Santander', beneficiary: 'Receita Federal do Brasil', applicant: 'Export Excellence Corp',
        value: 300000, currency: 'BRL', issueDate: new Date('2024-04-01'), expiryDate: new Date('2024-10-01'),
        linkedContract: 'CTR-2024-035', description: 'Garantia aduaneira para regime de drawback',
        advisingBank: '', confirmingBank: '',
        partialShipment: false, transhipment: false, incoterm: '',
        portOfLoading: '', portOfDischarge: '',
        lastAmendmentDate: null, amendments: 0,
        documentsRequired: ['Termo de inadimplência fiscal'],
        timelineEvents: [
          { id: 'E1', date: new Date('2024-04-01'), event: 'Garantia Emitida', user: 'Santander', details: 'Garantia aduaneira para drawback' }
        ]
      },
      {
        id: 'TF-010', instrumentNumber: 'LC-2024-005', type: 'LC', status: 'UTILIZADA',
        bank: 'Citibank', beneficiary: 'Agro Export Brasil Ltda', applicant: 'Mumbai Traders Pvt Ltd',
        value: 720000, currency: 'USD', issueDate: new Date('2024-02-10'), expiryDate: new Date('2024-08-10'),
        linkedContract: 'CTR-2024-018', description: 'LC para exportação de algodão',
        advisingBank: 'Banco do Brasil', confirmingBank: 'Itaú BBA',
        partialShipment: true, transhipment: true, incoterm: 'CFR',
        portOfLoading: 'Santos', portOfDischarge: 'Mumbai',
        lastAmendmentDate: new Date('2024-05-20'), amendments: 1,
        documentsRequired: ['Commercial Invoice', 'Bill of Lading', 'Packing List', 'Certificate of Origin'],
        timelineEvents: [
          { id: 'E1', date: new Date('2024-02-10'), event: 'LC Emitida', user: 'Citibank', details: 'LC irrevogável emitida' },
          { id: 'E2', date: new Date('2024-05-20'), event: 'Emenda nº1', user: 'Citibank', details: 'Aumento de valor' },
          { id: 'E3', date: new Date('2024-07-25'), event: 'LC Utilizada', user: 'Banco do Brasil', details: 'Documentos em conformidade - pagamento efetuado' }
        ]
      },
      {
        id: 'TF-011', instrumentNumber: 'AVAL-2024-001', type: 'AVAL', status: 'ATIVA',
        bank: 'Banco do Brasil', beneficiary: 'Brazilian Commodities SA', applicant: 'Agro Export Brasil Ltda',
        value: 180000, currency: 'USD', issueDate: new Date('2024-07-01'), expiryDate: new Date('2024-12-01'),
        linkedContract: 'CTR-2024-055', description: 'Aval bancário para cambial sacada',
        advisingBank: '', confirmingBank: '',
        partialShipment: false, transhipment: false, incoterm: '',
        portOfLoading: '', portOfDischarge: '',
        lastAmendmentDate: null, amendments: 0,
        documentsRequired: ['Cambial protestada', 'Notificação ao avalista'],
        timelineEvents: [
          { id: 'E1', date: new Date('2024-07-01'), event: 'Aval Concedido', user: 'Banco do Brasil', details: 'Aval aposto em cambial sacada' }
        ]
      },
      {
        id: 'TF-012', instrumentNumber: 'COB-2024-003', type: 'COBRANCA_DOCUMENTARIA', status: 'ATIVA',
        bank: 'Itaú BBA', beneficiary: 'Export Excellence Corp', applicant: 'Buenos Aires Trading SA',
        value: 280000, currency: 'USD', issueDate: new Date('2024-08-05'), expiryDate: new Date('2024-10-20'),
        linkedContract: 'CTR-2024-068', description: 'Cobrança D/P à vista - carne bovina',
        advisingBank: 'Banco Nación', confirmingBank: '',
        partialShipment: false, transhipment: false, incoterm: 'DAP',
        portOfLoading: 'Santos', portOfDischarge: 'Buenos Aires',
        lastAmendmentDate: null, amendments: 0,
        documentsRequired: ['Commercial Invoice', 'Bill of Lading', 'SIF Certificate', 'Packing List'],
        timelineEvents: [
          { id: 'E1', date: new Date('2024-08-05'), event: 'Cobrança Iniciada', user: 'Itaú BBA', details: 'Documentos enviados para cobrança' },
          { id: 'E2', date: new Date('2024-08-08'), event: 'Aceite Pendente', user: 'Banco Nación', details: 'Aguardando aceite do importador' }
        ]
      },
      {
        id: 'TF-013', instrumentNumber: 'LC-2024-006', type: 'LC', status: 'CANCELADA',
        bank: 'Standard Chartered', beneficiary: 'Agro Export Brasil Ltda', applicant: 'Lagos Import Co',
        value: 400000, currency: 'USD', issueDate: new Date('2024-03-20'), expiryDate: new Date('2024-09-20'),
        linkedContract: 'CTR-2024-028', description: 'LC cancelada por acordo entre partes',
        advisingBank: 'Banco do Brasil', confirmingBank: '',
        partialShipment: false, transhipment: false, incoterm: 'CIF',
        portOfLoading: 'Santos', portOfDischarge: 'Lagos',
        lastAmendmentDate: null, amendments: 0,
        documentsRequired: ['Commercial Invoice', 'Bill of Lading'],
        timelineEvents: [
          { id: 'E1', date: new Date('2024-03-20'), event: 'LC Emitida', user: 'Standard Chartered', details: 'LC emitida' },
          { id: 'E2', date: new Date('2024-06-10'), event: 'LC Cancelada', user: 'Standard Chartered', details: 'Cancelamento por mútuo acordo' }
        ]
      },
      {
        id: 'TF-014', instrumentNumber: 'LC-2024-007', type: 'LC', status: 'ATIVA',
        bank: 'Deutsche Bank', beneficiary: 'Brazilian Commodities SA', applicant: 'Amsterdam Grains BV',
        value: 1500000, currency: 'EUR', issueDate: new Date('2024-08-20'), expiryDate: new Date('2025-02-20'),
        linkedContract: 'CTR-2024-085', description: 'LC para exportação de milho',
        advisingBank: 'Bradesco BBI', confirmingBank: 'Itaú BBA',
        partialShipment: true, transhipment: false, incoterm: 'FOB',
        portOfLoading: 'Paranaguá', portOfDischarge: 'Amsterdam',
        lastAmendmentDate: null, amendments: 0,
        documentsRequired: ['Commercial Invoice', 'Bill of Lading', 'Packing List', 'Fumigation Certificate', 'Weight Certificate'],
        timelineEvents: [
          { id: 'E1', date: new Date('2024-08-20'), event: 'LC Emitida', user: 'Deutsche Bank', details: 'LC irrevogável confirmada' },
          { id: 'E2', date: new Date('2024-08-22'), event: 'LC Avisada', user: 'Bradesco BBI', details: 'Aviso ao beneficiário' }
        ]
      },
      {
        id: 'TF-015', instrumentNumber: 'GAR-2024-003', type: 'GARANTIA_BANCARIA', status: 'PENDENTE',
        bank: 'HSBC', beneficiary: 'Terminal de Containers Santos', applicant: 'Export Excellence Corp',
        value: 750000, currency: 'BRL', issueDate: new Date('2024-08-25'), expiryDate: new Date('2025-08-25'),
        linkedContract: 'CTR-2024-090', description: 'Garantia de cumprimento contratual',
        advisingBank: '', confirmingBank: '',
        partialShipment: false, transhipment: false, incoterm: '',
        portOfLoading: '', portOfDischarge: '',
        lastAmendmentDate: null, amendments: 0,
        documentsRequired: ['Declaração de descumprimento contratual'],
        timelineEvents: [
          { id: 'E1', date: new Date('2024-08-25'), event: 'Em Análise', user: 'HSBC', details: 'Garantia em processo de aprovação' }
        ]
      },
      {
        id: 'TF-016', instrumentNumber: 'COB-2024-004', type: 'COBRANCA_DOCUMENTARIA', status: 'PENDENTE',
        bank: 'Santander', beneficiary: 'Agro Export Brasil Ltda', applicant: 'Cairo Trading Est',
        value: 190000, currency: 'USD', issueDate: new Date('2024-08-12'), expiryDate: new Date('2024-11-12'),
        linkedContract: 'CTR-2024-075', description: 'Cobrança D/A 90 dias - suco de laranja',
        advisingBank: 'National Bank of Egypt', confirmingBank: '',
        partialShipment: false, transhipment: true, incoterm: 'CIF',
        portOfLoading: 'Santos', portOfDischarge: 'Alexandria',
        lastAmendmentDate: null, amendments: 0,
        documentsRequired: ['Commercial Invoice', 'Bill of Lading', 'Packing List', 'Health Certificate'],
        timelineEvents: [
          { id: 'E1', date: new Date('2024-08-12'), event: 'Cobrança Remetida', user: 'Santander', details: 'Documentos enviados ao Egito' }
        ]
      }
    ];
  }
}

import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  RastreabilidadeLote,
  TimelineEvent,
  TimelineEventType,
  TraceDocument,
  AITraceInsights,
  RiskLevel,
  TraceAlert,
  ChainBreak,
  ComplianceCheck,
  SupplyChainNode,
  RastreabilidadeFilters,
  RastreabilidadeMetrics
} from '../types/rastreabilidade';

@Injectable({
  providedIn: 'root'
})
export class RastreabilidadeMockService {

  private lotes: RastreabilidadeLote[] = [];
  private timelines: Map<string, TimelineEvent[]> = new Map();
  private documents: Map<string, TraceDocument[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  // ================================
  // PUBLIC API
  // ================================

  getLotes(filters?: RastreabilidadeFilters): Observable<RastreabilidadeLote[]> {
    let result = [...this.lotes];

    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        result = result.filter(l =>
          l.loteNumber.toLowerCase().includes(search) ||
          l.productName.toLowerCase().includes(search) ||
          l.farmName.toLowerCase().includes(search) ||
          l.clientName.toLowerCase().includes(search) ||
          l.containerNumber.toLowerCase().includes(search) ||
          l.vesselName.toLowerCase().includes(search) ||
          l.destinationCountry.toLowerCase().includes(search)
        );
      }
      if (filters.harvest) {
        result = result.filter(l => l.harvest === filters.harvest);
      }
      if (filters.farm) {
        result = result.filter(l => l.farmName === filters.farm);
      }
      if (filters.warehouse) {
        result = result.filter(l => l.currentLocation.includes(filters.warehouse));
      }
      if (filters.container) {
        result = result.filter(l => l.containerNumber.includes(filters.container));
      }
      if (filters.vessel) {
        result = result.filter(l => l.vesselName === filters.vessel);
      }
      if (filters.destinationCountry) {
        result = result.filter(l => l.destinationCountry === filters.destinationCountry);
      }
      if (filters.client) {
        result = result.filter(l => l.clientName === filters.client);
      }
      if (filters.status) {
        result = result.filter(l => l.currentStatus === filters.status);
      }
    }

    return of(result).pipe(delay(this.randomDelay()));
  }

  getLoteById(id: string): Observable<RastreabilidadeLote | null> {
    const lote = this.lotes.find(l => l.id === id) || null;
    return of(lote).pipe(delay(this.randomDelay()));
  }

  getTimeline(loteId: string): Observable<TimelineEvent[]> {
    const timeline = this.timelines.get(loteId) || [];
    return of(timeline).pipe(delay(this.randomDelay()));
  }

  getDocuments(loteId: string): Observable<TraceDocument[]> {
    const docs = this.documents.get(loteId) || [];
    return of(docs).pipe(delay(this.randomDelay()));
  }

  getAIInsights(loteId: string): Observable<AITraceInsights> {
    const lote = this.lotes.find(l => l.id === loteId);
    const timeline = this.timelines.get(loteId) || [];
    const docs = this.documents.get(loteId) || [];

    const completedEvents = timeline.filter(e => e.status === 'completed').length;
    const totalEvents = timeline.length;
    const traceabilityScore = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;
    const reliabilityScore = Math.min(98, Math.max(70, traceabilityScore + Math.floor(Math.random() * 10) - 5));

    const expiredDocs = docs.filter(d => d.status === 'expired').length;
    const pendingDocs = docs.filter(d => d.status === 'pending').length;

    let regulatoryRisk: RiskLevel = 'LOW';
    if (expiredDocs > 0) regulatoryRisk = 'HIGH';
    else if (pendingDocs > 2) regulatoryRisk = 'MEDIUM';

    const alerts: TraceAlert[] = [];
    if (expiredDocs > 0) {
      alerts.push({
        severity: 'HIGH',
        message: `${expiredDocs} documento(s) vencido(s) identificados neste lote`,
        detectedAt: new Date()
      });
    }
    if (pendingDocs > 0) {
      alerts.push({
        severity: 'MEDIUM',
        message: `${pendingDocs} documento(s) pendentes de emissão`,
        detectedAt: new Date()
      });
    }
    if (traceabilityScore < 80) {
      alerts.push({
        severity: 'LOW',
        message: 'Score de rastreabilidade abaixo do ideal. Verifique etapas pendentes.',
        detectedAt: new Date()
      });
    }

    const chainBreaks: ChainBreak[] = [];
    for (let i = 0; i < timeline.length - 1; i++) {
      if (timeline[i].status === 'completed' && timeline[i + 1].status === 'pending' && i < timeline.length - 2) {
        chainBreaks.push({
          fromEvent: timeline[i].title,
          toEvent: timeline[i + 1].title,
          description: `Lacuna na cadeia entre ${timeline[i].title} e ${timeline[i + 1].title}`,
          severity: 'MEDIUM'
        });
      }
    }

    const country = lote?.destinationCountry || 'USA';
    const complianceChecks: ComplianceCheck[] = this.generateComplianceChecks(country, docs);

    const farmName = lote?.farmName || 'Fazenda';
    const harvest = lote?.harvest || '2025/2026';
    const product = lote?.productName || 'produto';
    const executiveSummary = `O lote ${lote?.loteNumber || ''} foi produzido na ${farmName} durante a safra ${harvest}. ` +
      `O ${product} passou por ${completedEvents} de ${totalEvents} etapas documentadas na cadeia logística. ` +
      `Destino: ${country}, cliente ${lote?.clientName || ''}. ` +
      `Score de confiabilidade: ${reliabilityScore}/100. ` +
      (chainBreaks.length > 0 ? `Atenção: ${chainBreaks.length} lacuna(s) na cadeia de rastreabilidade.` : 'Cadeia de rastreabilidade completa sem lacunas.');

    const insights: AITraceInsights = {
      loteId,
      reliabilityScore,
      traceabilityScore,
      regulatoryRisk,
      alerts,
      insights: [
        `Produto rastreado desde a origem na ${farmName}`,
        `${completedEvents}/${totalEvents} etapas da cadeia documentadas`,
        regulatoryRisk === 'LOW' ? 'Conformidade regulatória adequada' : 'Ação requerida para conformidade regulatória',
        `Container ${lote?.containerNumber || 'N/A'} embarcado no navio ${lote?.vesselName || 'N/A'}`
      ],
      executiveSummary,
      chainBreaks,
      complianceChecks
    };

    return of(insights).pipe(delay(this.randomDelay()));
  }

  getMetrics(): Observable<RastreabilidadeMetrics> {
    const totalLotes = this.lotes.length;
    const lotesInTransit = this.lotes.filter(l => l.currentStatus === 'Em Trânsito').length;
    const lotesDelivered = this.lotes.filter(l => l.currentStatus === 'Entregue').length;

    let totalScore = 0;
    let pendingDocuments = 0;
    let chainBreaksDetected = 0;

    this.lotes.forEach(l => {
      const timeline = this.timelines.get(l.id) || [];
      const completed = timeline.filter(e => e.status === 'completed').length;
      const total = timeline.length;
      totalScore += total > 0 ? Math.round((completed / total) * 100) : 0;

      const docs = this.documents.get(l.id) || [];
      pendingDocuments += docs.filter(d => d.status === 'pending').length;

      for (let i = 0; i < timeline.length - 1; i++) {
        if (timeline[i].status === 'completed' && timeline[i + 1].status === 'pending' && i < timeline.length - 2) {
          chainBreaksDetected++;
        }
      }
    });

    const metrics: RastreabilidadeMetrics = {
      totalLotes,
      lotesInTransit,
      lotesDelivered,
      avgTraceabilityScore: totalLotes > 0 ? Math.round(totalScore / totalLotes) : 0,
      pendingDocuments,
      chainBreaksDetected
    };

    return of(metrics).pipe(delay(300));
  }

  getSupplyChainNodes(loteId: string): Observable<SupplyChainNode[]> {
    const timeline = this.timelines.get(loteId) || [];
    const nodes: SupplyChainNode[] = timeline.map(event => ({
      id: event.id,
      type: event.eventType,
      label: event.title,
      sublabel: event.location,
      date: event.date,
      status: event.status
    }));
    return of(nodes).pipe(delay(this.randomDelay()));
  }

  searchByNaturalLanguage(query: string): Observable<RastreabilidadeLote[]> {
    const keywords = query.toLowerCase().split(/\s+/);
    const result = this.lotes.filter(l => {
      const searchableText = [
        l.loteNumber, l.productName, l.farmName, l.clientName,
        l.containerNumber, l.vesselName, l.destinationCountry,
        l.currentStatus, l.currentLocation, l.harvest
      ].join(' ').toLowerCase();
      return keywords.some(k => searchableText.includes(k));
    });
    return of(result).pipe(delay(600));
  }

  // Synchronous filter options
  getHarvests(): string[] {
    return ['2025/2026', '2024/2025', '2023/2024'];
  }

  getFarms(): string[] {
    return ['Fazenda Santa Maria', 'Fazenda Primavera', 'Fazenda Boa Vista', 'Fazenda São João', 'Fazenda Esperança'];
  }

  getWarehouses(): string[] {
    return ['Armazém Santos', 'Armazém Paranaguá', 'Armazém Rio Grande', 'Armazém Itajaí', 'Armazém Vitória'];
  }

  getCountries(): string[] {
    return ['USA', 'China', 'Germany', 'Japan', 'Netherlands', 'South Korea', 'United Kingdom'];
  }

  getClients(): string[] {
    return ['Global Grain Corp (USA)', 'China Foods Import Co.', 'European Commodities GmbH (Germany)', 'Tokyo Trading Ltd (Japan)', 'Holland Agri BV (Netherlands)', 'Korea Trade Co. (South Korea)'];
  }

  // ================================
  // PRIVATE HELPERS
  // ================================

  private randomDelay(): number {
    return Math.floor(Math.random() * 600) + 200;
  }

  private generateId(): string {
    return `id_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  }

  private generateComplianceChecks(country: string, docs: TraceDocument[]): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const hasPhyto = docs.some(d => d.documentType === 'Certificado Fitossanitário' && d.status === 'valid');
    const hasOrigin = docs.some(d => d.documentType === 'Certificado de Origem' && d.status === 'valid');

    if (country === 'China' || country === 'Japan' || country === 'South Korea') {
      checks.push({
        country,
        requirement: 'Certificado Fitossanitário',
        status: hasPhyto ? 'pass' : 'fail',
        details: hasPhyto ? 'Certificado válido e vigente' : 'Certificado fitossanitário ausente ou vencido'
      });
      checks.push({
        country,
        requirement: 'Inspeção Pré-Embarque',
        status: 'pass',
        details: 'Inspeção realizada conforme protocolo bilateral'
      });
    }

    if (country === 'Germany' || country === 'Netherlands' || country === 'United Kingdom') {
      checks.push({
        country,
        requirement: 'EU Deforestation Regulation',
        status: hasOrigin ? 'pass' : 'warning',
        details: hasOrigin ? 'Declaração de conformidade apresentada' : 'Certificado de origem pendente - necessário para EUDR'
      });
      checks.push({
        country,
        requirement: 'Rastreabilidade de Origem',
        status: 'pass',
        details: 'Dados de geolocalização da fazenda disponíveis'
      });
    }

    if (country === 'USA') {
      checks.push({
        country,
        requirement: 'FDA Import Requirements',
        status: 'pass',
        details: 'Requisitos FDA atendidos - registro de estabelecimento válido'
      });
      checks.push({
        country,
        requirement: 'FSVP Compliance',
        status: hasPhyto ? 'pass' : 'warning',
        details: hasPhyto ? 'Foreign Supplier Verification Program compliant' : 'Verificação de fornecedor estrangeiro pendente'
      });
    }

    return checks;
  }

  // ================================
  // MOCK DATA INITIALIZATION
  // ================================

  private initializeMockData(): void {
    const farms = [
      { name: 'Fazenda Santa Maria', plot: 'Talhão A3', producer: 'João Carlos Ribeiro' },
      { name: 'Fazenda Primavera', plot: 'Talhão B1', producer: 'Maria Fernanda Costa' },
      { name: 'Fazenda Boa Vista', plot: 'Talhão C2', producer: 'Pedro Henrique Alves' },
      { name: 'Fazenda São João', plot: 'Talhão D4', producer: 'Ana Paula Souza' },
      { name: 'Fazenda Esperança', plot: 'Talhão E1', producer: 'Roberto Silva Neto' }
    ];

    const products = [
      { name: 'Soja em Grão', unit: 'ton' },
      { name: 'Milho em Grão', unit: 'ton' },
      { name: 'Café Arábica', unit: 'sacas' },
      { name: 'Açúcar Cristal', unit: 'ton' },
      { name: 'Carne Bovina Congelada', unit: 'ton' }
    ];

    const clients = [
      { name: 'Global Grain Corp (USA)', country: 'USA' },
      { name: 'China Foods Import Co.', country: 'China' },
      { name: 'European Commodities GmbH (Germany)', country: 'Germany' },
      { name: 'Tokyo Trading Ltd (Japan)', country: 'Japan' },
      { name: 'Holland Agri BV (Netherlands)', country: 'Netherlands' },
      { name: 'Korea Trade Co. (South Korea)', country: 'South Korea' }
    ];

    const vessels = ['MSC Aurora', 'CMA CGM Concorde', 'Maersk Sealand', 'Hapag-Lloyd Express', 'Evergreen Fortune', 'COSCO Shipping Star'];
    const ports = ['Porto de Santos', 'Porto de Paranaguá', 'Porto de Rio Grande'];
    const warehouses = ['Armazém Santos', 'Armazém Paranaguá', 'Armazém Rio Grande', 'Armazém Itajaí', 'Armazém Vitória'];

    const statuses = ['Em Produção', 'No Armazém', 'Em Trânsito', 'No Porto', 'Embarcado', 'Entregue'];
    const harvests = ['2025/2026', '2024/2025', '2023/2024'];

    for (let i = 0; i < 18; i++) {
      const farm = farms[i % farms.length];
      const product = products[i % products.length];
      const client = clients[i % clients.length];
      const vessel = vessels[i % vessels.length];
      const port = ports[i % ports.length];
      const warehouse = warehouses[i % warehouses.length];
      const status = statuses[Math.min(i % 6, statuses.length - 1)];
      const harvest = harvests[i % harvests.length];

      const loteId = `rastr_${i + 1}`;
      const loteNumber = `LT-2026-${String(i + 1).padStart(3, '0')}`;
      const containerNumber = `${['MSCU', 'CMAU', 'MSKU', 'HLCU', 'EGHU', 'CSQU'][i % 6]}${String(1234567 + i * 111).slice(0, 7)}`;
      const quantity = Math.floor(Math.random() * 800) + 200;

      const productionDate = new Date(2025, Math.floor(i / 3), 10 + (i % 20));

      const lote: RastreabilidadeLote = {
        id: loteId,
        loteNumber,
        productName: product.name,
        harvest,
        farmName: farm.name,
        farmPlot: farm.plot,
        producerName: farm.producer,
        quantity,
        unit: product.unit,
        productionDate,
        currentStatus: status,
        currentLocation: status === 'Em Trânsito' || status === 'Embarcado' ? `${vessel} - ${port}` : warehouse,
        destinationCountry: client.country,
        clientName: client.name,
        containerNumber,
        vesselName: vessel,
        invoiceNumber: `INV-2026-${String(1000 + i)}`,
        dueNumber: `DUE-${String(2026)}${String(i + 1).padStart(6, '0')}`,
        bookingNumber: `BK-${String(50000 + i * 13)}`,
        blNumber: `BL-${['BRSSZ', 'BRPNG', 'BRRGS'][i % 3]}-${String(2026)}${String(i + 1).padStart(4, '0')}`
      };

      this.lotes.push(lote);

      // Generate timeline for this lot
      this.timelines.set(loteId, this.generateTimeline(loteId, lote, status));

      // Generate documents for this lot
      this.documents.set(loteId, this.generateDocuments(loteId, lote, status));
    }
  }

  private generateTimeline(loteId: string, lote: RastreabilidadeLote, currentStatus: string): TimelineEvent[] {
    const statusIndex = ['Em Produção', 'No Armazém', 'Em Trânsito', 'No Porto', 'Embarcado', 'Entregue'].indexOf(currentStatus);
    const baseDate = lote.productionDate;

    const events: { type: TimelineEventType; title: string; description: string; location: string; dayOffset: number }[] = [
      { type: 'SAFRA', title: 'Início da Safra', description: `Safra ${lote.harvest} iniciada`, location: lote.farmName, dayOffset: 0 },
      { type: 'FAZENDA', title: 'Plantio e Cultivo', description: `Cultivo de ${lote.productName} no ${lote.farmPlot}`, location: lote.farmName, dayOffset: 15 },
      { type: 'COLHEITA', title: 'Colheita', description: `Colheita de ${lote.quantity} ${lote.unit} de ${lote.productName}`, location: lote.farmName, dayOffset: 90 },
      { type: 'RECEBIMENTO', title: 'Recebimento no Armazém', description: `Lote recebido e registrado`, location: lote.currentLocation.includes('Armazém') ? lote.currentLocation : 'Armazém Santos', dayOffset: 95 },
      { type: 'ARMAZEM', title: 'Armazenagem', description: 'Produto armazenado em condições controladas', location: lote.currentLocation.includes('Armazém') ? lote.currentLocation : 'Armazém Santos', dayOffset: 96 },
      { type: 'QUALIDADE', title: 'Inspeção de Qualidade', description: 'Análise laboratorial e inspeção visual aprovadas', location: lote.currentLocation.includes('Armazém') ? lote.currentLocation : 'Armazém Santos', dayOffset: 100 },
      { type: 'CONTAINER', title: 'Estufagem de Container', description: `Container ${lote.containerNumber} carregado`, location: 'Terminal de Containers', dayOffset: 110 },
      { type: 'PORTO', title: 'Chegada ao Porto', description: `Container posicionado no pátio do porto`, location: 'Porto de Santos', dayOffset: 115 },
      { type: 'NAVIO', title: 'Embarque no Navio', description: `Embarcado no ${lote.vesselName}`, location: 'Porto de Santos', dayOffset: 120 },
      { type: 'EXPORTACAO', title: 'Despacho Aduaneiro', description: `DU-E ${lote.dueNumber} registrada. BL ${lote.blNumber} emitido`, location: 'Receita Federal - Porto', dayOffset: 121 },
      { type: 'CLIENTE', title: 'Entrega ao Cliente', description: `Entregue a ${lote.clientName}`, location: lote.destinationCountry, dayOffset: 150 }
    ];

    // Determine how many events are completed based on status
    let completedCount: number;
    switch (statusIndex) {
      case 0: completedCount = 2; break;   // Em Produção
      case 1: completedCount = 5; break;   // No Armazém
      case 2: completedCount = 7; break;   // Em Trânsito
      case 3: completedCount = 8; break;   // No Porto
      case 4: completedCount = 10; break;  // Embarcado
      case 5: completedCount = 11; break;  // Entregue
      default: completedCount = 3; break;
    }

    return events.map((event, index) => {
      let status: 'completed' | 'current' | 'pending';
      if (index < completedCount) status = 'completed';
      else if (index === completedCount) status = 'current';
      else status = 'pending';

      const eventDate = new Date(baseDate);
      eventDate.setDate(eventDate.getDate() + event.dayOffset);

      return {
        id: `${loteId}_evt_${index}`,
        loteId,
        eventType: event.type,
        title: event.title,
        description: event.description,
        date: eventDate,
        location: event.location,
        responsibleUser: ['Carlos Mendes', 'Juliana Ferreira', 'Marcos Oliveira', 'Fernanda Lima', 'Ricardo Santos'][index % 5],
        documents: this.getEventDocuments(event.type),
        observations: '',
        status
      };
    });
  }

  private getEventDocuments(type: TimelineEventType): string[] {
    switch (type) {
      case 'COLHEITA': return ['Nota Fiscal de Produtor'];
      case 'QUALIDADE': return ['Laudo de Qualidade', 'Certificado Fitossanitário'];
      case 'CONTAINER': return ['Packing List'];
      case 'PORTO': return ['Booking Confirmation'];
      case 'NAVIO': return ['Bill of Lading'];
      case 'EXPORTACAO': return ['DU-E', 'Invoice', 'Certificado de Origem'];
      case 'CLIENTE': return ['Delivery Receipt'];
      default: return [];
    }
  }

  private generateDocuments(loteId: string, lote: RastreabilidadeLote, currentStatus: string): TraceDocument[] {
    const statusIndex = ['Em Produção', 'No Armazém', 'Em Trânsito', 'No Porto', 'Embarcado', 'Entregue'].indexOf(currentStatus);
    const baseDate = lote.productionDate;

    const docTemplates = [
      { type: 'Invoice', number: lote.invoiceNumber, dayOffset: 100, alwaysValid: true },
      { type: 'Packing List', number: `PL-${lote.loteNumber}`, dayOffset: 110, alwaysValid: true },
      { type: 'DU-E', number: lote.dueNumber, dayOffset: 115, alwaysValid: true },
      { type: 'Bill of Lading', number: lote.blNumber, dayOffset: 120, alwaysValid: true },
      { type: 'Certificado Fitossanitário', number: `CF-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`, dayOffset: 98, alwaysValid: false },
      { type: 'Certificado de Origem', number: `CO-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`, dayOffset: 105, alwaysValid: false }
    ];

    return docTemplates.map((doc, index) => {
      const issueDate = new Date(baseDate);
      issueDate.setDate(issueDate.getDate() + doc.dayOffset);

      let status: 'valid' | 'expired' | 'pending';
      if (statusIndex >= 4) {
        // Embarked or delivered - most docs valid
        status = doc.alwaysValid ? 'valid' : (Math.random() > 0.85 ? 'expired' : 'valid');
      } else if (statusIndex >= 2) {
        // In transit - some pending
        status = index < 3 ? 'valid' : (Math.random() > 0.5 ? 'valid' : 'pending');
      } else {
        // Still at farm/warehouse - many pending
        status = index < 1 ? 'valid' : 'pending';
      }

      const expiryDate = new Date(issueDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      return {
        id: `${loteId}_doc_${index}`,
        loteId,
        documentType: doc.type,
        documentNumber: doc.number,
        issueDate,
        expiryDate: doc.alwaysValid ? undefined : expiryDate,
        status,
        fileUrl: status !== 'pending' ? `/docs/${loteId}/${doc.type.replace(/\s/g, '_').toLowerCase()}.pdf` : undefined
      };
    });
  }
}

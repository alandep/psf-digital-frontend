import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  RegistroExportacao, REStatus, REProduct, REDocument,
  REDivergence, RETimelineEvent, REAIInsights, AISuggestion,
  REFilters, REMetrics
} from '../types/registro-exportacao';

@Injectable({ providedIn: 'root' })
export class RegistroExportacaoMockService {

  private registros: RegistroExportacao[] = this.generateREs();
  private productsMap: Map<string, REProduct[]> = new Map();
  private documentsMap: Map<string, REDocument[]> = new Map();
  private divergencesMap: Map<string, REDivergence[]> = new Map();
  private timelinesMap: Map<string, RETimelineEvent[]> = new Map();

  constructor() {
    this.registros.forEach(re => {
      this.productsMap.set(re.id, this.generateProducts(re));
      this.documentsMap.set(re.id, this.generateDocuments(re));
      this.divergencesMap.set(re.id, this.generateDivergences(re));
      this.timelinesMap.set(re.id, this.generateTimeline(re));
    });
  }

  // === PUBLIC METHODS ===

  getREs(filters?: REFilters): Observable<RegistroExportacao[]> {
    let result = [...this.registros];
    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        result = result.filter(r =>
          r.reNumber.toLowerCase().includes(search) ||
          r.exporterName.toLowerCase().includes(search) ||
          r.clientName.toLowerCase().includes(search) ||
          r.productName.toLowerCase().includes(search)
        );
      }
      if (filters.status) result = result.filter(r => r.status === filters.status);
      if (filters.exporterName) result = result.filter(r => r.exporterName === filters.exporterName);
      if (filters.destinationCountry) result = result.filter(r => r.destinationCountry === filters.destinationCountry);
      if (filters.productName) result = result.filter(r => r.productName === filters.productName);
      if (filters.linkedDue === 'COM_DUE') result = result.filter(r => r.linkedDueNumber !== null);
      if (filters.linkedDue === 'SEM_DUE') result = result.filter(r => r.linkedDueNumber === null);
    }
    return of(result).pipe(delay(400));
  }

  getREById(id: string): Observable<RegistroExportacao | null> {
    return of(this.registros.find(r => r.id === id) || null).pipe(delay(200));
  }

  importRE(data: Partial<RegistroExportacao>): Observable<RegistroExportacao> {
    const newRE: RegistroExportacao = {
      id: `re-${Date.now()}`,
      reNumber: `RE/${new Date().getFullYear()}/${String(this.registros.length + 1).padStart(6, '0')}`,
      status: 'IMPORTADO',
      exporterName: data.exporterName || 'Agro Export Brasil Ltda',
      exporterCnpj: data.exporterCnpj || '12.345.678/0001-90',
      clientName: data.clientName || '',
      destinationCountry: data.destinationCountry || '',
      productName: data.productName || '',
      ncm: data.ncm || '',
      quantity: data.quantity || 0,
      unit: data.unit || 'TON',
      totalValue: data.totalValue || 0,
      currency: data.currency || 'USD',
      incoterm: data.incoterm || 'FOB',
      portOrigin: data.portOrigin || 'Santos',
      transportMode: data.transportMode || 'Marítimo',
      operationNature: data.operationNature || 'Venda',
      linkedExportId: null,
      linkedDueNumber: null,
      migrationScore: 0,
      consistencyScore: 0,
      createdAt: new Date(),
      importedAt: new Date(),
      originalSource: data.originalSource || 'Importação Manual',
    };
    this.registros.unshift(newRE);
    return of(newRE).pipe(delay(500));
  }

  getProducts(reId: string): Observable<REProduct[]> {
    return of(this.productsMap.get(reId) || []).pipe(delay(300));
  }

  getDocuments(reId: string): Observable<REDocument[]> {
    return of(this.documentsMap.get(reId) || []).pipe(delay(300));
  }

  getDivergences(reId: string): Observable<REDivergence[]> {
    return of(this.divergencesMap.get(reId) || []).pipe(delay(300));
  }

  getTimeline(reId: string): Observable<RETimelineEvent[]> {
    return of(this.timelinesMap.get(reId) || []).pipe(delay(300));
  }

  getAIInsights(reId: string): Observable<REAIInsights> {
    const re = this.registros.find(r => r.id === reId);
    const divergences = this.divergencesMap.get(reId) || [];
    const migrationScore = re?.migrationScore || 50;
    const consistencyScore = re?.consistencyScore || 60;
    const hasHighDivergence = divergences.some(d => d.severity === 'HIGH');

    let conversionReadiness: 'READY' | 'NEEDS_REVIEW' | 'NOT_READY' = 'NOT_READY';
    if (migrationScore >= 90 && !hasHighDivergence) conversionReadiness = 'READY';
    else if (migrationScore >= 60) conversionReadiness = 'NEEDS_REVIEW';

    const suggestions: AISuggestion[] = this.generateSuggestions(re!);

    const insights: REAIInsights = {
      reId: reId,
      migrationScore,
      consistencyScore,
      divergences,
      conversionReadiness,
      suggestions,
      executiveSummary: this.generateExecutiveSummary(re!, migrationScore, consistencyScore, conversionReadiness),
    };
    return of(insights).pipe(delay(500));
  }

  getMetrics(): Observable<REMetrics> {
    const metrics: REMetrics = {
      totalREs: this.registros.length,
      importedCount: this.registros.filter(r => r.status === 'IMPORTADO').length,
      convertedCount: this.registros.filter(r => r.status === 'CONVERTIDO').length,
      pendingCount: this.registros.filter(r => r.status === 'PENDENTE').length,
      divergentCount: this.registros.filter(r => r.status === 'DIVERGENTE').length,
      avgMigrationScore: Math.round(
        this.registros.reduce((sum, r) => sum + r.migrationScore, 0) / this.registros.length
      ),
    };
    return of(metrics).pipe(delay(300));
  }

  convertToDUE(reId: string): Observable<{success: boolean, dueNumber: string, message: string}> {
    const re = this.registros.find(r => r.id === reId);
    if (!re) {
      return of({ success: false, dueNumber: '', message: 'RE não encontrado' }).pipe(delay(300));
    }
    if (re.migrationScore < 60) {
      return of({ success: false, dueNumber: '', message: 'Score de migração insuficiente. Resolva as divergências antes de converter.' }).pipe(delay(500));
    }
    const dueNumber = `BR${new Date().getFullYear()}${String(Math.floor(Math.random() * 99999999)).padStart(8, '0')}`;
    re.status = 'CONVERTIDO';
    re.linkedDueNumber = dueNumber;
    return of({ success: true, dueNumber, message: `RE convertido com sucesso para DU-E ${dueNumber}` }).pipe(delay(800));
  }

  validateConsistency(reId: string): Observable<REDivergence[]> {
    const divergences = this.divergencesMap.get(reId) || [];
    return of(divergences).pipe(delay(600));
  }

  // === SYNCHRONOUS FILTER OPTIONS ===

  getExporters(): string[] {
    return ['Agro Export Brasil Ltda', 'Brazilian Commodities SA', 'Café Premium Export', 'Grãos do Sul Exportadora'];
  }

  getCountries(): string[] {
    return ['China', 'Estados Unidos', 'Alemanha', 'Japão', 'Coreia do Sul', 'Itália', 'Bélgica', 'Holanda'];
  }

  getStatuses(): { value: REStatus; label: string }[] {
    return [
      { value: 'IMPORTADO', label: 'Importado' },
      { value: 'VALIDADO', label: 'Validado' },
      { value: 'CONVERTIDO', label: 'Convertido' },
      { value: 'PENDENTE', label: 'Pendente' },
      { value: 'DIVERGENTE', label: 'Divergente' },
      { value: 'ARQUIVADO', label: 'Arquivado' },
    ];
  }

  getProducts_list(): string[] {
    return ['Soja em Grãos', 'Milho em Grãos', 'Café Arábica', 'Açúcar Cristal', 'Carne Bovina Congelada'];
  }

  // === PRIVATE DATA GENERATORS ===

  private generateREs(): RegistroExportacao[] {
    return [
      {
        id: 're-001', reNumber: 'RE/2019/000142', status: 'CONVERTIDO',
        exporterName: 'Agro Export Brasil Ltda', exporterCnpj: '12.345.678/0001-90',
        clientName: 'Shanghai Grain Trading Co.', destinationCountry: 'China',
        productName: 'Soja em Grãos', ncm: '12019000', quantity: 5000, unit: 'TON',
        totalValue: 2150000, currency: 'USD', incoterm: 'FOB', portOrigin: 'Santos',
        transportMode: 'Marítimo', operationNature: 'Venda',
        linkedExportId: 'exp-001', linkedDueNumber: 'BR202400001234',
        migrationScore: 95, consistencyScore: 92,
        createdAt: new Date('2019-03-15'), importedAt: new Date('2024-01-10'),
        originalSource: 'ERP SAP'
      },
      {
        id: 're-002', reNumber: 'RE/2020/000287', status: 'VALIDADO',
        exporterName: 'Brazilian Commodities SA', exporterCnpj: '23.456.789/0001-01',
        clientName: 'Kraft Foods International', destinationCountry: 'Estados Unidos',
        productName: 'Café Arábica', ncm: '09011110', quantity: 800, unit: 'TON',
        totalValue: 4800000, currency: 'USD', incoterm: 'CIF', portOrigin: 'Santos',
        transportMode: 'Marítimo', operationNature: 'Venda',
        linkedExportId: 'exp-002', linkedDueNumber: null,
        migrationScore: 88, consistencyScore: 85,
        createdAt: new Date('2020-06-22'), importedAt: new Date('2024-02-05'),
        originalSource: 'Siscomex Legado'
      },
      {
        id: 're-003', reNumber: 'RE/2018/000089', status: 'DIVERGENTE',
        exporterName: 'Café Premium Export', exporterCnpj: '34.567.890/0001-12',
        clientName: 'Lavazza SpA', destinationCountry: 'Itália',
        productName: 'Café Arábica', ncm: '09011190', quantity: 450, unit: 'TON',
        totalValue: 3150000, currency: 'USD', incoterm: 'FOB', portOrigin: 'Santos',
        transportMode: 'Marítimo', operationNature: 'Venda',
        linkedExportId: null, linkedDueNumber: null,
        migrationScore: 62, consistencyScore: 48,
        createdAt: new Date('2018-09-10'), importedAt: new Date('2024-01-20'),
        originalSource: 'Sistema Legado'
      },
      {
        id: 're-004', reNumber: 'RE/2019/000201', status: 'IMPORTADO',
        exporterName: 'Agro Export Brasil Ltda', exporterCnpj: '12.345.678/0001-90',
        clientName: 'Mitsubishi Corporation', destinationCountry: 'Japão',
        productName: 'Soja em Grãos', ncm: '12019000', quantity: 3200, unit: 'TON',
        totalValue: 1380000, currency: 'USD', incoterm: 'CFR', portOrigin: 'Paranaguá',
        transportMode: 'Marítimo', operationNature: 'Venda',
        linkedExportId: null, linkedDueNumber: null,
        migrationScore: 72, consistencyScore: 78,
        createdAt: new Date('2019-11-05'), importedAt: new Date('2024-03-01'),
        originalSource: 'ERP SAP'
      },
      {
        id: 're-005', reNumber: 'RE/2020/000315', status: 'PENDENTE',
        exporterName: 'Grãos do Sul Exportadora', exporterCnpj: '45.678.901/0001-23',
        clientName: 'Samsung C&T Corporation', destinationCountry: 'Coreia do Sul',
        productName: 'Milho em Grãos', ncm: '10059010', quantity: 7500, unit: 'TON',
        totalValue: 1875000, currency: 'USD', incoterm: 'FOB', portOrigin: 'Rio Grande',
        transportMode: 'Marítimo', operationNature: 'Venda',
        linkedExportId: null, linkedDueNumber: null,
        migrationScore: 55, consistencyScore: 60,
        createdAt: new Date('2020-02-18'), importedAt: new Date('2024-02-15'),
        originalSource: 'Importação Manual'
      },
      {
        id: 're-006', reNumber: 'RE/2017/000034', status: 'ARQUIVADO',
        exporterName: 'Brazilian Commodities SA', exporterCnpj: '23.456.789/0001-01',
        clientName: 'ADM Hamburg AG', destinationCountry: 'Alemanha',
        productName: 'Açúcar Cristal', ncm: '17011400', quantity: 12000, unit: 'TON',
        totalValue: 4200000, currency: 'USD', incoterm: 'FOB', portOrigin: 'Santos',
        transportMode: 'Marítimo', operationNature: 'Venda',
        linkedExportId: 'exp-010', linkedDueNumber: 'BR202300005678',
        migrationScore: 98, consistencyScore: 96,
        createdAt: new Date('2017-07-12'), importedAt: new Date('2023-11-20'),
        originalSource: 'Siscomex Legado'
      },
      {
        id: 're-007', reNumber: 'RE/2020/000401', status: 'CONVERTIDO',
        exporterName: 'Agro Export Brasil Ltda', exporterCnpj: '12.345.678/0001-90',
        clientName: 'Cargill BV', destinationCountry: 'Holanda',
        productName: 'Soja em Grãos', ncm: '12019000', quantity: 6000, unit: 'TON',
        totalValue: 2580000, currency: 'USD', incoterm: 'CIF', portOrigin: 'Santos',
        transportMode: 'Marítimo', operationNature: 'Venda',
        linkedExportId: 'exp-015', linkedDueNumber: 'BR202400002345',
        migrationScore: 92, consistencyScore: 90,
        createdAt: new Date('2020-08-30'), importedAt: new Date('2024-01-15'),
        originalSource: 'ERP SAP'
      },
      {
        id: 're-008', reNumber: 'RE/2019/000178', status: 'DIVERGENTE',
        exporterName: 'Grãos do Sul Exportadora', exporterCnpj: '45.678.901/0001-23',
        clientName: 'Bunge Europe', destinationCountry: 'Bélgica',
        productName: 'Milho em Grãos', ncm: '10059010', quantity: 4500, unit: 'TON',
        totalValue: 1125000, currency: 'USD', incoterm: 'FOB', portOrigin: 'Paranaguá',
        transportMode: 'Marítimo', operationNature: 'Venda',
        linkedExportId: null, linkedDueNumber: null,
        migrationScore: 45, consistencyScore: 38,
        createdAt: new Date('2019-04-22'), importedAt: new Date('2024-02-28'),
        originalSource: 'Sistema Legado'
      },
      {
        id: 're-009', reNumber: 'RE/2018/000112', status: 'VALIDADO',
        exporterName: 'Café Premium Export', exporterCnpj: '34.567.890/0001-12',
        clientName: 'Nestlé SA', destinationCountry: 'Alemanha',
        productName: 'Café Arábica', ncm: '09011110', quantity: 600, unit: 'TON',
        totalValue: 3600000, currency: 'USD', incoterm: 'FOB', portOrigin: 'Santos',
        transportMode: 'Marítimo', operationNature: 'Venda',
        linkedExportId: 'exp-008', linkedDueNumber: null,
        migrationScore: 82, consistencyScore: 88,
        createdAt: new Date('2018-11-15'), importedAt: new Date('2024-01-25'),
        originalSource: 'Siscomex Legado'
      },
      {
        id: 're-010', reNumber: 'RE/2020/000456', status: 'PENDENTE',
        exporterName: 'Brazilian Commodities SA', exporterCnpj: '23.456.789/0001-01',
        clientName: 'JBS USA Holdings', destinationCountry: 'Estados Unidos',
        productName: 'Carne Bovina Congelada', ncm: '02023000', quantity: 200, unit: 'TON',
        totalValue: 1200000, currency: 'USD', incoterm: 'CIF', portOrigin: 'Itajaí',
        transportMode: 'Marítimo', operationNature: 'Venda',
        linkedExportId: null, linkedDueNumber: null,
        migrationScore: 68, consistencyScore: 72,
        createdAt: new Date('2020-05-10'), importedAt: new Date('2024-03-05'),
        originalSource: 'Importação Manual'
      },
      {
        id: 're-011', reNumber: 'RE/2019/000225', status: 'IMPORTADO',
        exporterName: 'Agro Export Brasil Ltda', exporterCnpj: '12.345.678/0001-90',
        clientName: 'COFCO International', destinationCountry: 'China',
        productName: 'Açúcar Cristal', ncm: '17011400', quantity: 8000, unit: 'TON',
        totalValue: 2800000, currency: 'USD', incoterm: 'FOB', portOrigin: 'Santos',
        transportMode: 'Marítimo', operationNature: 'Venda',
        linkedExportId: null, linkedDueNumber: null,
        migrationScore: 75, consistencyScore: 70,
        createdAt: new Date('2019-08-20'), importedAt: new Date('2024-03-10'),
        originalSource: 'ERP SAP'
      },
      {
        id: 're-012', reNumber: 'RE/2018/000067', status: 'CONVERTIDO',
        exporterName: 'Café Premium Export', exporterCnpj: '34.567.890/0001-12',
        clientName: 'Starbucks Coffee Trading', destinationCountry: 'Estados Unidos',
        productName: 'Café Arábica', ncm: '09011110', quantity: 350, unit: 'TON',
        totalValue: 2450000, currency: 'USD', incoterm: 'FOB', portOrigin: 'Santos',
        transportMode: 'Marítimo', operationNature: 'Venda',
        linkedExportId: 'exp-020', linkedDueNumber: 'BR202400003456',
        migrationScore: 97, consistencyScore: 94,
        createdAt: new Date('2018-04-05'), importedAt: new Date('2023-12-15'),
        originalSource: 'Siscomex Legado'
      },
    ];
  }

  private generateProducts(re: RegistroExportacao): REProduct[] {
    const products: REProduct[] = [
      {
        id: `prod-${re.id}-1`, reId: re.id,
        productName: re.productName, ncm: re.ncm,
        quantity: re.quantity * 0.6, unit: re.unit,
        value: re.totalValue * 0.6, netWeight: re.quantity * 0.6 * 1000,
        grossWeight: re.quantity * 0.6 * 1020, linkedLot: `LOT-${re.reNumber.slice(-4)}-A`
      },
      {
        id: `prod-${re.id}-2`, reId: re.id,
        productName: re.productName, ncm: re.ncm,
        quantity: re.quantity * 0.4, unit: re.unit,
        value: re.totalValue * 0.4, netWeight: re.quantity * 0.4 * 1000,
        grossWeight: re.quantity * 0.4 * 1020, linkedLot: `LOT-${re.reNumber.slice(-4)}-B`
      },
    ];
    return products;
  }

  private generateDocuments(re: RegistroExportacao): REDocument[] {
    const docs: REDocument[] = [
      {
        id: `doc-${re.id}-1`, reId: re.id,
        documentType: 'Nota Fiscal de Exportação',
        documentNumber: `NF-${Math.floor(Math.random() * 999999)}`,
        status: re.status === 'CONVERTIDO' ? 'converted' : 'valid',
        issueDate: re.createdAt,
      },
      {
        id: `doc-${re.id}-2`, reId: re.id,
        documentType: 'Certificado de Origem',
        documentNumber: `CO-${Math.floor(Math.random() * 99999)}`,
        status: new Date().getFullYear() - re.createdAt.getFullYear() > 3 ? 'expired' : 'valid',
        issueDate: re.createdAt,
      },
      {
        id: `doc-${re.id}-3`, reId: re.id,
        documentType: 'Licença de Exportação',
        documentNumber: `LE-${Math.floor(Math.random() * 99999)}`,
        status: re.status === 'PENDENTE' ? 'pending' : 'valid',
        issueDate: new Date(re.createdAt.getTime() + 86400000 * 5),
      },
    ];
    return docs;
  }

  private generateDivergences(re: RegistroExportacao): REDivergence[] {
    if (re.status === 'CONVERTIDO' || re.status === 'ARQUIVADO') return [];
    const divergences: REDivergence[] = [];
    if (re.consistencyScore < 80) {
      divergences.push({
        id: `div-${re.id}-1`, reId: re.id,
        field: 'NCM', reValue: re.ncm,
        currentValue: re.ncm.slice(0, -1) + (parseInt(re.ncm.slice(-1)) + 1),
        severity: 'HIGH',
        suggestion: `Atualizar NCM para ${re.ncm.slice(0, -1) + (parseInt(re.ncm.slice(-1)) + 1)} conforme classificação vigente`,
        aiConfidence: 0.89,
      });
    }
    if (re.consistencyScore < 70) {
      divergences.push({
        id: `div-${re.id}-2`, reId: re.id,
        field: 'Incoterm', reValue: re.incoterm,
        currentValue: re.incoterm === 'FOB' ? 'CIF' : 'FOB',
        severity: 'MEDIUM',
        suggestion: `Verificar condição de venda. Contratos recentes indicam ${re.incoterm === 'FOB' ? 'CIF' : 'FOB'}`,
        aiConfidence: 0.72,
      });
    }
    if (re.consistencyScore < 60) {
      divergences.push({
        id: `div-${re.id}-3`, reId: re.id,
        field: 'Porto de Origem', reValue: re.portOrigin,
        currentValue: 'Paranaguá',
        severity: 'LOW',
        suggestion: 'Operações recentes utilizam Paranaguá como porto principal',
        aiConfidence: 0.65,
      });
    }
    if (re.consistencyScore < 50) {
      divergences.push({
        id: `div-${re.id}-4`, reId: re.id,
        field: 'Razão Social Cliente', reValue: re.clientName,
        currentValue: re.clientName + ' Ltd.',
        severity: 'MEDIUM',
        suggestion: 'Razão social do cliente foi atualizada no cadastro',
        aiConfidence: 0.81,
      });
    }
    return divergences;
  }

  private generateTimeline(re: RegistroExportacao): RETimelineEvent[] {
    const events: RETimelineEvent[] = [
      {
        id: `tl-${re.id}-1`, reId: re.id,
        event: 'Criação do RE',
        date: re.createdAt,
        user: 'Sistema Legado',
        details: `RE criado originalmente no ${re.originalSource}`,
      },
      {
        id: `tl-${re.id}-2`, reId: re.id,
        event: 'Importação para EIP',
        date: re.importedAt,
        user: 'admin@empresa.com',
        details: `RE importado do ${re.originalSource} para a plataforma EIP`,
      },
      {
        id: `tl-${re.id}-3`, reId: re.id,
        event: 'Validação Automática',
        date: new Date(re.importedAt.getTime() + 86400000),
        user: 'IA - Motor de Validação',
        details: `Score de migração: ${re.migrationScore}%, Score de consistência: ${re.consistencyScore}%`,
      },
    ];
    if (re.status === 'CONVERTIDO') {
      events.push({
        id: `tl-${re.id}-4`, reId: re.id,
        event: 'Conversão para DU-E',
        date: new Date(re.importedAt.getTime() + 86400000 * 7),
        user: 'admin@empresa.com',
        details: `Convertido com sucesso para DU-E ${re.linkedDueNumber}`,
      });
    }
    if (re.status === 'DIVERGENTE') {
      events.push({
        id: `tl-${re.id}-4`, reId: re.id,
        event: 'Divergências Detectadas',
        date: new Date(re.importedAt.getTime() + 86400000 * 2),
        user: 'IA - Motor de Consistência',
        details: 'Divergências detectadas entre dados do RE e cadastros atuais',
      });
    }
    return events;
  }

  private generateSuggestions(re: RegistroExportacao): AISuggestion[] {
    const suggestions: AISuggestion[] = [
      {
        field: 'NCM',
        suggestion: `Verificar se NCM ${re.ncm} ainda é válido na TIPI vigente`,
        reason: 'Classificações NCM são atualizadas anualmente pela Receita Federal',
        source: 'TIPI 2024',
        confidence: 0.88,
      },
      {
        field: 'Incoterm',
        suggestion: `Confirmar ${re.incoterm} com contrato vigente do cliente`,
        reason: 'Contratos podem ter sido renegociados desde a emissão do RE',
        source: 'Módulo Contratos',
        confidence: 0.75,
      },
    ];
    if (re.migrationScore < 80) {
      suggestions.push({
        field: 'Dados Gerais',
        suggestion: 'Completar campos obrigatórios da DU-E antes da conversão',
        reason: 'Campos como CNPJ do despachante e enquadramento são obrigatórios na DU-E',
        source: 'Manual DU-E Siscomex',
        confidence: 0.92,
      });
    }
    return suggestions;
  }

  private generateExecutiveSummary(
    re: RegistroExportacao, migrationScore: number,
    consistencyScore: number, readiness: string
  ): string {
    if (readiness === 'READY') {
      return `O RE ${re.reNumber} possui ${migrationScore}% de compatibilidade com a estrutura da DU-E e ${consistencyScore}% de consistência com os dados atuais do sistema. Todos os campos obrigatórios estão preenchidos e não há divergências críticas. O registro está pronto para conversão automática para DU-E.`;
    }
    if (readiness === 'NEEDS_REVIEW') {
      return `O RE ${re.reNumber} possui ${migrationScore}% de compatibilidade com a estrutura da DU-E, porém apresenta ${consistencyScore}% de consistência com os dados atuais. Recomenda-se revisão das divergências identificadas antes da conversão. Campos como NCM e condições de venda podem necessitar atualização.`;
    }
    return `O RE ${re.reNumber} possui apenas ${migrationScore}% de compatibilidade com a DU-E e ${consistencyScore}% de consistência. Existem divergências críticas que impedem a conversão automática. É necessária intervenção manual para resolver os problemas identificados antes de prosseguir com a migração.`;
  }
}

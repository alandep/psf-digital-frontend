import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  DUE, DueStatus, DueProduct, DueAttribute, DueDocument,
  DueValidation, DueTimelineEvent, DueAIInsights, AIRecommendation,
  DueAuditEntry, DueFilters, DueMetrics
} from '../types/due';

@Injectable({ providedIn: 'root' })
export class DueMockService {

  private dues: DUE[] = this.generateDues();
  private products: Map<string, DueProduct[]> = new Map();
  private attributes: Map<string, DueAttribute[]> = new Map();
  private documents: Map<string, DueDocument[]> = new Map();
  private validations: Map<string, DueValidation[]> = new Map();
  private timelines: Map<string, DueTimelineEvent[]> = new Map();
  private audits: Map<string, DueAuditEntry[]> = new Map();

  constructor() {
    this.dues.forEach(due => {
      this.products.set(due.id, this.generateProducts(due));
      this.attributes.set(due.id, this.generateAttributes(due));
      this.documents.set(due.id, this.generateDocuments(due));
      this.validations.set(due.id, this.generateValidations(due));
      this.timelines.set(due.id, this.generateTimeline(due));
      this.audits.set(due.id, this.generateAudit(due));
    });
  }

  // === PUBLIC METHODS ===

  getDues(filters?: DueFilters): Observable<DUE[]> {
    let result = [...this.dues];
    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        result = result.filter(d =>
          d.dueNumber.toLowerCase().includes(search) ||
          d.exporterName.toLowerCase().includes(search) ||
          d.importerName.toLowerCase().includes(search) ||
          d.productName.toLowerCase().includes(search)
        );
      }
      if (filters.status) result = result.filter(d => d.status === filters.status);
      if (filters.exporterName) result = result.filter(d => d.exporterName === filters.exporterName);
      if (filters.destinationCountry) result = result.filter(d => d.destinationCountry === filters.destinationCountry);
      if (filters.productName) result = result.filter(d => d.productName === filters.productName);
      if (filters.portOrigin) result = result.filter(d => d.portOrigin === filters.portOrigin);
    }
    return of(result).pipe(delay(400));
  }

  getDueById(id: string): Observable<DUE | null> {
    return of(this.dues.find(d => d.id === id) || null).pipe(delay(200));
  }

  createDue(data: Partial<DUE>): Observable<DUE> {
    const newDue: DUE = {
      id: `due-${Date.now()}`,
      dueNumber: `BR${new Date().getFullYear()}${String(this.dues.length + 1).padStart(8, '0')}`,
      status: 'RASCUNHO',
      exporterName: data.exporterName || 'Agro Export Brasil Ltda',
      exporterCnpj: data.exporterCnpj || '12.345.678/0001-90',
      importerName: data.importerName || '',
      destinationCountry: data.destinationCountry || '',
      productName: data.productName || '',
      ncm: data.ncm || '',
      quantity: data.quantity || 0,
      unit: data.unit || 'TON',
      totalValue: data.totalValue || 0,
      currency: data.currency || 'USD',
      incoterm: data.incoterm || 'FOB',
      portOrigin: data.portOrigin || 'Santos',
      portDestination: data.portDestination || '',
      transportMode: data.transportMode || 'Marítimo',
      contractNumber: data.contractNumber || '',
      invoiceNumber: data.invoiceNumber || '',
      completionPercentage: 15,
      aiComplianceScore: 0,
      rejectionProbability: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSiscomexSync: null,
      createdBy: 'admin@empresa.com',
    };
    this.dues.unshift(newDue);
    return of(newDue).pipe(delay(500));
  }

  updateDue(id: string, data: Partial<DUE>): Observable<DUE> {
    const idx = this.dues.findIndex(d => d.id === id);
    if (idx >= 0) {
      this.dues[idx] = { ...this.dues[idx], ...data, updatedAt: new Date() };
    }
    return of(this.dues[idx]).pipe(delay(300));
  }

  getProducts(dueId: string): Observable<DueProduct[]> {
    return of(this.products.get(dueId) || []).pipe(delay(300));
  }

  getAttributes(dueId: string): Observable<DueAttribute[]> {
    return of(this.attributes.get(dueId) || []).pipe(delay(300));
  }

  getDocuments(dueId: string): Observable<DueDocument[]> {
    return of(this.documents.get(dueId) || []).pipe(delay(300));
  }

  getValidations(dueId: string): Observable<DueValidation[]> {
    return of(this.validations.get(dueId) || []).pipe(delay(400));
  }

  getTimeline(dueId: string): Observable<DueTimelineEvent[]> {
    return of(this.timelines.get(dueId) || []).pipe(delay(300));
  }

  getAIInsights(dueId: string): Observable<DueAIInsights> {
    return of(this.generateAIInsights(dueId)).pipe(delay(800));
  }

  getAudit(dueId: string): Observable<DueAuditEntry[]> {
    return of(this.audits.get(dueId) || []).pipe(delay(300));
  }

  getMetrics(): Observable<DueMetrics> {
    const metrics: DueMetrics = {
      totalDues: this.dues.length,
      draftCount: this.dues.filter(d => d.status === 'RASCUNHO').length,
      sentCount: this.dues.filter(d => ['ENVIADO', 'RECEBIDO', 'EM_ANÁLISE'].includes(d.status)).length,
      approvedCount: this.dues.filter(d => ['LIBERADO', 'AVERBADO', 'CONCLUÍDO'].includes(d.status)).length,
      rejectedCount: this.dues.filter(d => d.status === 'REJEITADO').length,
      avgComplianceScore: Math.round(this.dues.reduce((sum, d) => sum + d.aiComplianceScore, 0) / this.dues.length),
    };
    return of(metrics).pipe(delay(200));
  }

  sendToSiscomex(dueId: string): Observable<{ success: boolean; message: string }> {
    const due = this.dues.find(d => d.id === dueId);
    if (due && due.status === 'PRONTO_ENVIO') {
      due.status = 'ENVIADO';
      due.updatedAt = new Date();
      due.lastSiscomexSync = new Date();
      return of({ success: true, message: 'DU-E enviada ao Siscomex com sucesso.' }).pipe(delay(600));
    }
    return of({ success: false, message: 'DU-E não está pronta para envio.' }).pipe(delay(300));
  }

  syncSiscomex(dueId: string): Observable<DUE> {
    const due = this.dues.find(d => d.id === dueId);
    if (due) {
      due.lastSiscomexSync = new Date();
      due.updatedAt = new Date();
    }
    return of(due!).pipe(delay(500));
  }

  // === SYNCHRONOUS HELPER METHODS ===

  getExporters(): string[] {
    return ['Agro Export Brasil Ltda', 'Brazilian Commodities SA', 'Export Excellence Corp'];
  }

  getCountries(): string[] {
    return ['Estados Unidos', 'China', 'Alemanha', 'Japão', 'Holanda', 'Coreia do Sul', 'Itália', 'Emirados Árabes'];
  }

  getPorts(): string[] {
    return ['Santos', 'Paranaguá', 'Rio Grande', 'Itajaí', 'Vitória'];
  }

  getStatuses(): { value: DueStatus; label: string }[] {
    return [
      { value: 'RASCUNHO', label: 'Rascunho' },
      { value: 'VALIDAÇÃO', label: 'Em Validação' },
      { value: 'PRONTO_ENVIO', label: 'Pronto p/ Envio' },
      { value: 'ENVIADO', label: 'Enviado' },
      { value: 'RECEBIDO', label: 'Recebido' },
      { value: 'EM_ANÁLISE', label: 'Em Análise' },
      { value: 'LIBERADO', label: 'Liberado' },
      { value: 'AVERBADO', label: 'Averbado' },
      { value: 'CONCLUÍDO', label: 'Concluído' },
      { value: 'REJEITADO', label: 'Rejeitado' },
    ];
  }

  getProducts_list(): string[] {
    return ['Soja em Grão', 'Milho em Grão', 'Café Arábica', 'Açúcar Cristal', 'Carne Bovina Congelada'];
  }

  // === PRIVATE GENERATORS ===

  private generateDues(): DUE[] {
    const exporters = [
      { name: 'Agro Export Brasil Ltda', cnpj: '12.345.678/0001-90' },
      { name: 'Brazilian Commodities SA', cnpj: '98.765.432/0001-10' },
      { name: 'Export Excellence Corp', cnpj: '55.123.456/0001-77' },
    ];
    const importers = ['Global Grain Corp (USA)', 'China Foods Import Co.', 'European Commodities GmbH'];
    const products = [
      { name: 'Soja em Grão', ncm: '1201.90.00' },
      { name: 'Milho em Grão', ncm: '1005.90.10' },
      { name: 'Café Arábica', ncm: '0901.11.10' },
      { name: 'Açúcar Cristal', ncm: '1701.14.00' },
      { name: 'Carne Bovina Congelada', ncm: '0202.30.00' },
    ];
    const countries = ['Estados Unidos', 'China', 'Alemanha', 'Japão', 'Holanda', 'Coreia do Sul'];
    const ports = ['Santos', 'Paranaguá', 'Rio Grande'];
    const incoterms = ['FOB', 'CIF', 'CFR', 'FCA'];
    const statuses: DueStatus[] = [
      'RASCUNHO', 'RASCUNHO', 'VALIDAÇÃO', 'PRONTO_ENVIO', 'ENVIADO',
      'RECEBIDO', 'EM_ANÁLISE', 'LIBERADO', 'LIBERADO', 'AVERBADO',
      'CONCLUÍDO', 'CONCLUÍDO', 'CONCLUÍDO', 'REJEITADO', 'ENVIADO',
      'EM_ANÁLISE'
    ];

    return statuses.map((status, i) => {
      const exporter = exporters[i % exporters.length];
      const product = products[i % products.length];
      const country = countries[i % countries.length];
      const port = ports[i % ports.length];
      const qty = Math.floor(Math.random() * 5000) + 500;
      const price = Math.floor(Math.random() * 800) + 200;
      const completion = this.getCompletionForStatus(status);
      const compliance = Math.floor(Math.random() * 38) + 60;
      const rejection = Math.floor(Math.random() * 38) + 2;

      return {
        id: `due-${String(i + 1).padStart(3, '0')}`,
        dueNumber: `BR2024${String(1000 + i).padStart(8, '0')}`,
        status,
        exporterName: exporter.name,
        exporterCnpj: exporter.cnpj,
        importerName: importers[i % importers.length],
        destinationCountry: country,
        productName: product.name,
        ncm: product.ncm,
        quantity: qty,
        unit: 'TON',
        totalValue: qty * price,
        currency: 'USD',
        incoterm: incoterms[i % incoterms.length],
        portOrigin: port,
        portDestination: `Porto ${country}`,
        transportMode: 'Marítimo',
        contractNumber: `CTR-2024-${String(i + 1).padStart(4, '0')}`,
        invoiceNumber: `INV-2024-${String(i + 1).padStart(5, '0')}`,
        completionPercentage: completion,
        aiComplianceScore: compliance,
        rejectionProbability: rejection,
        createdAt: new Date(2024, Math.floor(i / 3), (i % 28) + 1),
        updatedAt: new Date(2024, Math.floor(i / 3) + 1, (i % 28) + 1),
        lastSiscomexSync: status !== 'RASCUNHO' ? new Date(2024, Math.floor(i / 3) + 1, (i % 28) + 1) : null,
        createdBy: 'admin@empresa.com',
      } as DUE;
    });
  }

  private getCompletionForStatus(status: DueStatus): number {
    const map: Record<DueStatus, number> = {
      'RASCUNHO': 25, 'VALIDAÇÃO': 50, 'PRONTO_ENVIO': 75,
      'ENVIADO': 80, 'RECEBIDO': 85, 'EM_ANÁLISE': 90,
      'LIBERADO': 95, 'AVERBADO': 98, 'CONCLUÍDO': 100, 'REJEITADO': 70,
    };
    return map[status] || 0;
  }

  private generateProducts(due: DUE): DueProduct[] {
    const count = Math.floor(Math.random() * 3) + 2;
    const products: DueProduct[] = [];
    for (let i = 0; i < count; i++) {
      const qty = Math.floor(due.quantity / count);
      const unitPrice = Math.floor(Math.random() * 500) + 200;
      products.push({
        id: `prod-${due.id}-${i}`,
        dueId: due.id,
        productName: due.productName + (i > 0 ? ` (Lote ${i + 1})` : ''),
        ncm: due.ncm,
        quantity: qty,
        unit: due.unit,
        unitPrice,
        totalValue: qty * unitPrice,
        linkedLots: [`LOT-${String(Math.floor(Math.random() * 999) + 1).padStart(4, '0')}`],
        netWeight: qty * 0.95,
        grossWeight: qty * 1.05,
      });
    }
    return products;
  }

  private generateAttributes(due: DUE): DueAttribute[] {
    const attrTemplates = [
      { name: 'País de Origem', value: 'Brasil', required: true },
      { name: 'Certificado Fitossanitário', value: 'Sim', required: true },
      { name: 'Teor de Umidade (%)', value: '13.5', required: true },
      { name: 'Grão Transgênico', value: 'Não', required: true },
      { name: 'Tratamento Quarentenário', value: 'Fumigação', required: false },
      { name: 'Destaque NCM', value: 'Sem destaque', required: false },
      { name: 'Acordo Tarifário', value: 'Mercosul', required: false },
      { name: 'Enquadramento Legal', value: 'Art. 212 RA', required: true },
    ];
    const count = Math.floor(Math.random() * 4) + 4;
    return attrTemplates.slice(0, count).map((attr, i) => ({
      id: `attr-${due.id}-${i}`,
      dueId: due.id,
      ncm: due.ncm,
      attributeName: attr.name,
      attributeValue: attr.value,
      required: attr.required,
      aiSuggested: Math.random() > 0.4,
      aiConfidence: Math.floor(Math.random() * 30) + 70,
      source: Math.random() > 0.5 ? 'Siscomex - Histórico' : 'IA - Análise NCM',
    }));
  }

  private generateDocuments(due: DUE): DueDocument[] {
    const docTypes = [
      { type: 'Invoice Comercial', number: due.invoiceNumber },
      { type: 'Packing List', number: `PL-${due.invoiceNumber}` },
      { type: 'Certificado de Origem', number: `CO-${Math.floor(Math.random() * 9999)}` },
      { type: 'Certificado Fitossanitário', number: `CF-${Math.floor(Math.random() * 9999)}` },
      { type: 'Bill of Lading', number: `BL-${Math.floor(Math.random() * 9999)}` },
      { type: 'Contrato de Câmbio', number: `CC-${Math.floor(Math.random() * 9999)}` },
      { type: 'Nota Fiscal', number: `NF-${Math.floor(Math.random() * 99999)}` },
      { type: 'Registro de Exportação', number: `RE-${Math.floor(Math.random() * 99999)}` },
    ];
    const count = Math.floor(Math.random() * 3) + 5;
    const statusOptions: ('valid' | 'expired' | 'pending' | 'missing')[] = ['valid', 'valid', 'valid', 'pending', 'missing'];
    return docTypes.slice(0, count).map((doc, i) => ({
      id: `doc-${due.id}-${i}`,
      dueId: due.id,
      documentType: doc.type,
      documentNumber: doc.number,
      status: statusOptions[i % statusOptions.length],
      issueDate: new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1),
      linkedAt: new Date(2024, Math.floor(Math.random() * 6) + 3, Math.floor(Math.random() * 28) + 1),
    }));
  }

  private generateValidations(due: DUE): DueValidation[] {
    const checks = [
      { name: 'NCM válido no Siscomex', status: 'pass' as const, severity: 'HIGH' as const, msg: 'NCM cadastrado e ativo', sug: '' },
      { name: 'Peso líquido vs. bruto', status: 'pass' as const, severity: 'MEDIUM' as const, msg: 'Relação peso consistente', sug: '' },
      { name: 'Certificado Fitossanitário', status: 'warning' as const, severity: 'HIGH' as const, msg: 'Certificado próximo ao vencimento', sug: 'Renovar certificado antes do embarque' },
      { name: 'Invoice vinculada', status: 'pass' as const, severity: 'CRITICAL' as const, msg: 'Invoice comercial vinculada', sug: '' },
      { name: 'País destino x NCM', status: 'pass' as const, severity: 'HIGH' as const, msg: 'Sem restrições para o destino', sug: '' },
      { name: 'Valor unitário compatível', status: 'warning' as const, severity: 'MEDIUM' as const, msg: 'Valor 8% acima da média de mercado', sug: 'Verificar cotação atualizada' },
      { name: 'CNPJ habilitado Siscomex', status: 'pass' as const, severity: 'CRITICAL' as const, msg: 'Exportador habilitado', sug: '' },
      { name: 'Limite de crédito', status: 'pass' as const, severity: 'LOW' as const, msg: 'Dentro do limite', sug: '' },
      { name: 'Atributos NCM obrigatórios', status: due.status === 'REJEITADO' ? 'fail' as const : 'pass' as const, severity: 'CRITICAL' as const, msg: due.status === 'REJEITADO' ? 'Atributo obrigatório não preenchido' : 'Todos preenchidos', sug: due.status === 'REJEITADO' ? 'Preencher campo "Enquadramento Legal"' : '' },
      { name: 'Embarque dentro do prazo', status: 'pass' as const, severity: 'MEDIUM' as const, msg: 'Prazo de embarque válido', sug: '' },
    ];
    const count = Math.floor(Math.random() * 4) + 6;
    return checks.slice(0, count).map((c, i) => ({
      id: `val-${due.id}-${i}`,
      dueId: due.id,
      checkName: c.name,
      status: c.status,
      severity: c.severity,
      message: c.msg,
      suggestion: c.sug,
    }));
  }

  private generateTimeline(due: DUE): DueTimelineEvent[] {
    const allStatuses: DueStatus[] = ['RASCUNHO', 'VALIDAÇÃO', 'PRONTO_ENVIO', 'ENVIADO', 'RECEBIDO', 'EM_ANÁLISE', 'LIBERADO', 'AVERBADO', 'CONCLUÍDO'];
    const currentIdx = allStatuses.indexOf(due.status);
    const relevantStatuses = due.status === 'REJEITADO'
      ? ['RASCUNHO', 'VALIDAÇÃO', 'PRONTO_ENVIO', 'ENVIADO', 'RECEBIDO', 'EM_ANÁLISE', 'REJEITADO'] as DueStatus[]
      : allStatuses.slice(0, currentIdx + 1);

    return relevantStatuses.map((status, i) => ({
      id: `tl-${due.id}-${i}`,
      dueId: due.id,
      status,
      date: new Date(due.createdAt.getTime() + i * 86400000 * 2),
      user: i % 2 === 0 ? 'admin@empresa.com' : 'sistema@siscomex.gov.br',
      integration: i > 2 ? 'Siscomex' : 'Portal EIP',
      observations: this.getTimelineObservation(status),
    }));
  }

  private getTimelineObservation(status: DueStatus): string {
    const obs: Record<DueStatus, string> = {
      'RASCUNHO': 'DU-E criada no sistema',
      'VALIDAÇÃO': 'Validações automáticas em andamento',
      'PRONTO_ENVIO': 'Todas as validações passaram. Pronta para transmissão.',
      'ENVIADO': 'Transmitida ao Siscomex via WebService',
      'RECEBIDO': 'Recebimento confirmado pelo Siscomex',
      'EM_ANÁLISE': 'Em análise pela Receita Federal',
      'LIBERADO': 'Liberação de embarque autorizada',
      'AVERBADO': 'Averbação de embarque registrada',
      'CONCLUÍDO': 'Processo de exportação concluído',
      'REJEITADO': 'Rejeitada por pendência documental',
    };
    return obs[status] || '';
  }

  private generateAudit(due: DUE): DueAuditEntry[] {
    const actions = ['Criação', 'Edição dados gerais', 'Vinculação de produto', 'Upload documento', 'Validação executada', 'Envio Siscomex'];
    return actions.slice(0, Math.floor(Math.random() * 3) + 3).map((action, i) => ({
      id: `audit-${due.id}-${i}`,
      dueId: due.id,
      action,
      user: 'admin@empresa.com',
      timestamp: new Date(due.createdAt.getTime() + i * 3600000),
      details: `${action} realizada na DU-E ${due.dueNumber}`,
      ip: '192.168.1.' + (Math.floor(Math.random() * 254) + 1),
    }));
  }

  private generateAIInsights(dueId: string): DueAIInsights {
    const due = this.dues.find(d => d.id === dueId);
    const bottlenecks = [
      'Certificado Fitossanitário ausente ou vencido',
      'Peso líquido inconsistente com volume declarado',
      'Atributo NCM obrigatório não preenchido',
      'Valor FOB abaixo da média de mercado (possível subfaturamento)',
      'País destino com restrições sanitárias adicionais',
    ];
    const suggestions: AIRecommendation[] = [
      {
        field: 'Certificado Fitossanitário',
        suggestion: 'Vincular certificado CF-2024-1234 emitido em 10/03/2024',
        reason: 'Certificado é obrigatório para NCM do produto',
        source: 'Regulamento Siscomex - IN RFB 1.702/2017',
        confidence: 95,
        impact: 'HIGH',
      },
      {
        field: 'Peso Líquido',
        suggestion: 'Ajustar peso líquido para 95% do peso bruto declarado',
        reason: 'Proporção está fora do padrão para commodity agrícola',
        source: 'Histórico de exportações similares (últimos 12 meses)',
        confidence: 82,
        impact: 'MEDIUM',
      },
      {
        field: 'Incoterm',
        suggestion: 'Considerar CIF para este destino',
        reason: 'Importador possui histórico de preferência CIF',
        source: 'Base de contratos anteriores',
        confidence: 68,
        impact: 'LOW',
      },
    ];

    const score = due?.aiComplianceScore || 75;
    const rejection = due?.rejectionProbability || 15;

    return {
      dueId,
      complianceScore: score,
      rejectionProbability: rejection,
      bottlenecks: bottlenecks.slice(0, Math.floor(Math.random() * 3) + 2),
      suggestions,
      executiveSummary: `A DU-E ${due?.dueNumber || ''} apresenta score de conformidade de ${score}% com probabilidade de rejeição de ${rejection}%. ` +
        `O principal produto exportado é ${due?.productName || 'commodity'} com destino a ${due?.destinationCountry || 'mercado internacional'}. ` +
        `Foram identificados ${Math.floor(Math.random() * 3) + 1} pontos de atenção que requerem ação do exportador antes do envio ao Siscomex. ` +
        `Recomenda-se priorizar a vinculação documental e validação dos atributos NCM obrigatórios.`,
    };
  }
}

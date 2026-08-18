import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  CertificadoExportacao,
  CertificadoTipo,
  CertificadoStatus,
  CertificadoFilters,
  CertificadoMetrics,
  CertificadoValidation,
  CertificadoTimelineEvent,
  CertificadoRelatedDoc,
  CertificadoAIInsights,
  CertificadoAlert,
  CertificadoSuggestion,
  CountryRequirement,
  RequirementLevel,
} from '../types/certificados-exportacao';

@Injectable({ providedIn: 'root' })
export class CertificadosExportacaoMockService {

  private certificados: CertificadoExportacao[] = this.generateCertificados();
  private validationsMap: Map<string, CertificadoValidation[]> = new Map();
  private timelinesMap: Map<string, CertificadoTimelineEvent[]> = new Map();
  private relatedDocsMap: Map<string, CertificadoRelatedDoc[]> = new Map();

  constructor() {
    this.certificados.forEach(cert => {
      this.validationsMap.set(cert.id, this.generateValidations(cert));
      this.timelinesMap.set(cert.id, this.generateTimeline(cert));
      this.relatedDocsMap.set(cert.id, this.generateRelatedDocs(cert));
    });
  }

  // === PUBLIC METHODS ===

  getCertificados(filters?: CertificadoFilters): Observable<CertificadoExportacao[]> {
    let result = [...this.certificados];
    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        result = result.filter(c =>
          c.certificateNumber.toLowerCase().includes(search) ||
          c.productName.toLowerCase().includes(search) ||
          c.exporterName.toLowerCase().includes(search) ||
          c.destinationCountry.toLowerCase().includes(search)
        );
      }
      if (filters.tipo) result = result.filter(c => c.tipo === filters.tipo);
      if (filters.status) result = result.filter(c => c.status === filters.status);
      if (filters.destinationCountry) result = result.filter(c => c.destinationCountry === filters.destinationCountry);
      if (filters.productName) result = result.filter(c => c.productName === filters.productName);
      if (filters.issuingAuthority) result = result.filter(c => c.issuingAuthority === filters.issuingAuthority);
      if (filters.expiryStart) result = result.filter(c => new Date(c.expiryDate) >= new Date(filters.expiryStart!));
      if (filters.expiryEnd) result = result.filter(c => new Date(c.expiryDate) <= new Date(filters.expiryEnd!));
    }
    return of(result).pipe(delay(400));
  }

  getCertificadoById(id: string): Observable<CertificadoExportacao | null> {
    return of(this.certificados.find(c => c.id === id) || null).pipe(delay(200));
  }

  createCertificado(data: Partial<CertificadoExportacao>): Observable<CertificadoExportacao> {
    const newCert: CertificadoExportacao = {
      id: `cert-exp-${Date.now()}`,
      certificateNumber: `CERT-${new Date().getFullYear()}-${String(this.certificados.length + 1).padStart(5, '0')}`,
      tipo: data.tipo || 'FITOSSANITÁRIO',
      status: 'SOLICITADO',
      productName: data.productName || '',
      ncm: data.ncm || '',
      destinationCountry: data.destinationCountry || '',
      exporterName: data.exporterName || 'Agro Export Brasil Ltda',
      importerName: data.importerName || '',
      issuingAuthority: data.issuingAuthority || 'MAPA',
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      linkedExportId: data.linkedExportId || '',
      linkedLoteNumber: data.linkedLoteNumber || '',
      linkedDueNumber: data.linkedDueNumber || '',
      aiComplianceScore: 0,
      rejectionRisk: 'MEDIUM',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.certificados.unshift(newCert);
    return of(newCert).pipe(delay(500));
  }

  getValidations(certId: string): Observable<CertificadoValidation[]> {
    return of(this.validationsMap.get(certId) || []).pipe(delay(300));
  }

  getTimeline(certId: string): Observable<CertificadoTimelineEvent[]> {
    return of(this.timelinesMap.get(certId) || []).pipe(delay(300));
  }

  getRelatedDocuments(certId: string): Observable<CertificadoRelatedDoc[]> {
    return of(this.relatedDocsMap.get(certId) || []).pipe(delay(300));
  }

  getAIInsights(certId: string): Observable<CertificadoAIInsights> {
    return of(this.generateAIInsights(certId)).pipe(delay(800));
  }

  getMetrics(): Observable<CertificadoMetrics> {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const metrics: CertificadoMetrics = {
      totalCertificates: this.certificados.length,
      validCount: this.certificados.filter(c => c.status === 'VÁLIDO').length,
      expiredCount: this.certificados.filter(c => c.status === 'VENCIDO').length,
      pendingCount: this.certificados.filter(c => c.status === 'PENDENTE' || c.status === 'SOLICITADO').length,
      expiringSoonCount: this.certificados.filter(c =>
        c.status === 'VÁLIDO' && new Date(c.expiryDate) <= thirtyDaysFromNow
      ).length,
      avgComplianceScore: Math.round(this.certificados.reduce((sum, c) => sum + c.aiComplianceScore, 0) / this.certificados.length),
    };
    return of(metrics).pipe(delay(200));
  }

  getCountryRequirements(country: string, product: string): Observable<CountryRequirement[]> {
    const requirements = this.getCountryRequirementsMatrix(country, product);
    return of(requirements).pipe(delay(500));
  }

  renewCertificate(certId: string): Observable<{ success: boolean; message: string }> {
    const cert = this.certificados.find(c => c.id === certId);
    if (cert) {
      cert.status = 'SOLICITADO';
      cert.updatedAt = new Date();
      return of({ success: true, message: `Renovação do certificado ${cert.certificateNumber} solicitada com sucesso.` }).pipe(delay(600));
    }
    return of({ success: false, message: 'Certificado não encontrado.' }).pipe(delay(300));
  }

  validateCertificate(certId: string): Observable<CertificadoValidation[]> {
    const validations = this.generateValidations(this.certificados.find(c => c.id === certId)!);
    this.validationsMap.set(certId, validations);
    return of(validations).pipe(delay(600));
  }

  // === SYNCHRONOUS HELPER METHODS ===

  getTypes(): { value: CertificadoTipo; label: string }[] {
    return [
      { value: 'FITOSSANITÁRIO', label: 'Fitossanitário' },
      { value: 'ORIGEM', label: 'Certificado de Origem' },
      { value: 'QUALIDADE', label: 'Qualidade' },
      { value: 'ANÁLISE_LABORATORIAL', label: 'Análise Laboratorial' },
      { value: 'HALAL', label: 'Halal' },
      { value: 'KOSHER', label: 'Kosher' },
      { value: 'ORGÂNICO', label: 'Orgânico' },
      { value: 'SANITÁRIO', label: 'Sanitário' },
      { value: 'FUMIGAÇÃO', label: 'Fumigação' },
    ];
  }

  getCountries(): string[] {
    return ['China', 'Estados Unidos', 'Japão', 'Alemanha', 'Holanda', 'Coreia do Sul', 'Arábia Saudita'];
  }

  getProducts(): string[] {
    return ['Soja', 'Milho', 'Café', 'Açúcar', 'Carne Bovina'];
  }

  getAuthorities(): string[] {
    return ['MAPA', 'Receita Federal', 'ANVISA', 'SGS', 'Bureau Veritas', 'Laboratório Central'];
  }

  getStatuses(): { value: CertificadoStatus; label: string }[] {
    return [
      { value: 'VÁLIDO', label: 'Válido' },
      { value: 'VENCIDO', label: 'Vencido' },
      { value: 'PENDENTE', label: 'Pendente' },
      { value: 'SOLICITADO', label: 'Solicitado' },
      { value: 'EMITIDO', label: 'Emitido' },
      { value: 'VINCULADO', label: 'Vinculado' },
      { value: 'ARQUIVADO', label: 'Arquivado' },
    ];
  }

  // === PRIVATE GENERATORS ===

  private generateCertificados(): CertificadoExportacao[] {
    const types: CertificadoTipo[] = [
      'FITOSSANITÁRIO', 'ORIGEM', 'QUALIDADE', 'ANÁLISE_LABORATORIAL',
      'HALAL', 'KOSHER', 'ORGÂNICO', 'SANITÁRIO', 'FUMIGAÇÃO',
      'FITOSSANITÁRIO', 'ORIGEM', 'SANITÁRIO', 'ANÁLISE_LABORATORIAL',
      'HALAL', 'FITOSSANITÁRIO', 'QUALIDADE', 'ORGÂNICO', 'ORIGEM',
      'SANITÁRIO', 'FUMIGAÇÃO'
    ];
    const statuses: CertificadoStatus[] = [
      'VÁLIDO', 'VÁLIDO', 'VÁLIDO', 'VÁLIDO', 'VÁLIDO',
      'VENCIDO', 'VENCIDO', 'PENDENTE', 'PENDENTE', 'SOLICITADO',
      'EMITIDO', 'EMITIDO', 'VINCULADO', 'VINCULADO', 'VINCULADO',
      'ARQUIVADO', 'VÁLIDO', 'VÁLIDO', 'VENCIDO', 'PENDENTE'
    ];
    const products = [
      { name: 'Soja', ncm: '1201.90.00' },
      { name: 'Milho', ncm: '1005.90.10' },
      { name: 'Café', ncm: '0901.11.10' },
      { name: 'Açúcar', ncm: '1701.14.00' },
      { name: 'Carne Bovina', ncm: '0202.30.00' },
    ];
    const countries = ['China', 'Estados Unidos', 'Japão', 'Alemanha', 'Holanda', 'Coreia do Sul', 'Arábia Saudita'];
    const exporters = ['Agro Export Brasil Ltda', 'Brazilian Commodities SA', 'Export Excellence Corp'];
    const importers = ['Global Grain Corp', 'China Foods Import Co.', 'European Commodities GmbH', 'Japan Trading Co.', 'Saudi Food Group'];
    const authorities = ['MAPA', 'Receita Federal', 'ANVISA', 'SGS', 'Bureau Veritas', 'Laboratório Central'];

    return types.map((tipo, i) => {
      const product = products[i % products.length];
      const country = countries[i % countries.length];
      const status = statuses[i % statuses.length];
      const issueDate = new Date(2025, Math.floor(i / 4), (i % 28) + 1);
      const expiryMonths = tipo === 'FITOSSANITÁRIO' ? 6 : tipo === 'ORIGEM' ? 12 : 8;
      const expiryDate = new Date(issueDate.getTime() + expiryMonths * 30 * 24 * 60 * 60 * 1000);
      const score = status === 'VENCIDO' ? Math.floor(Math.random() * 30) + 20
        : status === 'VÁLIDO' ? Math.floor(Math.random() * 20) + 80
        : Math.floor(Math.random() * 30) + 50;
      const risk: ('LOW' | 'MEDIUM' | 'HIGH') = status === 'VENCIDO' ? 'HIGH' : score >= 80 ? 'LOW' : 'MEDIUM';

      return {
        id: `cert-exp-${String(i + 1).padStart(3, '0')}`,
        certificateNumber: `CERT-2025-${String(i + 1).padStart(5, '0')}`,
        tipo,
        status,
        productName: product.name,
        ncm: product.ncm,
        destinationCountry: country,
        exporterName: exporters[i % exporters.length],
        importerName: importers[i % importers.length],
        issuingAuthority: authorities[i % authorities.length],
        issueDate,
        expiryDate,
        linkedExportId: `EXP-2025-${String(i + 1).padStart(4, '0')}`,
        linkedLoteNumber: `LT-2025-${String(i + 1).padStart(4, '0')}`,
        linkedDueNumber: `BR2025${String(1000 + i).padStart(8, '0')}`,
        aiComplianceScore: score,
        rejectionRisk: risk,
        createdAt: new Date(issueDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(issueDate.getTime() + 2 * 24 * 60 * 60 * 1000),
      } as CertificadoExportacao;
    });
  }

  private generateValidations(cert: CertificadoExportacao): CertificadoValidation[] {
    const checks: { name: string; status: 'pass' | 'fail' | 'warning'; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; msg: string }[] = [
      { name: 'Validade do Certificado', status: cert.status === 'VENCIDO' ? 'fail' : 'pass', severity: 'CRITICAL', msg: cert.status === 'VENCIDO' ? 'Certificado vencido' : 'Dentro da validade' },
      { name: 'Órgão Emissor Válido', status: 'pass', severity: 'HIGH', msg: 'Órgão emissor reconhecido internacionalmente' },
      { name: 'Produto Compatível com NCM', status: 'pass', severity: 'HIGH', msg: 'NCM compatível com produto declarado' },
      { name: 'País Destino Aceita Certificado', status: 'pass', severity: 'CRITICAL', msg: 'Certificado aceito no país de destino' },
      { name: 'Dados do Exportador', status: 'pass', severity: 'MEDIUM', msg: 'Dados do exportador conferem com registro' },
      { name: 'Vinculação com Exportação', status: cert.linkedExportId ? 'pass' : 'warning', severity: 'MEDIUM', msg: cert.linkedExportId ? 'Vinculado à exportação' : 'Sem vínculo com exportação' },
      { name: 'Conformidade Documental', status: cert.status === 'PENDENTE' ? 'warning' : 'pass', severity: 'HIGH', msg: cert.status === 'PENDENTE' ? 'Documentação incompleta' : 'Documentação completa' },
      { name: 'Assinatura Digital', status: 'pass', severity: 'LOW', msg: 'Assinatura digital verificada' },
    ];
    return checks.map((c, i) => ({
      id: `val-${cert.id}-${i}`,
      certificateId: cert.id,
      checkName: c.name,
      status: c.status,
      message: c.msg,
      severity: c.severity,
    }));
  }

  private generateTimeline(cert: CertificadoExportacao): CertificadoTimelineEvent[] {
    const events = [
      { event: 'Solicitação', observations: 'Certificado solicitado junto ao órgão emissor' },
      { event: 'Documentação Enviada', observations: 'Documentação de suporte enviada para análise' },
      { event: 'Em Análise', observations: 'Análise em andamento pelo órgão emissor' },
      { event: 'Emissão', observations: `Certificado emitido por ${cert.issuingAuthority}` },
      { event: 'Validação', observations: 'Validação automática realizada com sucesso' },
      { event: 'Vinculação', observations: `Vinculado à exportação ${cert.linkedExportId}` },
    ];

    const statusOrder: CertificadoStatus[] = ['SOLICITADO', 'PENDENTE', 'EMITIDO', 'VÁLIDO', 'VINCULADO', 'ARQUIVADO'];
    const currentIdx = statusOrder.indexOf(cert.status);
    const relevantEvents = events.slice(0, Math.max(currentIdx + 1, 3));

    return relevantEvents.map((e, i) => ({
      id: `tl-${cert.id}-${i}`,
      certificateId: cert.id,
      event: e.event,
      date: new Date(cert.createdAt.getTime() + i * 2 * 24 * 60 * 60 * 1000),
      user: i % 2 === 0 ? 'admin@empresa.com' : `${cert.issuingAuthority.toLowerCase()}@gov.br`,
      origin: i < 2 ? 'Portal EIP' : cert.issuingAuthority,
      observations: e.observations,
    }));
  }

  private generateRelatedDocs(cert: CertificadoExportacao): CertificadoRelatedDoc[] {
    return [
      { id: `rel-${cert.id}-1`, certificateId: cert.id, documentType: 'Lote', documentNumber: cert.linkedLoteNumber, entity: `Lote ${cert.linkedLoteNumber}` },
      { id: `rel-${cert.id}-2`, certificateId: cert.id, documentType: 'Exportação', documentNumber: cert.linkedExportId, entity: `Exportação ${cert.linkedExportId}` },
      { id: `rel-${cert.id}-3`, certificateId: cert.id, documentType: 'DU-E', documentNumber: cert.linkedDueNumber, entity: `DU-E ${cert.linkedDueNumber}` },
      { id: `rel-${cert.id}-4`, certificateId: cert.id, documentType: 'Invoice', documentNumber: `INV-2025-${cert.id.split('-').pop()}`, entity: `Invoice INV-2025-${cert.id.split('-').pop()}` },
    ];
  }

  private generateAIInsights(certId: string): CertificadoAIInsights {
    const cert = this.certificados.find(c => c.id === certId);
    if (!cert) {
      return {
        certificateId: certId,
        complianceScore: 0,
        rejectionRisk: 'HIGH',
        alerts: [],
        suggestions: [],
        countryRequirements: [],
        executiveSummary: 'Certificado não encontrado.',
      };
    }

    const alerts: CertificadoAlert[] = [];
    if (cert.status === 'VENCIDO') {
      alerts.push({ severity: 'CRITICAL', message: `Certificado ${cert.certificateNumber} está vencido desde ${cert.expiryDate.toLocaleDateString('pt-BR')}`, detectedAt: new Date() });
    }
    const daysToExpiry = Math.floor((new Date(cert.expiryDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    if (daysToExpiry > 0 && daysToExpiry <= 30) {
      alerts.push({ severity: 'HIGH', message: `Certificado expira em ${daysToExpiry} dias. Solicite renovação imediata.`, detectedAt: new Date() });
    }
    if (cert.status === 'PENDENTE') {
      alerts.push({ severity: 'MEDIUM', message: 'Documentação pendente para conclusão da certificação.', detectedAt: new Date() });
    }

    const suggestions: CertificadoSuggestion[] = [
      {
        action: 'Renovar certificado com antecedência mínima de 30 dias',
        reason: 'Evitar gaps de cobertura durante processo de exportação',
        norm: 'IN MAPA 02/2019 - Art. 15',
        confidence: 92,
        impact: 'HIGH',
      },
      {
        action: `Verificar exigências específicas de ${cert.destinationCountry} para ${cert.productName}`,
        reason: 'País pode ter requisitos adicionais não cobertos por este certificado',
        norm: 'Regulamento Sanitário Internacional (RSI)',
        confidence: 85,
        impact: 'MEDIUM',
      },
      {
        action: 'Atualizar dados do exportador no certificado',
        reason: 'Garantir consistência com dados registrados no Siscomex',
        norm: 'IN RFB 1.702/2017',
        confidence: 78,
        impact: 'LOW',
      },
    ];

    const countryRequirements = this.getCountryRequirementsMatrix(cert.destinationCountry, cert.productName);

    return {
      certificateId: certId,
      complianceScore: cert.aiComplianceScore,
      rejectionRisk: cert.rejectionRisk,
      alerts,
      suggestions,
      countryRequirements,
      executiveSummary: `O certificado ${cert.certificateNumber} (${cert.tipo}) apresenta score de conformidade de ${cert.aiComplianceScore}% ` +
        `com risco de rejeição ${cert.rejectionRisk === 'HIGH' ? 'alto' : cert.rejectionRisk === 'MEDIUM' ? 'médio' : 'baixo'}. ` +
        `O produto ${cert.productName} com destino a ${cert.destinationCountry} requer atenção às exigências fitossanitárias e regulatórias locais. ` +
        `${alerts.length > 0 ? `Foram identificados ${alerts.length} alertas que requerem ação imediata.` : 'Não há alertas críticos no momento.'} ` +
        `Recomenda-se manter o certificado atualizado e vinculado à operação de exportação correspondente para garantir conformidade total.`,
    };
  }

  private getCountryRequirementsMatrix(country: string, product: string): CountryRequirement[] {
    const requirements: CountryRequirement[] = [];
    let id = 0;

    const addReq = (certType: CertificadoTipo, level: RequirementLevel, authority: string, days: number, months: number, notes: string) => {
      requirements.push({
        id: `req-${++id}`,
        country,
        productName: product,
        ncm: '',
        certificateType: certType,
        level,
        issuingAuthority: authority,
        estimatedProcessingDays: days,
        validityMonths: months,
        notes,
      });
    };

    if (country === 'China') {
      addReq('FITOSSANITÁRIO', 'OBRIGATÓRIO', 'MAPA', 15, 6, 'Exigido para todos os grãos. Inspeção pré-embarque obrigatória.');
      addReq('ORIGEM', 'OBRIGATÓRIO', 'Receita Federal', 5, 12, 'Certificado de origem preferencial não aplicável.');
      addReq('ANÁLISE_LABORATORIAL', 'OBRIGATÓRIO', 'Laboratório Central', 10, 3, 'Análise de micotoxinas e resíduos de agrotóxicos.');
      if (product === 'Soja') {
        addReq('FUMIGAÇÃO', 'RECOMENDADO', 'SGS', 3, 1, 'Fumigação com fosfina recomendada para soja.');
      }
    } else if (country === 'Estados Unidos') {
      addReq('SANITÁRIO', 'OBRIGATÓRIO', 'ANVISA', 10, 12, 'FDA exige certificação sanitária para alimentos importados.');
      addReq('ORIGEM', 'RECOMENDADO', 'Receita Federal', 5, 12, 'Não obrigatório mas acelera desembaraço.');
      if (product === 'Carne Bovina') {
        addReq('HALAL', 'NÃO_APLICÁVEL', '-', 0, 0, 'Não exigido para mercado americano.');
      }
    } else if (country === 'Japão') {
      addReq('FITOSSANITÁRIO', 'OBRIGATÓRIO', 'MAPA', 15, 6, 'Japão possui requisitos fitossanitários rigorosos.');
      addReq('QUALIDADE', 'OBRIGATÓRIO', 'SGS', 7, 6, 'Certificado de qualidade JAS obrigatório.');
      addReq('ANÁLISE_LABORATORIAL', 'OBRIGATÓRIO', 'Bureau Veritas', 12, 3, 'Análise de resíduos conforme padrões japoneses.');
      addReq('FUMIGAÇÃO', 'RECOMENDADO', 'SGS', 3, 1, 'Tratamento quarentenário recomendado.');
    } else if (country === 'Alemanha' || country === 'Holanda') {
      addReq('FITOSSANITÁRIO', 'OBRIGATÓRIO', 'MAPA', 15, 6, 'Exigência EU para produtos agrícolas.');
      addReq('ORGÂNICO', 'RECOMENDADO', 'Bureau Veritas', 30, 12, 'Certificação orgânica EU valoriza produto.');
      addReq('ORIGEM', 'OBRIGATÓRIO', 'Receita Federal', 5, 12, 'Preferência tarifária Mercosul-EU.');
      if (product === 'Soja') {
        addReq('QUALIDADE', 'RECOMENDADO', 'SGS', 7, 6, 'Certificação non-GMO valorizada na EU.');
      }
    } else if (country === 'Coreia do Sul') {
      addReq('FITOSSANITÁRIO', 'OBRIGATÓRIO', 'MAPA', 15, 6, 'KFDA exige certificação fitossanitária.');
      addReq('QUALIDADE', 'OBRIGATÓRIO', 'SGS', 7, 6, 'Padrões KS de qualidade exigidos.');
      addReq('ANÁLISE_LABORATORIAL', 'RECOMENDADO', 'Laboratório Central', 10, 3, 'Testes de contaminantes recomendados.');
    } else if (country === 'Arábia Saudita') {
      addReq('HALAL', 'OBRIGATÓRIO', 'SGS', 20, 12, 'Certificação Halal obrigatória para todos os alimentos.');
      addReq('SANITÁRIO', 'OBRIGATÓRIO', 'ANVISA', 10, 12, 'SFDA exige certificado sanitário.');
      if (product === 'Carne Bovina') {
        addReq('QUALIDADE', 'OBRIGATÓRIO', 'Bureau Veritas', 7, 6, 'Inspeção de qualidade conforme padrões GCC.');
      }
      addReq('ORIGEM', 'RECOMENDADO', 'Receita Federal', 5, 12, 'Certificado de origem para preferência tarifária.');
    }

    // Add some defaults if no specific match
    if (requirements.length === 0) {
      addReq('FITOSSANITÁRIO', 'RECOMENDADO', 'MAPA', 15, 6, 'Recomendado para exportação de produtos agrícolas.');
      addReq('ORIGEM', 'OPCIONAL', 'Receita Federal', 5, 12, 'Pode ser solicitado pelo importador.');
    }

    return requirements;
  }
}

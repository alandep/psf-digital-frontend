import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Invoice,
  InvoiceStatus,
  InvoiceFilters,
  InvoiceMetrics,
  InvoiceProduct,
  InvoiceRelatedDoc,
  InvoiceValidation,
  InvoiceTimelineEvent,
  InvoiceAIInsights,
  InvoiceAlert,
  InvoiceSuggestion,
} from '../types/invoice';

@Injectable({ providedIn: 'root' })
export class InvoiceMockService {

  private invoices: Invoice[] = this.generateInvoices();
  private productsMap: Map<string, InvoiceProduct[]> = new Map();
  private relatedDocsMap: Map<string, InvoiceRelatedDoc[]> = new Map();
  private validationsMap: Map<string, InvoiceValidation[]> = new Map();
  private timelinesMap: Map<string, InvoiceTimelineEvent[]> = new Map();

  constructor() {
    this.invoices.forEach(inv => {
      this.productsMap.set(inv.id, this.generateProducts(inv));
      this.relatedDocsMap.set(inv.id, this.generateRelatedDocs(inv));
      this.validationsMap.set(inv.id, this.generateValidations(inv));
      this.timelinesMap.set(inv.id, this.generateTimeline(inv));
    });
  }

  // === PUBLIC METHODS ===

  getInvoices(filters?: InvoiceFilters): Observable<Invoice[]> {
    let result = [...this.invoices];
    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        result = result.filter(i =>
          i.invoiceNumber.toLowerCase().includes(search) ||
          i.exporterName.toLowerCase().includes(search) ||
          i.buyerName.toLowerCase().includes(search) ||
          i.buyerCountry.toLowerCase().includes(search)
        );
      }
      if (filters.status) result = result.filter(i => i.status === filters.status);
      if (filters.buyerName) result = result.filter(i => i.buyerName === filters.buyerName);
      if (filters.buyerCountry) result = result.filter(i => i.buyerCountry === filters.buyerCountry);
      if (filters.currency) result = result.filter(i => i.currency === filters.currency);
      if (filters.portOrigin) result = result.filter(i => i.portOrigin === filters.portOrigin);
      if (filters.dateStart) result = result.filter(i => new Date(i.issueDate) >= new Date(filters.dateStart!));
      if (filters.dateEnd) result = result.filter(i => new Date(i.issueDate) <= new Date(filters.dateEnd!));
    }
    return of(result).pipe(delay(400));
  }

  getInvoiceById(id: string): Observable<Invoice | null> {
    return of(this.invoices.find(i => i.id === id) || null).pipe(delay(200));
  }

  createInvoice(data: Partial<Invoice>): Observable<Invoice> {
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(this.invoices.length + 1).padStart(5, '0')}`,
      status: 'RASCUNHO',
      exporterName: data.exporterName || 'Agro Export Brasil Ltda',
      exporterCnpj: data.exporterCnpj || '12.345.678/0001-90',
      buyerName: data.buyerName || '',
      buyerAddress: data.buyerAddress || '',
      buyerCountry: data.buyerCountry || '',
      portOrigin: data.portOrigin || 'Santos',
      portDestination: data.portDestination || '',
      incoterm: data.incoterm || 'FOB',
      paymentMethod: data.paymentMethod || 'Letter of Credit',
      saleCondition: data.saleCondition || 'À Vista',
      currency: data.currency || 'USD',
      exchangeRate: null,
      issueDate: new Date(),
      subtotal: 0,
      freight: 0,
      insurance: 0,
      discount: 0,
      otherExpenses: 0,
      totalValue: 0,
      totalWeight: 0,
      totalQuantity: 0,
      linkedContractNumber: data.linkedContractNumber || '',
      linkedExportId: data.linkedExportId || '',
      linkedDueNumber: data.linkedDueNumber || '',
      linkedPackingList: data.linkedPackingList || '',
      completionPercentage: 15,
      aiDocScore: 0,
      rejectionProbability: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin@empresa.com',
      version: 1,
    };
    this.invoices.unshift(newInv);
    return of(newInv).pipe(delay(500));
  }

  getProducts(invoiceId: string): Observable<InvoiceProduct[]> {
    return of(this.productsMap.get(invoiceId) || []).pipe(delay(300));
  }

  getRelatedDocuments(invoiceId: string): Observable<InvoiceRelatedDoc[]> {
    return of(this.relatedDocsMap.get(invoiceId) || []).pipe(delay(300));
  }

  getValidations(invoiceId: string): Observable<InvoiceValidation[]> {
    return of(this.validationsMap.get(invoiceId) || []).pipe(delay(300));
  }

  getTimeline(invoiceId: string): Observable<InvoiceTimelineEvent[]> {
    return of(this.timelinesMap.get(invoiceId) || []).pipe(delay(300));
  }

  getAIInsights(invoiceId: string): Observable<InvoiceAIInsights> {
    return of(this.generateAIInsights(invoiceId)).pipe(delay(800));
  }

  getMetrics(): Observable<InvoiceMetrics> {
    const metrics: InvoiceMetrics = {
      totalInvoices: this.invoices.length,
      draftCount: this.invoices.filter(i => i.status === 'RASCUNHO').length,
      approvedCount: this.invoices.filter(i => i.status === 'APROVADA').length,
      sentCount: this.invoices.filter(i => i.status === 'ENVIADA').length,
      totalValueUSD: Math.round(this.invoices.reduce((sum, i) => sum + (i.currency === 'USD' ? i.totalValue : i.totalValue * 0.92), 0)),
      avgDocScore: Math.round(this.invoices.reduce((sum, i) => sum + i.aiDocScore, 0) / this.invoices.length),
    };
    return of(metrics).pipe(delay(200));
  }

  generatePDF(invoiceId: string): Observable<{ success: boolean; message: string }> {
    const inv = this.invoices.find(i => i.id === invoiceId);
    if (inv) {
      return of({ success: true, message: `PDF da Invoice ${inv.invoiceNumber} gerado com sucesso.` }).pipe(delay(600));
    }
    return of({ success: false, message: 'Invoice não encontrada.' }).pipe(delay(300));
  }

  approveInvoice(invoiceId: string): Observable<Invoice> {
    const inv = this.invoices.find(i => i.id === invoiceId);
    if (inv) {
      inv.status = 'APROVADA';
      inv.updatedAt = new Date();
    }
    return of(inv!).pipe(delay(500));
  }

  // === SYNCHRONOUS HELPER METHODS ===

  getBuyers(): string[] {
    return ['Global Grain Corp', 'China Foods Import Co.', 'European Commodities GmbH', 'Tokyo Trading Ltd', 'Arabia Foods Import'];
  }

  getCountries(): string[] {
    return ['China', 'Estados Unidos', 'Alemanha', 'Japão', 'Arábia Saudita', 'Holanda', 'Coreia do Sul'];
  }

  getPorts(): string[] {
    return ['Santos', 'Paranaguá', 'Rio Grande'];
  }

  getCurrencies(): string[] {
    return ['USD', 'EUR'];
  }

  getIncoterms(): string[] {
    return ['FOB', 'CIF', 'CFR'];
  }

  getStatuses(): { value: InvoiceStatus; label: string }[] {
    return [
      { value: 'RASCUNHO', label: 'Rascunho' },
      { value: 'GERADA', label: 'Gerada' },
      { value: 'EDITADA', label: 'Editada' },
      { value: 'VALIDADA', label: 'Validada' },
      { value: 'APROVADA', label: 'Aprovada' },
      { value: 'ENVIADA', label: 'Enviada' },
      { value: 'UTILIZADA', label: 'Utilizada' },
      { value: 'ARQUIVADA', label: 'Arquivada' },
    ];
  }

  // === PRIVATE GENERATORS ===

  private generateInvoices(): Invoice[] {
    const buyers = [
      { name: 'Global Grain Corp', country: 'Estados Unidos', address: '123 Trade Center, Houston, TX 77002' },
      { name: 'China Foods Import Co.', country: 'China', address: '88 Pudong Avenue, Shanghai 200120' },
      { name: 'European Commodities GmbH', country: 'Alemanha', address: 'Handelsweg 45, 20457 Hamburg' },
      { name: 'Tokyo Trading Ltd', country: 'Japão', address: '2-1-1 Marunouchi, Chiyoda, Tokyo 100-0005' },
      { name: 'Arabia Foods Import', country: 'Arábia Saudita', address: 'King Fahd Road, Riyadh 12271' },
    ];
    const ports = ['Santos', 'Paranaguá', 'Rio Grande'];
    const destPorts = ['Houston', 'Shanghai', 'Hamburg', 'Tokyo', 'Jeddah', 'Rotterdam', 'Busan'];
    const incoterms = ['FOB', 'CIF', 'CFR'];
    const currencies = ['USD', 'USD', 'USD', 'EUR', 'USD'];
    const statuses: InvoiceStatus[] = [
      'RASCUNHO', 'GERADA', 'EDITADA', 'VALIDADA', 'APROVADA',
      'APROVADA', 'ENVIADA', 'ENVIADA', 'UTILIZADA', 'UTILIZADA',
      'ARQUIVADA', 'APROVADA', 'GERADA', 'VALIDADA', 'ENVIADA',
      'RASCUNHO', 'APROVADA', 'UTILIZADA', 'ENVIADA', 'VALIDADA',
    ];

    return Array.from({ length: 20 }, (_, i) => {
      const buyer = buyers[i % buyers.length];
      const status = statuses[i];
      const currency = currencies[i % currencies.length];
      const subtotal = Math.round((Math.random() * 800000 + 200000) * 100) / 100;
      const freight = Math.round(subtotal * (Math.random() * 0.05 + 0.02) * 100) / 100;
      const insurance = Math.round(subtotal * (Math.random() * 0.01 + 0.005) * 100) / 100;
      const discount = Math.round(subtotal * (Math.random() * 0.02) * 100) / 100;
      const otherExpenses = Math.round((Math.random() * 5000 + 1000) * 100) / 100;
      const totalValue = Math.round((subtotal + freight + insurance - discount + otherExpenses) * 100) / 100;
      const completionMap: Record<InvoiceStatus, number> = {
        'RASCUNHO': 25, 'GERADA': 45, 'EDITADA': 55, 'VALIDADA': 70,
        'APROVADA': 85, 'ENVIADA': 95, 'UTILIZADA': 100, 'ARQUIVADA': 100,
      };
      const aiDocScore = status === 'RASCUNHO' ? Math.floor(Math.random() * 20) + 55
        : status === 'APROVADA' || status === 'ENVIADA' || status === 'UTILIZADA'
          ? Math.floor(Math.random() * 10) + 88
          : Math.floor(Math.random() * 15) + 72;

      return {
        id: `inv-${String(i + 1).padStart(3, '0')}`,
        invoiceNumber: `INV-2025-${String(i + 1).padStart(5, '0')}`,
        status,
        exporterName: 'Agro Export Brasil Ltda',
        exporterCnpj: '12.345.678/0001-90',
        buyerName: buyer.name,
        buyerAddress: buyer.address,
        buyerCountry: buyer.country,
        portOrigin: ports[i % ports.length],
        portDestination: destPorts[i % destPorts.length],
        incoterm: incoterms[i % incoterms.length],
        paymentMethod: i % 3 === 0 ? 'Letter of Credit' : i % 3 === 1 ? 'Wire Transfer' : 'Documentary Collection',
        saleCondition: i % 2 === 0 ? 'À Vista' : '30/60/90 dias',
        currency,
        exchangeRate: currency === 'USD' ? 5.45 : 5.92,
        issueDate: new Date(2025, Math.floor(i / 4), (i % 28) + 1),
        subtotal,
        freight,
        insurance,
        discount,
        otherExpenses,
        totalValue,
        totalWeight: Math.round(Math.random() * 50000 + 10000),
        totalQuantity: Math.round(Math.random() * 2000 + 500),
        linkedContractNumber: `CT-2025-${String(i + 1).padStart(4, '0')}`,
        linkedExportId: `EXP-2025-${String(i + 1).padStart(4, '0')}`,
        linkedDueNumber: `BR2025${String(1000 + i).padStart(8, '0')}`,
        linkedPackingList: `PL-2025-${String(i + 1).padStart(4, '0')}`,
        completionPercentage: completionMap[status],
        aiDocScore,
        rejectionProbability: Math.max(1, 100 - aiDocScore + Math.floor(Math.random() * 5)),
        createdAt: new Date(2025, Math.floor(i / 4), (i % 28) + 1),
        updatedAt: new Date(2025, Math.floor(i / 4), (i % 28) + 3),
        createdBy: 'admin@empresa.com',
        version: Math.floor(Math.random() * 3) + 1,
      } as Invoice;
    });
  }

  private generateProducts(inv: Invoice): InvoiceProduct[] {
    const allProducts = [
      { name: 'Soja em Grãos', desc: 'Brazilian Soybeans, Non-GMO, Grade A, Harvest 2025/2026', tech: 'Glycine max, umidade máx. 14%, impurezas máx. 1%', ncm: '1201.90.00', unit: 'TON' },
      { name: 'Milho em Grãos', desc: 'Yellow Corn in Bulk, Max 14% Moisture', tech: 'Zea mays, grão amarelo tipo 1, padrão ANEC', ncm: '1005.90.10', unit: 'TON' },
      { name: 'Café Arábica', desc: 'Arabica Coffee Beans, Screen 17/18, Specialty Grade', tech: 'Coffea arabica, bebida dura/mole, catação 10-15', ncm: '0901.11.10', unit: 'BAG' },
      { name: 'Açúcar VHP', desc: 'VHP Raw Sugar, Pol 99.3 Min', tech: 'Sacarose cristalizada, polarização mín. 99.3°Z, cor ICUMSA máx. 1500', ncm: '1701.14.00', unit: 'TON' },
      { name: 'Carne Bovina Congelada', desc: 'Frozen Boneless Beef, Cuts Rump & Loin', tech: 'Cortes desossados, congelados a -18°C, SIF aprovado', ncm: '0202.30.00', unit: 'TON' },
    ];

    const numProducts = Math.floor(Math.random() * 3) + 2;
    const startIdx = parseInt(inv.id.split('-')[1]) % allProducts.length;
    const products: InvoiceProduct[] = [];

    for (let j = 0; j < numProducts; j++) {
      const p = allProducts[(startIdx + j) % allProducts.length];
      const qty = Math.round(Math.random() * 500 + 100);
      const unitPrice = Math.round((Math.random() * 800 + 200) * 100) / 100;
      const totalVal = Math.round(qty * unitPrice * 100) / 100;
      const netWeight = Math.round(qty * (Math.random() * 0.95 + 0.9) * 1000) / 1000;
      const grossWeight = Math.round(netWeight * 1.05 * 1000) / 1000;

      products.push({
        id: `prod-${inv.id}-${j + 1}`,
        invoiceId: inv.id,
        productName: p.name,
        commercialDescription: p.desc,
        technicalDescription: p.tech,
        ncm: p.ncm,
        quantity: qty,
        unit: p.unit,
        netWeight,
        grossWeight,
        unitPrice,
        totalValue: totalVal,
        countryOrigin: 'Brasil',
        linkedLot: `LT-2025-${String(parseInt(inv.id.split('-')[1]) * 10 + j).padStart(4, '0')}`,
      });
    }
    return products;
  }

  private generateRelatedDocs(inv: Invoice): InvoiceRelatedDoc[] {
    const statusByCompletion = (pct: number): 'valid' | 'pending' | 'missing' => {
      if (pct >= 85) return 'valid';
      if (pct >= 50) return 'pending';
      return 'missing';
    };
    return [
      { id: `rel-${inv.id}-1`, invoiceId: inv.id, documentType: 'Contrato', documentNumber: inv.linkedContractNumber, status: 'valid' },
      { id: `rel-${inv.id}-2`, invoiceId: inv.id, documentType: 'Exportação', documentNumber: inv.linkedExportId, status: 'valid' },
      { id: `rel-${inv.id}-3`, invoiceId: inv.id, documentType: 'DU-E', documentNumber: inv.linkedDueNumber, status: statusByCompletion(inv.completionPercentage) },
      { id: `rel-${inv.id}-4`, invoiceId: inv.id, documentType: 'Packing List', documentNumber: inv.linkedPackingList, status: statusByCompletion(inv.completionPercentage) },
      { id: `rel-${inv.id}-5`, invoiceId: inv.id, documentType: 'Certificado Fitossanitário', documentNumber: `CERT-2025-${inv.id.split('-')[1]}`, status: statusByCompletion(inv.completionPercentage - 10) },
      { id: `rel-${inv.id}-6`, invoiceId: inv.id, documentType: 'Bill of Lading', documentNumber: `BL-${inv.id.split('-')[1]}-2025`, status: inv.completionPercentage >= 95 ? 'valid' : 'missing' },
      { id: `rel-${inv.id}-7`, invoiceId: inv.id, documentType: 'Booking Confirmation', documentNumber: `BK-${inv.id.split('-')[1]}-2025`, status: inv.completionPercentage >= 70 ? 'valid' : 'pending' },
    ];
  }

  private generateValidations(inv: Invoice): InvoiceValidation[] {
    const checks: { name: string; status: 'pass' | 'fail' | 'warning'; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; msg: string; suggestion: string }[] = [
      { name: 'Dados do Exportador', status: 'pass', severity: 'CRITICAL', msg: 'CNPJ e razão social conferem com Siscomex', suggestion: '' },
      { name: 'Dados do Comprador', status: inv.buyerAddress ? 'pass' : 'warning', severity: 'HIGH', msg: inv.buyerAddress ? 'Endereço completo informado' : 'Endereço do comprador incompleto', suggestion: 'Completar endereço com ZIP code e estado' },
      { name: 'Incoterm vs Frete', status: inv.incoterm === 'FOB' && inv.freight > 0 ? 'warning' : 'pass', severity: 'HIGH', msg: inv.incoterm === 'FOB' && inv.freight > 0 ? 'FOB não deveria incluir frete na invoice' : 'Incoterm compatível com composição de valores', suggestion: 'Revisar valor de frete para condição FOB' },
      { name: 'Peso Total vs Produtos', status: 'pass', severity: 'MEDIUM', msg: 'Peso total consistente com soma dos produtos', suggestion: '' },
      { name: 'Moeda e Taxa Câmbio', status: inv.exchangeRate ? 'pass' : 'warning', severity: 'MEDIUM', msg: inv.exchangeRate ? 'Taxa de câmbio informada' : 'Taxa de câmbio não informada', suggestion: 'Informar taxa de câmbio para conversão BRL' },
      { name: 'NCM dos Produtos', status: 'pass', severity: 'HIGH', msg: 'NCMs válidos e compatíveis com descrição', suggestion: '' },
      { name: 'Documentos Vinculados', status: inv.completionPercentage >= 85 ? 'pass' : 'warning', severity: 'MEDIUM', msg: inv.completionPercentage >= 85 ? 'Todos os documentos vinculados' : 'Documentos pendentes de vinculação', suggestion: 'Vincular BL e Certificados' },
      { name: 'Cross-check DU-E', status: inv.status === 'RASCUNHO' ? 'warning' : 'pass', severity: 'CRITICAL', msg: inv.status === 'RASCUNHO' ? 'DU-E ainda não vinculada' : 'Valores conferem com DU-E registrada', suggestion: 'Registrar DU-E antes de envio' },
    ];
    return checks.map((c, i) => ({
      id: `val-${inv.id}-${i}`,
      invoiceId: inv.id,
      checkName: c.name,
      status: c.status,
      severity: c.severity,
      message: c.msg,
      suggestion: c.suggestion,
    }));
  }

  private generateTimeline(inv: Invoice): InvoiceTimelineEvent[] {
    const events = [
      { event: 'Invoice Criada', details: `Invoice ${inv.invoiceNumber} criada como rascunho` },
      { event: 'Produtos Adicionados', details: 'Itens e valores calculados automaticamente' },
      { event: 'Validação Automática', details: 'Verificação cruzada com contrato e DU-E executada' },
      { event: 'Revisão Documental', details: 'Documentos vinculados e conformidade verificada' },
      { event: 'Aprovação', details: `Aprovada por gestor de exportação` },
      { event: 'Envio ao Comprador', details: `Enviada para ${inv.buyerName}` },
    ];
    const statusOrder: InvoiceStatus[] = ['RASCUNHO', 'GERADA', 'EDITADA', 'VALIDADA', 'APROVADA', 'ENVIADA', 'UTILIZADA', 'ARQUIVADA'];
    const currentIdx = statusOrder.indexOf(inv.status);
    const relevantEvents = events.slice(0, Math.max(currentIdx + 1, 2));

    return relevantEvents.map((e, i) => ({
      id: `tl-${inv.id}-${i}`,
      invoiceId: inv.id,
      event: e.event,
      date: new Date(inv.createdAt.getTime() + i * 24 * 60 * 60 * 1000),
      user: i % 2 === 0 ? 'admin@empresa.com' : 'gestor@empresa.com',
      details: e.details,
    }));
  }

  private generateAIInsights(invoiceId: string): InvoiceAIInsights {
    const inv = this.invoices.find(i => i.id === invoiceId);
    if (!inv) {
      return { invoiceId, docScore: 0, rejectionProbability: 100, alerts: [], suggestions: [], executiveSummary: 'Invoice não encontrada.' };
    }

    const alerts: InvoiceAlert[] = [];
    if (inv.status === 'RASCUNHO') {
      alerts.push({ severity: 'MEDIUM', message: 'Invoice em rascunho - campos obrigatórios pendentes de preenchimento.' });
    }
    if (inv.incoterm === 'FOB' && inv.freight > 0) {
      alerts.push({ severity: 'HIGH', message: 'Incoterm FOB mas frete incluído na invoice. Possível inconsistência com contrato.' });
    }
    if (inv.completionPercentage < 70) {
      alerts.push({ severity: 'MEDIUM', message: 'Documentação de suporte incompleta. Packing List ou BL pendentes.' });
    }
    if (inv.totalWeight > 40000) {
      alerts.push({ severity: 'LOW', message: 'Peso total acima de 40.000 kg - verificar compatibilidade com contêiner.' });
    }

    const suggestions: InvoiceSuggestion[] = [
      { field: 'buyerAddress', suggestion: 'Incluir ZIP code no endereço do comprador', reason: 'Endereço completo reduz risco de rejeição aduaneira no destino', source: 'Contrato CT-2025-0001', confidence: 91, impact: 'HIGH' },
      { field: 'incoterm', suggestion: `Confirmar condição ${inv.incoterm} com Packing List`, reason: 'Incoterm deve ser consistente entre Invoice, PL e BL', source: 'DU-E', confidence: 88, impact: 'HIGH' },
      { field: 'exchangeRate', suggestion: 'Atualizar taxa de câmbio para data de embarque', reason: 'Taxa vigente garante precisão na conversão BRL para fins fiscais', source: 'BACEN', confidence: 85, impact: 'MEDIUM' },
      { field: 'productDescription', suggestion: 'Detalhar especificações técnicas do produto', reason: 'Descrição comercial detalhada em inglês é requisito para desembaraço', source: 'Packing List', confidence: 82, impact: 'MEDIUM' },
    ];

    const executiveSummary = `A Invoice ${inv.invoiceNumber} para ${inv.buyerName} (${inv.buyerCountry}) ` +
      `apresenta doc score de ${inv.aiDocScore}% com probabilidade de rejeição de ${inv.rejectionProbability}%. ` +
      `Valor total: ${inv.currency} ${inv.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${inv.incoterm}). ` +
      `${alerts.length > 0 ? `Identificados ${alerts.length} alertas que requerem atenção.` : 'Sem alertas críticos.'} ` +
      `Recomenda-se verificar consistência com documentos vinculados antes do envio ao comprador.`;

    return {
      invoiceId,
      docScore: inv.aiDocScore,
      rejectionProbability: inv.rejectionProbability,
      alerts,
      suggestions,
      executiveSummary,
    };
  }
}

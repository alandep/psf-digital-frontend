// STUB - Serviço movido para inline no componente principal
export class StubNovosPedidosService { }
import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Exportacao } from '../../../../types/exportacao';

export interface NovosPedidosInitialData {
  exporters: Array<{ id: string; name: string; document: string; }>;
  countries: Array<{ code: string; name: string; currency: string; }>;
  products: Array<{ id: string; name: string; ncm: string; category: string; }>;
  ports: Array<{ code: string; name: string; country: string; type: string; }>;
  incoterms: Array<{ code: string; name: string; description: string; }>;
  currencies: Array<{ code: string; name: string; symbol: string; }>;
  transportModes: Array<{ id: string; name: string; icon: string; }>;
  paymentMethods: Array<{ code: string; name: string; risk: string; }>;
  documentTypes: Array<{ code: string; name: string; required: boolean; }>;
}

@Injectable({
  providedIn: 'root'
})
export class NovosPedidosService {

  private readonly MOCK_DELAY = 1000;

  constructor() { }

  // ========== DADOS INICIAIS ==========
  
  getInitialData(): Observable<NovosPedidosInitialData> {
    const mockData: NovosPedidosInitialData = {
      exporters: [
        { id: 'exp_001', name: 'Agro Export Brasil Ltda', document: '12.345.678/0001-90' },
        { id: 'exp_002', name: 'Brazilian Commodities SA', document: '23.456.789/0001-01' },
        { id: 'exp_003', name: 'Export Excellence Corp', document: '34.567.890/0001-12' },
        { id: 'exp_004', name: 'Global Trade Partners', document: '45.678.901/0001-23' }
      ],
      
      countries: [
        { code: 'US', name: 'Estados Unidos', currency: 'USD' },
        { code: 'CN', name: 'China', currency: 'CNY' },
        { code: 'DE', name: 'Alemanha', currency: 'EUR' },
        { code: 'JP', name: 'Japão', currency: 'JPY' },
        { code: 'NL', name: 'Países Baixos', currency: 'EUR' },
        { code: 'BE', name: 'Bélgica', currency: 'EUR' },
        { code: 'ES', name: 'Espanha', currency: 'EUR' },
        { code: 'IT', name: 'Itália', currency: 'EUR' },
        { code: 'FR', name: 'França', currency: 'EUR' },
        { code: 'GB', name: 'Reino Unido', currency: 'GBP' }
      ],
      
      products: [
        { id: 'prod_001', name: 'Soja em Grão', ncm: '12019000', category: 'Commodities Agrícolas' },
        { id: 'prod_002', name: 'Milho em Grão', ncm: '10059000', category: 'Commodities Agrícolas' },
        { id: 'prod_003', name: 'Açúcar Cristal', ncm: '17019900', category: 'Alimentos Processados' },
        { id: 'prod_004', name: 'Café Arabica', ncm: '09011100', category: 'Beverages' },
        { id: 'prod_005', name: 'Carne Bovina Congelada', ncm: '02023000', category: 'Proteínas Animais' },
        { id: 'prod_006', name: 'Frango Congelado', ncm: '02071400', category: 'Proteínas Animais' },
        { id: 'prod_007', name: 'Óleo de Soja', ncm: '15071000', category: 'Óleos Vegetais' },
        { id: 'prod_008', name: 'Farelo de Soja', ncm: '23040000', category: 'Subprodutos Agrícolas' }
      ],
      
      ports: [
        { code: 'BRSSZ', name: 'Santos, SP', country: 'Brasil', type: 'Marítimo' },
        { code: 'BRPNG', name: 'Paranaguá, PR', country: 'Brasil', type: 'Marítimo' },
        { code: 'BRRIO', name: 'Rio de Janeiro, RJ', country: 'Brasil', type: 'Marítimo' },
        { code: 'BRSSA', name: 'Salvador, BA', country: 'Brasil', type: 'Marítimo' },
        { code: 'USNYC', name: 'New York, NY', country: 'Estados Unidos', type: 'Marítimo' },
        { code: 'USLAX', name: 'Los Angeles, CA', country: 'Estados Unidos', type: 'Marítimo' },
        { code: 'NLRTM', name: 'Rotterdam', country: 'Países Baixos', type: 'Marítimo' },
        { code: 'BEANR', name: 'Antwerp', country: 'Bélgica', type: 'Marítimo' }
      ],
      
      incoterms: [
        { code: 'FOB', name: 'Free On Board', description: 'Vendedor entrega mercadoria no porto de embarque' },
        { code: 'CIF', name: 'Cost, Insurance and Freight', description: 'Vendedor paga frete e seguro até destino' },
        { code: 'CFR', name: 'Cost and Freight', description: 'Vendedor paga frete até destino' },
        { code: 'EXW', name: 'Ex Works', description: 'Comprador retira mercadoria na fábrica' },
        { code: 'DDP', name: 'Delivered Duty Paid', description: 'Vendedor entrega com impostos pagos' },
        { code: 'DDU', name: 'Delivered Duty Unpaid', description: 'Vendedor entrega sem impostos' }
      ],
      
      currencies: [
        { code: 'USD', name: 'Dólar Americano', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
        { code: 'CNY', name: 'Yuan Chinês', symbol: '¥' },
        { code: 'JPY', name: 'Yen Japonês', symbol: '¥' },
        { code: 'GBP', name: 'Libra Esterlina', symbol: '£' }
      ],
      
      transportModes: [
        { id: 'maritime', name: 'Marítimo', icon: 'directions_boat' },
        { id: 'air', name: 'Aéreo', icon: 'flight' },
        { id: 'land', name: 'Terrestre', icon: 'local_shipping' },
        { id: 'multimodal', name: 'Multimodal', icon: 'swap_horiz' }
      ],
      
      paymentMethods: [
        { code: 'TT', name: 'Transferência Telegráfica (T/T)', risk: 'Low' },
        { code: 'LC', name: 'Carta de Crédito (L/C)', risk: 'Very Low' },
        { code: 'DP', name: 'Documentos contra Pagamento (D/P)', risk: 'Medium' },
        { code: 'DA', name: 'Documentos contra Aceite (D/A)', risk: 'High' },
        { code: 'OA', name: 'Conta Aberta (O/A)', risk: 'Very High' }
      ],
      
      documentTypes: [
        { code: 'DUE', name: 'Declaração Única de Exportação', required: true },
        { code: 'INV', name: 'Fatura Comercial (Invoice)', required: true },
        { code: 'PL', name: 'Lista de Embalagem (Packing List)', required: true },
        { code: 'CO', name: 'Certificado de Origem', required: false },
        { code: 'PHYTO', name: 'Certificado Fitossanitário', required: false },
        { code: 'HALAL', name: 'Certificado Halal', required: false },
        { code: 'KOSHER', name: 'Certificado Kosher', required: false },
        { code: 'BL', name: 'Conhecimento de Embarque (B/L)', required: true }
      ]
    };

    return of(mockData).pipe(delay(this.MOCK_DELAY));
  }

  // ========== GERAÇÃO DE NÚMEROS ==========
  
  generateExportNumber(): Observable<string> {
    const year = new Date().getFullYear();
    const sequence = Math.floor(Math.random() * 9999) + 1;
    const exportNumber = `EXP-${year}-${sequence.toString().padStart(4, '0')}`;
    
    return of(exportNumber).pipe(delay(500));
  }

  // ========== VALIDAÇÕES ==========
  
  validateImporter(document: string, country: string): Observable<{valid: boolean, data?: any}> {
    const mockValidation = {
      valid: true,
      data: {
        name: 'Global Trading Corporation',
        address: '123 Business Ave, Trade City',
        contact: 'trading@globalcorp.com',
        riskRating: 'A'
      }
    };

    return of(mockValidation).pipe(delay(800));
  }

  validateProduct(ncmCode: string): Observable<{valid: boolean, data?: any}> {
    const mockValidation = {
      valid: true,
      data: {
        description: 'Soja em grãos, mesmo triturada',
        taxRate: 0,
        restrictions: [],
        certificationRequired: ['Fitossanitário']
      }
    };

    return of(mockValidation).pipe(delay(600));
  }

  // ========== CÁLCULOS AUTOMÁTICOS ==========
  
  calculateShipping(origin: string, destination: string, weight: number, mode: string): Observable<any> {
    const mockCalculation = {
      estimatedCost: Math.floor(Math.random() * 5000) + 1000,
      estimatedDays: Math.floor(Math.random() * 20) + 10,
      carriers: [
        { name: 'Maritime Express', cost: 2500, days: 15 },
        { name: 'Ocean Lines', cost: 2200, days: 18 },
        { name: 'Global Shipping', cost: 2800, days: 12 }
      ]
    };

    return of(mockCalculation).pipe(delay(1200));
  }

  calculateTotalValue(unitPrice: number, quantity: number, currency: string): Observable<any> {
    const total = unitPrice * quantity;
    const exchangeRate = currency === 'USD' ? 5.2 : currency === 'EUR' ? 5.8 : 1;
    
    const mockCalculation = {
      totalValue: total,
      totalInBRL: total * exchangeRate,
      exchangeRate,
      taxes: {
        icms: total * 0.18,
        pis: total * 0.0165,
        cofins: total * 0.076
      }
    };

    return of(mockCalculation).pipe(delay(400));
  }

  // ========== PERSISTÊNCIA ==========
  
  saveDraft(exportacaoData: any): Observable<{id: string, savedAt: Date}> {
    const mockResponse = {
      id: `draft_${Date.now()}`,
      savedAt: new Date()
    };

    // Simula erro ocasional para testar tratamento
    if (Math.random() < 0.1) {
      return throwError('Erro ao salvar rascunho').pipe(delay(this.MOCK_DELAY));
    }

    return of(mockResponse).pipe(delay(this.MOCK_DELAY));
  }

  submitExportacao(exportacaoData: any): Observable<{exportId: string, exportNumber: string}> {
    const mockResponse = {
      exportId: `exp_${Date.now()}`,
      exportNumber: `EXP-${new Date().getFullYear()}-${Math.floor(Math.random() * 9999) + 1}`
    };

    // Simula erro ocasional
    if (Math.random() < 0.05) {
      return throwError('Erro ao criar pedido de exportação').pipe(delay(this.MOCK_DELAY));
    }

    return of(mockResponse).pipe(delay(this.MOCK_DELAY * 2));
  }

  // ========== SUGESTÕES AI ==========
  
  getAISuggestions(context: string, data: any): Observable<string[]> {
    const suggestions = {
      'incoterm': [
        'Para China, recomenda-se FOB devido à expertise logística do importador',
        'CIF é vantajoso para novos importadores nos EUA',
        'Para União Europeia, CFR oferece bom equilíbrio de responsabilidades'
      ],
      'payment': [
        'Carta de Crédito (L/C) é mais segura para novos parceiros',
        'T/T contra documentos é adequado para parceiros confiáveis',
        'Considere seguro de crédito para pagamentos em conta aberta'
      ],
      'logistics': [
        'Porto de Santos oferece melhores conexões para EUA e Europa',
        'Considere container refrigerado para produtos sensíveis',
        'Embarque em navios com certificação ISO para produtos orgânicos'
      ]
    };

    const contextSuggestions = suggestions[context as keyof typeof suggestions] || [];
    return of(contextSuggestions).pipe(delay(800));
  }

  // ========== HISTÓRICO ==========
  
  getUserDrafts(): Observable<any[]> {
    const mockDrafts = [
      {
        id: 'draft_001',
        name: 'Soja para China - Rascunho',
        progress: 60,
        lastModified: new Date(Date.now() - 86400000),
        estimatedValue: 2500000
      },
      {
        id: 'draft_002',
        name: 'Milho para Europa - Rascunho',  
        progress: 30,
        lastModified: new Date(Date.now() - 172800000),
        estimatedValue: 1800000
      }
    ];

    return of(mockDrafts).pipe(delay(600));
  }

  loadDraft(draftId: string): Observable<any> {
    const mockDraftData = {
      0: { // Informações Básicas
        exportNumber: 'EXP-2026-DRAFT-001',
        exportType: 'Regular',
        priority: 'Normal',
        responsible: 'João Silva',
        isUrgent: false
      },
      1: { // Produtos
        products: [
          {
            id: 'prod_001',
            name: 'Soja em Grão',
            quantity: 5000,
            unit: 'MT',
            unitPrice: 425.50
          }
        ]
      }
    };

    return of(mockDraftData).pipe(delay(1000));
  }
}
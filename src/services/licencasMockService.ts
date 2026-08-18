import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Licenca,
  LicenseType,
  LicenseStatus,
  RiskLevel,
  ComplianceValidation,
  CountryRequirement,
  RegulatoryRestriction,
  ActionPlan,
  LicenseTimelineEvent,
  LicenseAIInsights,
  LicenseMetrics,
  LicenseFilters
} from '../types/licencas';

@Injectable({ providedIn: 'root' })
export class LicencasMockService {

  private mockLicenses: Licenca[] = [
    {
      id: 'LIC-001', licenseNumber: 'EXP-2024-00142', licenseType: 'EXPORTAÇÃO',
      company: 'Agro Export Brasil Ltda', productName: 'Soja em Grãos',
      destinationCountry: 'China', regulatoryBody: 'Secretaria de Comércio Exterior',
      issueDate: new Date('2024-01-15'), expiryDate: new Date('2025-01-15'),
      status: 'VÁLIDA', responsibleUser: 'Carlos Silva',
      observations: 'Licença para exportação de soja em grãos para mercado chinês',
      aiComplianceScore: 92, riskLevel: 'BAIXO',
      createdAt: new Date('2024-01-10'), updatedAt: new Date('2024-06-20')
    },
    {
      id: 'LIC-002', licenseNumber: 'FIT-2024-00087', licenseType: 'FITOSSANITÁRIA',
      company: 'Agro Export Brasil Ltda', productName: 'Milho',
      destinationCountry: 'Japão', regulatoryBody: 'MAPA',
      issueDate: new Date('2024-02-01'), expiryDate: new Date('2024-08-01'),
      status: 'VENCIDA', responsibleUser: 'Ana Pereira',
      observations: 'Certificado fitossanitário para milho - mercado japonês',
      aiComplianceScore: 45, riskLevel: 'CRÍTICO',
      createdAt: new Date('2024-01-28'), updatedAt: new Date('2024-08-02')
    },
    {
      id: 'LIC-003', licenseNumber: 'SAN-2024-00215', licenseType: 'SANITÁRIA',
      company: 'Brazilian Commodities SA', productName: 'Carne Bovina',
      destinationCountry: 'Arábia Saudita', regulatoryBody: 'Anvisa',
      issueDate: new Date('2024-03-10'), expiryDate: new Date('2025-03-10'),
      status: 'VÁLIDA', responsibleUser: 'Roberto Mendes',
      observations: 'Certificado sanitário para exportação de carne bovina halal',
      aiComplianceScore: 88, riskLevel: 'BAIXO',
      createdAt: new Date('2024-03-05'), updatedAt: new Date('2024-07-15')
    },
    {
      id: 'LIC-004', licenseNumber: 'AMB-2024-00034', licenseType: 'AMBIENTAL',
      company: 'Export Excellence Corp', productName: 'Café Arábica',
      destinationCountry: 'Alemanha', regulatoryBody: 'IBAMA',
      issueDate: new Date('2024-04-01'), expiryDate: new Date('2024-10-15'),
      status: 'EM_RENOVAÇÃO', responsibleUser: 'Maria Santos',
      observations: 'Licença ambiental para café - compliance EUDR',
      aiComplianceScore: 72, riskLevel: 'MÉDIO',
      createdAt: new Date('2024-03-25'), updatedAt: new Date('2024-09-28')
    },
    {
      id: 'LIC-005', licenseNumber: 'REG-2024-00098', licenseType: 'REGISTRO_ESPECIAL',
      company: 'Agro Export Brasil Ltda', productName: 'Açúcar Cristal',
      destinationCountry: 'EUA', regulatoryBody: 'Receita Federal',
      issueDate: new Date('2024-05-20'), expiryDate: new Date('2025-05-20'),
      status: 'VÁLIDA', responsibleUser: 'Pedro Costa',
      observations: 'Registro especial para exportação de açúcar - FDA compliance',
      aiComplianceScore: 85, riskLevel: 'BAIXO',
      createdAt: new Date('2024-05-15'), updatedAt: new Date('2024-08-10')
    },
    {
      id: 'LIC-006', licenseNumber: 'EXP-2024-00201', licenseType: 'EXPORTAÇÃO',
      company: 'Brazilian Commodities SA', productName: 'Soja em Grãos',
      destinationCountry: 'Holanda', regulatoryBody: 'Secretaria de Comércio Exterior',
      issueDate: new Date('2024-06-01'), expiryDate: new Date('2025-06-01'),
      status: 'VÁLIDA', responsibleUser: 'Carlos Silva',
      observations: 'Licença exportação soja para Porto de Rotterdam',
      aiComplianceScore: 90, riskLevel: 'MUITO_BAIXO',
      createdAt: new Date('2024-05-28'), updatedAt: new Date('2024-07-20')
    },
    {
      id: 'LIC-007', licenseNumber: 'CTR-2024-00012', licenseType: 'PRODUTOS_CONTROLADOS',
      company: 'Export Excellence Corp', productName: 'Fertilizantes Especiais',
      destinationCountry: 'México', regulatoryBody: 'Banco Central',
      issueDate: new Date('2024-03-15'), expiryDate: new Date('2024-09-15'),
      status: 'VENCIDA', responsibleUser: 'Ana Pereira',
      observations: 'Licença para produtos controlados - fertilizantes',
      aiComplianceScore: 38, riskLevel: 'CRÍTICO',
      createdAt: new Date('2024-03-10'), updatedAt: new Date('2024-09-16')
    },
    {
      id: 'LIC-008', licenseNumber: 'FIT-2024-00145', licenseType: 'FITOSSANITÁRIA',
      company: 'Agro Export Brasil Ltda', productName: 'Café Arábica',
      destinationCountry: 'Coreia do Sul', regulatoryBody: 'Vigiagro',
      issueDate: new Date('2024-07-01'), expiryDate: new Date('2025-01-01'),
      status: 'VÁLIDA', responsibleUser: 'Maria Santos',
      observations: 'Certificado fitossanitário café para mercado coreano',
      aiComplianceScore: 87, riskLevel: 'BAIXO',
      createdAt: new Date('2024-06-28'), updatedAt: new Date('2024-09-15')
    },
    {
      id: 'LIC-009', licenseNumber: 'SAN-2024-00301', licenseType: 'SANITÁRIA',
      company: 'Brazilian Commodities SA', productName: 'Carne Bovina',
      destinationCountry: 'China', regulatoryBody: 'Anvisa',
      issueDate: new Date('2024-08-01'), expiryDate: new Date('2024-11-01'),
      status: 'PENDENTE', responsibleUser: 'Roberto Mendes',
      observations: 'Aguardando aprovação sanitária para carne bovina - China',
      aiComplianceScore: 65, riskLevel: 'MÉDIO',
      createdAt: new Date('2024-07-25'), updatedAt: new Date('2024-10-01')
    },
    {
      id: 'LIC-010', licenseNumber: 'EXP-2024-00312', licenseType: 'EXPORTAÇÃO',
      company: 'Export Excellence Corp', productName: 'Milho',
      destinationCountry: 'Japão', regulatoryBody: 'Secretaria de Comércio Exterior',
      issueDate: new Date('2024-09-01'), expiryDate: new Date('2025-09-01'),
      status: 'VÁLIDA', responsibleUser: 'Pedro Costa',
      observations: 'Licença exportação milho - mercado japonês',
      aiComplianceScore: 94, riskLevel: 'MUITO_BAIXO',
      createdAt: new Date('2024-08-28'), updatedAt: new Date('2024-10-05')
    },
    {
      id: 'LIC-011', licenseNumber: 'AMB-2024-00056', licenseType: 'AMBIENTAL',
      company: 'Agro Export Brasil Ltda', productName: 'Soja em Grãos',
      destinationCountry: 'Alemanha', regulatoryBody: 'IBAMA',
      issueDate: new Date('2024-04-15'), expiryDate: new Date('2024-10-30'),
      status: 'EM_RENOVAÇÃO', responsibleUser: 'Carlos Silva',
      observations: 'Renovação licença ambiental soja - EUDR compliance pendente',
      aiComplianceScore: 68, riskLevel: 'ALTO',
      createdAt: new Date('2024-04-10'), updatedAt: new Date('2024-10-15')
    },
    {
      id: 'LIC-012', licenseNumber: 'FIT-2024-00198', licenseType: 'FITOSSANITÁRIA',
      company: 'Brazilian Commodities SA', productName: 'Açúcar Cristal',
      destinationCountry: 'EUA', regulatoryBody: 'MAPA',
      issueDate: new Date('2024-06-15'), expiryDate: new Date('2024-12-15'),
      status: 'VÁLIDA', responsibleUser: 'Ana Pereira',
      observations: 'Certificado fitossanitário açúcar para mercado americano',
      aiComplianceScore: 81, riskLevel: 'BAIXO',
      createdAt: new Date('2024-06-10'), updatedAt: new Date('2024-09-20')
    },
    {
      id: 'LIC-013', licenseNumber: 'REG-2024-00145', licenseType: 'REGISTRO_ESPECIAL',
      company: 'Export Excellence Corp', productName: 'Café Arábica',
      destinationCountry: 'Coreia do Sul', regulatoryBody: 'Receita Federal',
      issueDate: new Date('2024-07-20'), expiryDate: new Date('2025-07-20'),
      status: 'VÁLIDA', responsibleUser: 'Maria Santos',
      observations: 'Registro especial café premium - Korea Food Agency',
      aiComplianceScore: 91, riskLevel: 'MUITO_BAIXO',
      createdAt: new Date('2024-07-15'), updatedAt: new Date('2024-09-30')
    },
    {
      id: 'LIC-014', licenseNumber: 'SAN-2024-00412', licenseType: 'SANITÁRIA',
      company: 'Agro Export Brasil Ltda', productName: 'Carne Bovina',
      destinationCountry: 'Arábia Saudita', regulatoryBody: 'Vigiagro',
      issueDate: new Date('2024-08-10'), expiryDate: new Date('2024-11-10'),
      status: 'SUSPENSA', responsibleUser: 'Roberto Mendes',
      observations: 'Suspensa - pendência documental certificação halal',
      aiComplianceScore: 42, riskLevel: 'ALTO',
      createdAt: new Date('2024-08-05'), updatedAt: new Date('2024-10-20')
    },
    {
      id: 'LIC-015', licenseNumber: 'EXP-2024-00456', licenseType: 'EXPORTAÇÃO',
      company: 'Brazilian Commodities SA', productName: 'Milho',
      destinationCountry: 'México', regulatoryBody: 'Secretaria de Comércio Exterior',
      issueDate: new Date('2024-09-15'), expiryDate: new Date('2025-09-15'),
      status: 'VÁLIDA', responsibleUser: 'Pedro Costa',
      observations: 'Licença milho para mercado mexicano - NAFTA',
      aiComplianceScore: 88, riskLevel: 'BAIXO',
      createdAt: new Date('2024-09-10'), updatedAt: new Date('2024-10-01')
    },
    {
      id: 'LIC-016', licenseNumber: 'CTR-2024-00028', licenseType: 'PRODUTOS_CONTROLADOS',
      company: 'Agro Export Brasil Ltda', productName: 'Defensivos Agrícolas',
      destinationCountry: 'China', regulatoryBody: 'Banco Central',
      issueDate: new Date('2024-05-01'), expiryDate: new Date('2024-11-01'),
      status: 'PENDENTE', responsibleUser: 'Carlos Silva',
      observations: 'Pendente aprovação - produtos controlados defensivos',
      aiComplianceScore: 55, riskLevel: 'ALTO',
      createdAt: new Date('2024-04-25'), updatedAt: new Date('2024-10-10')
    },
    {
      id: 'LIC-017', licenseNumber: 'OTR-2024-00067', licenseType: 'OUTRAS',
      company: 'Export Excellence Corp', productName: 'Soja em Grãos',
      destinationCountry: 'Holanda', regulatoryBody: 'Secretaria de Comércio Exterior',
      issueDate: new Date('2024-10-01'), expiryDate: new Date('2025-10-01'),
      status: 'VÁLIDA', responsibleUser: 'Ana Pereira',
      observations: 'Licença complementar soja - compliance EUDR',
      aiComplianceScore: 78, riskLevel: 'MÉDIO',
      createdAt: new Date('2024-09-28'), updatedAt: new Date('2024-10-05')
    },
    {
      id: 'LIC-018', licenseNumber: 'EXP-2024-00501', licenseType: 'EXPORTAÇÃO',
      company: 'Brazilian Commodities SA', productName: 'Café Arábica',
      destinationCountry: 'EUA', regulatoryBody: 'Secretaria de Comércio Exterior',
      issueDate: new Date('2024-10-10'), expiryDate: new Date('2025-10-10'),
      status: 'VÁLIDA', responsibleUser: 'Maria Santos',
      observations: 'Licença exportação café premium para mercado americano',
      aiComplianceScore: 96, riskLevel: 'MUITO_BAIXO',
      createdAt: new Date('2024-10-05'), updatedAt: new Date('2024-10-12')
    }
  ];

  private countryRequirementsMap: Record<string, CountryRequirement[]> = {
    'China': [
      { id: 'CR-001', country: 'China', requirement: 'Certificado Fitossanitário', category: 'Sanitário', mandatory: true, regulatoryBody: 'MAPA', details: 'Emitido pelo MAPA com validade de 14 dias para embarque' },
      { id: 'CR-002', country: 'China', requirement: 'Licença de Exportação', category: 'Comercial', mandatory: true, regulatoryBody: 'SECEX', details: 'Licença automática ou não-automática conforme produto' },
      { id: 'CR-003', country: 'China', requirement: 'Certificado de Origem', category: 'Comercial', mandatory: true, regulatoryBody: 'Câmara de Comércio', details: 'Form A para benefícios tarifários preferenciais' },
      { id: 'CR-004', country: 'China', requirement: 'Inspeção Pré-Embarque', category: 'Qualidade', mandatory: true, regulatoryBody: 'AQSIQ/GACC', details: 'Inspeção obrigatória por entidade credenciada pela GACC' }
    ],
    'EUA': [
      { id: 'CR-005', country: 'EUA', requirement: 'FDA Registration', category: 'Sanitário', mandatory: true, regulatoryBody: 'FDA', details: 'Registro na FDA com Prior Notice 15 dias antes do embarque' },
      { id: 'CR-006', country: 'EUA', requirement: 'FSVP Compliance', category: 'Sanitário', mandatory: true, regulatoryBody: 'FDA', details: 'Foreign Supplier Verification Program - verificação do fornecedor' },
      { id: 'CR-007', country: 'EUA', requirement: 'Licença de Exportação', category: 'Comercial', mandatory: true, regulatoryBody: 'SECEX', details: 'Licença automática para a maioria dos produtos agrícolas' }
    ],
    'Alemanha': [
      { id: 'CR-008', country: 'Alemanha', requirement: 'Certificado Fitossanitário', category: 'Sanitário', mandatory: true, regulatoryBody: 'MAPA', details: 'Conforme regulamentos fitossanitários da UE' },
      { id: 'CR-009', country: 'Alemanha', requirement: 'EUDR Compliance', category: 'Ambiental', mandatory: true, regulatoryBody: 'Comissão Europeia', details: 'Regulamento de Desmatamento da UE - due diligence obrigatório' },
      { id: 'CR-010', country: 'Alemanha', requirement: 'Certificado de Origem', category: 'Comercial', mandatory: true, regulatoryBody: 'Câmara de Comércio', details: 'EUR.1 ou declaração de origem na fatura' }
    ],
    'Japão': [
      { id: 'CR-011', country: 'Japão', requirement: 'Certificado Fitossanitário', category: 'Sanitário', mandatory: true, regulatoryBody: 'MAPA', details: 'Certificado com requisitos específicos MAFF Japão' },
      { id: 'CR-012', country: 'Japão', requirement: 'Certificado de Qualidade', category: 'Qualidade', mandatory: true, regulatoryBody: 'Laboratório Credenciado', details: 'Análise de resíduos e micotoxinas conforme padrões JAS' },
      { id: 'CR-013', country: 'Japão', requirement: 'Registro no MAFF', category: 'Regulatório', mandatory: true, regulatoryBody: 'MAFF', details: 'Ministry of Agriculture, Forestry and Fisheries registration' }
    ],
    'Arábia Saudita': [
      { id: 'CR-014', country: 'Arábia Saudita', requirement: 'Certificado Halal', category: 'Religiosa', mandatory: true, regulatoryBody: 'CDIAL Halal/SFDA', details: 'Certificação halal por entidade reconhecida pela SFDA' },
      { id: 'CR-015', country: 'Arábia Saudita', requirement: 'Certificado Sanitário', category: 'Sanitário', mandatory: true, regulatoryBody: 'Anvisa/MAPA', details: 'Certificado sanitário internacional para produtos de origem animal' }
    ],
    'Holanda': [
      { id: 'CR-016', country: 'Holanda', requirement: 'Certificado Fitossanitário', category: 'Sanitário', mandatory: true, regulatoryBody: 'MAPA', details: 'Conforme regulamentos fitossanitários da UE' },
      { id: 'CR-017', country: 'Holanda', requirement: 'EUDR Compliance', category: 'Ambiental', mandatory: true, regulatoryBody: 'Comissão Europeia', details: 'Regulamento de Desmatamento da UE' },
      { id: 'CR-018', country: 'Holanda', requirement: 'Certificado de Origem', category: 'Comercial', mandatory: true, regulatoryBody: 'Câmara de Comércio', details: 'Certificado de origem para entrada na UE' }
    ],
    'Coreia do Sul': [
      { id: 'CR-019', country: 'Coreia do Sul', requirement: 'Certificado Fitossanitário', category: 'Sanitário', mandatory: true, regulatoryBody: 'MAPA', details: 'Certificado com requisitos Korea Food Agency' },
      { id: 'CR-020', country: 'Coreia do Sul', requirement: 'Certificado de Qualidade', category: 'Qualidade', mandatory: true, regulatoryBody: 'Laboratório Credenciado', details: 'Análise conforme padrões KFDA' }
    ],
    'México': [
      { id: 'CR-021', country: 'México', requirement: 'Certificado Fitossanitário', category: 'Sanitário', mandatory: true, regulatoryBody: 'MAPA', details: 'Certificado conforme SENASICA/México' },
      { id: 'CR-022', country: 'México', requirement: 'Licença de Exportação', category: 'Comercial', mandatory: true, regulatoryBody: 'SECEX', details: 'Licença automática - acordo MERCOSUL-México' }
    ]
  };

  private mockRestrictions: RegulatoryRestriction[] = [
    {
      id: 'RR-001', country: 'China', product: 'Carne Bovina',
      restrictionType: 'Embargo Sanitário', description: 'Embargo parcial em frigoríficos não habilitados pela GACC',
      startDate: new Date('2024-06-01'), endDate: null, severity: 'ALTO'
    },
    {
      id: 'RR-002', country: 'Arábia Saudita', product: 'Carne Bovina',
      restrictionType: 'Suspensão Temporária', description: 'Suspensão temporária de 3 plantas por descumprimento halal',
      startDate: new Date('2024-09-01'), endDate: new Date('2024-12-31'), severity: 'CRÍTICO'
    },
    {
      id: 'RR-003', country: 'Alemanha', product: 'Soja em Grãos',
      restrictionType: 'Exigência Regulatória', description: 'EUDR - Regulamento de Desmatamento entra em vigor, due diligence obrigatório',
      startDate: new Date('2024-12-30'), endDate: null, severity: 'ALTO'
    }
  ];

  // ============ PUBLIC METHODS ============

  getLicenses(filters?: LicenseFilters): Observable<Licenca[]> {
    let result = [...this.mockLicenses];
    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        result = result.filter(l =>
          l.licenseNumber.toLowerCase().includes(search) ||
          l.company.toLowerCase().includes(search) ||
          l.productName.toLowerCase().includes(search) ||
          l.destinationCountry.toLowerCase().includes(search)
        );
      }
      if (filters.licenseType) result = result.filter(l => l.licenseType === filters.licenseType);
      if (filters.status) result = result.filter(l => l.status === filters.status);
      if (filters.regulatoryBody) result = result.filter(l => l.regulatoryBody === filters.regulatoryBody);
      if (filters.destinationCountry) result = result.filter(l => l.destinationCountry === filters.destinationCountry);
      if (filters.riskLevel) result = result.filter(l => l.riskLevel === filters.riskLevel);
      if (filters.expiryStart) result = result.filter(l => new Date(l.expiryDate) >= filters.expiryStart!);
      if (filters.expiryEnd) result = result.filter(l => new Date(l.expiryDate) <= filters.expiryEnd!);
    }
    return of(result).pipe(delay(300));
  }

  getLicenseById(id: string): Observable<Licenca | null> {
    const license = this.mockLicenses.find(l => l.id === id) || null;
    return of(license).pipe(delay(200));
  }

  createLicense(data: Partial<Licenca>): Observable<Licenca> {
    const newLicense: Licenca = {
      id: `LIC-${String(this.mockLicenses.length + 1).padStart(3, '0')}`,
      licenseNumber: data.licenseNumber || this.generateLicenseNumber(),
      licenseType: data.licenseType || 'EXPORTAÇÃO',
      company: data.company || '',
      productName: data.productName || '',
      destinationCountry: data.destinationCountry || '',
      regulatoryBody: data.regulatoryBody || '',
      issueDate: data.issueDate || new Date(),
      expiryDate: data.expiryDate || new Date(),
      status: 'PENDENTE',
      responsibleUser: data.responsibleUser || '',
      observations: data.observations || '',
      aiComplianceScore: Math.floor(Math.random() * 30) + 60,
      riskLevel: 'MÉDIO',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockLicenses.push(newLicense);
    return of(newLicense).pipe(delay(500));
  }

  renewLicense(id: string): Observable<Licenca> {
    const license = this.mockLicenses.find(l => l.id === id);
    if (license) {
      license.status = 'EM_RENOVAÇÃO';
      license.updatedAt = new Date();
    }
    return of(license!).pipe(delay(400));
  }

  getValidations(licenseId: string): Observable<ComplianceValidation[]> {
    const validations: ComplianceValidation[] = [
      { id: 'VAL-001', licenseId, checkType: 'Documentação Completa', status: 'CONFORME', riskScore: 12, validationDate: new Date('2024-09-15'), validatedBy: 'Sistema Automático', observations: 'Todos os documentos presentes e válidos' },
      { id: 'VAL-002', licenseId, checkType: 'Requisitos do País Destino', status: 'CONFORME', riskScore: 18, validationDate: new Date('2024-09-15'), validatedBy: 'Ana Pereira', observations: 'Requisitos do país atendidos conforme checklist' },
      { id: 'VAL-003', licenseId, checkType: 'Validade Certificados', status: 'EM_ANÁLISE', riskScore: 45, validationDate: new Date('2024-10-01'), validatedBy: 'Sistema Automático', observations: 'Certificado fitossanitário próximo ao vencimento' },
      { id: 'VAL-004', licenseId, checkType: 'Conformidade Ambiental', status: 'PENDENTE', riskScore: 30, validationDate: new Date('2024-10-05'), validatedBy: 'Roberto Mendes', observations: 'Aguardando comprovação EUDR' },
      { id: 'VAL-005', licenseId, checkType: 'Restrições Comerciais', status: 'CONFORME', riskScore: 8, validationDate: new Date('2024-10-05'), validatedBy: 'Sistema Automático', observations: 'Sem restrições identificadas para o destino' }
    ];
    return of(validations).pipe(delay(300));
  }

  getCountryRequirements(country: string): Observable<CountryRequirement[]> {
    const requirements = this.countryRequirementsMap[country] || [];
    return of(requirements).pipe(delay(200));
  }

  getRestrictions(): Observable<RegulatoryRestriction[]> {
    return of(this.mockRestrictions).pipe(delay(200));
  }

  getActionPlans(licenseId: string): Observable<ActionPlan[]> {
    const plans: ActionPlan[] = [
      { id: 'AP-001', licenseId, title: 'Renovar Certificado Fitossanitário', description: 'Solicitar renovação junto ao MAPA antes do vencimento', responsible: 'Ana Pereira', deadline: new Date('2024-11-15'), status: 'EM_ANDAMENTO', priority: 'ALTA', evidence: ['Protocolo MAPA nº 2024/98765'] },
      { id: 'AP-002', licenseId, title: 'Atualizar Documentação EUDR', description: 'Providenciar documentação de due diligence para EUDR', responsible: 'Maria Santos', deadline: new Date('2024-12-01'), status: 'ABERTO', priority: 'CRÍTICA', evidence: [] },
      { id: 'AP-003', licenseId, title: 'Corrigir Não Conformidade Halal', description: 'Resolver pendência documental certificação halal', responsible: 'Roberto Mendes', deadline: new Date('2024-11-30'), status: 'EM_ANDAMENTO', priority: 'ALTA', evidence: ['Relatório auditoria halal', 'Plano de ação corretiva'] },
      { id: 'AP-004', licenseId, title: 'Treinamento Equipe Compliance', description: 'Capacitar equipe nas novas exigências regulatórias', responsible: 'Carlos Silva', deadline: new Date('2025-01-15'), status: 'ABERTO', priority: 'MÉDIA', evidence: [] }
    ];
    return of(plans).pipe(delay(300));
  }

  getTimeline(licenseId: string): Observable<LicenseTimelineEvent[]> {
    const events: LicenseTimelineEvent[] = [
      { id: 'TL-001', licenseId, event: 'Cadastro da Licença', date: new Date('2024-01-10'), user: 'Carlos Silva', details: 'Licença cadastrada no sistema com dados iniciais' },
      { id: 'TL-002', licenseId, event: 'Validação Documental', date: new Date('2024-01-12'), user: 'Sistema Automático', details: 'Documentação validada automaticamente - todos os requisitos atendidos' },
      { id: 'TL-003', licenseId, event: 'Aprovação Órgão Regulador', date: new Date('2024-01-15'), user: 'SECEX', details: 'Licença aprovada e emitida pelo órgão regulador' },
      { id: 'TL-004', licenseId, event: 'Integração Sistema', date: new Date('2024-01-16'), user: 'Sistema Automático', details: 'Licença integrada com módulos de exportação e embarque' },
      { id: 'TL-005', licenseId, event: 'Alteração de Dados', date: new Date('2024-06-20'), user: 'Ana Pereira', details: 'Atualização de observações e vinculação a novo embarque' },
      { id: 'TL-006', licenseId, event: 'Alerta de Expiração', date: new Date('2024-12-15'), user: 'Sistema IA', details: 'Alerta automático: licença expira em 30 dias - iniciar renovação' }
    ];
    return of(events).pipe(delay(300));
  }

  getAIInsights(licenseId: string): Observable<LicenseAIInsights> {
    const license = this.mockLicenses.find(l => l.id === licenseId);
    const country = license?.destinationCountry || 'China';
    const insights: LicenseAIInsights = {
      licenseId,
      complianceScore: license?.aiComplianceScore || 75,
      riskLevel: license?.riskLevel || 'MÉDIO',
      alerts: [
        { severity: 'HIGH', message: 'Licença expira em menos de 30 dias - renovação urgente necessária', regulation: 'Portaria SECEX nº 23/2024', detectedAt: new Date('2024-10-15') },
        { severity: 'CRITICAL', message: 'Novo regulamento EUDR entra em vigor em 30/12/2024 - adequação obrigatória', regulation: 'EU Regulation 2023/1115', detectedAt: new Date('2024-10-10') },
        { severity: 'MEDIUM', message: 'Certificado fitossanitário próximo ao vencimento para embarque programado', regulation: 'IN MAPA nº 45/2023', detectedAt: new Date('2024-10-12') },
        { severity: 'LOW', message: 'Atualização de requisitos do país destino disponível para revisão', regulation: 'GACC Notice 2024-089', detectedAt: new Date('2024-10-08') }
      ],
      suggestions: [
        { action: 'Iniciar processo de renovação imediatamente', reason: 'A licença expira em menos de 30 dias e o processo de renovação leva em média 15 dias úteis', regulation: 'Portaria SECEX nº 23/2024', confidence: 95, operationalImpact: 'Bloqueio de embarques programados caso não renovada a tempo', deadline: '15 dias úteis' },
        { action: 'Adequar documentação ao EUDR', reason: 'O Regulamento de Desmatamento da UE exige comprovação de due diligence para produtos agropecuários', regulation: 'EU Regulation 2023/1115', confidence: 88, operationalImpact: 'Impossibilidade de exportar para UE a partir de 30/12/2024', deadline: '60 dias' },
        { action: 'Solicitar inspeção pré-embarque antecipada', reason: 'Alta demanda no período pode atrasar agendamento - antecipar solicitação', regulation: 'GACC Requirements', confidence: 72, operationalImpact: 'Atraso de 7-14 dias no embarque se não agendado com antecedência', deadline: '30 dias' }
      ],
      countryRequirements: this.countryRequirementsMap[country] || [],
      restrictions: this.mockRestrictions.filter(r => r.country === country),
      executiveSummary: `A licença ${license?.licenseNumber || ''} apresenta score de compliance de ${license?.aiComplianceScore || 75}/100. Foram identificados ${license?.riskLevel === 'CRÍTICO' ? '3 pontos críticos' : '2 pontos de atenção'} que requerem ação imediata. O principal risco está relacionado à proximidade do vencimento e às novas exigências regulatórias do país destino. Recomenda-se iniciar o processo de renovação nos próximos 5 dias úteis para evitar impacto operacional nos embarques programados.`
    };
    return of(insights).pipe(delay(500));
  }

  getMetrics(): Observable<LicenseMetrics> {
    const active = this.mockLicenses.filter(l => l.status === 'VÁLIDA').length;
    const expired = this.mockLicenses.filter(l => l.status === 'VENCIDA').length;
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringSoon = this.mockLicenses.filter(l => {
      const exp = new Date(l.expiryDate);
      return l.status === 'VÁLIDA' && exp <= thirtyDays && exp > now;
    }).length;
    const nonConformities = 4;
    const blocked = this.mockLicenses.filter(l => l.status === 'SUSPENSA' || l.status === 'CANCELADA').length;
    const avgScore = Math.round(this.mockLicenses.reduce((sum, l) => sum + l.aiComplianceScore, 0) / this.mockLicenses.length);

    const metrics: LicenseMetrics = {
      totalLicenses: this.mockLicenses.length,
      activeCount: active,
      expiredCount: expired,
      expiringSoonCount: expiringSoon,
      nonConformities,
      blockedExports: blocked,
      avgComplianceScore: avgScore,
      avgRiskScore: 35
    };
    return of(metrics).pipe(delay(200));
  }

  validateExport(exportId: string): Observable<{ score: number; issues: string[]; canProceed: boolean }> {
    const result = {
      score: 78,
      issues: [
        'Certificado fitossanitário vence em 10 dias',
        'Documentação EUDR incompleta',
        'Inspeção pré-embarque não agendada'
      ],
      canProceed: true
    };
    return of(result).pipe(delay(600));
  }

  // ============ SYNCHRONOUS METHODS ============

  getLicenseTypes(): LicenseType[] {
    return ['EXPORTAÇÃO', 'REGISTRO_ESPECIAL', 'SANITÁRIA', 'FITOSSANITÁRIA', 'AMBIENTAL', 'PRODUTOS_CONTROLADOS', 'OUTRAS'];
  }

  getStatuses(): LicenseStatus[] {
    return ['VÁLIDA', 'VENCIDA', 'PENDENTE', 'EM_RENOVAÇÃO', 'SUSPENSA', 'CANCELADA'];
  }

  getRegulatoryBodies(): string[] {
    return ['MAPA', 'Receita Federal', 'Banco Central', 'IBAMA', 'Anvisa', 'Vigiagro', 'Secretaria de Comércio Exterior'];
  }

  getCountries(): string[] {
    return ['China', 'EUA', 'Japão', 'Alemanha', 'Holanda', 'Arábia Saudita', 'Coreia do Sul', 'México'];
  }

  getRiskLevels(): RiskLevel[] {
    return ['MUITO_BAIXO', 'BAIXO', 'MÉDIO', 'ALTO', 'CRÍTICO'];
  }

  private generateLicenseNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const seq = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0');
    return `LIC-${year}-${seq}`;
  }
}

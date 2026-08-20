import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Customer, Contact, Opportunity, CrmMetrics,
  CustomerSegment, OpportunityStage
} from '../types/crm';

@Injectable({
  providedIn: 'root'
})
export class CrmMockService {

  private customers: Customer[] = [];
  private contacts: Contact[] = [];
  private opportunities: Opportunity[] = [];

  constructor() {
    this.initializeMockData();
  }

  // ================================
  // PUBLIC API
  // ================================

  getCustomers(): Observable<Customer[]> {
    return of([...this.customers]).pipe(delay(this.randomDelay()));
  }

  getContacts(): Observable<Contact[]> {
    return of([...this.contacts]).pipe(delay(this.randomDelay()));
  }

  getOpportunities(): Observable<Opportunity[]> {
    return of([...this.opportunities]).pipe(delay(this.randomDelay()));
  }

  getMetrics(): Observable<CrmMetrics> {
    const openOpps = this.opportunities.filter(o => o.stage !== 'CLOSED_WON' && o.stage !== 'CLOSED_LOST');
    const metrics: CrmMetrics = {
      totalCustomers: this.customers.length,
      totalRevenue: this.customers.reduce((sum, c) => sum + c.totalRevenue, 0),
      activeContracts: this.customers.reduce((sum, c) => sum + c.activeContracts, 0),
      avgRiskScore: Math.round(this.customers.reduce((sum, c) => sum + c.riskScore, 0) / this.customers.length),
      opportunitiesOpen: openOpps.length,
      pipelineValue: openOpps.reduce((sum, o) => sum + o.estimatedValue, 0)
    };
    return of(metrics).pipe(delay(this.randomDelay()));
  }

  createCustomer(data: Partial<Customer>): Observable<Customer> {
    const newCustomer: Customer = {
      id: `CUST-${Date.now()}`,
      companyName: data.companyName || '',
      tradeName: data.tradeName || '',
      taxId: data.taxId || '',
      country: data.country || 'Brasil',
      address: data.address || '',
      segment: data.segment || 'TRADING',
      primaryContact: data.primaryContact || '',
      totalRevenue: 0,
      activeContracts: 0,
      riskScore: 30,
      lastInteractionDate: new Date(),
      createdAt: new Date()
    };
    this.customers.push(newCustomer);
    return of(newCustomer).pipe(delay(this.randomDelay()));
  }

  createOpportunity(data: Partial<Opportunity>): Observable<Opportunity> {
    const newOpp: Opportunity = {
      id: `OPP-${Date.now()}`,
      title: data.title || '',
      customerId: data.customerId || '',
      customerName: data.customerName || '',
      estimatedValue: data.estimatedValue || 0,
      probability: data.probability || 50,
      stage: data.stage || 'PROSPECTING',
      expectedCloseDate: data.expectedCloseDate || new Date(),
      assignedUser: data.assignedUser || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.opportunities.push(newOpp);
    return of(newOpp).pipe(delay(this.randomDelay()));
  }

  getSegments(): CustomerSegment[] {
    return ['AGRO', 'INDUSTRIAL', 'TRADING', 'RETAIL', 'SERVICES'];
  }

  getCountries(): string[] {
    return [...new Set(this.customers.map(c => c.country))].sort();
  }

  getStages(): OpportunityStage[] {
    return ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
  }

  // ================================
  // PRIVATE HELPERS
  // ================================

  private randomDelay(): number {
    return 300 + Math.random() * 400;
  }

  private initializeMockData(): void {
    this.customers = [
      {
        id: 'CUST-001', companyName: 'Cargill Agrícola S.A.', tradeName: 'Cargill',
        taxId: '11.222.333/0001-44', country: 'Brasil', address: 'Av. Nações Unidas, 12901 - SP',
        segment: 'AGRO', primaryContact: 'Roberto Mendes', totalRevenue: 45000000,
        activeContracts: 8, riskScore: 15, lastInteractionDate: new Date('2024-12-01'), createdAt: new Date('2021-03-15')
      },
      {
        id: 'CUST-002', companyName: 'Bunge Alimentos S.A.', tradeName: 'Bunge',
        taxId: '22.333.444/0001-55', country: 'Brasil', address: 'Rua Correia Dias, 184 - SP',
        segment: 'AGRO', primaryContact: 'Ana Luiza Costa', totalRevenue: 38000000,
        activeContracts: 6, riskScore: 22, lastInteractionDate: new Date('2024-11-28'), createdAt: new Date('2020-07-22')
      },
      {
        id: 'CUST-003', companyName: 'Louis Dreyfus Company', tradeName: 'LDC',
        taxId: '33.444.555/0001-66', country: 'Brasil', address: 'Av. Brigadeiro Faria Lima, 1355 - SP',
        segment: 'TRADING', primaryContact: 'Carlos Ferreira', totalRevenue: 52000000,
        activeContracts: 12, riskScore: 18, lastInteractionDate: new Date('2024-12-05'), createdAt: new Date('2019-11-08')
      },
      {
        id: 'CUST-004', companyName: 'ADM do Brasil Ltda', tradeName: 'ADM',
        taxId: '44.555.666/0001-77', country: 'Brasil', address: 'Av. Faria Lima, 3400 - SP',
        segment: 'AGRO', primaryContact: 'Patricia Rodrigues', totalRevenue: 29000000,
        activeContracts: 5, riskScore: 28, lastInteractionDate: new Date('2024-11-20'), createdAt: new Date('2020-04-12')
      },
      {
        id: 'CUST-005', companyName: 'COFCO International', tradeName: 'COFCO',
        taxId: '55.666.777/0001-88', country: 'China', address: 'Tower 2, Fortune Plaza - Beijing',
        segment: 'TRADING', primaryContact: 'Wei Zhang', totalRevenue: 67000000,
        activeContracts: 15, riskScore: 35, lastInteractionDate: new Date('2024-12-08'), createdAt: new Date('2018-09-03')
      },
      {
        id: 'CUST-006', companyName: 'Glencore Agriculture', tradeName: 'Glencore',
        taxId: '66.777.888/0001-99', country: 'Suíça', address: 'Baarermattstrasse 3 - Baar',
        segment: 'TRADING', primaryContact: 'Hans Mueller', totalRevenue: 41000000,
        activeContracts: 7, riskScore: 42, lastInteractionDate: new Date('2024-11-15'), createdAt: new Date('2019-06-18')
      },
      {
        id: 'CUST-007', companyName: 'JBS S.A.', tradeName: 'JBS',
        taxId: '77.888.999/0001-10', country: 'Brasil', address: 'Av. Marginal Direita do Tietê, 500 - SP',
        segment: 'INDUSTRIAL', primaryContact: 'Marcos Silva', totalRevenue: 33000000,
        activeContracts: 4, riskScore: 55, lastInteractionDate: new Date('2024-12-02'), createdAt: new Date('2021-01-25')
      },
      {
        id: 'CUST-008', companyName: 'BRF S.A.', tradeName: 'BRF',
        taxId: '88.999.000/0001-21', country: 'Brasil', address: 'Rua Hungria, 1400 - SP',
        segment: 'INDUSTRIAL', primaryContact: 'Fernanda Oliveira', totalRevenue: 27000000,
        activeContracts: 3, riskScore: 38, lastInteractionDate: new Date('2024-11-30'), createdAt: new Date('2020-08-14')
      },
      {
        id: 'CUST-009', companyName: 'Marfrig Global Foods', tradeName: 'Marfrig',
        taxId: '99.000.111/0001-32', country: 'Brasil', address: 'Av. Queiroz Filho, 1560 - SP',
        segment: 'INDUSTRIAL', primaryContact: 'Eduardo Machado', totalRevenue: 21000000,
        activeContracts: 3, riskScore: 45, lastInteractionDate: new Date('2024-11-25'), createdAt: new Date('2021-05-30')
      },
      {
        id: 'CUST-010', companyName: 'Minerva Foods', tradeName: 'Minerva',
        taxId: '10.111.222/0001-43', country: 'Brasil', address: 'Av. Antônio Manço Bernardes, s/n - MG',
        segment: 'INDUSTRIAL', primaryContact: 'Luciana Barros', totalRevenue: 18000000,
        activeContracts: 2, riskScore: 50, lastInteractionDate: new Date('2024-12-04'), createdAt: new Date('2022-02-10')
      },
      {
        id: 'CUST-011', companyName: 'Olam International', tradeName: 'Olam',
        taxId: '11.222.333/0001-54', country: 'Singapura', address: '7 Straits View - Marina One',
        segment: 'TRADING', primaryContact: 'David Tan', totalRevenue: 35000000,
        activeContracts: 9, riskScore: 25, lastInteractionDate: new Date('2024-12-06'), createdAt: new Date('2019-12-22')
      },
      {
        id: 'CUST-012', companyName: 'Wilmar International', tradeName: 'Wilmar',
        taxId: '12.333.444/0001-65', country: 'Singapura', address: '56 Neil Road - Singapore',
        segment: 'AGRO', primaryContact: 'Lim Kok Wei', totalRevenue: 42000000,
        activeContracts: 10, riskScore: 20, lastInteractionDate: new Date('2024-11-22'), createdAt: new Date('2020-01-15')
      },
      {
        id: 'CUST-013', companyName: 'Amaggi Exportação', tradeName: 'Amaggi',
        taxId: '13.444.555/0001-76', country: 'Brasil', address: 'Av. Historiador Rubens de Mendonça - MT',
        segment: 'AGRO', primaryContact: 'Juliana Maggi', totalRevenue: 25000000,
        activeContracts: 4, riskScore: 12, lastInteractionDate: new Date('2024-12-09'), createdAt: new Date('2020-06-08')
      },
      {
        id: 'CUST-014', companyName: 'Toyota Tsusho Corporation', tradeName: 'Toyota Tsusho',
        taxId: '14.555.666/0001-87', country: 'Japão', address: '9-8 Meieki 4-chome - Nagoya',
        segment: 'SERVICES', primaryContact: 'Takeshi Yamamoto', totalRevenue: 15000000,
        activeContracts: 2, riskScore: 10, lastInteractionDate: new Date('2024-11-18'), createdAt: new Date('2022-09-01')
      },
      {
        id: 'CUST-015', companyName: 'Viterra Limited', tradeName: 'Viterra',
        taxId: '15.666.777/0001-98', country: 'Holanda', address: 'De Boelelaan 7 - Amsterdam',
        segment: 'TRADING', primaryContact: 'Pierre Dubois', totalRevenue: 31000000,
        activeContracts: 6, riskScore: 30, lastInteractionDate: new Date('2024-12-03'), createdAt: new Date('2021-08-20')
      },
      {
        id: 'CUST-016', companyName: 'Carrefour Brasil', tradeName: 'Carrefour',
        taxId: '16.777.888/0001-09', country: 'Brasil', address: 'Rua George Eastman, 213 - SP',
        segment: 'RETAIL', primaryContact: 'Camila Nogueira', totalRevenue: 12000000,
        activeContracts: 2, riskScore: 20, lastInteractionDate: new Date('2024-11-27'), createdAt: new Date('2023-01-10')
      }
    ];

    this.contacts = [
      { id: 'CONT-001', customerId: 'CUST-001', customerName: 'Cargill', name: 'Roberto Mendes', email: 'roberto.mendes@cargill.com', phone: '+55 11 98765-4321', role: 'Diretor Comercial', status: 'ACTIVE' },
      { id: 'CONT-002', customerId: 'CUST-001', customerName: 'Cargill', name: 'Mariana Santos', email: 'mariana.santos@cargill.com', phone: '+55 11 97654-3210', role: 'Gerente de Compras', status: 'ACTIVE' },
      { id: 'CONT-003', customerId: 'CUST-002', customerName: 'Bunge', name: 'Ana Luiza Costa', email: 'ana.costa@bunge.com', phone: '+55 11 96543-2109', role: 'VP Comercial', status: 'ACTIVE' },
      { id: 'CONT-004', customerId: 'CUST-002', customerName: 'Bunge', name: 'Felipe Almeida', email: 'felipe.almeida@bunge.com', phone: '+55 11 95432-1098', role: 'Analista Sênior', status: 'ACTIVE' },
      { id: 'CONT-005', customerId: 'CUST-003', customerName: 'LDC', name: 'Carlos Ferreira', email: 'carlos.ferreira@ldc.com', phone: '+55 11 94321-0987', role: 'Head of Trading', status: 'ACTIVE' },
      { id: 'CONT-006', customerId: 'CUST-003', customerName: 'LDC', name: 'Isabela Lima', email: 'isabela.lima@ldc.com', phone: '+55 11 93210-9876', role: 'Coordenadora Logística', status: 'ACTIVE' },
      { id: 'CONT-007', customerId: 'CUST-004', customerName: 'ADM', name: 'Patricia Rodrigues', email: 'patricia.rodrigues@adm.com', phone: '+55 11 92109-8765', role: 'Gerente Operações', status: 'ACTIVE' },
      { id: 'CONT-008', customerId: 'CUST-005', customerName: 'COFCO', name: 'Wei Zhang', email: 'wei.zhang@cofco.com', phone: '+86 10 8888-9999', role: 'Director Procurement', status: 'ACTIVE' },
      { id: 'CONT-009', customerId: 'CUST-005', customerName: 'COFCO', name: 'Li Ming', email: 'li.ming@cofco.com', phone: '+86 10 7777-8888', role: 'Senior Trader', status: 'ACTIVE' },
      { id: 'CONT-010', customerId: 'CUST-006', customerName: 'Glencore', name: 'Hans Mueller', email: 'hans.mueller@glencore.com', phone: '+41 41 709-2000', role: 'Commodity Director', status: 'ACTIVE' },
      { id: 'CONT-011', customerId: 'CUST-007', customerName: 'JBS', name: 'Marcos Silva', email: 'marcos.silva@jbs.com.br', phone: '+55 11 91098-7654', role: 'Diretor Supply Chain', status: 'ACTIVE' },
      { id: 'CONT-012', customerId: 'CUST-007', customerName: 'JBS', name: 'Amanda Rezende', email: 'amanda.rezende@jbs.com.br', phone: '+55 11 90987-6543', role: 'Compradora Sênior', status: 'ACTIVE' },
      { id: 'CONT-013', customerId: 'CUST-008', customerName: 'BRF', name: 'Fernanda Oliveira', email: 'fernanda.oliveira@brf.com', phone: '+55 41 89876-5432', role: 'Gerente Exportação', status: 'ACTIVE' },
      { id: 'CONT-014', customerId: 'CUST-009', customerName: 'Marfrig', name: 'Eduardo Machado', email: 'eduardo.machado@marfrig.com.br', phone: '+55 11 88765-4321', role: 'Head Comercial', status: 'ACTIVE' },
      { id: 'CONT-015', customerId: 'CUST-010', customerName: 'Minerva', name: 'Luciana Barros', email: 'luciana.barros@minervafoods.com', phone: '+55 17 87654-3210', role: 'Diretora Comercial', status: 'ACTIVE' },
      { id: 'CONT-016', customerId: 'CUST-011', customerName: 'Olam', name: 'David Tan', email: 'david.tan@olamgroup.com', phone: '+65 6339-9788', role: 'VP Asia Pacific', status: 'ACTIVE' },
      { id: 'CONT-017', customerId: 'CUST-011', customerName: 'Olam', name: 'Sarah Wong', email: 'sarah.wong@olamgroup.com', phone: '+65 6339-9799', role: 'Trade Manager', status: 'INACTIVE' },
      { id: 'CONT-018', customerId: 'CUST-012', customerName: 'Wilmar', name: 'Lim Kok Wei', email: 'lim.kokwei@wilmar.com', phone: '+65 6216-0244', role: 'Chief Procurement', status: 'ACTIVE' },
      { id: 'CONT-019', customerId: 'CUST-013', customerName: 'Amaggi', name: 'Juliana Maggi', email: 'juliana.maggi@amaggi.com.br', phone: '+55 65 86543-2109', role: 'Diretora Exportação', status: 'ACTIVE' },
      { id: 'CONT-020', customerId: 'CUST-013', customerName: 'Amaggi', name: 'Ricardo Souza', email: 'ricardo.souza@amaggi.com.br', phone: '+55 65 85432-1098', role: 'Gerente Logística', status: 'ACTIVE' },
      { id: 'CONT-021', customerId: 'CUST-014', customerName: 'Toyota Tsusho', name: 'Takeshi Yamamoto', email: 'takeshi.yamamoto@toyota-tsusho.com', phone: '+81 52 584-5000', role: 'General Manager', status: 'ACTIVE' },
      { id: 'CONT-022', customerId: 'CUST-015', customerName: 'Viterra', name: 'Pierre Dubois', email: 'pierre.dubois@viterra.com', phone: '+31 20 799-1234', role: 'Trading Director', status: 'ACTIVE' },
      { id: 'CONT-023', customerId: 'CUST-015', customerName: 'Viterra', name: 'Sophie Bernard', email: 'sophie.bernard@viterra.com', phone: '+31 20 799-1235', role: 'Operations Manager', status: 'ACTIVE' },
      { id: 'CONT-024', customerId: 'CUST-016', customerName: 'Carrefour', name: 'Camila Nogueira', email: 'camila.nogueira@carrefour.com', phone: '+55 11 84321-0987', role: 'Buyer Manager', status: 'ACTIVE' },
      { id: 'CONT-025', customerId: 'CUST-004', customerName: 'ADM', name: 'Lucas Pereira', email: 'lucas.pereira@adm.com', phone: '+55 11 83210-9876', role: 'Trader', status: 'INACTIVE' },
      { id: 'CONT-026', customerId: 'CUST-006', customerName: 'Glencore', name: 'Klaus Weber', email: 'klaus.weber@glencore.com', phone: '+41 41 709-3000', role: 'Risk Analyst', status: 'ACTIVE' },
      { id: 'CONT-027', customerId: 'CUST-008', customerName: 'BRF', name: 'Rafael Torres', email: 'rafael.torres@brf.com', phone: '+55 41 82109-8765', role: 'Compliance Officer', status: 'ACTIVE' },
      { id: 'CONT-028', customerId: 'CUST-009', customerName: 'Marfrig', name: 'Gabriela Campos', email: 'gabriela.campos@marfrig.com.br', phone: '+55 11 81098-7654', role: 'Analista Comercial', status: 'ACTIVE' },
      { id: 'CONT-029', customerId: 'CUST-010', customerName: 'Minerva', name: 'Bruno Cardoso', email: 'bruno.cardoso@minervafoods.com', phone: '+55 17 80987-6543', role: 'Gerente Exportação', status: 'ACTIVE' },
      { id: 'CONT-030', customerId: 'CUST-012', customerName: 'Wilmar', name: 'Ng Siew Ping', email: 'siewping.ng@wilmar.com', phone: '+65 6216-0255', role: 'Logistics Director', status: 'ACTIVE' },
      { id: 'CONT-031', customerId: 'CUST-016', customerName: 'Carrefour', name: 'Daniel Azevedo', email: 'daniel.azevedo@carrefour.com', phone: '+55 11 79876-5432', role: 'Analista Importação', status: 'ACTIVE' }
    ];

    this.opportunities = [
      { id: 'OPP-001', title: 'Contrato Soja Safra 2025', customerId: 'CUST-001', customerName: 'Cargill', estimatedValue: 8500000, probability: 75, stage: 'NEGOTIATION', expectedCloseDate: new Date('2025-02-15'), assignedUser: 'João Silva', createdAt: new Date('2024-10-01'), updatedAt: new Date('2024-12-05') },
      { id: 'OPP-002', title: 'Expansão Milho China', customerId: 'CUST-005', customerName: 'COFCO', estimatedValue: 12000000, probability: 60, stage: 'PROPOSAL', expectedCloseDate: new Date('2025-03-30'), assignedUser: 'Maria Santos', createdAt: new Date('2024-09-15'), updatedAt: new Date('2024-12-01') },
      { id: 'OPP-003', title: 'Fornecimento Algodão', customerId: 'CUST-006', customerName: 'Glencore', estimatedValue: 5200000, probability: 40, stage: 'QUALIFICATION', expectedCloseDate: new Date('2025-04-20'), assignedUser: 'Pedro Costa', createdAt: new Date('2024-11-01'), updatedAt: new Date('2024-11-28') },
      { id: 'OPP-004', title: 'Contrato Açúcar VHP', customerId: 'CUST-003', customerName: 'LDC', estimatedValue: 15000000, probability: 85, stage: 'NEGOTIATION', expectedCloseDate: new Date('2025-01-31'), assignedUser: 'João Silva', createdAt: new Date('2024-08-20'), updatedAt: new Date('2024-12-08') },
      { id: 'OPP-005', title: 'Novo Cliente Café Especial', customerId: 'CUST-011', customerName: 'Olam', estimatedValue: 3800000, probability: 30, stage: 'PROSPECTING', expectedCloseDate: new Date('2025-06-15'), assignedUser: 'Ana Oliveira', createdAt: new Date('2024-12-01'), updatedAt: new Date('2024-12-07') },
      { id: 'OPP-006', title: 'Renovação Contrato Farelo', customerId: 'CUST-002', customerName: 'Bunge', estimatedValue: 6700000, probability: 90, stage: 'CLOSED_WON', expectedCloseDate: new Date('2024-11-30'), assignedUser: 'Maria Santos', createdAt: new Date('2024-07-10'), updatedAt: new Date('2024-11-28') },
      { id: 'OPP-007', title: 'Exportação Suco Laranja', customerId: 'CUST-014', customerName: 'Toyota Tsusho', estimatedValue: 2100000, probability: 55, stage: 'PROPOSAL', expectedCloseDate: new Date('2025-05-01'), assignedUser: 'Pedro Costa', createdAt: new Date('2024-11-10'), updatedAt: new Date('2024-12-03') },
      { id: 'OPP-008', title: 'Acordo Carne Premium', customerId: 'CUST-007', customerName: 'JBS', estimatedValue: 9400000, probability: 70, stage: 'NEGOTIATION', expectedCloseDate: new Date('2025-02-28'), assignedUser: 'João Silva', createdAt: new Date('2024-09-25'), updatedAt: new Date('2024-12-06') },
      { id: 'OPP-009', title: 'Contrato Frango Halal', customerId: 'CUST-008', customerName: 'BRF', estimatedValue: 4300000, probability: 20, stage: 'CLOSED_LOST', expectedCloseDate: new Date('2024-11-15'), assignedUser: 'Ana Oliveira', createdAt: new Date('2024-06-01'), updatedAt: new Date('2024-11-15') },
      { id: 'OPP-010', title: 'Expansão Mercado Asiático', customerId: 'CUST-012', customerName: 'Wilmar', estimatedValue: 18000000, probability: 45, stage: 'QUALIFICATION', expectedCloseDate: new Date('2025-07-01'), assignedUser: 'Maria Santos', createdAt: new Date('2024-11-20'), updatedAt: new Date('2024-12-04') },
      { id: 'OPP-011', title: 'Lote Especial Chia/Quinoa', customerId: 'CUST-016', customerName: 'Carrefour', estimatedValue: 1500000, probability: 65, stage: 'PROPOSAL', expectedCloseDate: new Date('2025-03-15'), assignedUser: 'Pedro Costa', createdAt: new Date('2024-10-20'), updatedAt: new Date('2024-12-02') },
      { id: 'OPP-012', title: 'Acordo Grãos Europa', customerId: 'CUST-015', customerName: 'Viterra', estimatedValue: 7800000, probability: 50, stage: 'PROSPECTING', expectedCloseDate: new Date('2025-08-01'), assignedUser: 'Ana Oliveira', createdAt: new Date('2024-12-05'), updatedAt: new Date('2024-12-09') },
      { id: 'OPP-013', title: 'Contrato Bovino Premium', customerId: 'CUST-009', customerName: 'Marfrig', estimatedValue: 5600000, probability: 80, stage: 'CLOSED_WON', expectedCloseDate: new Date('2024-12-01'), assignedUser: 'João Silva', createdAt: new Date('2024-08-15'), updatedAt: new Date('2024-12-01') }
    ];
  }
}

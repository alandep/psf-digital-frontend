import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { 
  Contract, 
  ContractFilters, 
  ContractFilterOptions, 
  ContractCosts,
  Exporter, 
  Port, 
  Country,
  INCOTERM_COST_FACTORS,
  CONTRACT_STATUS_LABELS,
  INCOTERM_LABELS,
  CURRENCY_LABELS
} from '../types/contracts';

@Injectable({
  providedIn: 'root'
})
export class ContractsMockService {
  private contracts: Contract[] = [
    {
      contract_id: 'CONT-2024-001',
      contract_number: 'EXP/2024/001',
      exporter_id: 'EXP-001',
      exporter_name: 'ABC Exportadora Ltda',
      importer_name: 'Global Trade Corp',
      importer_country: 'USA',
      country_destination: 'USA',
      total_value: 2500000,
      currency: 'USD',
      status: 'Active',
      incoterm: 'FOB',
      port_origin: 'Santos (BRSSZ)',
      port_destination: 'Miami (USMIA)',
      contract_date: '2024-01-15',
      shipment_date: '2024-03-15',
      calculated_costs: {
        freight_cost: 0,
        insurance_cost: 0,
        handling_cost: 50000,
        total_costs: 50000,
        margin: 10,
        net_value: 2450000
      },
      created_at: '2024-01-10',
      updated_at: '2024-02-20',
      created_by: 'user@empresa.com'
    },
    {
      contract_id: 'CONT-2024-002',
      contract_number: 'EXP/2024/002',
      exporter_id: 'EXP-002',
      exporter_name: 'XYZ Trading LTDA',
      importer_name: 'Europa Importações S.A.',
      importer_country: 'Germany',
      country_destination: 'Germany',
      total_value: 1850000,
      currency: 'EUR',
      status: 'Draft',
      incoterm: 'CIF',
      port_origin: 'Santos (BRSSZ)',
      port_destination: 'Hamburg (DEHAM)',
      contract_date: '2024-02-10',
      shipment_date: '2024-04-10',
      calculated_costs: {
        freight_cost: 92500,
        insurance_cost: 27750,
        handling_cost: 37000,
        total_costs: 157250,
        margin: 8,
        net_value: 1692750
      },
      created_at: '2024-02-05',
      updated_at: '2024-02-23',
      created_by: 'admin@empresa.com'
    },
    {
      contract_id: 'CONT-2024-003',
      contract_number: 'EXP/2024/003',
      exporter_id: 'EXP-001',
      exporter_name: 'ABC Exportadora Ltda',
      importer_name: 'Asia Pacific Ltd',
      importer_country: 'China',
      country_destination: 'China',
      total_value: 3200000,
      currency: 'USD',
      status: 'Closed',
      incoterm: 'CFR',
      port_origin: 'Santos (BRSSZ)',
      port_destination: 'Shanghai (CNSHA)',
      contract_date: '2023-11-20',
      shipment_date: '2024-01-20',
      calculated_costs: {
        freight_cost: 160000,
        insurance_cost: 0,
        handling_cost: 64000,
        total_costs: 224000,
        margin: 12,
        net_value: 2976000
      },
      created_at: '2023-11-15',
      updated_at: '2024-01-25',
      created_by: 'user@empresa.com'
    },
    {
      contract_id: 'CONT-2024-004',
      contract_number: 'EXP/2024/004',
      exporter_id: 'EXP-003',
      exporter_name: 'Mega Export S.A.',
      importer_name: 'British Importers Ltd',
      importer_country: 'United Kingdom',
      country_destination: 'United Kingdom',
      total_value: 4500000,
      currency: 'USD',
      status: 'Active',
      incoterm: 'DDP',
      port_origin: 'Santos (BRSSZ)',
      port_destination: 'Felixstowe (GBFXT)',
      contract_date: '2024-02-01',
      shipment_date: '2024-04-01',
      calculated_costs: {
        freight_cost: 360000,
        insurance_cost: 90000,
        handling_cost: 135000,
        total_costs: 585000,
        margin: 15,
        net_value: 3915000
      },
      created_at: '2024-01-25',
      updated_at: '2024-02-22',
      created_by: 'manager@empresa.com'
    },
    {
      contract_id: 'CONT-2024-005',
      contract_number: 'EXP/2024/005',
      exporter_id: 'EXP-002',
      exporter_name: 'XYZ Trading LTDA',
      importer_name: 'Argentine Partners SA',
      importer_country: 'Argentina',
      country_destination: 'Argentina',
      total_value: 1200000,
      currency: 'BRL',
      status: 'Draft',
      incoterm: 'EXW',
      port_origin: 'São Paulo (BRSGZ)',
      port_destination: 'Buenos Aires (ARBUE)',
      contract_date: '2024-02-20',
      shipment_date: '2024-05-20',
      calculated_costs: {
        freight_cost: 0,
        insurance_cost: 0,
        handling_cost: 12000,
        total_costs: 12000,
        margin: 5,
        net_value: 1188000
      },
      created_at: '2024-02-15',
      updated_at: '2024-02-21',
      created_by: 'user@empresa.com'
    }
  ];

  private exporters: Exporter[] = [
    {
      id: 'EXP-001',
      name: 'ABC Exportadora Ltda',
      cnpj: '12.345.678/0001-90',
      address: 'Av. Paulista, 1000 - São Paulo/SP',
      country: 'Brazil',
      email: 'contato@abcexport.com.br',
      phone: '+55 11 3333-4444',
      status: 'active'
    },
    {
      id: 'EXP-002',
      name: 'XYZ Trading LTDA',
      cnpj: '98.765.432/0001-10',
      address: 'Rua das Flores, 500 - Rio de Janeiro/RJ',
      country: 'Brazil',
      email: 'comercial@xyztrading.com.br',
      phone: '+55 21 2222-3333',
      status: 'active'
    },
    {
      id: 'EXP-003',
      name: 'Mega Export S.A.',
      cnpj: '55.444.333/0001-22',
      address: 'Rua Comércio, 200 - Santos/SP',
      country: 'Brazil',
      email: 'vendas@megaexport.com.br',
      phone: '+55 13 3334-5555',
      status: 'active'
    }
  ];

  private countries: Country[] = [
    { code: 'USA', name: 'Estados Unidos', region: 'America do Norte', currency: 'USD' },
    { code: 'Germany', name: 'Alemanha', region: 'Europa', currency: 'EUR' },
    { code: 'China', name: 'China', region: 'Asia', currency: 'CNY' },
    { code: 'United Kingdom', name: 'Reino Unido', region: 'Europa', currency: 'GBP' },
    { code: 'Argentina', name: 'Argentina', region: 'America do Sul', currency: 'ARS' },
    { code: 'France', name: 'França', region: 'Europa', currency: 'EUR' },
    { code: 'Japan', name: 'Japão', region: 'Asia', currency: 'JPY' },
    { code: 'Canada', name: 'Canadá', region: 'America do Norte', currency: 'CAD' },
  ];

  private ports: Port[] = [
    { code: 'BRSSZ', name: 'Santos', country: 'Brazil', type: 'sea' },
    { code: 'BRSGZ', name: 'São Paulo (Guarulhos)', country: 'Brazil', type: 'air' },
    { code: 'USMIA', name: 'Miami', country: 'USA', type: 'sea' },
    { code: 'USJFK', name: 'New York (JFK)', country: 'USA', type: 'air' },
    { code: 'DEHAM', name: 'Hamburg', country: 'Germany', type: 'sea' },
    { code: 'GBFXT', name: 'Felixstowe', country: 'United Kingdom', type: 'sea' },
    { code: 'CNSHA', name: 'Shanghai', country: 'China', type: 'sea' },
    { code: 'ARBUE', name: 'Buenos Aires', country: 'Argentina', type: 'sea' }
  ];

  constructor() {
    console.log('📋 ContractsMockService inicializado com', this.contracts.length, 'contratos');
  }

  getContracts(filters?: ContractFilters): Observable<Contract[]> {
    console.log('📋 Buscando contratos com filtros:', filters);
    
    let filteredContracts = [...this.contracts];

    if (filters) {
      if (filters.status?.length) {
        filteredContracts = filteredContracts.filter(c => filters.status!.includes(c.status));
      }
      if (filters.currency?.length) {
        filteredContracts = filteredContracts.filter(c => filters.currency!.includes(c.currency));
      }
      if (filters.incoterm?.length) {
        filteredContracts = filteredContracts.filter(c => filters.incoterm!.includes(c.incoterm));
      }
      if (filters.countries?.length) {
        filteredContracts = filteredContracts.filter(c => filters.countries!.includes(c.country_destination));
      }
      if (filters.value_min !== undefined) {
        filteredContracts = filteredContracts.filter(c => c.total_value >= filters.value_min!);
      }
      if (filters.value_max !== undefined) {
        filteredContracts = filteredContracts.filter(c => c.total_value <= filters.value_max!);
      }
      if (filters.exporter_id?.length) {
        filteredContracts = filteredContracts.filter(c => filters.exporter_id!.includes(c.exporter_id!));
      }
    }

    return of(filteredContracts).pipe(delay(800));
  }

  getContractById(id: string): Observable<Contract | null> {
    console.log('📋 Buscando contrato:', id);
    const contract = this.contracts.find(c => c.contract_id === id);
    return of(contract || null).pipe(delay(500));
  }

  createContract(contract: Partial<Contract>): Observable<Contract> {
    console.log('📋 Criando novo contrato:', contract);
    
    const newContract: Contract = {
      ...contract,
      contract_id: `CONT-${new Date().getFullYear()}-${String(this.contracts.length + 1).padStart(3, '0')}`,
      contract_number: contract.contract_number || `EXP/${new Date().getFullYear()}/${String(this.contracts.length + 1).padStart(3, '0')}`,
      calculated_costs: this.calculateCosts(contract.total_value || 0, contract.incoterm || 'FOB'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user@empresa.com'
    } as Contract;

    this.contracts.push(newContract);
    return of(newContract).pipe(delay(1000));
  }

  updateContract(id: string, contract: Partial<Contract>): Observable<Contract | null> {
    console.log('📋 Atualizando contrato:', id, contract);
    
    const index = this.contracts.findIndex(c => c.contract_id === id);
    if (index === -1) {
      return throwError(() => new Error('Contrato não encontrado'));
    }

    const updatedContract = {
      ...this.contracts[index],
      ...contract,
      updated_at: new Date().toISOString(),
      calculated_costs: contract.total_value || contract.incoterm ? 
        this.calculateCosts(contract.total_value || this.contracts[index].total_value, contract.incoterm || this.contracts[index].incoterm) :
        this.contracts[index].calculated_costs
    };

    this.contracts[index] = updatedContract;
    return of(updatedContract).pipe(delay(1000));
  }

  deleteContract(id: string): Observable<boolean> {
    console.log('📋 Excluindo contrato:', id);
    
    const index = this.contracts.findIndex(c => c.contract_id === id);
    if (index === -1) {
      return throwError(() => new Error('Contrato não encontrado'));
    }

    this.contracts.splice(index, 1);
    return of(true).pipe(delay(800));
  }

  generateDocuments(contractId: string): Observable<{ success: boolean; documentUrls?: string[] }> {
    console.log('📋 Gerando documentos para contrato:', contractId);
    
    // Simular geração de documentos
    const documentUrls = [
      `/api/documents/contract-${contractId}.pdf`,
      `/api/documents/invoice-${contractId}.pdf`,
      `/api/documents/bl-${contractId}.pdf`
    ];
    
    return of({ success: true, documentUrls }).pipe(delay(2000));
  }

  sendToReceita(contractId: string): Observable<{ success: boolean; protocol?: string }> {
    console.log('📋 Enviando contrato para Receita Federal:', contractId);
    
    // Simular envio para Receita Federal
    const protocol = `RF${Date.now()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    
    return of({ success: true, protocol }).pipe(delay(3000));
  }

  getFilterOptions(): Observable<ContractFilterOptions> {
    const options: ContractFilterOptions = {
      statuses: Object.entries(CONTRACT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
      currencies: Array.from(new Set(this.contracts.map(c => c.currency))),
      incoterms: Object.entries(INCOTERM_LABELS).map(([value, label]) => ({ value, label })),
      countries: this.countries,
      exporters: this.exporters,
      ports: this.ports
    };

    return of(options).pipe(delay(500));
  }

  calculateCosts(totalValue: number, incoterm: string): ContractCosts {
    const factors = INCOTERM_COST_FACTORS[incoterm as keyof typeof INCOTERM_COST_FACTORS] || INCOTERM_COST_FACTORS['FOB'];
    
    const freight_cost = totalValue * factors.freight;
    const insurance_cost = totalValue * factors.insurance;
    const handling_cost = totalValue * factors.handling;
    const total_costs = freight_cost + insurance_cost + handling_cost;
    
    // Margem entre 5% e 15% dependendo do incoterm
    const margin = incoterm === 'EXW' ? 5 : incoterm === 'DDP' ? 15 : 10;
    const net_value = totalValue - total_costs;

    return {
      freight_cost,
      insurance_cost,
      handling_cost,
      total_costs,
      margin,
      net_value
    };
  }
}
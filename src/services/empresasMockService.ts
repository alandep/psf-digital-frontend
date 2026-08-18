import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Empresa, EmpresaMetrics } from '../types/admin-empresas';

@Injectable({
  providedIn: 'root'
})
export class EmpresasMockService {

  private empresas: Empresa[] = [];

  constructor() {
    this.initializeMockData();
  }

  getEmpresas(): Observable<Empresa[]> {
    return of([...this.empresas]).pipe(delay(this.randomDelay()));
  }

  addEmpresa(empresa: Empresa): Observable<Empresa> {
    this.empresas.push(empresa);
    return of(empresa).pipe(delay(300));
  }

  updateEmpresa(empresa: Empresa): Observable<Empresa> {
    const index = this.empresas.findIndex(e => e.id === empresa.id);
    if (index !== -1) {
      this.empresas[index] = { ...empresa };
    }
    return of(empresa).pipe(delay(300));
  }

  getMetrics(): Observable<EmpresaMetrics> {
    const metrics: EmpresaMetrics = {
      totalEmpresas: this.empresas.length,
      ativas: this.empresas.filter(e => e.status === 'ATIVA').length,
      emOnboarding: this.empresas.filter(e => e.status === 'EM_ONBOARDING').length,
      suspensas: this.empresas.filter(e => e.status === 'SUSPENSA').length,
      totalUsuarios: this.empresas.reduce((sum, e) => sum + e.usuarios, 0),
      totalExportacoes: this.empresas.reduce((sum, e) => sum + e.exportacoes, 0)
    };
    return of(metrics).pipe(delay(this.randomDelay()));
  }

  private randomDelay(): number {
    return 300 + Math.random() * 500;
  }

  private initializeMockData(): void {
    this.empresas = [
      {
        id: 'EMP-001',
        razaoSocial: 'AgroBrasil Exportações Ltda',
        nomeFantasia: 'AgroBrasil',
        cnpj: '12.345.678/0001-90',
        tipo: 'EXPORTADOR',
        status: 'ATIVA',
        pais: 'Brasil',
        estado: 'SP',
        cidade: 'São Paulo',
        responsavel: 'Carlos Alberto',
        email: 'carlos@agrobrasil.com.br',
        telefone: '(11) 3456-7890',
        plano: 'Enterprise',
        dataAdesao: new Date('2022-03-15'),
        ultimoAcesso: new Date('2024-12-14'),
        usuarios: 45,
        exportacoes: 1250,
        modulosAtivos: ['Exportações', 'Documentos', 'Logística', 'Financeiro', 'Compliance']
      },
      {
        id: 'EMP-002',
        razaoSocial: 'MeatPack International Comércio Exterior Ltda',
        nomeFantasia: 'MeatPack International',
        cnpj: '34.567.890/0001-12',
        tipo: 'EXPORTADOR',
        status: 'ATIVA',
        pais: 'Brasil',
        estado: 'PR',
        cidade: 'Curitiba',
        responsavel: 'Ana Ribeiro',
        email: 'ana@meatpack.com.br',
        telefone: '(41) 3678-1234',
        plano: 'Enterprise',
        dataAdesao: new Date('2022-06-20'),
        ultimoAcesso: new Date('2024-12-14'),
        usuarios: 38,
        exportacoes: 890,
        modulosAtivos: ['Exportações', 'Documentos', 'Logística', 'Financeiro', 'Compliance', 'MAPA']
      },
      {
        id: 'EMP-003',
        razaoSocial: 'Café Premium Export S.A.',
        nomeFantasia: 'Café Premium',
        cnpj: '23.456.789/0001-01',
        tipo: 'EXPORTADOR',
        status: 'ATIVA',
        pais: 'Brasil',
        estado: 'MG',
        cidade: 'Belo Horizonte',
        responsavel: 'Roberto Alves',
        email: 'roberto@cafepremium.com.br',
        telefone: '(31) 3789-4567',
        plano: 'Professional',
        dataAdesao: new Date('2023-01-10'),
        ultimoAcesso: new Date('2024-12-13'),
        usuarios: 22,
        exportacoes: 456,
        modulosAtivos: ['Exportações', 'Documentos', 'Logística', 'Financeiro']
      },
      {
        id: 'EMP-004',
        razaoSocial: 'Cooperativa Agrícola Centro-Oeste',
        nomeFantasia: 'CoopCentro',
        cnpj: '56.789.012/0001-34',
        tipo: 'COOPERATIVA',
        status: 'ATIVA',
        pais: 'Brasil',
        estado: 'GO',
        cidade: 'Goiânia',
        responsavel: 'Marcos Silva',
        email: 'marcos@coopcentro.com.br',
        telefone: '(62) 3456-7890',
        plano: 'Enterprise',
        dataAdesao: new Date('2022-09-05'),
        ultimoAcesso: new Date('2024-12-14'),
        usuarios: 65,
        exportacoes: 2100,
        modulosAtivos: ['Exportações', 'Documentos', 'Logística', 'Financeiro', 'Compliance', 'Lotes']
      },
      {
        id: 'EMP-005',
        razaoSocial: 'Global Trading Comércio Internacional',
        nomeFantasia: 'Global Trading',
        cnpj: '67.890.123/0001-45',
        tipo: 'TRADING',
        status: 'ATIVA',
        pais: 'Brasil',
        estado: 'SP',
        cidade: 'Santos',
        responsavel: 'Fernanda Costa',
        email: 'fernanda@globaltrading.com.br',
        telefone: '(13) 3234-5678',
        plano: 'Professional',
        dataAdesao: new Date('2023-04-12'),
        ultimoAcesso: new Date('2024-12-12'),
        usuarios: 18,
        exportacoes: 320,
        modulosAtivos: ['Exportações', 'Documentos', 'Logística', 'Financeiro']
      },
      {
        id: 'EMP-006',
        razaoSocial: 'Indústria de Alimentos Tropical Ltda',
        nomeFantasia: 'Tropical Foods',
        cnpj: '01.234.567/0001-89',
        tipo: 'INDÚSTRIA',
        status: 'EM_ONBOARDING',
        pais: 'Brasil',
        estado: 'BA',
        cidade: 'Salvador',
        responsavel: 'Paulo Santos',
        email: 'paulo@tropicalfoods.com.br',
        telefone: '(71) 3567-8901',
        plano: 'Professional',
        dataAdesao: new Date('2024-11-20'),
        ultimoAcesso: new Date('2024-12-10'),
        usuarios: 5,
        exportacoes: 0,
        modulosAtivos: ['Exportações', 'Documentos']
      },
      {
        id: 'EMP-007',
        razaoSocial: 'LogiPort Operações Portuárias S.A.',
        nomeFantasia: 'LogiPort',
        cnpj: '78.901.234/0001-56',
        tipo: 'OPERADOR_LOGÍSTICO',
        status: 'ATIVA',
        pais: 'Brasil',
        estado: 'SP',
        cidade: 'Santos',
        responsavel: 'Ricardo Menezes',
        email: 'ricardo@logiport.com.br',
        telefone: '(13) 3890-1234',
        plano: 'Enterprise',
        dataAdesao: new Date('2022-11-30'),
        ultimoAcesso: new Date('2024-12-14'),
        usuarios: 52,
        exportacoes: 3400,
        modulosAtivos: ['Logística', 'Documentos', 'Financeiro', 'Portos']
      },
      {
        id: 'EMP-008',
        razaoSocial: 'Citrus Valley Comércio Exterior Ltda',
        nomeFantasia: 'Citrus Valley',
        cnpj: '45.678.901/0001-23',
        tipo: 'EXPORTADOR',
        status: 'SUSPENSA',
        pais: 'Brasil',
        estado: 'SP',
        cidade: 'Araraquara',
        responsavel: 'Lucia Ferreira',
        email: 'lucia@citrusvalley.com.br',
        telefone: '(16) 3456-7890',
        plano: 'Professional',
        dataAdesao: new Date('2023-02-28'),
        ultimoAcesso: new Date('2024-10-15'),
        usuarios: 12,
        exportacoes: 189,
        modulosAtivos: ['Exportações', 'Documentos']
      },
      {
        id: 'EMP-009',
        razaoSocial: 'Mineração e Exportação Serra Dourada',
        nomeFantasia: 'Serra Dourada',
        cnpj: '33.444.555/0001-66',
        tipo: 'EXPORTADOR',
        status: 'ATIVA',
        pais: 'Brasil',
        estado: 'MG',
        cidade: 'Ouro Preto',
        responsavel: 'Jorge Andrade',
        email: 'jorge@serradourada.com.br',
        telefone: '(31) 3678-9012',
        plano: 'Enterprise',
        dataAdesao: new Date('2022-07-15'),
        ultimoAcesso: new Date('2024-12-14'),
        usuarios: 30,
        exportacoes: 780,
        modulosAtivos: ['Exportações', 'Documentos', 'Logística', 'Financeiro', 'Compliance']
      },
      {
        id: 'EMP-010',
        razaoSocial: 'NovaTrade Importação e Exportação',
        nomeFantasia: 'NovaTrade',
        cnpj: '88.999.000/0001-11',
        tipo: 'TRADING',
        status: 'EM_ONBOARDING',
        pais: 'Brasil',
        estado: 'RJ',
        cidade: 'Rio de Janeiro',
        responsavel: 'Camila Oliveira',
        email: 'camila@novatrade.com.br',
        telefone: '(21) 3234-5678',
        plano: 'Starter',
        dataAdesao: new Date('2024-12-01'),
        ultimoAcesso: new Date('2024-12-08'),
        usuarios: 3,
        exportacoes: 0,
        modulosAtivos: ['Exportações']
      },
      {
        id: 'EMP-011',
        razaoSocial: 'Poultry Global Trade Ltda',
        nomeFantasia: 'Poultry Global',
        cnpj: '90.123.456/0001-78',
        tipo: 'EXPORTADOR',
        status: 'ATIVA',
        pais: 'Brasil',
        estado: 'SC',
        cidade: 'Chapecó',
        responsavel: 'Fernando Lima',
        email: 'fernando@poultryglobal.com.br',
        telefone: '(49) 3345-6789',
        plano: 'Professional',
        dataAdesao: new Date('2023-05-18'),
        ultimoAcesso: new Date('2024-12-13'),
        usuarios: 25,
        exportacoes: 540,
        modulosAtivos: ['Exportações', 'Documentos', 'Logística', 'MAPA']
      },
      {
        id: 'EMP-012',
        razaoSocial: 'BioEthanol Export Ltd',
        nomeFantasia: 'BioEthanol',
        cnpj: '11.222.333/0001-44',
        tipo: 'INDÚSTRIA',
        status: 'BLOQUEADA',
        pais: 'Brasil',
        estado: 'SP',
        cidade: 'Ribeirão Preto',
        responsavel: 'André Martins',
        email: 'andre@bioethanol.com.br',
        telefone: '(16) 3789-0123',
        plano: 'Starter',
        dataAdesao: new Date('2023-08-10'),
        ultimoAcesso: new Date('2024-09-20'),
        usuarios: 8,
        exportacoes: 45,
        modulosAtivos: ['Exportações', 'Documentos']
      }
    ];
  }
}

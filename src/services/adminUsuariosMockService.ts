import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AdminUser, UserMetrics } from '../types/admin-usuarios';

@Injectable({
  providedIn: 'root'
})
export class AdminUsuariosMockService {

  private users: AdminUser[] = [];

  constructor() {
    this.initializeMockData();
  }

  getUsers(): Observable<AdminUser[]> {
    return of([...this.users]).pipe(delay(400));
  }

  addUser(user: AdminUser): Observable<AdminUser> {
    this.users.push(user);
    return of(user).pipe(delay(300));
  }

  addUsers(users: AdminUser[]): Observable<AdminUser[]> {
    this.users.push(...users);
    return of(users).pipe(delay(300));
  }

  updateUser(user: AdminUser): Observable<AdminUser> {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.users[index] = { ...user };
    }
    return of(user).pipe(delay(300));
  }

  getMetrics(): Observable<UserMetrics> {
    const metrics: UserMetrics = {
      totalUsers: this.users.length,
      ativos: this.users.filter(u => u.status === 'ATIVO').length,
      inativos: this.users.filter(u => u.status === 'INATIVO').length,
      bloqueados: this.users.filter(u => u.status === 'BLOQUEADO').length,
      pendentes: this.users.filter(u => u.status === 'PENDENTE').length,
      mfaHabilitado: this.users.filter(u => u.mfaEnabled).length
    };
    return of(metrics).pipe(delay(300));
  }

  private initializeMockData(): void {
    this.users = [
      { id: 'USR-001', name: 'Ana Maria Silva', email: 'ana.silva@empresa.com.br', role: 'ADMIN', status: 'ATIVO', empresa: 'PSF Exportações', departamento: 'TI', ultimoAcesso: new Date('2025-01-15T09:30:00'), dataCriacao: new Date('2023-03-10'), mfaEnabled: true, loginCount: 342, phone: '(11) 98765-4321' },
      { id: 'USR-002', name: 'Carlos Eduardo Mendes', email: 'carlos.mendes@empresa.com.br', role: 'GERENTE', status: 'ATIVO', empresa: 'PSF Exportações', departamento: 'Comercial', ultimoAcesso: new Date('2025-01-15T08:15:00'), dataCriacao: new Date('2023-05-22'), mfaEnabled: true, loginCount: 287, phone: '(11) 97654-3210' },
      { id: 'USR-003', name: 'Maria Oliveira Santos', email: 'maria.oliveira@parceiro.com.br', role: 'ANALISTA', status: 'ATIVO', empresa: 'Trade Solutions', departamento: 'Operações', ultimoAcesso: new Date('2025-01-14T16:45:00'), dataCriacao: new Date('2023-08-15'), mfaEnabled: true, loginCount: 198, phone: '(21) 98876-5432' },
      { id: 'USR-004', name: 'Pedro Henrique Costa', email: 'pedro.costa@empresa.com.br', role: 'OPERADOR', status: 'ATIVO', empresa: 'PSF Exportações', departamento: 'Logística', ultimoAcesso: new Date('2025-01-15T10:00:00'), dataCriacao: new Date('2024-01-08'), mfaEnabled: false, loginCount: 156, phone: '(11) 96543-2109' },
      { id: 'USR-005', name: 'Juliana Ferreira Lima', email: 'juliana.lima@empresa.com.br', role: 'COMPLIANCE', status: 'ATIVO', empresa: 'PSF Exportações', departamento: 'Compliance', ultimoAcesso: new Date('2025-01-15T07:50:00'), dataCriacao: new Date('2023-11-20'), mfaEnabled: true, loginCount: 220, phone: '(11) 95432-1098' },
      { id: 'USR-006', name: 'Roberto Almeida Souza', email: 'roberto.souza@parceiro.com.br', role: 'FINANCEIRO', status: 'ATIVO', empresa: 'Global Commodities', departamento: 'Financeiro', ultimoAcesso: new Date('2025-01-13T14:30:00'), dataCriacao: new Date('2024-03-05'), mfaEnabled: true, loginCount: 95, phone: '(21) 94321-0987' },
      { id: 'USR-007', name: 'Fernanda Rodrigues', email: 'fernanda.rodrigues@empresa.com.br', role: 'GERENTE', status: 'ATIVO', empresa: 'PSF Exportações', departamento: 'Financeiro', ultimoAcesso: new Date('2025-01-15T09:00:00'), dataCriacao: new Date('2023-06-12'), mfaEnabled: true, loginCount: 310, phone: '(11) 93210-9876' },
      { id: 'USR-008', name: 'Lucas Martins Pereira', email: 'lucas.pereira@parceiro.com.br', role: 'VISUALIZADOR', status: 'ATIVO', empresa: 'AgroTrade Brasil', departamento: 'Comercial', ultimoAcesso: new Date('2025-01-12T11:20:00'), dataCriacao: new Date('2024-06-18'), mfaEnabled: false, loginCount: 45, phone: '(31) 92109-8765' },
      { id: 'USR-009', name: 'Patricia Gomes Nascimento', email: 'patricia.gomes@empresa.com.br', role: 'ANALISTA', status: 'INATIVO', empresa: 'PSF Exportações', departamento: 'Operações', ultimoAcesso: new Date('2024-11-30T15:45:00'), dataCriacao: new Date('2023-09-01'), mfaEnabled: true, loginCount: 178, phone: '(11) 91098-7654' },
      { id: 'USR-010', name: 'Marcos Vinícius Araújo', email: 'marcos.araujo@empresa.com.br', role: 'OPERADOR', status: 'BLOQUEADO', empresa: 'PSF Exportações', departamento: 'Logística', ultimoAcesso: new Date('2024-12-20T08:30:00'), dataCriacao: new Date('2024-02-14'), mfaEnabled: false, loginCount: 89, phone: '(11) 90987-6543' },
      { id: 'USR-011', name: 'Camila Barbosa Ramos', email: 'camila.ramos@parceiro.com.br', role: 'ANALISTA', status: 'ATIVO', empresa: 'Trade Solutions', departamento: 'Compliance', ultimoAcesso: new Date('2025-01-14T13:10:00'), dataCriacao: new Date('2024-04-22'), mfaEnabled: true, loginCount: 67, phone: '(21) 89876-5432' },
      { id: 'USR-012', name: 'Thiago Oliveira Dias', email: 'thiago.dias@empresa.com.br', role: 'ADMIN', status: 'ATIVO', empresa: 'PSF Exportações', departamento: 'TI', ultimoAcesso: new Date('2025-01-15T10:30:00'), dataCriacao: new Date('2023-01-15'), mfaEnabled: true, loginCount: 456, phone: '(11) 88765-4321' },
      { id: 'USR-013', name: 'Amanda Lopes Vieira', email: 'amanda.vieira@parceiro.com.br', role: 'VISUALIZADOR', status: 'PENDENTE', empresa: 'AgroTrade Brasil', departamento: 'Diretoria', ultimoAcesso: new Date('2025-01-10T09:00:00'), dataCriacao: new Date('2025-01-08'), mfaEnabled: false, loginCount: 3, phone: '(31) 87654-3210' },
      { id: 'USR-014', name: 'Rafael Santos Neto', email: 'rafael.neto@empresa.com.br', role: 'FINANCEIRO', status: 'ATIVO', empresa: 'PSF Exportações', departamento: 'Financeiro', ultimoAcesso: new Date('2025-01-15T08:45:00'), dataCriacao: new Date('2023-07-20'), mfaEnabled: true, loginCount: 245, phone: '(11) 86543-2109' },
      { id: 'USR-015', name: 'Beatriz Carvalho Melo', email: 'beatriz.melo@parceiro.com.br', role: 'OPERADOR', status: 'INATIVO', empresa: 'Global Commodities', departamento: 'Operações', ultimoAcesso: new Date('2024-10-15T17:00:00'), dataCriacao: new Date('2024-01-30'), mfaEnabled: false, loginCount: 112, phone: '(21) 85432-1098' },
      { id: 'USR-016', name: 'Gustavo Henrique Moura', email: 'gustavo.moura@empresa.com.br', role: 'GERENTE', status: 'ATIVO', empresa: 'PSF Exportações', departamento: 'Logística', ultimoAcesso: new Date('2025-01-14T18:20:00'), dataCriacao: new Date('2023-04-08'), mfaEnabled: true, loginCount: 298, phone: '(11) 84321-0987' },
      { id: 'USR-017', name: 'Isabela Freitas Cunha', email: 'isabela.cunha@parceiro.com.br', role: 'COMPLIANCE', status: 'PENDENTE', empresa: 'Trade Solutions', departamento: 'Compliance', ultimoAcesso: new Date('2025-01-11T10:15:00'), dataCriacao: new Date('2025-01-05'), mfaEnabled: false, loginCount: 5, phone: '(21) 83210-9876' },
      { id: 'USR-018', name: 'Diego Alves Cardoso', email: 'diego.cardoso@empresa.com.br', role: 'ANALISTA', status: 'ATIVO', empresa: 'PSF Exportações', departamento: 'Comercial', ultimoAcesso: new Date('2025-01-15T07:30:00'), dataCriacao: new Date('2024-05-12'), mfaEnabled: true, loginCount: 134, phone: '(11) 82109-8765' },
      { id: 'USR-019', name: 'Larissa Pinto Rezende', email: 'larissa.rezende@parceiro.com.br', role: 'VISUALIZADOR', status: 'BLOQUEADO', empresa: 'AgroTrade Brasil', departamento: 'Comercial', ultimoAcesso: new Date('2024-12-01T09:45:00'), dataCriacao: new Date('2024-07-10'), mfaEnabled: false, loginCount: 28, phone: '(31) 81098-7654' },
      { id: 'USR-020', name: 'Felipe Monteiro Brito', email: 'felipe.brito@empresa.com.br', role: 'OPERADOR', status: 'ATIVO', empresa: 'PSF Exportações', departamento: 'Operações', ultimoAcesso: new Date('2025-01-15T06:50:00'), dataCriacao: new Date('2024-08-25'), mfaEnabled: false, loginCount: 78, phone: '(11) 80987-6543' },
      { id: 'USR-021', name: 'Vanessa Costa Ribeiro', email: 'vanessa.ribeiro@empresa.com.br', role: 'GERENTE', status: 'INATIVO', empresa: 'PSF Exportações', departamento: 'Compliance', ultimoAcesso: new Date('2024-09-20T14:00:00'), dataCriacao: new Date('2023-02-28'), mfaEnabled: true, loginCount: 267, phone: '(11) 79876-5432' },
      { id: 'USR-022', name: 'André Luiz Teixeira', email: 'andre.teixeira@parceiro.com.br', role: 'FINANCEIRO', status: 'ATIVO', empresa: 'Global Commodities', departamento: 'Financeiro', ultimoAcesso: new Date('2025-01-14T15:30:00'), dataCriacao: new Date('2024-09-15'), mfaEnabled: true, loginCount: 56, phone: '(21) 78765-4321' }
    ];
  }
}

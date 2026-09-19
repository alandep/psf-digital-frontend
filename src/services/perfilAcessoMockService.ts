import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  AccessProfile,
  ModuleCatalog,
  PermissionAction,
  ProfileMetrics,
  ProfilePermission,
  ScreenFeature
} from '../types/perfil-acesso';

// Conjuntos de ações reutilizáveis
const CRUD: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'export'];
const REP: PermissionAction[] = ['view', 'export'];
const VIEW: PermissionAction[] = ['view'];

@Injectable({ providedIn: 'root' })
export class PerfilAcessoMockService {

  private catalog: ModuleCatalog[] = this.buildCatalog();
  private profiles: AccessProfile[] = [];

  constructor() {
    this.profiles = this.seedProfiles();
  }

  // ================================
  // CATÁLOGO (síncrono)
  // ================================
  getModuleCatalog(): ModuleCatalog[] {
    return this.catalog;
  }

  // ================================
  // PERFIS
  // ================================
  getProfiles(): Observable<AccessProfile[]> {
    return of(this.profiles.map(p => this.clone(p))).pipe(delay(this.randomDelay()));
  }

  getMetrics(): Observable<ProfileMetrics> {
    const totalTelas = this.catalog.reduce((sum, m) => sum + m.screens.length, 0);
    const metrics: ProfileMetrics = {
      totalPerfis: this.profiles.length,
      perfisSistema: this.profiles.filter(p => p.system).length,
      perfisCustom: this.profiles.filter(p => !p.system).length,
      totalTelas
    };
    return of(metrics).pipe(delay(this.randomDelay()));
  }

  createProfile(p: AccessProfile): Observable<AccessProfile> {
    const now = new Date();
    const created: AccessProfile = {
      ...this.clone(p),
      id: `PERFIL-${Date.now()}`,
      system: false,
      usersCount: p.usersCount || 0,
      createdAt: now,
      updatedAt: now
    };
    this.profiles.push(created);
    return of(this.clone(created)).pipe(delay(this.randomDelay()));
  }

  updateProfile(p: AccessProfile): Observable<AccessProfile> {
    const idx = this.profiles.findIndex(x => x.id === p.id);
    if (idx >= 0) {
      const updated: AccessProfile = {
        ...this.profiles[idx],
        ...this.clone(p),
        updatedAt: new Date()
      };
      this.profiles[idx] = updated;
      return of(this.clone(updated)).pipe(delay(this.randomDelay()));
    }
    return of(this.clone(p)).pipe(delay(this.randomDelay()));
  }

  deleteProfile(id: string): Observable<void> {
    this.profiles = this.profiles.filter(p => p.id !== id || p.system);
    return of(void 0).pipe(delay(this.randomDelay()));
  }

  // ================================
  // HELPERS
  // ================================
  private randomDelay(): number {
    return 250 + Math.random() * 400;
  }

  private clone(p: AccessProfile): AccessProfile {
    return {
      ...p,
      permissions: p.permissions.map(perm => ({ screenId: perm.screenId, actions: [...perm.actions] }))
    };
  }

  private s(screenName: string, route: string, icon: string, actions: PermissionAction[]): ScreenFeature {
    const screenId = route.replace(/\//g, '_');
    return { screenId, screenName, route, icon, actions: [...actions] };
  }

  private buildCatalog(): ModuleCatalog[] {
    return [
      {
        moduleId: 'dashboards', moduleName: 'Dashboards', icon: 'dashboard', screens: [
          this.s('Dashboard Principal', 'dashboards/principal', 'dashboard', REP),
          this.s('Criar Dashboard', 'dashboards/criar', 'add_box', CRUD),
          this.s('Meus Dashboards', 'dashboards/meus', 'view_quilt', CRUD),
          this.s('Compartilhados', 'dashboards/compartilhados', 'share', REP)
        ]
      },
      {
        moduleId: 'exportacoes', moduleName: 'Exportações', icon: 'inventory_2', screens: [
          this.s('Gerenciar Exportações', 'exportacoes/gerenciar', 'inventory_2', CRUD),
          this.s('Novos Pedidos', 'exportacoes/pedidos', 'add_shopping_cart', CRUD),
          this.s('Acompanhar Status', 'exportacoes/status', 'track_changes', REP)
        ]
      },
      {
        moduleId: 'contratos', moduleName: 'Contratos', icon: 'assignment_turned_in', screens: [
          this.s('Contratos Ativos', 'contratos/ativos', 'assignment_turned_in', CRUD),
          this.s('Novos Contratos', 'contratos/novo', 'note_add', CRUD),
          this.s('Templates', 'contratos/templates', 'content_copy', CRUD)
        ]
      },
      {
        moduleId: 'produtos', moduleName: 'Produtos', icon: 'category', screens: [
          this.s('Catálogo', 'produtos/catalogo', 'category', CRUD),
          this.s('Classificação NCM', 'produtos/ncm', 'label', CRUD),
          this.s('Certificações', 'produtos/certificacoes', 'verified', CRUD)
        ]
      },
      {
        moduleId: 'lotes', moduleName: 'Lotes', icon: 'qr_code', screens: [
          this.s('Controle de Lotes', 'lotes/controle', 'qr_code', CRUD),
          this.s('Rastreabilidade', 'lotes/rastreabilidade', 'timeline', REP)
        ]
      },
      {
        moduleId: 'documentos', moduleName: 'Documentos', icon: 'description', screens: [
          this.s('DU-E', 'documentos/due', 'description', CRUD),
          this.s('RE', 'documentos/re', 'receipt_long', CRUD),
          this.s('Certificados', 'documentos/certificados', 'verified', CRUD),
          this.s('Invoice', 'documentos/invoice', 'receipt', CRUD),
          this.s('Packing List', 'documentos/packing-list', 'list_alt', CRUD),
          this.s('Bill of Lading', 'documentos/bill-of-lading', 'sailing', CRUD)
        ]
      },
      {
        moduleId: 'logistica', moduleName: 'Logística', icon: 'local_shipping', screens: [
          this.s('Embarques', 'logistica/embarque', 'departure_board', CRUD),
          this.s('Portos', 'logistica/portos', 'anchor', CRUD),
          this.s('Transportadoras', 'logistica/transportadoras', 'local_shipping', CRUD),
          this.s('Navios', 'logistica/navios', 'directions_boat', CRUD),
          this.s('Containers', 'logistica/containers', 'view_in_ar', CRUD)
        ]
      },
      {
        moduleId: 'financeiro', moduleName: 'Financeiro', icon: 'account_balance', screens: [
          this.s('Contas a Receber', 'financeiro/contas-receber', 'trending_up', CRUD),
          this.s('Câmbio', 'financeiro/cambio', 'currency_exchange', CRUD),
          this.s('Pagamentos', 'financeiro/pagamentos', 'payment', CRUD),
          this.s('Trade Finance', 'financeiro/trade-finance', 'account_balance', CRUD),
          this.s('Hedge Cambial', 'financeiro/hedge', 'swap_horiz', CRUD)
        ]
      },
      {
        moduleId: 'compliance', moduleName: 'Compliance', icon: 'gavel', screens: [
          this.s('Licenças', 'compliance/licencas', 'assignment', CRUD),
          this.s('Regulamentações', 'compliance/regulamentacoes', 'policy', CRUD),
          this.s('Due Diligence', 'compliance/due-diligence', 'policy', CRUD),
          this.s('Sanções', 'compliance/sancoes', 'shield', CRUD)
        ]
      },
      {
        moduleId: 'rentabilidade', moduleName: 'Rentabilidade', icon: 'insights', screens: [
          this.s('Análise', 'rentabilidade/analise', 'trending_up', REP),
          this.s('Simulador', 'rentabilidade/simulador', 'calculate', REP),
          this.s('Cenários', 'rentabilidade/cenarios', 'insights', CRUD)
        ]
      },
      {
        moduleId: 'integracoes', moduleName: 'Integrações Governamentais', icon: 'cloud_sync', screens: [
          this.s('Siscomex', 'integracoes/siscomex', 'cloud_sync', CRUD),
          this.s('MAPA', 'integracoes/mapa', 'agriculture', CRUD),
          this.s('Status Serviços', 'integracoes/status', 'cloud_done', REP)
        ]
      },
      {
        moduleId: 'automacao', moduleName: 'Automação e Regras', icon: 'rule', screens: [
          this.s('Criar Regra', 'automacao/criar-regra', 'rule', CRUD),
          this.s('Regras Ativas', 'automacao/regras-ativas', 'rule_folder', CRUD),
          this.s('Histórico', 'automacao/historico', 'history', REP)
        ]
      },
      {
        moduleId: 'construtor', moduleName: 'Construtor de Telas', icon: 'dashboard_customize', screens: [
          this.s('Nova Tela', 'construtor/nova-tela', 'add_box', CRUD),
          this.s('Minhas Telas', 'construtor/minhas-telas', 'web', CRUD),
          this.s('Templates', 'construtor/templates', 'dashboard_customize', CRUD)
        ]
      },
      {
        moduleId: 'clientes', moduleName: 'Clientes/CRM', icon: 'account_circle', screens: [
          this.s('Visão 360', 'clientes/visao-360', 'account_circle', CRUD),
          this.s('Contatos', 'clientes/contatos', 'contacts', CRUD),
          this.s('Oportunidades', 'clientes/oportunidades', 'trending_up', CRUD)
        ]
      },
      {
        moduleId: 'supply-chain', moduleName: 'Supply Chain', icon: 'factory', screens: [
          this.s('Fornecedores', 'supply-chain/fornecedores', 'factory', CRUD)
        ]
      },
      {
        moduleId: 'esg', moduleName: 'ESG/Sustentabilidade', icon: 'nature', screens: [
          this.s('Sustentabilidade', 'esg/sustentabilidade', 'nature', REP)
        ]
      },
      {
        moduleId: 'ai-operations', moduleName: 'AI Operations', icon: 'monitoring', screens: [
          this.s('Dashboard IA', 'ai-operations/dashboard', 'monitoring', REP)
        ]
      },
      {
        moduleId: 'command-center', moduleName: 'Command Center', icon: 'hub', screens: [
          this.s('Command Center', 'command-center', 'hub', VIEW)
        ]
      },
      {
        moduleId: 'marketplace', moduleName: 'Marketplace', icon: 'storefront', screens: [
          this.s('Marketplace', 'marketplace', 'storefront', VIEW)
        ]
      },
      {
        moduleId: 'analytics', moduleName: 'Analytics', icon: 'query_stats', screens: [
          this.s('Data Explorer', 'analytics/data-explorer', 'query_stats', REP)
        ]
      },
      {
        moduleId: 'relatorios', moduleName: 'Relatórios', icon: 'summarize', screens: [
          this.s('Exportações', 'relatorios/exportacoes', 'flight_takeoff', REP),
          this.s('Rentabilidade', 'relatorios/rentabilidade', 'trending_up', REP),
          this.s('Compliance', 'relatorios/compliance', 'gavel', REP),
          this.s('Logística', 'relatorios/logistica', 'local_shipping', REP)
        ]
      },
      {
        moduleId: 'admin', moduleName: 'Administração', icon: 'admin_panel_settings', screens: [
          this.s('Usuários', 'admin/usuarios', 'group', CRUD),
          this.s('Empresas', 'admin/empresas', 'business', CRUD),
          this.s('Configurações', 'admin/configuracoes', 'tune', CRUD),
          this.s('Auditoria', 'admin/auditoria', 'history', REP),
          this.s('Perfis de Acesso', 'admin/perfis-acesso', 'admin_panel_settings', CRUD)
        ]
      }
    ];
  }

  // Todas as telas com TODAS as suas ações (usado por Administrador)
  private allPermissions(): ProfilePermission[] {
    const perms: ProfilePermission[] = [];
    for (const mod of this.catalog) {
      for (const sc of mod.screens) {
        perms.push({ screenId: sc.screenId, actions: [...sc.actions] });
      }
    }
    return perms;
  }

  // Todas as telas apenas com 'view' (usado por Visualizador)
  private viewOnlyPermissions(): ProfilePermission[] {
    const perms: ProfilePermission[] = [];
    for (const mod of this.catalog) {
      for (const sc of mod.screens) {
        if (sc.actions.includes('view')) {
          perms.push({ screenId: sc.screenId, actions: ['view'] });
        }
      }
    }
    return perms;
  }

  // Permissões para os módulos informados, com todas as ações de cada tela
  private permissionsForModules(moduleIds: string[]): ProfilePermission[] {
    const perms: ProfilePermission[] = [];
    for (const mod of this.catalog) {
      if (!moduleIds.includes(mod.moduleId)) { continue; }
      for (const sc of mod.screens) {
        perms.push({ screenId: sc.screenId, actions: [...sc.actions] });
      }
    }
    return perms;
  }

  private seedProfiles(): AccessProfile[] {
    const now = new Date();
    return [
      {
        id: 'PERFIL-ADMIN',
        name: 'Administrador',
        description: 'Acesso total a todas as telas e funcionalidades do sistema.',
        color: '#1976d2',
        system: true,
        usersCount: 4,
        permissions: this.allPermissions(),
        createdAt: new Date('2023-01-10'),
        updatedAt: now
      },
      {
        id: 'PERFIL-EXPORTADOR',
        name: 'Exportador',
        description: 'Gestão de exportações, documentos, logística e produtos.',
        color: '#2e7d32',
        system: false,
        usersCount: 28,
        permissions: this.permissionsForModules(['exportacoes', 'documentos', 'logistica', 'produtos']),
        createdAt: new Date('2023-03-15'),
        updatedAt: now
      },
      {
        id: 'PERFIL-COBRADOR',
        name: 'Cobrador / Financeiro',
        description: 'Operações financeiras e relatórios de recebíveis.',
        color: '#ef6c00',
        system: false,
        usersCount: 15,
        permissions: this.permissionsForModules(['financeiro', 'relatorios']),
        createdAt: new Date('2023-04-02'),
        updatedAt: now
      },
      {
        id: 'PERFIL-COMPLIANCE',
        name: 'Compliance',
        description: 'Controle regulatório, licenças e relatórios de conformidade.',
        color: '#6a1b9a',
        system: false,
        usersCount: 9,
        permissions: this.permissionsForModules(['compliance', 'relatorios']),
        createdAt: new Date('2023-05-20'),
        updatedAt: now
      },
      {
        id: 'PERFIL-VIEWER',
        name: 'Visualizador',
        description: 'Acesso somente leitura a todas as telas do sistema.',
        color: '#546e7a',
        system: true,
        usersCount: 42,
        permissions: this.viewOnlyPermissions(),
        createdAt: new Date('2023-02-01'),
        updatedAt: now
      }
    ];
  }
}

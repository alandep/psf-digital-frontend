import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'home-logged',
    loadComponent: () =>
      import('./components/home-logged/home-logged.component').then((m) => m.HomeLoggedComponent),
    children: [
      // === MÓDULOS EXISTENTES ===
      {
        path: 'cadastros/cidades',
        loadComponent: () =>
          import('./components/cadastros/cidades/cidades.component').then((m) => m.CidadesComponent),
      },
      {
        path: 'cadastros/psf-ubs',
        loadComponent: () =>
          import('./components/cadastros/psf-ubs/psf-ubs.component').then((m) => m.PsfUbsComponent),
      },
      {
        path: 'cadastros/usuarios',
        loadComponent: () =>
          import('./components/cadastros/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
      },
      {
        path: 'fichas/cadastro-individual',
        loadComponent: () =>
          import('./components/fichas/cadastro-individual/cadastro-individual.component').then((m) => m.CadastroIndividualComponent),
      },
      {
        path: 'fichas/cadastro-domiciliar',
        loadComponent: () =>
          import('./components/fichas/cadastro-domiciliar/cadastro-domiciliar.component').then((m) => m.CadastroDomiciliarComponent),
      },
      {
        path: 'fichas/visita-domiciliar',
        loadComponent: () =>
          import('./components/fichas/visita-domiciliar/visita-domiciliar.component').then((m) => m.VisitaDomiciliarComponent),
      },

      // === NOVOS MÓDULOS EIP ===
      {
        path: 'rentabilidade/analise',
        loadComponent: () =>
          import('./components/rentabilidade/rentabilidade-analise/rentabilidade-analise.component').then((m) => m.RentabilidadeAnaliseComponent),
      },
      {
        path: 'dashboards/principal',
        loadComponent: () =>
          import('./components/dashboards/dashboard-principal/dashboard-principal.component').then((m) => m.DashboardPrincipalComponent),
      },
      {
        path: 'dashboards/criar',
        loadComponent: () =>
          import('./components/dashboards/dashboards-criar/dashboards-criar.component').then((m) => m.DashboardsCriarComponent),
      },
      {
        path: 'automacao/criar-regra',
        loadComponent: () =>
          import('./components/automacao/automacao-criar-regra/automacao-criar-regra.component').then((m) => m.AutomacaoCriarRegraComponent),
      },
      {
        path: 'financeiro/contas-receber',
        loadComponent: () =>
          import('./components/financeiro/contas-receber-fixed.component').then((m) => m.ContasReceberFixedComponent),
      },
      {
        path: 'assistente-ia',
        loadComponent: () =>
          import('./components/shared/ai-copilot/ai-copilot-simple.component').then((m) => m.AiCopilotSimpleComponent),
      },
      {
        path: 'contratos/novo',
        loadComponent: () =>
          import('./components/contratos/novos-contratos.component').then((m) => m.NovosContratosComponent),
      },
      {
        path: 'contratos/ativos',
        loadComponent: () =>
          import('./components/contratos/contratos-ativos.component').then((m) => m.ContratosAtivosComponent),
      },
      {
        path: 'contratos/templates',
        loadComponent: () =>
          import('./components/contratos/templates/templates-full.component').then((m) => m.TemplatesFullComponent),
      },
      {
        path: 'produtos/catalogo',
        loadComponent: () =>
          import('./components/produtos/catalogo/catalogo.component').then((m) => m.CatalogoComponent),
      },
      {
        path: 'produtos/ncm',
        loadComponent: () =>
          import('./components/produtos/ncm-classificacao/ncm-classificacao.component').then((m) => m.NCMClassificacaoComponent),
      },
      {
        path: 'produtos/certificacoes',
        loadComponent: () =>
          import('./components/produtos/certificacoes/certificacoes.component').then((m) => m.CertificacoesComponent),
      },

      // === MÓDULO EXPORTAÇÕES ===
      {
        path: 'exportacoes/gerenciar',
        loadComponent: () =>
          import('./components/exportacao/exportacao-lista/exportacao-lista.component').then((m) => m.ExportacaoListaComponent),
      },
      {
        path: 'exportacoes/pedidos',
        loadComponent: () =>
          import('./components/exportacao/novo-pedido/novo-pedido-stepper.component').then((m) => m.NovoPedidoStepperComponent),
      },
      {
        path: 'exportacoes/status',
        loadComponent: () =>
          import('./components/exportacao/acompanhar-status/acompanhar-status.component').then((m) => m.AcompanharStatusComponent),
      },
      {
        path: 'exportacao/novo',
        loadComponent: () =>
          import('./components/exportacao/exportacao-form/exportacao-form.component').then((m) => m.ExportacaoFormComponent),
      },
      {
        path: 'exportacao/editar/:id',
        loadComponent: () =>
          import('./components/exportacao/exportacao-form/exportacao-form.component').then((m) => m.ExportacaoFormComponent),
      },
      {
        path: 'exportacao/detalhes/:id',
        loadComponent: () =>
          import('./components/exportacao/exportacao-detalhes/exportacao-detalhes.component').then((m) => m.ExportacaoDetalhesComponent),
      },

      // === MÓDULO LOGÍSTICA - EMBARQUES ===
      {
        path: 'logistica/embarque',
        loadChildren: () =>
          import('./components/logistica/embarque/embarque.routes').then((m) => m.embarqueRoutes),
      },
      {
        path: 'logistica/portos',
        loadComponent: () =>
          import('./components/logistica/portos/portos.component').then((m) => m.PortosComponent),
      },
      {
        path: 'logistica/transportadoras',
        loadComponent: () =>
          import('./components/logistica/transportadoras/transportadoras.component').then((m) => m.TransportadorasComponent),
      },
      {
        path: 'embarques',
        redirectTo: 'logistica/embarque',
        pathMatch: 'full'
      },

      // === MÓDULO DOCUMENTOS ===
      {
        path: 'documentos/due',
        loadComponent: () =>
          import('./components/documentos/due/due.component').then((m) => m.DueComponent),
      },
      {
        path: 'documentos/re',
        loadComponent: () =>
          import('./components/documentos/registro-exportacao/registro-exportacao.component').then((m) => m.RegistroExportacaoComponent),
      },
      {
        path: 'documentos/certificados',
        loadComponent: () =>
          import('./components/documentos/certificados/certificados.component').then((m) => m.CertificadosExportacaoComponent),
      },
      {
        path: 'documentos/invoice',
        loadComponent: () =>
          import('./components/documentos/invoice/invoice.component').then((m) => m.InvoiceComponent),
      },

      // === MÓDULO FINANCEIRO ===
      {
        path: 'financeiro/cambio',
        loadComponent: () =>
          import('./components/financeiro/cambio/cambio.component').then((m) => m.CambioComponent),
      },
      {
        path: 'financeiro/pagamentos',
        loadComponent: () =>
          import('./components/financeiro/pagamentos/pagamentos.component').then((m) => m.PagamentosComponent),
      },

      // === MÓDULO COMPLIANCE ===
      {
        path: 'compliance/licencas',
        loadComponent: () =>
          import('./components/compliance/licencas/licencas.component').then((m) => m.LicencasComponent),
      },
      {
        path: 'compliance/regulamentacoes',
        loadComponent: () =>
          import('./components/compliance/regulamentacoes/regulamentacoes.component').then((m) => m.RegulamentacoesComponent),
      },

      // === MÓDULO LOTES ===
      {
        path: 'lotes/controle',
        loadComponent: () =>
          import('./components/lotes/lotes-controle/lotes-controle.component').then((m) => m.LotesControleComponent),
      },
      {
        path: 'lotes/rastreabilidade',
        loadComponent: () =>
          import('./components/lotes/rastreabilidade/rastreabilidade.component').then((m) => m.RastreabilidadeComponent),
      },

      // === MÓDULO INTEGRAÇÕES ===
      {
        path: 'integracoes/siscomex',
        loadComponent: () =>
          import('./components/integracoes/siscomex/siscomex.component').then((m) => m.SiscomexComponent),
      },
      {
        path: 'integracoes/mapa',
        loadComponent: () =>
          import('./components/integracoes/mapa/mapa.component').then((m) => m.MapaComponent),
      },

      // === MÓDULO RELATÓRIOS ===
      {
        path: 'relatorios/exportacoes',
        loadComponent: () =>
          import('./components/relatorios/relatorios-exportacoes/relatorios-exportacoes.component').then((m) => m.RelatoriosExportacoesComponent),
      },

      // === MÓDULO INTEGRAÇÕES - STATUS ===
      {
        path: 'integracoes/status',
        loadComponent: () =>
          import('./components/integracoes/status-servicos/status-servicos.component').then((m) => m.StatusServicosComponent),
      },

      // === MÓDULO ADMIN ===
      {
        path: 'admin/empresas',
        loadComponent: () =>
          import('./components/admin/empresas/empresas.component').then((m) => m.EmpresasComponent),
      },

      // === MÓDULO RENTABILIDADE - SIMULADOR ===
      {
        path: 'rentabilidade/simulador',
        loadComponent: () =>
          import('./components/rentabilidade/simulador/simulador.component').then((m) => m.SimuladorComponent),
      },

      // === MÓDULO ADMIN - CONFIGURAÇÕES & AUDITORIA ===
      {
        path: 'admin/configuracoes',
        loadComponent: () =>
          import('./components/admin/configuracoes/configuracoes.component').then((m) => m.ConfiguracoesComponent),
      },
      {
        path: 'admin/auditoria',
        loadComponent: () =>
          import('./components/admin/auditoria/auditoria.component').then((m) => m.AuditoriaComponent),
      },

      // === MÓDULO RELATÓRIOS - COMPLIANCE ===
      {
        path: 'relatorios/compliance',
        loadComponent: () =>
          import('./components/relatorios/relatorios-compliance/relatorios-compliance.component').then((m) => m.RelatoriosComplianceComponent),
      },

      // === MÓDULO AUTOMAÇÃO - REGRAS & HISTÓRICO ===
      {
        path: 'automacao/regras-ativas',
        loadComponent: () =>
          import('./components/automacao/regras-ativas/regras-ativas.component').then((m) => m.RegrasAtivasComponent),
      },
      {
        path: 'automacao/historico',
        loadComponent: () =>
          import('./components/automacao/historico-automacao/historico-automacao.component').then((m) => m.HistoricoAutomacaoComponent),
      },

      // === MÓDULO RELATÓRIOS - LOGÍSTICA ===
      {
        path: 'relatorios/logistica',
        loadComponent: () =>
          import('./components/relatorios/relatorios-logistica/relatorios-logistica.component').then((m) => m.RelatoriosLogisticaComponent),
      },

      // === MÓDULO RELATÓRIOS - RENTABILIDADE ===
      {
        path: 'relatorios/rentabilidade',
        loadComponent: () =>
          import('./components/relatorios/relatorios-rentabilidade/relatorios-rentabilidade.component').then((m) => m.RelatoriosRentabilidadeComponent),
      },

      // === MÓDULO RENTABILIDADE - CENÁRIOS ===
      {
        path: 'rentabilidade/cenarios',
        loadComponent: () =>
          import('./components/rentabilidade/cenarios/cenarios.component').then((m) => m.CenariosComponent),
      },

      // === MÓDULO ADMIN - USUÁRIOS ===
      {
        path: 'admin/usuarios',
        loadComponent: () =>
          import('./components/admin/usuarios/admin-usuarios.component').then((m) => m.AdminUsuariosComponent),
      },

      // === MÓDULO CRM ===
      {
        path: 'clientes/visao-360',
        loadComponent: () =>
          import('./components/crm/visao-360/visao-360.component').then((m) => m.Visao360Component),
      },
      {
        path: 'clientes/contatos',
        loadComponent: () =>
          import('./components/crm/contatos/contatos.component').then((m) => m.ContatosComponent),
      },
      {
        path: 'clientes/oportunidades',
        loadComponent: () =>
          import('./components/crm/oportunidades/oportunidades.component').then((m) => m.OportunidadesComponent),
      },

      // === MÓDULO SUPPLY CHAIN - FORNECEDORES ===
      {
        path: 'supply-chain/fornecedores',
        loadComponent: () =>
          import('./components/supply-chain/fornecedores/fornecedores.component').then((m) => m.FornecedoresComponent),
      },

      // === MÓDULO COMPLIANCE - DUE DILIGENCE ===
      {
        path: 'compliance/due-diligence',
        loadComponent: () =>
          import('./components/compliance/due-diligence/due-diligence.component').then((m) => m.DueDiligenceComponent),
      },

      // === MÓDULO ESG / SUSTENTABILIDADE ===
      {
        path: 'esg/sustentabilidade',
        loadComponent: () =>
          import('./components/esg/sustentabilidade/sustentabilidade.component').then((m) => m.SustentabilidadeComponent),
      },

      // === MÓDULO AI OPERATIONS CENTER ===
      {
        path: 'ai-operations/dashboard',
        loadComponent: () =>
          import('./components/ai-operations/dashboard/ai-operations-dashboard.component').then((m) => m.AiOperationsDashboardComponent),
      },

      // === MÓDULO COMMAND CENTER ===
      {
        path: 'command-center',
        loadComponent: () =>
          import('./components/command-center/command-center.component').then((m) => m.CommandCenterComponent),
      },

      // === MÓDULO FINANCEIRO - TRADE FINANCE & HEDGE ===
      {
        path: 'financeiro/trade-finance',
        loadComponent: () =>
          import('./components/financeiro/trade-finance/trade-finance.component').then(m => m.TradeFinanceComponent),
      },
      {
        path: 'financeiro/hedge',
        loadComponent: () =>
          import('./components/financeiro/hedge/hedge.component').then(m => m.HedgeComponent),
      },

      // === MÓDULO LOGÍSTICA - NAVIOS & CONTAINERS ===
      {
        path: 'logistica/navios',
        loadComponent: () =>
          import('./components/logistica/navios/navios.component').then(m => m.NaviosComponent),
      },
      {
        path: 'logistica/containers',
        loadComponent: () =>
          import('./components/logistica/containers/containers.component').then(m => m.ContainersComponent),
      },

      // === MÓDULO DOCUMENTOS - PACKING LIST ===
      {
        path: 'documentos/packing-list',
        loadComponent: () =>
          import('./components/documentos/packing-list/packing-list.component').then(m => m.PackingListComponent),
      },

      // === MÓDULO NOTIFICAÇÕES ===
      {
        path: 'notificacoes/centro',
        loadComponent: () =>
          import('./components/notificacoes/centro/notificacoes-centro.component').then(m => m.NotificacoesCentroComponent),
      },

      // === MÓDULO MARKETPLACE ===
      {
        path: 'marketplace',
        loadComponent: () =>
          import('./components/marketplace/marketplace.component').then(m => m.MarketplaceComponent),
      },

      // === MÓDULO CONHECIMENTO ===
      {
        path: 'conhecimento/centro',
        loadComponent: () =>
          import('./components/conhecimento/centro/knowledge-center.component').then(m => m.KnowledgeCenterComponent),
      },

      // === MÓDULO DASHBOARDS BUILDER ===
      {
        path: 'dashboards/meus',
        loadComponent: () =>
          import('./components/dashboards/meus-dashboards/meus-dashboards.component').then((m) => m.MeusDashboardsComponent),
      },
      {
        path: 'dashboards/compartilhados',
        loadComponent: () =>
          import('./components/dashboards/compartilhados/compartilhados.component').then((m) => m.CompartilhadosComponent),
      },

      // === MÓDULO CONSTRUTOR DE TELAS ===
      {
        path: 'construtor/nova-tela',
        loadComponent: () =>
          import('./components/construtor/nova-tela/nova-tela.component').then(m => m.NovaTelaComponent),
      },
      {
        path: 'construtor/minhas-telas',
        loadComponent: () =>
          import('./components/construtor/minhas-telas/minhas-telas.component').then(m => m.MinhasTelasComponent),
      },
      {
        path: 'construtor/templates',
        loadComponent: () =>
          import('./components/construtor/templates/templates-construtor.component').then(m => m.TemplatesConstrutorComponent),
      },

      // === MÓDULO DOCUMENTOS - BILL OF LADING ===
      {
        path: 'documentos/bill-of-lading',
        loadComponent: () =>
          import('./components/documentos/bill-of-lading/bill-of-lading.component').then(m => m.BillOfLadingComponent),
      },

      // === MÓDULO COMPLIANCE - SANÇÕES ===
      {
        path: 'compliance/sancoes',
        loadComponent: () =>
          import('./components/compliance/sancoes/sancoes.component').then(m => m.SancoesComponent),
      },

      // === MÓDULO ANALYTICS - DATA EXPLORER ===
      {
        path: 'analytics/data-explorer',
        loadComponent: () =>
          import('./components/analytics/data-explorer/data-explorer.component').then(m => m.DataExplorerComponent),
      },

      // === MÓDULO PERFIL ===
      {
        path: 'perfil',
        loadComponent: () =>
          import('./components/perfil/perfil.component').then(m => m.PerfilComponent),
      },

      // Rota padrão - primeiro acesso após login
      {
        path: '',
        redirectTo: 'dashboards/principal',
        pathMatch: 'full'
      },
      // Catch-all para módulos ainda não implementados
      {
        path: '**',
        loadComponent: () =>
          import('./components/shared/coming-soon/coming-soon-route.component').then(m => m.ComingSoonRouteComponent),
      }
    ],
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
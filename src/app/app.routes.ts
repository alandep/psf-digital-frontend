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
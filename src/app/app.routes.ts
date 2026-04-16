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
          import('./components/financeiro/contas-receber-fixed.component').then((m) => {
            console.log('Loading ContasReceberFixedComponent:', m);
            return m.ContasReceberFixedComponent;
          }),
      },
      {
        path: 'assistente-ia',
        loadComponent: () =>
          import('./components/shared/ai-copilot/ai-copilot-simple.component').then((m) => {
            console.log('Loading AiCopilotSimpleComponent:', m);
            return m.AiCopilotSimpleComponent;
          }),
      },
      {
        path: 'contratos/novo',
        loadComponent: () =>
          import('./components/contratos/novos-contratos.component').then((m) => {
            console.log('Loading NovosContratosComponent:', m);
            return m.NovosContratosComponent;
          }),
      },
      {
        path: 'contratos/ativos',
        loadComponent: () =>
          import('./components/contratos/contratos-ativos.component').then((m) => {
            console.log('Loading ContratosAtivosComponent:', m);
            return m.ContratosAtivosComponent;
          }),
      },
      {
        path: 'contratos/templates',
        loadComponent: () =>
          import('./components/contratos/templates/templates-full.component').then((m) => {
            console.log('Loading TemplatesFullComponent:', m);
            return m.TemplatesFullComponent;
          }),
      },
      {
        path: 'produtos/catalogo',
        loadComponent: () =>
          import('./components/produtos/catalogo/catalogo.component').then((m) => {
            console.log('Loading CatalogoComponent:', m);
            return m.CatalogoComponent;
          }),
      },
      {
        path: 'produtos/ncm',
        loadComponent: () =>
          import('./components/produtos/ncm-classificacao/ncm-classificacao.component').then((m) => {
            console.log('Loading NCMClassificacaoComponent:', m);
            return m.NCMClassificacaoComponent;
          }),
      },

      // === MÓDULO EXPORTAÇÕES ===
      {
        path: 'exportacoes/gerenciar',
        loadComponent: () =>
          import('./components/exportacao/exportacao-lista/exportacao-lista.component').then((m) => {
            console.log('Loading ExportacaoListaComponent:', m);
            return m.ExportacaoListaComponent;
          }),
      },
      {
        path: 'exportacoes/pedidos',
        loadComponent: () =>
          import('./components/exportacao/novo-pedido/novo-pedido-stepper.component').then((m) => {
            console.log('Loading NovoPedidoStepperComponent:', m);
            return m.NovoPedidoStepperComponent;
          }),
      },
      {
        path: 'exportacoes/status',
        loadComponent: () =>
          import('./components/exportacao/exportacao-lista/exportacao-lista.component').then((m) => {
            console.log('Loading ExportacaoListaComponent (Status):', m);
            return m.ExportacaoListaComponent;
          }),
      },
      {
        path: 'exportacao/novo',
        loadComponent: () =>
          import('./components/exportacao/exportacao-form/exportacao-form.component').then((m) => {
            console.log('Loading ExportacaoFormComponent (Novo):', m);
            return m.ExportacaoFormComponent;
          }),
      },
      {
        path: 'exportacao/editar/:id',
        loadComponent: () =>
          import('./components/exportacao/exportacao-form/exportacao-form.component').then((m) => {
            console.log('Loading ExportacaoFormComponent (Editar):', m);
            return m.ExportacaoFormComponent;
          }),
      },
      {
        path: 'exportacao/detalhes/:id',
        loadComponent: () =>
          import('./components/exportacao/exportacao-detalhes/exportacao-detalhes.component').then((m) => {
            console.log('Loading ExportacaoDetalhesComponent:', m);
            return m.ExportacaoDetalhesComponent;
          }),
      },

      // === MÓDULO LOGÍSTICA - EMBARQUES ===
      {
        path: 'logistica/embarque',
        loadChildren: () =>
          import('./components/logistica/embarque/embarque.routes').then((m) => {
            console.log('Loading EmbarqueRoutes:', m);
            return m.embarqueRoutes;
          }),
      },
      {
        path: 'embarques',
        redirectTo: 'logistica/embarque',
        pathMatch: 'full'
      },

      // Rota padrão para módulos ainda não implementados
      {
        path: '',
        redirectTo: 'cadastros/usuarios',
        pathMatch: 'full'
      }
    ],
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
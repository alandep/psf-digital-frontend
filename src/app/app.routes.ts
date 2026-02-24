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
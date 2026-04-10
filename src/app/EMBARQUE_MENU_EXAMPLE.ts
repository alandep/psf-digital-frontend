// Exemplo de como incluir o módulo Embarques no menu principal da aplicação

export const mainMenuItems = [
  // ... outros itens de menu existentes
  
  // Menu Logística
  {
    label: 'Logística',
    icon: 'fas fa-shipping-fast',
    children: [
      {
        label: 'Embarques',
        icon: 'fas fa-ship',
        route: '/logistica/embarque',
        description: 'Gerencie embarques de exportação com IA',
        permissions: ['embarques.read']
      },
      {
        label: 'Novo Embarque',
        icon: 'fas fa-plus-circle',
        route: '/logistica/embarque/novo',
        description: 'Criar novo embarque',
        permissions: ['embarques.create']
      },
      // Outros itens de logística...
      {
        label: 'Transportadoras',
        icon: 'fas fa-truck',
        route: '/logistica/transportadoras'
      },
      {
        label: 'Portos',
        icon: 'fas fa-anchor', 
        route: '/logistica/portos'
      }
    ]
  },
  
  // ... outros menus
];

// Exemplo de breadcrumbs para navegação
export const embarqueBreadcrumbs = {
  '/logistica/embarque': [
    { label: 'Home', route: '/' },
    { label: 'Logística', route: '/logistica' },
    { label: 'Embarques', route: '/logistica/embarque' }
  ],
  '/logistica/embarque/novo': [
    { label: 'Home', route: '/' },
    { label: 'Logística', route: '/logistica' },
    { label: 'Embarques', route: '/logistica/embarque' },
    { label: 'Novo Embarque' }
  ],
  '/logistica/embarque/editar/:id': [
    { label: 'Home', route: '/' },
    { label: 'Logística', route: '/logistica' },
    { label: 'Embarques', route: '/logistica/embarque' },
    { label: 'Editar Embarque' }
  ],
  '/logistica/embarque/detalhes/:id': [
    { label: 'Home', route: '/' },
    { label: 'Logística', route: '/logistica' },
    { label: 'Embarques', route: '/logistica/embarque' },
    { label: 'Detalhes do Embarque' }
  ]
};

// Dashboards cards para página inicial (opcional)
export const embarqueDashboardCards = [
  {
    title: 'Embarques Ativos',
    icon: 'fas fa-ship',
    value: 15,
    description: 'Em trânsito',
    color: 'primary',
    route: '/logistica/embarque?status=In Transit'
  },
  {
    title: 'Atrasos Previstos', 
    icon: 'fas fa-exclamation-triangle',
    value: 3,
    description: 'Requer atenção',
    color: 'warning',
    route: '/logistica/embarque?tracking_status=Risk'
  },
  {
    title: 'Economia IA',
    icon: 'fas fa-robot',
    value: 'R$ 245K',
    description: 'Este mês',
    color: 'success',
    route: '/logistica/embarque'
  }
];
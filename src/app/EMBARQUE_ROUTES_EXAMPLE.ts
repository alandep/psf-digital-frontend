import { Routes } from '@angular/router';

// Exemplo de como integrar as rotas de embarque no app principal
export const appRoutes: Routes = [
  // ... outras rotas existentes
  
  // Rota para o módulo de Embarques
  {
    path: 'logistica/embarque',
    loadChildren: () => import('./components/logistica/embarque/embarque.routes').then(r => r.embarqueRoutes),
    title: 'Embarques - Logística'
  },
  
  // Rota alternativa mais curta
  {
    path: 'embarques',
    redirectTo: 'logistica/embarque'
  },
  
  // ... outras rotas
];
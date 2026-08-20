import { Routes } from '@angular/router';
import { EmbarqueListaComponent } from './embarque-lista/embarque-lista.component';
import { EmbarqueFormComponent } from './embarque-form/embarque-form.component';
import { EmbarqueDetalhesComponent } from './embarque-detalhes/embarque-detalhes.component';

export const embarqueRoutes: Routes = [
  {
    path: '',
    component: EmbarqueListaComponent,
    title: 'Embarques - Export Intelligence Platform'
  },
  {
    path: 'novo',
    component: EmbarqueFormComponent,
    title: 'Novo Embarque - Export Intelligence Platform'
  },
  {
    path: 'editar/:id',
    component: EmbarqueFormComponent,
    title: 'Editar Embarque - Export Intelligence Platform'
  },
  {
    path: 'detalhes/:id',
    component: EmbarqueDetalhesComponent,
    title: 'Detalhes do Embarque - Export Intelligence Platform'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
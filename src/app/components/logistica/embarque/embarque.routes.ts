import { Routes } from '@angular/router';
import { EmbarqueListaComponent } from './embarque-lista/embarque-lista.component';
import { EmbarqueFormComponent } from './embarque-form/embarque-form.component';
import { EmbarqueDetalhesComponent } from './embarque-detalhes/embarque-detalhes.component';

export const embarqueRoutes: Routes = [
  {
    path: '',
    component: EmbarqueListaComponent,
    title: 'Embarques - PSF Digital'
  },
  {
    path: 'novo',
    component: EmbarqueFormComponent,
    title: 'Novo Embarque - PSF Digital'
  },
  {
    path: 'editar/:id',
    component: EmbarqueFormComponent,
    title: 'Editar Embarque - PSF Digital'
  },
  {
    path: 'detalhes/:id',
    component: EmbarqueDetalhesComponent,
    title: 'Detalhes do Embarque - PSF Digital'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
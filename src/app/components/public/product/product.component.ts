import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { PublicHeaderComponent } from '../public-header/public-header.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';

interface Capability {
  id: string;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule,
    PublicHeaderComponent, PublicFooterComponent,
  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent {
  capabilities: Capability[] = [
    { id: 'operacoes', icon: 'inventory_2', title: 'Operações de Exportação', description: 'Do contrato ao embarque, centralize o acompanhamento das operações.' },
    { id: 'ai-hub', icon: 'smart_toy', title: 'AI Hub', description: 'IA integrada para auxiliar análise, documentos, classificação, tradução e tomada de decisão.' },
    { id: 'documentos', icon: 'description', title: 'Documentos', description: 'Centralização e gestão dos documentos relacionados à operação.' },
    { id: 'logistica', icon: 'local_shipping', title: 'Logística', description: 'Acompanhe embarques, portos, transportadoras e etapas logísticas.' },
    { id: 'financeiro', icon: 'account_balance', title: 'Financeiro', description: 'Centralize informações financeiras relacionadas às operações.' },
    { id: 'compliance', icon: 'verified_user', title: 'Compliance', description: 'Apoie controles, verificações e processos de conformidade da operação internacional.' },
  ];

  trackById(_: number, item: Capability): string { return item.id; }
}

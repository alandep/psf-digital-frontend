import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

interface TrustCard {
  icon: string;
  title: string;
  items: string[];
}

@Component({
  selector: 'app-trust',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './trust.component.html',
  styleUrls: ['./trust.component.scss'],
})
export class TrustComponent {
  cards: TrustCard[] = [
    {
      icon: 'security',
      title: 'Segurança',
      items: [
        'Criptografia em trânsito e em repouso',
        'Autenticação multifator (MFA)',
        'Isolamento multi-tenant por CNPJ',
        'Rotinas de backup',
        'Registros e logs de auditoria',
      ],
    },
    {
      icon: 'verified_user',
      title: 'Privacidade e LGPD',
      items: [
        'Conformidade com a Lei nº 13.709/2018',
        'Papéis de controlador e operador definidos',
        'Bases legais para cada tratamento',
        'Direitos dos titulares atendidos',
      ],
    },
    {
      icon: 'download',
      title: 'Seus dados são seus',
      items: [
        'Portabilidade e exportação de dados',
        'Pacote de Exportação EIP (CSV/JSON)',
        'Documentos originais incluídos',
        '30 dias para exportar após o encerramento',
      ],
    },
    {
      icon: 'cloud_done',
      title: 'Disponibilidade',
      items: [
        'Infraestrutura monitorada',
        'Manutenções comunicadas',
        'Resiliência e redundância',
        'Práticas de continuidade',
      ],
    },
    {
      icon: 'smart_toy',
      title: 'IA responsável',
      items: [
        'Resultados com validação humana',
        'Transparência de uso da IA',
        'Sem substituir responsabilidades profissionais',
      ],
    },
  ];
}

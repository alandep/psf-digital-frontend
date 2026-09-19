import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { PublicHeaderComponent } from '../public-header/public-header.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';

interface SecurityBlock {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

interface TrustTopic {
  id: string;
  label: string;
}

@Component({
  selector: 'app-public-security',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule,
    PublicHeaderComponent, PublicFooterComponent,
  ],
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss'],
})
export class SecurityComponent {
  blocks: SecurityBlock[] = [
    { id: 'identidade', icon: 'fingerprint', title: 'Identidade & MFA', desc: 'Autenticação com verificação em múltiplos fatores, em arquitetura orientada às boas práticas de identidade.' },
    { id: 'rbac', icon: 'admin_panel_settings', title: 'Controle de acesso (RBAC)', desc: 'Permissões por perfil e por tela, para que cada pessoa acesse apenas o que precisa.' },
    { id: 'isolamento', icon: 'domain', title: 'Isolamento entre empresas', desc: 'Modelo multi-tenant com separação lógica dos dados de cada empresa.' },
    { id: 'cripto', icon: 'lock', title: 'Criptografia', desc: 'Proteção de dados em trânsito e em repouso, seguindo boas práticas de mercado.' },
    { id: 'auditoria', icon: 'fact_check', title: 'Auditoria', desc: 'Registro de ações relevantes para rastreabilidade e apuração.' },
    { id: 'backups', icon: 'backup', title: 'Backups', desc: 'Rotinas de cópia de segurança para reduzir risco de perda de dados.' },
    { id: 'continuidade', icon: 'sync_problem', title: 'Continuidade', desc: 'Arquitetura pensada para resiliência e recuperação de serviços.' },
    { id: 'lgpd', icon: 'privacy_tip', title: 'Privacidade & LGPD', desc: 'Tratamento de dados orientado aos princípios da LGPD e à minimização de dados.' },
    { id: 'incidentes', icon: 'report', title: 'Gestão de incidentes', desc: 'Processos para detecção, resposta e comunicação de incidentes de segurança.' },
    { id: 'ia', icon: 'smart_toy', title: 'Segurança de IA', desc: 'Uso responsável de IA, com atenção a privacidade, controle e transparência.' },
  ];

  trustTopics: TrustTopic[] = [
    { id: 'security', label: 'Security' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'data-processing', label: 'Data Processing' },
    { id: 'subprocessors', label: 'Subprocessors' },
    { id: 'availability', label: 'Availability' },
    { id: 'ai', label: 'AI' },
    { id: 'legal', label: 'Legal' },
    { id: 'status', label: 'Status' },
  ];

  trackByBlock(_: number, b: SecurityBlock): string { return b.id; }
  trackByTopic(_: number, t: TrustTopic): string { return t.id; }
}

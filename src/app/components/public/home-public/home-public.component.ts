import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PublicHeaderComponent } from '../public-header/public-header.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';
import { IntelligenceMockService } from '../../../../services/intelligenceMockService';
import { SaasBillingMockService } from '../../../../services/saasBillingMockService';
import { SaasPlan } from '../../../../types/saas-billing';
import { HomePublicData, IMPACT_STYLES, TYPE_LABELS } from '../../../../types/intelligence';

interface FxCard {
  id: string;
  pair: string;
  value: number;
  changePercent: number;
  up: boolean;
  reference: string;
  source: string;
  updatedAt: Date;
}

interface TeaserCard {
  id: string;
  slug: string;
  typeLabel: string;
  impactLabel: string;
  impactIcon: string;
  impactColor: string;
  impactBg: string;
  title: string;
  summary: string;
}

interface PlanCard {
  code: string;
  name: string;
  priceLabel: string;
  highlighted: boolean;
  badge: string;
}

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

@Component({
  selector: 'app-home-public',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatButtonModule, MatIconModule,
    MatCardModule, MatProgressSpinnerModule,
    PublicHeaderComponent, PublicFooterComponent,
  ],
  templateUrl: './home-public.component.html',
  styleUrls: ['./home-public.component.scss'],
})
export class HomePublicComponent implements OnInit {
  private intelligence = inject(IntelligenceMockService);
  private billing = inject(SaasBillingMockService);

  isLoading = true;
  statusLabel = 'Todos os sistemas operacionais';

  fxCards: FxCard[] = [];
  teaserItems: TeaserCard[] = [];
  sponsored: HomePublicData['sponsored'] = null;

  trustItems = [
    'Usuários ilimitados',
    'IA integrada',
    'Dados da sua empresa protegidos',
    'Portabilidade de dados',
    'Compliance & auditoria',
  ];

  features: Feature[] = [
    { icon: 'inventory_2', title: 'Operações de Exportação', desc: 'Gerencie pedidos, embarques e status em um único lugar.' },
    { icon: 'smart_toy', title: 'AI Hub', desc: 'Inteligência integrada para agilizar decisões e documentos.' },
    { icon: 'description', title: 'Documentos', desc: 'DU-E, invoices, packing list e certificados centralizados.' },
    { icon: 'local_shipping', title: 'Logística', desc: 'Portos, navios, containers e transportadoras conectados.' },
    { icon: 'account_balance', title: 'Financeiro', desc: 'Câmbio, pagamentos, trade finance e hedge.' },
    { icon: 'verified_user', title: 'Compliance', desc: 'Licenças, sanções, auditoria e due diligence.' },
  ];

  planCards: PlanCard[] = [];

  steps = [
    { n: 1, icon: 'business', label: 'Cadastre sua empresa' },
    { n: 2, icon: 'inventory_2', label: 'Configure produtos e clientes' },
    { n: 3, icon: 'flight_takeoff', label: 'Crie sua exportação' },
    { n: 4, icon: 'track_changes', label: 'Acompanhe todo o processo' },
    { n: 5, icon: 'auto_awesome', label: 'Use a IA em cada etapa' },
  ];

  ngOnInit(): void {
    this.buildPlanCards();
    this.intelligence.getHomeData().subscribe((data) => {
      this.statusLabel = data.systemStatus.label;
      this.fxCards = data.fx.map((f) => ({
        id: f.pair,
        pair: f.pair,
        value: f.value,
        changePercent: f.changePercent,
        up: f.changePercent >= 0,
        reference: f.reference,
        source: f.source,
        updatedAt: f.updatedAt,
      }));
      this.teaserItems = data.items.slice(0, 3).map((i) => {
        const s = IMPACT_STYLES[i.impactLevel];
        return {
          id: i.id,
          slug: i.slug,
          typeLabel: TYPE_LABELS[i.type],
          impactLabel: s.label,
          impactIcon: s.icon,
          impactColor: s.color,
          impactBg: s.bg,
          title: i.title,
          summary: i.summary,
        };
      });
      this.sponsored = data.sponsored;
      this.isLoading = false;
    });
  }

  private buildPlanCards(): void {
    const plans: SaasPlan[] = this.billing.getPlans();
    this.planCards = plans.map((p) => ({
      code: p.code,
      name: p.name,
      priceLabel: p.code === 'ENTERPRISE'
        ? 'A partir de R$ 6.990/mês'
        : 'R$ ' + p.monthlyPrice.toLocaleString('pt-BR') + '/mês',
      highlighted: p.highlighted,
      badge: p.highlighted ? 'Mais escolhido' : '',
    }));
  }

  trackById(_: number, item: { id: string }): string { return item.id; }
  trackByCode(_: number, item: { code: string }): string { return item.code; }
  trackByStep(_: number, s: { n: number }): number { return s.n; }
}

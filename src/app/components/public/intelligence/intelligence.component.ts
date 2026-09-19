import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PublicHeaderComponent } from '../public-header/public-header.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';
import { IntelligenceMockService } from '../../../../services/intelligenceMockService';
import {
  IntelligenceItem, IntelligenceType, IMPACT_STYLES, TYPE_LABELS,
} from '../../../../types/intelligence';

interface FeedCard {
  id: string;
  slug: string;
  type: IntelligenceType;
  typeLabel: string;
  impactLabel: string;
  impactIcon: string;
  impactColor: string;
  impactBg: string;
  title: string;
  summary: string;
  sourceName: string;
  publishedAt: Date;
  aiGenerated: boolean;
}

interface FilterChip {
  key: 'ALL' | IntelligenceType;
  label: string;
}

@Component({
  selector: 'app-intelligence',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    PublicHeaderComponent, PublicFooterComponent,
  ],
  templateUrl: './intelligence.component.html',
  styleUrls: ['./intelligence.component.scss'],
})
export class IntelligenceComponent implements OnInit {
  private intelligence = inject(IntelligenceMockService);
  private router = inject(Router);

  isLoading = true;
  activeFilter: 'ALL' | IntelligenceType = 'ALL';

  chips: FilterChip[] = [
    { key: 'ALL', label: 'Todos' },
    { key: 'FX', label: 'Câmbio' },
    { key: 'ALERT', label: 'Alertas' },
    { key: 'NEWS', label: 'Notícias' },
    { key: 'OPPORTUNITY', label: 'Oportunidades' },
    { key: 'REGULATION', label: 'Regulação' },
  ];

  private allCards: FeedCard[] = [];
  filteredCards: FeedCard[] = [];

  ngOnInit(): void {
    this.intelligence.getIntelligenceFeed().subscribe((items) => {
      this.allCards = items.map((i) => this.toCard(i));
      this.applyFilter();
      this.isLoading = false;
    });
  }

  private toCard(i: IntelligenceItem): FeedCard {
    const s = IMPACT_STYLES[i.impactLevel];
    return {
      id: i.id,
      slug: i.slug,
      type: i.type,
      typeLabel: TYPE_LABELS[i.type],
      impactLabel: s.label,
      impactIcon: s.icon,
      impactColor: s.color,
      impactBg: s.bg,
      title: i.title,
      summary: i.summary,
      sourceName: i.sourceName,
      publishedAt: i.publishedAt,
      aiGenerated: i.aiGenerated,
    };
  }

  setFilter(key: 'ALL' | IntelligenceType): void {
    this.activeFilter = key;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filteredCards = this.activeFilter === 'ALL'
      ? this.allCards.slice()
      : this.allCards.filter((c) => c.type === this.activeFilter);
  }

  open(slug: string): void {
    this.router.navigate(['/intelligence', slug]);
  }

  trackById(_: number, item: { id: string }): string { return item.id; }
  trackByKey(_: number, item: FilterChip): string { return item.key; }
}

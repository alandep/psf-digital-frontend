import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { CmsIntelligenceMockService } from '../../../../services/cmsIntelligenceMockService';
import {
  CmsIntelligenceItem,
  CmsIntelligenceStats,
  CmsReviewStatus,
  CmsPublicationStatus,
} from '../../../../types/cms-intelligence';
import { IMPACT_STYLES, ImpactLevel } from '../../../../types/intelligence';

interface ChipView { label: string; color: string; bg: string; }

@Component({
  selector: 'app-cms-intelligence',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatPaginatorModule, MatSortModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatMenuModule, MatTooltipModule,
    MatSnackBarModule, MatProgressBarModule,
  ],
  templateUrl: './cms-intelligence.component.html',
  styleUrls: ['./cms-intelligence.component.scss'],
})
export class CmsIntelligenceComponent implements OnInit, AfterViewInit {
  private cms = inject(CmsIntelligenceMockService);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  stats: CmsIntelligenceStats | null = null;
  isLoading = false;

  displayedColumns = [
    'title', 'type', 'source', 'impactLevel', 'reviewStatus',
    'publicationStatus', 'updatedAt', 'actions',
  ];
  dataSource = new MatTableDataSource<CmsIntelligenceItem>([]);
  expandedId: string | null = null;

  searchTerm = '';
  reviewFilter: CmsReviewStatus | 'ALL' = 'ALL';

  reviewOptions: { value: CmsReviewStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Todos' },
    { value: 'DRAFT', label: 'Rascunho' },
    { value: 'REVIEW_REQUIRED', label: 'Aguardando revisão' },
    { value: 'APPROVED', label: 'Aprovado' },
    { value: 'REJECTED', label: 'Rejeitado' },
  ];

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (i: CmsIntelligenceItem, filter: string) => {
      const f = JSON.parse(filter) as { term: string; review: string };
      const term = f.term.trim().toLowerCase();
      const matchTerm =
        !term ||
        i.title.toLowerCase().includes(term) ||
        i.source.toLowerCase().includes(term) ||
        i.type.toLowerCase().includes(term);
      const matchReview = f.review === 'ALL' || i.reviewStatus === f.review;
      return matchTerm && matchReview;
    };
    this.applyFilter();
  }

  load(): void {
    this.isLoading = true;
    this.cms.getStats().subscribe((s) => (this.stats = s));
    this.cms.getItems().subscribe((items) => {
      this.dataSource.data = items;
      this.applyFilter();
      this.isLoading = false;
    });
  }

  applyFilter(): void {
    this.dataSource.filter = JSON.stringify({ term: this.searchTerm, review: this.reviewFilter });
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  trackById(_: number, row: CmsIntelligenceItem): string {
    return row.id;
  }

  toggleExpand(row: CmsIntelligenceItem): void {
    this.expandedId = this.expandedId === row.id ? null : row.id;
  }

  impactView(level: ImpactLevel): ChipView {
    const s = IMPACT_STYLES[level];
    return { label: s.label, color: s.color, bg: s.bg };
  }

  reviewView(status: CmsReviewStatus): ChipView {
    switch (status) {
      case 'APPROVED': return { label: 'Aprovado', color: '#2e7d32', bg: '#e8f5e9' };
      case 'REVIEW_REQUIRED': return { label: 'Aguardando revisão', color: '#ef6c00', bg: '#fff3e0' };
      case 'REJECTED': return { label: 'Rejeitado', color: '#c62828', bg: '#ffebee' };
      case 'DRAFT': return { label: 'Rascunho', color: '#616161', bg: '#f5f5f5' };
      default: return { label: status, color: '#616161', bg: '#f5f5f5' };
    }
  }

  publicationView(status: CmsPublicationStatus): ChipView {
    switch (status) {
      case 'PUBLISHED': return { label: 'Publicado', color: '#2e7d32', bg: '#e8f5e9' };
      case 'SCHEDULED': return { label: 'Agendado', color: '#1565c0', bg: '#e3f2fd' };
      case 'EXPIRED': return { label: 'Expirado', color: '#ef6c00', bg: '#fff3e0' };
      case 'ARCHIVED': return { label: 'Arquivado', color: '#616161', bg: '#f5f5f5' };
      default: return { label: '—', color: '#90a4ae', bg: '#f5f5f5' };
    }
  }

  private reloadFrom(obs: import('rxjs').Observable<CmsIntelligenceItem[]>, msg: string): void {
    this.isLoading = true;
    obs.subscribe((items) => {
      this.dataSource.data = items;
      this.applyFilter();
      this.isLoading = false;
      this.snackBar.open(msg, 'Fechar', { duration: 3000 });
    });
  }

  aprovar(row: CmsIntelligenceItem): void {
    this.reloadFrom(this.cms.approve(row.id), `"${row.title}" aprovado (mock)`);
  }

  rejeitar(row: CmsIntelligenceItem): void {
    this.reloadFrom(this.cms.reject(row.id), `"${row.title}" rejeitado (mock)`);
  }

  publicar(row: CmsIntelligenceItem): void {
    this.reloadFrom(this.cms.publish(row.id), `"${row.title}" publicado (mock)`);
  }

  agendar(row: CmsIntelligenceItem): void {
    this.reloadFrom(this.cms.schedule(row.id), `"${row.title}" agendado (mock)`);
  }

  arquivar(row: CmsIntelligenceItem): void {
    this.reloadFrom(this.cms.archive(row.id), `"${row.title}" arquivado (mock)`);
  }
}

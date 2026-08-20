import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';

import { KnowledgeCenterMockService } from '../../../../services/knowledgeCenterMockService';
import {
  KnowledgeArticle,
  KnowledgeCategory,
  KnowledgeCenterMetrics,
  KnowledgeCenterFilters
} from '../../../../types/knowledge-center';

@Component({
  selector: 'app-knowledge-center',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressBarModule,
    MatListModule
  ],
  templateUrl: './knowledge-center.component.html',
  styleUrls: ['./knowledge-center.component.scss']
})
export class KnowledgeCenterComponent implements OnInit, OnDestroy {

  private service = inject(KnowledgeCenterMockService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  articles: KnowledgeArticle[] = [];
  mostViewed: KnowledgeArticle[] = [];
  recentlyUpdated: KnowledgeArticle[] = [];
  metrics: KnowledgeCenterMetrics | null = null;
  selectedArticle: KnowledgeArticle | null = null;
  isLoading = false;

  categories: { value: KnowledgeCategory; label: string; icon: string }[] = [];
  selectedCategory: KnowledgeCategory | '' = '';

  filterForm!: FormGroup;

  ngOnInit(): void {
    this.filterForm = this.fb.group({ searchText: [''] });
    this.categories = this.service.getCategories();
    this.loadArticles();
    this.loadMostViewed();
    this.loadRecentlyUpdated();
    this.loadMetrics();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.filterForm.get('searchText')!.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.loadArticles());
  }

  loadArticles(): void {
    this.isLoading = true;
    const filters: KnowledgeCenterFilters = {
      searchText: this.filterForm.value.searchText || '',
      modules: [],
      category: this.selectedCategory,
      difficulty: ''
    };
    this.service.getArticles(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.articles = data;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar artigos', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadMostViewed(): void {
    this.service.getMostViewed(10)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.mostViewed = data);
  }

  loadRecentlyUpdated(): void {
    this.service.getRecentlyUpdated(30)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.recentlyUpdated = data);
  }

  loadMetrics(): void {
    this.service.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(m => this.metrics = m);
  }

  onTabChange(index: number): void {
    if (index === 0) {
      this.selectedCategory = '';
    } else {
      this.selectedCategory = this.categories[index - 1]?.value || '';
    }
    this.loadArticles();
  }

  selectArticle(article: KnowledgeArticle): void {
    this.selectedArticle = article;
  }

  closeArticle(): void {
    this.selectedArticle = null;
  }

  rateArticle(positive: boolean): void {
    if (!this.selectedArticle) return;
    this.service.rateArticle(this.selectedArticle.id, positive)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.snackBar.open(
          positive ? 'Obrigado pelo feedback positivo!' : 'Obrigado pelo feedback. Vamos melhorar!',
          'OK', { duration: 3000 }
        );
      });
  }

  getCategoryIcon(category: KnowledgeCategory): string {
    const map: Record<KnowledgeCategory, string> = {
      'DOCUMENTATION': 'description',
      'FAQ': 'help',
      'VIDEO_TUTORIAL': 'play_circle',
      'BEST_PRACTICES': 'star'
    };
    return map[category] || 'article';
  }

  getCategoryLabel(category: KnowledgeCategory): string {
    const map: Record<KnowledgeCategory, string> = {
      'DOCUMENTATION': 'Documentação',
      'FAQ': 'FAQ',
      'VIDEO_TUTORIAL': 'Vídeo Tutorial',
      'BEST_PRACTICES': 'Boas Práticas'
    };
    return map[category] || category;
  }

  getDifficultyLabel(difficulty: string): string {
    const map: Record<string, string> = {
      'BASICO': 'Básico',
      'INTERMEDIARIO': 'Intermediário',
      'AVANCADO': 'Avançado'
    };
    return map[difficulty] || difficulty;
  }

  getDifficultyClass(difficulty: string): string {
    const map: Record<string, string> = {
      'BASICO': 'diff-basic',
      'INTERMEDIARIO': 'diff-intermediate',
      'AVANCADO': 'diff-advanced'
    };
    return map[difficulty] || '';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}

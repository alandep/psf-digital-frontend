import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ConstrutorTelasMockService } from '../../../../services/construtorTelasMockService';
import { ScreenTemplate } from '../../../../types/construtor-telas';

@Component({
  selector: 'app-templates-construtor',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './templates-construtor.component.html',
  styleUrls: ['./templates-construtor.component.scss']
})
export class TemplatesConstrutorComponent implements OnInit, OnDestroy {

  private service = inject(ConstrutorTelasMockService);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  templates: ScreenTemplate[] = [];

  ngOnInit(): void {
    this.loadTemplates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTemplates(): void {
    this.service.getTemplates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(templates => this.templates = templates);
  }

  useTemplate(template: ScreenTemplate): void {
    this.service.createFromTemplate(template.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(screen => {
        if (screen) {
          this.snackBar.open(`Tela criada a partir de "${template.name}"!`, 'OK', { duration: 3000 });
        }
      });
  }

  getLayoutLabel(layout: string): string {
    const map: Record<string, string> = {
      '1_COLUMN': '1 Coluna',
      '2_COLUMNS': '2 Colunas',
      '3_COLUMNS': '3 Colunas'
    };
    return map[layout] || layout;
  }
}

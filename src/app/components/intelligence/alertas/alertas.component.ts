import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WatchlistMockService } from '../../../../services/watchlistMockService';
import { IntelligenceAlert } from '../../../../types/intelligence-alert';

interface ImpactStyle {
  label: string;
  color: string;
  bg: string;
}

const IMPACT_STYLES: Record<IntelligenceAlert['impactLevel'], ImpactStyle> = {
  LOW: { label: 'Baixo impacto', color: '#2e7d32', bg: '#e8f5e9' },
  MEDIUM: { label: 'Atenção', color: '#ef6c00', bg: '#fff3e0' },
  HIGH: { label: 'Impacto relevante', color: '#e65100', bg: '#ffe0b2' },
  CRITICAL: { label: 'Alto impacto', color: '#c62828', bg: '#ffebee' },
};

@Component({
  selector: 'app-intelligence-alertas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './alertas.component.html',
  styleUrls: ['./alertas.component.scss'],
})
export class IntelligenceAlertasComponent implements OnInit {
  private service = inject(WatchlistMockService);
  private snackBar = inject(MatSnackBar);

  // Stable field bound in the template (no array-rebuilding getters).
  alerts: IntelligenceAlert[] = [];
  unreadCount = 0;
  isLoading = false;

  ngOnInit(): void {
    this.load();
  }

  trackById(_index: number, alert: IntelligenceAlert): string {
    return alert.id;
  }

  impactStyle(level: IntelligenceAlert['impactLevel']): ImpactStyle {
    return IMPACT_STYLES[level];
  }

  private load(): void {
    this.isLoading = true;
    this.service.getAlerts().subscribe((list) => {
      this.alerts = list;
      this.unreadCount = list.filter((a) => !a.read).length;
      this.isLoading = false;
    });
  }

  markRead(alert: IntelligenceAlert): void {
    this.service.markAlertRead(alert.id).subscribe((list) => {
      this.alerts = list;
      this.unreadCount = list.filter((a) => !a.read).length;
      this.snackBar.open('Alerta marcado como lido (mock)', 'Fechar', {
        duration: 3000,
      });
    });
  }
}

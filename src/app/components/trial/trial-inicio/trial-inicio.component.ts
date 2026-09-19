import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TrialDashboardMockService } from '../../../../services/trialDashboardMockService';
import {
  TrialDashboard,
  TrialSetupStep,
  DiscoveryShortcut,
} from '../../../../types/trial-dashboard';

@Component({
  selector: 'app-trial-inicio',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressBarModule, MatSnackBarModule,
  ],
  templateUrl: './trial-inicio.component.html',
  styleUrls: ['./trial-inicio.component.scss'],
})
export class TrialInicioComponent implements OnInit {
  private trialService = inject(TrialDashboardMockService);
  private snackBar = inject(MatSnackBar);

  dashboard: TrialDashboard | null = null;
  shortcuts: DiscoveryShortcut[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.shortcuts = this.trialService.getDiscoveryShortcuts();
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.trialService.getDashboard().subscribe((d) => {
      this.dashboard = d;
      this.isLoading = false;
    });
  }

  loadSampleData(): void {
    this.isLoading = true;
    this.trialService.loadSampleData().subscribe((d) => {
      this.dashboard = d;
      this.isLoading = false;
      this.snackBar.open('Dados de exemplo carregados (mock)', 'Fechar', { duration: 3000 });
    });
  }

  removeSampleData(): void {
    this.isLoading = true;
    this.trialService.removeSampleData().subscribe((d) => {
      this.dashboard = d;
      this.isLoading = false;
      this.snackBar.open('Dados de exemplo removidos (mock)', 'Fechar', { duration: 3000 });
    });
  }

  trackByStepKey(_index: number, step: TrialSetupStep): string {
    return step.key;
  }

  trackByShortcutLabel(_index: number, shortcut: DiscoveryShortcut): string {
    return shortcut.label;
  }
}

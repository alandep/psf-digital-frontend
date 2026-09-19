import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

const DEMO_STORAGE_KEY = 'eip_demo_mode';

// Sticky in-app demo banner (MOCK). Shows when the app is running in demo mode
// (?demo=1 on entry, persisted in localStorage). Renders nothing otherwise.
@Component({
  selector: 'app-demo-banner',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div *ngIf="demoMode" class="demo-banner" role="status">
      <mat-icon class="db-icon">science</mat-icon>
      <span class="db-text">
        Você está no ambiente demonstrativo do EIP. Todos os dados são fictícios.
      </span>
      <span class="db-actions">
        <a class="db-btn primary" routerLink="/signup">Criar minha empresa</a>
        <a class="db-exit" (click)="exitDemo()">Sair da demonstração</a>
      </span>
    </div>
  `,
  styles: [`
    .demo-banner {
      position: sticky;
      top: 0;
      z-index: 880;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 20px;
      font-size: 0.9rem;
      font-weight: 500;
      color: #fff;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      border-bottom: 3px solid #ffb300;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    }
    .db-icon { flex-shrink: 0; color: #ffe082; }
    .db-text { flex: 1; line-height: 1.35; }
    .db-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
    .db-btn {
      display: inline-flex;
      align-items: center;
      padding: 6px 14px;
      border-radius: 18px;
      font-size: 0.82rem;
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
      cursor: pointer;
    }
    .db-btn.primary { background: #fff; color: #1565c0; }
    .db-btn.primary:hover { background: #e3f2fd; }
    .db-exit {
      color: #e3f2fd;
      text-decoration: underline;
      font-size: 0.82rem;
      cursor: pointer;
      white-space: nowrap;
    }
    .db-exit:hover { color: #fff; }
    @media (max-width: 768px) {
      .demo-banner { flex-wrap: wrap; }
      .db-actions { width: 100%; }
    }
  `],
})
export class DemoBannerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  demoMode = false;

  ngOnInit(): void {
    const fromQuery = this.route.snapshot.queryParamMap.get('demo') === '1';
    let persisted = false;
    try {
      persisted = localStorage.getItem(DEMO_STORAGE_KEY) === 'true';
    } catch {
      // localStorage may be unavailable (SSR / privacy mode) - ignore.
    }
    if (fromQuery) {
      try { localStorage.setItem(DEMO_STORAGE_KEY, 'true'); } catch { /* ignore */ }
    }
    this.demoMode = fromQuery || persisted;
  }

  exitDemo(): void {
    try { localStorage.removeItem(DEMO_STORAGE_KEY); } catch { /* ignore */ }
    this.demoMode = false;
    this.router.navigate(['/home']);
  }
}

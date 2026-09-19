import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <header class="ph">
      <div class="ph-inner">
        <a class="brand" routerLink="/home">EIP <span>— Export Intelligence Platform</span></a>

        <nav class="nav-center" [class.open]="menuOpen">
          <a routerLink="/product" (click)="close()">Produto</a>
          <a routerLink="/precos" (click)="close()">Preços</a>
          <a routerLink="/site" (click)="close()">IA</a>
          <a routerLink="/intelligence" (click)="close()">Inteligência</a>
          <a routerLink="/security" (click)="close()">Segurança</a>
        </nav>

        <div class="right">
          <span class="status-pill">🟢 {{ statusLabel }}</span>
          <a mat-button class="ghost" routerLink="/login">Entrar</a>
          <a mat-flat-button color="primary" routerLink="/signup">Experimentar grátis</a>
          <button mat-icon-button class="menu-btn" (click)="toggle()" aria-label="Menu">
            <mat-icon>{{ menuOpen ? 'close' : 'menu' }}</mat-icon>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .ph{position:sticky;top:0;z-index:50;background:#fff;box-shadow:0 2px 12px rgba(25,118,210,0.08);}
    .ph-inner{max-width:1200px;margin:0 auto;padding:0 20px;height:64px;display:flex;align-items:center;gap:16px;}
    .brand{font-weight:800;color:#1565c0;text-decoration:none;font-size:1.1rem;white-space:nowrap;}
    .brand span{font-weight:500;color:#5a6b7b;font-size:.82rem;}
    .nav-center{display:flex;gap:22px;margin:0 auto;}
    .nav-center a{color:#37474f;text-decoration:none;font-weight:600;font-size:.92rem;}
    .nav-center a:hover{color:#1976d2;}
    .right{display:flex;align-items:center;gap:10px;margin-left:auto;}
    .status-pill{font-size:.74rem;color:#2e7d32;background:#e8f5e9;padding:4px 10px;border-radius:999px;white-space:nowrap;}
    .ghost{color:#1976d2;}
    .menu-btn{display:none;color:#1976d2;}
    @media (max-width:900px){
      .brand span{display:none;}
      .status-pill{display:none;}
      .menu-btn{display:inline-flex;}
      .nav-center{position:absolute;top:64px;left:0;right:0;flex-direction:column;gap:0;background:#fff;
        margin:0;padding:0 20px;max-height:0;overflow:hidden;transition:max-height .2s ease;box-shadow:0 8px 16px rgba(25,118,210,0.08);}
      .nav-center.open{max-height:320px;padding:8px 20px 16px;}
      .nav-center a{padding:12px 0;border-bottom:1px solid #eef2f6;}
    }
  `],
})
export class PublicHeaderComponent {
  @Input() statusLabel = 'Todos os sistemas operacionais';
  menuOpen = false;

  toggle(): void { this.menuOpen = !this.menuOpen; }
  close(): void { this.menuOpen = false; }
}

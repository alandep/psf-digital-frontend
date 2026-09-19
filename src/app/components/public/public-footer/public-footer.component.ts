import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CookieConsentService } from '../../../../services/cookieConsentService';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="mvv">
      <div class="mvv-inner">
        <div class="mvv-block">
          <h4>Missão</h4>
          <p>Simplificar e potencializar a exportação brasileira com tecnologia e inteligência.</p>
        </div>
        <div class="mvv-block">
          <h4>Visão</h4>
          <p>Ser a plataforma de referência para quem opera o comércio exterior no Brasil.</p>
        </div>
        <div class="mvv-block values">
          <h4>Valores</h4>
          <p>Confiança • Segurança • Inovação • Transparência • Eficiência • Inteligência • Foco no cliente</p>
        </div>
      </div>
    </div>

    <footer class="pf">
      <div class="pf-inner">
        <div class="col">
          <h5>Produto</h5>
          <a routerLink="/product">Exportações</a><a routerLink="/product">AI Hub</a><a routerLink="/product">Compliance</a>
          <a routerLink="/product">Logística</a><a routerLink="/product">Financeiro</a><a>API</a>
        </div>
        <div class="col">
          <h5>Empresa</h5>
          <a routerLink="/about">Sobre o EIP</a><a>Missão</a>
          <a routerLink="/security">Segurança</a>
          <a routerLink="/legal/privacidade">Privacidade</a>
          <a routerLink="/legal/termos">Termos de Uso</a>
        </div>
        <div class="col">
          <h5>Recursos</h5>
          <a routerLink="/intelligence">EIP Intelligence</a>
          <a>Central de ajuda</a><a routerLink="/official-links">Links oficiais</a><a>Status</a><a routerLink="/contact">Contato</a>
        </div>
      </div>

      <div class="legal">
        <div class="legal-brand">EIP — Export Intelligence Platform</div>
        <div class="legal-note">CNPJ e endereço são configurados institucionalmente.</div>
        <div class="legal-copy">© 2026 EIP. Todos os direitos reservados.</div>
        <div class="legal-links">
          <a routerLink="/legal/privacidade">Privacidade</a>
          <span class="sep">|</span>
          <a routerLink="/legal/termos">Termos</a>
          <span class="sep">|</span>
          <a class="legal-cookies" (click)="reopenCookies()">Cookies</a>
          <span class="sep">|</span>
          <a routerLink="/security">Segurança</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .mvv{background:#f5f9ff;border-top:1px solid #e3eefb;}
    .mvv-inner{max-width:1200px;margin:0 auto;padding:32px 20px;display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:28px;}
    .mvv-block h4{margin:0 0 6px;color:#1565c0;font-size:.9rem;letter-spacing:.5px;text-transform:uppercase;}
    .mvv-block p{margin:0;color:#455a64;font-size:.92rem;line-height:1.5;}
    .mvv-block.values p{color:#1976d2;font-weight:600;}
    .pf{background:#0d2a45;color:#cfe0f2;}
    .pf-inner{max-width:1200px;margin:0 auto;padding:40px 20px;display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .col h5{margin:0 0 12px;color:#fff;font-size:.95rem;}
    .col a{display:block;color:#a9c5e0;text-decoration:none;font-size:.88rem;padding:5px 0;cursor:pointer;}
    .col a:hover{color:#fff;}
    .legal{max-width:1200px;margin:0 auto;padding:20px;border-top:1px solid #17395a;display:flex;flex-wrap:wrap;gap:6px 18px;align-items:center;font-size:.8rem;color:#8fb0cf;}
    .legal-brand{font-weight:700;color:#fff;}
    .legal-links{display:flex;gap:8px;align-items:center;}
    .legal-links a{color:#8fb0cf;text-decoration:none;cursor:pointer;}
    .legal-links a:hover{color:#fff;}
    .legal-links .sep{color:#5b7fa3;}
    @media (max-width:760px){
      .mvv-inner{grid-template-columns:1fr;}
      .pf-inner{grid-template-columns:1fr;}
    }
  `],
})
export class PublicFooterComponent {
  constructor(private cookieConsent: CookieConsentService) {}

  reopenCookies(): void {
    this.cookieConsent.reopen();
  }
}

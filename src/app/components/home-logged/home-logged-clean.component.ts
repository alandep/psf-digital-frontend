import { Component, inject, OnInit, OnDestroy, HostListener, ViewChild, AfterViewInit, ElementRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { NotificationBellComponent } from '../shared/notification-bell/notification-bell.component';
import { LoadingComponent } from '../shared/loading/loading.component';
import { NotificationService } from '../../services/notification.service';
import { filter } from 'rxjs/operators';
import { AiCopilotComponent } from '../shared/ai-copilot/ai-copilot.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface LoggedUser {
  cpf: string;
  city: string;
  psf: string;
  name: string;
}

@Component({
  selector: 'app-home-logged',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatTooltipModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    AiCopilotComponent
  ],
  template: `
    <div class="app-wrapper">
      <mat-sidenav-container 
        class="sidenav-container" 
        fullscreen>
        
        <!-- Sidebar -->
        <mat-sidenav 
          #drawer 
          class="sidenav" 
          fixedInViewport="true"
          [attr.role]="'navigation'"
          mode="over"
          [disableClose]="false"
          [autoFocus]="false"
          (backdropClick)="onBackdropClick()"
          (keydown.escape)="onEscapeKey()"
          (opened)="onSidenavOpened()"
          (closed)="onSidenavClosed()">
        
        <!-- Logo e Header -->
        <div class="sidenav-header">
          <div class="logo-container">
            <mat-icon class="logo-icon">smart_toy</mat-icon>
            <h2 class="logo-text">Export AI</h2>
            <span class="logo-subtitle">Intelligence Platform</span>
          </div>
        </div>

        <!-- Navigation Menu -->
        <mat-nav-list class="nav-list">
          <ng-container *ngFor="let item of menuItems">
            
            <!-- Menu com submenu -->
            <ng-container *ngIf="item.items; else simpleMenuItem">
              
              <!-- Cabeçalho do menu expansível -->
              <mat-list-item 
                class="menu-header-item"
                (click)="toggleMenu(item.title)">
                <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                <span matListItemTitle class="menu-text">{{ item.title }}</span>
                <mat-icon class="expand-icon" [class.expanded]="item.title === expandedMenu">
                  expand_more
                </mat-icon>
              </mat-list-item>

              <!-- Subitens (mostrados condicionalmente) -->
              <ng-container *ngIf="item.title === expandedMenu">
                <mat-list-item 
                  *ngFor="let subItem of item.items"
                  class="submenu-item"
                  [matTooltip]="subItem.name"
                  matTooltipPosition="right"
                  (click)="handleMenuClick(subItem.route)">                  
                  <mat-icon matListItemIcon>{{ subItem.icon }}</mat-icon>
                  <span matListItemTitle class="submenu-text">{{ subItem.name }}</span>
                </mat-list-item>
              </ng-container>
              
            </ng-container>

            <!-- Menu simples -->
            <ng-template #simpleMenuItem>
              <mat-list-item 
                class="menu-item"
                [matTooltip]="item.title"
                matTooltipPosition="right"
                (click)="handleMenuClick(item.route!)">
                <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                <span matListItemTitle class="menu-text">{{ item.title }}</span>
              </mat-list-item>
            </ng-template>

          </ng-container>
        </mat-nav-list>
      </mat-sidenav>

      <!-- Main Content -->
      <mat-sidenav-content>
        
        <!-- Enhanced Toolbar -->
        <mat-toolbar 
          color="primary" 
          class="main-toolbar">
          <!-- Menu Toggle -->
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="toggleSidenav()">
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>

          <!-- Search Bar -->
          <div class="search-container">
            <mat-icon class="search-icon">search</mat-icon>
            <input 
              type="text" 
              placeholder="Busca global (Ctrl+K)"
              class="search-input"
              [(ngModel)]="searchQuery"
              (keydown.enter)="performSearch()"
              (keydown)="onKeyDown($event)">
          </div>

          <!-- Spacer -->
          <span class="toolbar-spacer"></span>

          <!-- Toolbar Actions -->
          <div class="toolbar-actions">
            
            <!-- Exchange Rate -->
            <button mat-button class="exchange-rate-btn">
              <mat-icon>currency_exchange</mat-icon>
              USD: R$ 5.18
              <mat-icon class="trend-up">trending_up</mat-icon>
            </button>

            <!-- AI Status -->
            <button mat-button class="ai-status-btn" (click)="toggleAIAssistant()">
              <mat-icon class="ai-icon">psychology</mat-icon>
              AI Online
              <div class="status-dot online"></div>
            </button>

            <!-- Notifications -->
            <button mat-icon-button [matMenuTriggerFor]="notificationMenu">
              <mat-icon [matBadge]="notificationCount" matBadgeColor="warn" aria-hidden="false">
                notifications
              </mat-icon>
            </button>
            
            <!-- Integration Status -->
            <button mat-icon-button [matMenuTriggerFor]="integrationMenu">
              <mat-icon [matBadge]="integrationIssues" matBadgeColor="warn" aria-hidden="false">
                cloud_sync
              </mat-icon>
            </button>

            <!-- Profile Menu -->
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </button>
          </div>
        </mat-toolbar>

        <!-- Page Content -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>

        <!-- AI Copilot -->
        <app-ai-copilot></app-ai-copilot>

      </mat-sidenav-content>
    </mat-sidenav-container>
    </div>

    <!-- Notification Menu -->
    <mat-menu #notificationMenu="matMenu" class="notification-menu">
      <div class="menu-header">
        <h3>Notificações</h3>
        <button mat-icon-button (click)="markAllAsRead()">
          <mat-icon>done_all</mat-icon>
        </button>
      </div>
      <mat-divider></mat-divider>
      
      <button mat-menu-item *ngFor="let notification of recentNotifications" 
              (click)="handleNotification(notification)">
        <mat-icon [class]="'notification-' + notification.type">
          {{ getNotificationIcon(notification.type) }}
        </mat-icon>
        <div class="notification-content">
          <span class="notification-title">{{ notification.title }}</span>
          <span class="notification-time">{{ notification.time }}</span>
        </div>
      </button>
      
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="viewAllNotifications()">
        <mat-icon>list</mat-icon>
        Ver todas notificações
      </button>
    </mat-menu>

    <!-- Integration Status Menu -->
    <mat-menu #integrationMenu="matMenu" class="integration-menu">
      <div class="menu-header">
        <h3>Status das Integrações</h3>
        <button mat-icon-button (click)="refreshIntegrations()">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>
      <mat-divider></mat-divider>
      
      <button mat-menu-item *ngFor="let integration of integrationStatus" 
              (click)="viewIntegrationDetails(integration)">
        <mat-icon [class]="'status-' + integration.status">
          {{ getIntegrationIcon(integration.status) }}
        </mat-icon>
        <div class="integration-content">
          <span class="integration-name">{{ integration.name }}</span>
          <span class="integration-status">{{ integration.statusText }}</span>
        </div>
      </button>
    </mat-menu>

    <!-- User Menu -->
    <mat-menu #userMenu="matMenu">
      <button mat-menu-item (click)="viewProfile()">
        <mat-icon>person</mat-icon>
        <span>Meu Perfil</span>
      </button>
      <button mat-menu-item (click)="openSettings()">
        <mat-icon>settings</mat-icon>
        <span>Configurações</span>
      </button>
      <button mat-menu-item (click)="viewHelp()">
        <mat-icon>help</mat-icon>
        <span>Ajuda</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="logout()">
        <mat-icon>logout</mat-icon>
        <span>Sair</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .app-wrapper { position: fixed; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; margin: 0; padding: 0; }
    .sidenav-container { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; overflow: hidden; margin: 0 !important; padding: 0 !important; width: 100vw !important; height: 100vh !important; }
    .sidenav { position: fixed !important; top: 0 !important; left: 0 !important; width: 300px; max-width: 85vw; height: 100vh !important; background: #fafafa; border-right: 1px solid #e0e0e0; overflow-y: auto; overflow-x: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.15); z-index: 1100 !important; margin: 0 !important; padding: 0 !important; transform: translateX(0) !important; }
    .mat-sidenav-backdrop { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; background-color: rgba(0, 0, 0, 0.6) !important; z-index: 1099 !important; }
    .sidenav-header { background: linear-gradient(135deg, #1976d2, #1565c0); color: white; padding: 24px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .logo-container { text-align: center; }
    .logo-icon { font-size: 2.5rem !important; width: 2.5rem !important; height: 2.5rem !important; color: #fff; margin-bottom: 8px; }
    .logo-text { margin: 0; font-size: 1.5rem; font-weight: 700; background: linear-gradient(45deg, #fff, #e3f2fd); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .logo-subtitle { display: block; font-size: 0.75rem; opacity: 0.8; margin-top: 4px; font-weight: 300; letter-spacing: 1px; }
    .nav-list { padding: 0; overflow: hidden; }
    .mat-sidenav-content { margin-left: 0 !important; padding: 0 !important; overflow-x: hidden; height: 100vh; width: 100% !important; }
    .main-toolbar { position: fixed; top: 0; left: 0; right: 0; background: linear-gradient(135deg, #1976d2, #1565c0); box-shadow: 0 2px 8px rgba(0,0,0,0.15); height: 64px; padding: 0 16px; z-index: 1050; width: 100%; }
    .main-content { margin-top: 64px; overflow-x: hidden; padding: 0; width: 100%; }
    .search-container { display: flex; align-items: center; background: rgba(255,255,255,0.15); border-radius: 24px; padding: 0 16px; margin-left: 24px; flex: 1; max-width: 400px; transition: all 0.3s ease; }
    .search-container:focus-within { background: rgba(255,255,255,0.25); transform: scale(1.02); }
    .search-icon { color: rgba(255,255,255,0.7); margin-right: 8px; }
    .search-input { flex: 1; border: none; background: transparent; color: white; font-size: 14px; padding: 8px 0; outline: none; }
    .search-input::placeholder { color: rgba(255,255,255,0.7); }
    .toolbar-spacer { flex: 1; }
    .toolbar-actions { display: flex; align-items: center; gap: 8px; }
    .exchange-rate-btn, .ai-status-btn { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 500; color: white; padding: 6px 12px; border-radius: 16px; background: rgba(255,255,255,0.1); transition: all 0.3s ease; }
    .exchange-rate-btn:hover, .ai-status-btn:hover { background: rgba(255,255,255,0.2); }
    .trend-up { color: #4caf50; font-size: 18px !important; }
    .ai-icon { color: #ff9800; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; margin-left: 4px; }
    .status-dot.online { background: #4caf50; animation: pulse 2s infinite; }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); } 70% { box-shadow: 0 0 0 8px rgba(76, 175, 80, 0); } 100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); } }
    .submenu-item { padding: 12px 24px 12px 40px !important; margin: 2px 0 !important; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important; cursor: pointer; border-radius: 0; min-height: 48px !important; position: relative; }
    .submenu-item .submenu-text { font-size: 13px; font-weight: 400; color: #424242; line-height: 1.4; word-wrap: break-word; overflow-wrap: break-word; white-space: normal !important; max-width: 180px; }
    .submenu-item mat-icon { color: #666 !important; font-size: 16px !important; width: 16px !important; height: 16px !important; margin-right: 12px; flex-shrink: 0; }
    .submenu-item:hover { background: rgba(25, 118, 210, 0.06) !important; transform: translateX(6px); }
    .submenu-item:hover .submenu-text { color: #1976d2; font-weight: 500; }
    .submenu-item:hover mat-icon { color: #1976d2 !important; }
    .submenu-item:active { background: rgba(25, 118, 210, 0.12) !important; }
    .menu-item { padding: 14px 20px !important; margin: 2px 0 !important; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important; cursor: pointer; border-radius: 0; min-height: 50px !important; }
    .menu-item .menu-text { font-size: 14px; font-weight: 400; color: #424242; line-height: 1.4; word-wrap: break-word; overflow-wrap: break-word; white-space: normal !important; max-width: 200px; }
    .menu-item mat-icon { color: #1976d2 !important; font-size: 20px !important; width: 20px !important; height: 20px !important; margin-right: 16px; flex-shrink: 0; }
    .menu-item:hover { background: rgba(25, 118, 210, 0.06) !important; transform: translateX(8px); }
    .menu-item:hover .menu-text { color: #1976d2; font-weight: 500; }
    .menu-item:active { background: rgba(25, 118, 210, 0.12) !important; }
    .menu-header-item { padding: 14px 20px !important; margin: 4px 0 !important; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important; cursor: pointer; border-radius: 0; min-height: 50px !important; background: rgba(25, 118, 210, 0.02); border-left: 3px solid transparent; display: flex !important; align-items: center !important; justify-content: space-between !important; }
    .menu-header-item .menu-text { font-size: 14px; font-weight: 500; color: #1976d2; line-height: 1.4; word-wrap: break-word; overflow-wrap: break-word; white-space: normal !important; max-width: 170px; flex-grow: 1; margin: 0 !important; }
    .menu-header-item mat-icon[matListItemIcon] { color: #1976d2 !important; font-size: 20px !important; width: 20px !important; height: 20px !important; margin-right: 16px !important; flex-shrink: 0; }
    .menu-header-item .expand-icon { color: #666 !important; font-size: 18px !important; width: 18px !important; height: 18px !important; transition: transform 0.3s ease; flex-shrink: 0; margin-left: auto !important; }
    .menu-header-item .expand-icon.expanded { transform: rotate(180deg); }
    .menu-header-item:hover { background: rgba(25, 118, 210, 0.06) !important; border-left-color: #1976d2; }
    .menu-header-item:hover .menu-text { color: #1565c0; font-weight: 600; }
    .menu-header-item:hover .expand-icon { color: #1976d2 !important; }
    .menu-header-item:active { background: rgba(25, 118, 210, 0.12) !important; }
    .notification-menu, .integration-menu { min-width: 320px; max-height: 400px; overflow-y: auto; }
    .menu-header { padding: 16px; display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; }
    .menu-header h3 { margin: 0; color: #333; font-size: 1rem; font-weight: 600; }
    .notification-content, .integration-content { display: flex; flex-direction: column; margin-left: 8px; }
    .notification-title, .integration-name { font-weight: 500; color: #333; }
    .notification-time, .integration-status { font-size: 0.8rem; color: #666; }
    .notification-success { color: #4caf50; }
    .notification-warning { color: #ff9800; }
    .notification-error { color: #f44336; }
    .notification-info { color: #2196f3; }
    .status-online { color: #4caf50; }
    .status-offline { color: #f44336; }
    .status-warning { color: #ff9800; }
    @media (max-width: 768px) {
      .search-container { max-width: 180px; margin-left: 8px; }
      .exchange-rate-btn, .ai-status-btn { display: none; }
      .toolbar-actions { gap: 4px; }
      .sidenav { width: 260px; max-width: 85vw; }
    }
    @media (max-width: 480px) {
      .search-container { display: none; }
      .main-toolbar { padding: 0 8px; }
      .sidenav { width: 240px; max-width: 90vw; }
    }
  `]
})
export class HomeLoggedComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('drawer') drawer!: MatSidenav;
  
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private breakpointObserver = inject(BreakpointObserver);
  private destroy$ = new Subject<void>();

  expandedMenu = '';
  isHandset = false;
  searchQuery = '';
  notificationCount = 3;
  integrationIssues = 1;

  recentNotifications = [
    { title: 'Exportação aprovada', type: 'success', time: '5 min' },
    { title: 'Margem baixa detectada', type: 'warning', time: '15 min' },
    { title: 'Documento pendente', type: 'info', time: '1 h' }
  ];

  integrationStatus = [
    { name: 'Siscomex', status: 'online', statusText: 'Conectado' },
    { name: 'MAPA', status: 'warning', statusText: 'Lento' },
    { name: 'Banco Central', status: 'online', statusText: 'Conectado' }
  ];

  menuItems = [
    {
      title: 'Dashboard Principal',
      icon: 'dashboard',
      route: 'dashboards/principal'
    },
    {
      title: 'Exportações',
      icon: 'flight_takeoff',
      items: [
        { name: 'Gerenciar Exportações', route: 'exportacoes/gerenciar', icon: 'inventory_2' },
        { name: 'Novos Pedidos', route: 'exportacoes/pedidos', icon: 'add_shopping_cart' },
        { name: 'Acompanhar Status', route: 'exportacoes/status', icon: 'track_changes' }
      ]
    },
    {
      title: 'Contratos',
      icon: 'description',
      items: [
        { name: 'Contratos Ativos', route: 'contratos/ativos', icon: 'assignment_turned_in' },
        { name: 'Novos Contratos', route: 'contratos/novo', icon: 'note_add' },
        { name: 'Templates', route: 'contratos/templates', icon: 'content_copy' }
      ]
    },
    {
      title: 'Produtos',
      icon: 'inventory',
      items: [
        { name: 'Catálogo', route: 'produtos/catalogo', icon: 'category' },
        { name: 'Classificação NCM', route: 'produtos/ncm', icon: 'label' },
        { name: 'Certificações', route: 'produtos/certificacoes', icon: 'verified' }
      ]
    },
    {
      title: 'Financeiro',
      icon: 'account_balance',
      items: [
        { name: 'Contas a Receber', route: 'financeiro/contas-receber', icon: 'trending_up' },
        { name: 'Câmbio', route: 'financeiro/cambio', icon: 'currency_exchange' },
        { name: 'Pagamentos', route: 'financeiro/pagamentos', icon: 'payment' }
      ]
    },
    {
      title: 'Rentabilidade',
      icon: 'analytics',
      items: [
        { name: 'Análise de Rentabilidade', route: 'rentabilidade/analise', icon: 'trending_up' },
        { name: 'Simulador', route: 'rentabilidade/simulador', icon: 'calculate' },
        { name: 'Cenários', route: 'rentabilidade/cenarios', icon: 'scenario' }
      ]
    }
  ];

  ngOnInit(): void {
    this.notificationService.showInfo('Bem-vindo à Export Intelligence Platform!');
    
    this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.TabletPortrait,
      '(max-width: 768px)'
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(result => {
      this.isHandset = result.matches;
    });
  }
  
  ngAfterViewInit(): void {
    // ViewChild inicializado
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    const width = event.target.innerWidth;
    this.isHandset = width <= 768;
  }
  
  toggleSidenav(): void {
    if (this.drawer) {
      this.drawer.toggle();
    }
  }

  handleMenuClick(route: string): void {
    // Fecha submenu expansível
    this.expandedMenu = '';
    
    // SOLUÇÃO DEFINITIVA: Fecha drawer e navega
    if (this.drawer?.opened) {
      this.drawer.close().then(() => {
        this.navigateTo(route);
      }).catch(() => {
        // Se close() falhar, força fechamento e navega
        setTimeout(() => {
          this.drawer.toggle(false);
          setTimeout(() => {
            this.navigateTo(route);
          }, 100);
        }, 50);
      });
    } else {
      this.navigateTo(route);
    }
  }
  
  toggleMenu(title: string): void {
    const wasExpanded = this.expandedMenu === title;
    this.expandedMenu = wasExpanded ? '' : title;
  }

  navigateTo(route: string): void {
    const implementedRoutes = [
      'cadastros/cidades', 'cadastros/psf-ubs', 'cadastros/usuarios',
      'fichas/cadastro-individual', 'fichas/cadastro-domiciliar', 'fichas/visita-domiciliar',
      'dashboards/principal', 'rentabilidade/analise', 'rentabilidade/simulador', 'rentabilidade/cenarios',
      'dashboards/criar', 'dashboards/meus', 'automacao/criar-regra', 'automacao/regras-ativas',
      'construtor/nova-tela', 'construtor/minhas-telas', 'assistente-ia',
      'financeiro/contas-receber', 'contratos/novo', 'contratos/ativos', 'contratos/templates',
      'produtos/catalogo', 'produtos/ncm', 'logistica/embarque', 'exportacoes/gerenciar',
      'exportacoes/pedidos', 'exportacoes/status'
    ];
    
    if (implementedRoutes.includes(route)) {
      this.notificationService.showInfo(`Acessando: ${route.split('/').pop()?.replace('-', ' ')}`);
      
      const currentUrl = this.router.url;
      const targetUrl = `/home-logged/${route}`;
      
      if (currentUrl === targetUrl) {
        return;
      }
      
      this.router.navigateByUrl(targetUrl).then(success => {
        if (!success) {
          this.notificationService.showError('Erro ao navegar para a página solicitada');
        }
      }).catch(error => {
        this.notificationService.showError('Erro ao navegar para a página solicitada');
      });
    } else {
      this.notificationService.showInfo(`Funcionalidade "${route.split('/').pop()?.replace('-', ' ')}" em desenvolvimento`);
    }
  }

  performSearch(): void {
    if (this.searchQuery.trim()) {
      this.notificationService.showInfo(`Buscando por: "${this.searchQuery}"`);
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
    }
  }

  markAllAsRead(): void {
    this.notificationCount = 0;
    this.notificationService.showSuccess('Todas as notificações foram marcadas como lidas');
  }

  handleNotification(notification: any): void {
    this.notificationService.showInfo(`Abrindo: ${notification.title}`);
  }

  viewAllNotifications(): void {
    this.notificationService.showInfo('Abrindo painel de notificações');
  }

  refreshIntegrations(): void {
    this.notificationService.showLoading({
      title: 'Atualizando...',
      message: 'Verificando status das integrações'
    });
    
    setTimeout(() => {
      this.notificationService.hideLoading();
      this.notificationService.showSuccess('Status das integrações atualizado');
    }, 2000);
  }

  viewIntegrationDetails(integration: any): void {
    this.notificationService.showInfo(`Detalhes da integração: ${integration.name}`);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'notifications';
    }
  }

  getIntegrationIcon(status: string): string {
    switch (status) {
      case 'online': return 'cloud_done';
      case 'offline': return 'cloud_off';
      case 'warning': return 'cloud_queue';
      default: return 'cloud';
    }
  }

  viewProfile(): void {
    this.notificationService.showInfo('Abrindo perfil do usuário');
  }

  openSettings(): void {
    this.notificationService.showInfo('Abrindo configurações');
  }

  viewHelp(): void {
    this.notificationService.showInfo('Abrindo central de ajuda');
  }

  logout(): void {
    this.notificationService.showInfo('Fazendo logout...');
  }

  toggleAIAssistant(): void {
    this.notificationService.showInfo('Abrindo AI Assistant...');
  }
  
  onBackdropClick(): void {
    if (this.drawer?.opened) {
      this.drawer.close();
    }
  }

  onEscapeKey(): void {
    if (this.drawer?.opened) {
      this.drawer.close();
    }
  }
  
  onSidenavOpened(): void {
    // Sidenav aberto
  }
  
  onSidenavClosed(): void {
    this.expandedMenu = ''; 
  }
}
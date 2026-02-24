import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
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
    MatExpansionModule,
    MatTooltipModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    AiCopilotComponent
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      
      <!-- Sidebar -->
      <mat-sidenav 
        #drawer 
        class="sidenav" 
        fixedInViewport 
        [attr.role]="'navigation'"
        [mode]="isHandset ? 'over' : 'side'"
        [opened]="!isHandset">
        
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
            <mat-expansion-panel 
              *ngIf="item.items; else simpleMenuItem"
              class="menu-expansion-panel"
              [expanded]="item.title === expandedMenu">
              
              <mat-expansion-panel-header 
                class="menu-header"
                (click)="toggleMenu(item.title)">
                <mat-panel-title class="menu-title">
                  <mat-icon class="menu-icon">{{ item.icon }}</mat-icon>
                  <span>{{ item.title }}</span>
                </mat-panel-title>
              </mat-expansion-panel-header>

              <div class="submenu-container">
                <mat-list-item 
                  *ngFor="let subItem of item.items"
                  class="submenu-item"
                  (click)="navigateTo(subItem.route); drawer.close()">
                  <mat-icon matListItemIcon>{{ subItem.icon }}</mat-icon>
                  <span matListItemTitle>{{ subItem.name }}</span>
                </mat-list-item>
              </div>
            </mat-expansion-panel>

            <!-- Menu simples -->
            <ng-template #simpleMenuItem>
              <mat-list-item 
                class="menu-item"
                (click)="navigateTo(item.route!); drawer.close()">
                <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                <span matListItemTitle>{{ item.title }}</span>
              </mat-list-item>
            </ng-template>

          </ng-container>
        </mat-nav-list>
      </mat-sidenav>

      <!-- Main Content -->
      <mat-sidenav-content>
        
        <!-- Enhanced Toolbar -->
        <mat-toolbar color="primary" class="main-toolbar">
          <!-- Menu Toggle -->
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="drawer.toggle()">
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
            <button mat-button class="ai-status-btn">
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
    * {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .logged-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .sidenav-container {
      flex: 1;
    }

    .sidenav {
      width: 280px;
      background: #fafafa;
      border-right: 1px solid #e0e0e0;
    }

    .sidenav-header {
      background: linear-gradient(135deg, #1976d2, #1565c0);
      color: white;
      padding: 24px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .logo-container {
      text-align: center;
    }

    .logo-icon {
      font-size: 2.5rem !important;
      width: 2.5rem !important;
      height: 2.5rem !important;
      color: #fff;
      margin-bottom: 8px;
    }

    .logo-text {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(45deg, #fff, #e3f2fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .logo-subtitle {
      display: block;
      font-size: 0.75rem;
      opacity: 0.8;
      margin-top: 4px;
      font-weight: 300;
      letter-spacing: 1px;
    }

    .nav-list {
      padding: 0;
    }

    .menu-expansion {
      box-shadow: none !important;
      background: transparent !important;
    }

    .submenu {
      background: #f5f5f5;
      padding: 0;
    }

    .submenu a {
      padding-left: 32px !important;
      height: 40px !important;
      font-size: 14px;
    }

    .main-toolbar {
      background: linear-gradient(135deg, #1976d2, #1565c0);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      height: 64px;
      padding: 0 16px;
    }

    .search-container {
      display: flex;
      align-items: center;
      background: rgba(255,255,255,0.15);
      border-radius: 24px;
      padding: 0 16px;
      margin-left: 24px;
      flex: 1;
      max-width: 400px;
      transition: all 0.3s ease;
    }

    .search-container:focus-within {
      background: rgba(255,255,255,0.25);
      transform: scale(1.02);
    }

    .search-icon {
      color: rgba(255,255,255,0.7);
      margin-right: 8px;
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      color: white;
      font-size: 14px;
      padding: 8px 0;
      outline: none;
    }

    .search-input::placeholder {
      color: rgba(255,255,255,0.7);
    }

    .toolbar-spacer {
      flex: 1;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .exchange-rate-btn,
    .ai-status-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      color: white;
      padding: 6px 12px;
      border-radius: 16px;
      background: rgba(255,255,255,0.1);
      transition: all 0.3s ease;
    }

    .exchange-rate-btn:hover,
    .ai-status-btn:hover {
      background: rgba(255,255,255,0.2);
    }

    .trend-up {
      color: #4caf50;
      font-size: 18px !important;
    }

    .ai-icon {
      color: #ff9800;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-left: 4px;
    }

    .status-dot.online {
      background: #4caf50;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
      70% { box-shadow: 0 0 0 8px rgba(76, 175, 80, 0); }
      100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
    }

    /* Menu Styles */
    .menu-expansion-panel {
      background: transparent !important;
      box-shadow: none !important;
      border-radius: 0 !important;
    }

    .menu-header {
      padding: 12px 16px !important;
      border-radius: 8px !important;
      margin: 4px 8px !important;
      transition: all 0.3s ease !important;
    }

    .menu-header:hover {
      background: rgba(25, 118, 210, 0.08) !important;
    }

    .menu-title {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      font-weight: 500 !important;
    }

    .menu-icon {
      color: #1976d2 !important;
    }

    .submenu-container {
      background: #f8f9fa;
      border-left: 3px solid #1976d2;
      margin-left: 16px;
    }

    .submenu-item {
      border-radius: 0 8px 8px 0 !important;
      margin: 2px 0 !important;
      transition: all 0.3s ease !important;
    }

    .submenu-item:hover {
      background: rgba(25, 118, 210, 0.08) !important;
      transform: translateX(4px);
    }

    .menu-item {
      border-radius: 8px !important;
      margin: 4px 8px !important;
      transition: all 0.3s ease !important;
    }

    .menu-item:hover {
      background: rgba(25, 118, 210, 0.08) !important;
      transform: translateX(4px);
    }

    /* Menu Dropdown Styles */
    .notification-menu,
    .integration-menu {
      min-width: 320px;
      max-height: 400px;
      overflow-y: auto;
    }

    .menu-header {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8f9fa;
    }

    .menu-header h3 {
      margin: 0;
      color: #333;
      font-size: 1rem;
      font-weight: 600;
    }

    .notification-content,
    .integration-content {
      display: flex;
      flex-direction: column;
      margin-left: 8px;
    }

    .notification-title,
    .integration-name {
      font-weight: 500;
      color: #333;
    }

    .notification-time,
    .integration-status {
      font-size: 0.8rem;
      color: #666;
    }

    /* Notification Types */
    .notification-success { color: #4caf50; }
    .notification-warning { color: #ff9800; }
    .notification-error { color: #f44336; }
    .notification-info { color: #2196f3; }

    /* Integration Status */
    .status-online { color: #4caf50; }
    .status-offline { color: #f44336; }
    .status-warning { color: #ff9800; }

    /* Responsive */
    @media (max-width: 768px) {
      .search-container {
        max-width: 200px;
        margin-left: 8px;
      }

      .exchange-rate-btn,
      .ai-status-btn {
        display: none;
      }

      .toolbar-actions {
        gap: 4px;
      }

      .notification-menu,
      .integration-menu {
        min-width: 280px;
      }
    }

    @media (max-width: 480px) {
      .search-container {
        display: none;
      }

      .main-toolbar {
        padding: 0 8px;
      }
    }
  `]
})
export class HomeLoggedComponent implements OnInit {
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  expandedMenu = '';
  isHandset = false; // Para responsividade
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

  ngOnInit(): void {
    this.notificationService.showInfo('Bem-vindo à Export Intelligence Platform!');
  }

  toggleMenu(title: string): void {
    this.expandedMenu = this.expandedMenu === title ? '' : title;
  }

  // Nova estrutura de menus para Export Intelligence Platform
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
      title: 'Lotes',
      icon: 'inventory_2',
      items: [
        { name: 'Controle de Lotes', route: 'lotes/controle', icon: 'qr_code' },
        { name: 'Rastreabilidade', route: 'lotes/rastreabilidade', icon: 'timeline' }
      ]
    },
    {
      title: 'Documentos',
      icon: 'folder',
      items: [
        { name: 'DU-E', route: 'documentos/due', icon: 'description' },
        { name: 'RE', route: 'documentos/re', icon: 'receipt_long' },
        { name: 'Certificados', route: 'documentos/certificados', icon: 'verified' },
        { name: 'Invoice', route: 'documentos/invoice', icon: 'receipt' }
      ]
    },
    {
      title: 'Logística',
      icon: 'local_shipping',
      items: [
        { name: 'Embarques', route: 'logistica/embarques', icon: 'departure_board' },
        { name: 'Portos', route: 'logistica/portos', icon: 'anchor' },
        { name: 'Transportadoras', route: 'logistica/transportadoras', icon: 'truck' }
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
      title: 'Compliance',
      icon: 'gavel',
      items: [
        { name: 'Licenças', route: 'compliance/licencas', icon: 'assignment' },
        { name: 'Regulamentações', route: 'compliance/regulamentacoes', icon: 'policy' }
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
    },
    {
      title: 'Integrações Governamentais',
      icon: 'connect_without_contact',
      items: [
        { name: 'Siscomex', route: 'integracoes/siscomex', icon: 'cloud_sync' },
        { name: 'MAPA', route: 'integracoes/mapa', icon: 'agriculture' },
        { name: 'Status Serviços', route: 'integracoes/status', icon: 'cloud_done' }
      ]
    },
    {
      title: 'Dashboards Personalizados',
      icon: 'dashboard_customize',
      items: [
        { name: 'Criar Dashboard', route: 'dashboards/criar', icon: 'add_box' },
        { name: 'Meus Dashboards', route: 'dashboards/meus', icon: 'view_quilt' },
        { name: 'Compartilhados', route: 'dashboards/compartilhados', icon: 'share' }
      ]
    },
    {
      title: 'Automação e Regras',
      icon: 'auto_awesome',
      items: [
        { name: 'Criar Regra', route: 'automacao/criar-regra', icon: 'rule' },
        { name: 'Regras Ativas', route: 'automacao/regras-ativas', icon: 'rule_folder' },
        { name: 'Histórico', route: 'automacao/historico', icon: 'history' }
      ]
    },
    {
      title: 'Construtor de Telas',
      icon: 'web',
      items: [
        { name: 'Nova Tela', route: 'construtor/nova-tela', icon: 'add_box' },
        { name: 'Minhas Telas', route: 'construtor/minhas-telas', icon: 'web' },
        { name: 'Templates', route: 'construtor/templates', icon: 'template' }
      ]
    },
    {
      title: 'Assistente IA',
      icon: 'smart_toy',
      route: 'assistente-ia'
    },
    {
      title: 'Relatórios',
      icon: 'assessment',
      items: [
        { name: 'Exportações', route: 'relatorios/exportacoes', icon: 'flight_takeoff' },
        { name: 'Rentabilidade', route: 'relatorios/rentabilidade', icon: 'trending_up' },
        { name: 'Compliance', route: 'relatorios/compliance', icon: 'gavel' },
        { name: 'Logística', route: 'relatorios/logistica', icon: 'local_shipping' }
      ]
    },
    {
      title: 'Administração',
      icon: 'settings',
      items: [
        { name: 'Usuários', route: 'admin/usuarios', icon: 'group' },
        { name: 'Empresas', route: 'admin/empresas', icon: 'business' },
        { name: 'Configurações', route: 'admin/configuracoes', icon: 'tune' },
        { name: 'Auditoria', route: 'admin/auditoria', icon: 'history' }
      ]
    }
  ];

  // Método para atualizar navegação com as novas rotas
  navigateTo(route: string): void {
    console.log('🚀 Navegando para:', route);
    
    // Lista de rotas implementadas - expandida para EIP
    const implementedRoutes = [
      // Módulos existentes
      'cadastros/cidades',
      'cadastros/psf-ubs', 
      'cadastros/usuarios',
      'fichas/cadastro-individual',
      'fichas/cadastro-domiciliar',
      'fichas/visita-domiciliar',
      
      // Novos módulos EIP
      'dashboards/principal',  // Corrigido: era 'dashboard'
      'rentabilidade/analise',
      'rentabilidade/simulador',
      'rentabilidade/cenarios',
      'dashboards/criar',
      'dashboards/meus',
      'automacao/criar-regra',
      'automacao/regras-ativas',
      'construtor/nova-tela',
      'construtor/minhas-telas',
      'assistente-ia',
      
      // Módulo Financeiro
      'financeiro/contas-receber'
    ];
    
    if (implementedRoutes.includes(route)) {
      this.notificationService.showInfo(`Acessando: ${route.split('/').pop()?.replace('-', ' ')}`);
      
      // Evitar navegação se já estamos na rota
      const currentUrl = this.router.url;
      const targetUrl = `/home-logged/${route}`;
      
      if (currentUrl === targetUrl) {
        console.log('🔄 Já estamos na rota:', targetUrl);
        return;
      }
      
      console.log('🎯 Navegando de:', currentUrl, 'para:', targetUrl);
      
      this.router.navigateByUrl(targetUrl).then(success => {
        if (success) {
          console.log('✅ Navegação bem-sucedida para:', targetUrl);
        } else {
          console.error('❌ Falha na navegação para:', targetUrl);
          this.notificationService.showError('Erro ao navegar para a página solicitada');
        }
      }).catch(error => {
        console.error('❌ Erro durante navegação:', error);
        this.notificationService.showError('Erro ao navegar para a página solicitada');
      });
    } else {
      this.notificationService.showInfo(`Funcionalidade "${route.split('/').pop()?.replace('-', ' ')}" em desenvolvimento`);
    }
  }

  performSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      this.notificationService.showInfo(`Buscando por: "${this.searchQuery}"`);
      // Implementar busca global
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'k') {
      this.focusSearch(event);
    }
  }

  focusSearch(event: KeyboardEvent): void {
    event.preventDefault();
    // Focus on search input
  }

  markAllAsRead(): void {
    this.notificationCount = 0;
    this.notificationService.showSuccess('Todas as notificações foram marcadas como lidas');
  }

  handleNotification(notification: any): void {
    console.log('Handling notification:', notification);
    this.notificationService.showInfo(`Abrindo: ${notification.title}`);
  }

  viewAllNotifications(): void {
    console.log('View all notifications');
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
    console.log('View integration details:', integration);
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
    // Implement logout logic
  }
}



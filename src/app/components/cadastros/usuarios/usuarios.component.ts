import { Component, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { NestedTreeControl } from '@angular/cdk/tree';
import { UsuarioCreateDialogComponent } from './usuario-create-dialog/usuario-create-dialog.component';
import { NotificationService } from '../../../services/notification.service';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  dataCadastro: Date;
  status: 'Ativo' | 'Inativo';
  dataUltimoAcesso: Date;
}

export interface TipoPerfil {
  id: string;
  nome: string;
  descricao: string;
}

export interface MenuNode {
  name: string;
  icon?: string;
  children?: MenuNode[];
  actions?: ActionNode[];
  permissions?: {
    [profileId: string]: boolean;
  };
}

export interface ActionNode {
  name: string;
  type: 'button' | 'field';
  permissions?: {
    [profileId: string]: boolean;
  };
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatTreeModule,
    MatCheckboxModule,
    MatTooltipModule
  ],
  template: `
    <div class="usuarios-container">
      <!-- Header -->
      <div class="page-header">
        <h1>
          <mat-icon>group</mat-icon>
          Cadastro de Usuários
        </h1>
        <p>Gerencie usuários e permissões do sistema</p>
      </div>

      <!-- Cards Container -->
      <div class="cards-container">
        
        <!-- Card Esquerdo - Gestão de Usuários -->
        <mat-card class="left-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>person_add</mat-icon>
              Gestão de Usuários
            </mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <!-- Tipo de Perfil -->
            <div class="form-section">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tipo de Perfil</mat-label>
                <mat-icon matPrefix>security</mat-icon>
                <mat-select [formControl]="tipoPerfilControl" 
                          (selectionChange)="onPerfilChange($event)">
                  <mat-option value="">Selecione um perfil</mat-option>
                  <mat-option *ngFor="let perfil of tiposPerfil" [value]="perfil.id">
                    {{perfil.nome}} - {{perfil.descricao}}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Seleção de Usuário com Botões Alinhados -->
            <div class="form-section">
              <div class="user-selection-container">
                <!-- Campo de seleção -->
                <div class="user-select-wrapper">
                  <mat-form-field appearance="outline" class="user-select-field">
                    <mat-label>Usuários Cadastrados</mat-label>
                    <mat-icon matPrefix>person</mat-icon>
                    <mat-select [formControl]="usuarioSelecionadoControl">
                      <mat-option value="">Selecione um usuário</mat-option>
                      <mat-option *ngFor="let user of usuariosCadastrados" [value]="user.id">
                        {{user.nome}} - {{user.email}}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
                
                <!-- Botões alinhados -->
                <div class="action-buttons-wrapper">
                  <button mat-raised-button 
                          color="accent"
                          (click)="openCreateUserDialog()"
                          matTooltip="Criar novo usuário"
                          class="action-btn">
                    <mat-icon>add</mat-icon>
                    Novo Usuário
                  </button>
                  
                  <button mat-raised-button 
                          color="primary"
                          [disabled]="!usuarioSelecionadoControl.value || !tipoPerfilControl.value"
                          (click)="adicionarUsuario()"
                          matTooltip="Adicionar usuário ao perfil"
                          class="action-btn">
                    <mat-icon>person_add</mat-icon>
                    Adicionar
                  </button>
                </div>
              </div>
            </div>

            <!-- Grid de Usuários -->
            <div class="grid-section">
              <div class="grid-header">
                <h3>
                  <mat-icon>list</mat-icon>
                  Usuários do Perfil
                </h3>
                <div class="grid-info" *ngIf="perfilSelecionado">
                  <mat-icon class="info-icon">info</mat-icon>
                  <span>{{dataSource.data.length}} usuário(s) no perfil: {{getPerfilNome()}}</span>
                </div>
              </div>
              
              <div class="table-container">
                <table mat-table 
                       [dataSource]="dataSource" 
                       matSort
                       class="usuarios-table">

                  <!-- Coluna Usuário -->
                  <ng-container matColumnDef="usuario">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>
                      <mat-icon>person</mat-icon>
                      Usuário
                    </th>
                    <td mat-cell *matCellDef="let usuario">
                      <div class="user-cell">
                        <div class="user-avatar">
                          <mat-icon>account_circle</mat-icon>
                        </div>
                        <div class="user-info">
                          <strong>{{usuario.nome}}</strong>
                          <br>
                          <small>{{usuario.email}}</small>
                        </div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Coluna Data Cadastro -->
                  <ng-container matColumnDef="dataCadastro">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>
                      <mat-icon>calendar_today</mat-icon>
                      Data Cadastro
                    </th>
                    <td mat-cell *matCellDef="let usuario">
                      <span class="date-cell">
                        {{usuario.dataCadastro | date:'dd/MM/yyyy HH:mm'}}
                      </span>
                    </td>
                  </ng-container>

                  <!-- Coluna Status -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>
                      <mat-icon>info</mat-icon>
                      Status
                    </th>
                    <td mat-cell *matCellDef="let usuario">
                      <span class="status-cell" [class]="'status-' + usuario.status.toLowerCase()">
                        <mat-icon>{{getStatusIcon(usuario.status)}}</mat-icon>
                        {{usuario.status}}
                      </span>
                    </td>
                  </ng-container>

                  <!-- Coluna Último Acesso -->
                  <ng-container matColumnDef="dataUltimoAcesso">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>
                      <mat-icon>schedule</mat-icon>
                      Último Acesso
                    </th>
                    <td mat-cell *matCellDef="let usuario">
                      <span class="date-cell">
                        {{usuario.dataUltimoAcesso | date:'dd/MM/yyyy HH:mm'}}
                      </span>
                    </td>
                  </ng-container>

                  <!-- Coluna Ações -->
                  <ng-container matColumnDef="acoes">
                    <th mat-header-cell *matHeaderCellDef>
                      <mat-icon>settings</mat-icon>
                      Ações
                    </th>
                    <td mat-cell *matCellDef="let usuario">
                      <div class="table-actions">
                        <button mat-icon-button 
                                matTooltip="Editar usuário"
                                (click)="editarUsuario(usuario); $event.stopPropagation()">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button 
                                [matTooltip]="usuario.status === 'Ativo' ? 'Desativar usuário' : 'Ativar usuário'"
                                (click)="toggleStatusUsuario(usuario); $event.stopPropagation()">
                          <mat-icon>{{usuario.status === 'Ativo' ? 'block' : 'check_circle'}}</mat-icon>
                        </button>
                      </div>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumnsExpanded"></tr>
                  <tr mat-row 
                      *matRowDef="let row; columns: displayedColumnsExpanded;"
                      (dblclick)="removerUsuario(row)"
                      class="data-row"
                      matTooltip="Duplo clique para remover do perfil">
                  </tr>
                </table>

                <!-- Paginação -->
                <mat-paginator #paginator
                               [pageSizeOptions]="[5, 10, 25, 50]"
                               [pageSize]="10"
                               [showFirstLastButtons]="true"
                               aria-label="Selecione a página">
                </mat-paginator>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Card Direito - Árvore de Permissões -->
        <mat-card class="right-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>account_tree</mat-icon>
              Permissões do Sistema
            </mat-card-title>
            <mat-card-subtitle *ngIf="perfilSelecionado">
              Configurando permissões para: <strong>{{getPerfilNome()}}</strong>
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="permissions-section" *ngIf="perfilSelecionado; else noProfileSelected">
              <div class="permissions-header">
                <mat-icon>settings</mat-icon>
                <span>Configure as permissões para cada funcionalidade</span>
                <div class="permissions-stats">
                  <span class="stats-item">
                    <mat-icon>check_circle</mat-icon>
                    {{getPermissionsCount().enabled}} habilitadas
                  </span>
                  <span class="stats-item">
                    <mat-icon>cancel</mat-icon>
                    {{getPermissionsCount().disabled}} desabilitadas
                  </span>
                </div>
              </div>
              
              <div class="permissions-actions">
                <button mat-button (click)="expandirTodos()" class="tree-action-btn">
                  <mat-icon>unfold_more</mat-icon>
                  Expandir Todos
                </button>
                <button mat-button (click)="recolherTodos()" class="tree-action-btn">
                  <mat-icon>unfold_less</mat-icon>
                  Recolher Todos
                </button>
                <button mat-button (click)="habilitarTodos()" class="tree-action-btn">
                  <mat-icon>check_box</mat-icon>
                  Habilitar Todos
                </button>
                <button mat-button (click)="desabilitarTodos()" class="tree-action-btn">
                  <mat-icon>check_box_outline_blank</mat-icon>
                  Desabilitar Todos
                </button>
              </div>
              
              <mat-tree [dataSource]="menuDataSource" 
                       [treeControl]="treeControl" 
                       class="permissions-tree">
                
                <!-- Nó de Folha (Tela) -->
                <mat-tree-node *matTreeNodeDef="let node" 
                              matTreeNodePadding 
                              class="tree-leaf-node">
                  <button mat-icon-button disabled></button>
                  
                  <div class="node-content">
                    <div class="node-header">
                      <mat-icon class="node-icon">{{node.icon || 'description'}}</mat-icon>
                      <span class="node-name">{{node.name}}</span>
                      <mat-checkbox 
                        [checked]="getNodePermission(node)"
                        (change)="toggleNodePermission(node, $event)"
                        [disabled]="!perfilSelecionado"
                        class="node-checkbox">
                      </mat-checkbox>
                    </div>
                    
                    <!-- Ações da Tela -->
                    <div class="actions-list" *ngIf="node.actions && node.actions.length > 0">
                      <div class="action-item" *ngFor="let action of node.actions">
                        <mat-icon class="action-icon">
                          {{getActionIcon(action.type)}}
                        </mat-icon>
                        <span class="action-name">{{action.name}}</span>
                        <mat-checkbox 
                          [checked]="getActionPermission(action)"
                          (change)="toggleActionPermission(action, $event)"
                          [disabled]="!perfilSelecionado || !getNodePermission(node)"
                          class="action-checkbox">
                        </mat-checkbox>
                      </div>
                    </div>
                  </div>
                </mat-tree-node>

                <!-- Nó com Filhos (Menu) -->
                <mat-tree-node *matTreeNodeDef="let node; when: hasChild" 
                              matTreeNodePadding 
                              class="tree-parent-node">
                  <button mat-icon-button 
                          matTreeNodeToggle 
                          [attr.aria-label]="'Toggle ' + node.name"
                          class="tree-toggle-button">
                    <mat-icon class="mat-icon-rtl-mirror">
                      {{treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right'}}
                    </mat-icon>
                  </button>
                  
                  <div class="node-content">
                    <div class="node-header">
                      <mat-icon class="node-icon">{{node.icon || 'folder'}}</mat-icon>
                      <span class="node-name">{{node.name}}</span>
                      <span class="children-count" *ngIf="node.children">
                        ({{node.children.length}} itens)
                      </span>
                      <mat-checkbox 
                        [checked]="getNodePermission(node)"
                        (change)="toggleNodePermission(node, $event)"
                        [disabled]="!perfilSelecionado"
                        class="node-checkbox">
                      </mat-checkbox>
                    </div>
                  </div>
                </mat-tree-node>
              </mat-tree>
            </div>
            
            <ng-template #noProfileSelected>
              <div class="no-profile-message">
                <mat-icon class="large-icon">security</mat-icon>
                <h3>Selecione um Tipo de Perfil</h3>
                <p>Escolha um perfil no card à esquerda para configurar suas permissões</p>
                <div class="profile-suggestions">
                  <h4>Perfis Disponíveis:</h4>
                  <div class="profile-cards">
                    <div class="profile-card" *ngFor="let perfil of tiposPerfil" 
                         (click)="selecionarPerfil(perfil.id)">
                      <mat-icon>{{getPerfilIcon(perfil.id)}}</mat-icon>
                      <strong>{{perfil.nome}}</strong>
                      <span>{{perfil.descricao}}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ng-template>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Botões de Ação Alinhados com Card Direito -->
      <div class="action-buttons-container">
        <div class="action-buttons">
          <button mat-raised-button 
                  (click)="limparCampos()"
                  class="cancel-button">
            <mat-icon>clear</mat-icon>
            Cancelar
          </button>
          
          <button mat-raised-button 
                  color="primary"
                  (click)="salvarPermissoes()"
                  [disabled]="!perfilSelecionado"
                  class="save-button">
            <mat-icon>save</mat-icon>
            Salvar Permissões
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .usuarios-container {
      padding: 24px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .page-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .page-header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #1976d2;
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }

    .page-header h1 mat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
    }

    .page-header p {
      color: #666;
      font-size: 1.2rem;
      font-weight: 400;
    }

    .cards-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
      max-width: 1800px;
      margin-left: auto;
      margin-right: auto;
    }

    .left-card,
    .right-card {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      height: fit-content;
    }

    .left-card {
      min-height: 600px;
    }

    .right-card {
      min-height: 600px;
      max-height: 800px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .right-card mat-card-content {
      flex: 1;
      overflow: hidden;
    }

    .form-section {
      margin-bottom: 24px;
    }

    .full-width {
      width: 100%;
    }

    /* Correção 1: Alinhamento dos botões com o combo */
    .user-selection-container {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 16px;
      align-items: end;
    }

    .user-select-wrapper {
      display: flex;
      flex-direction: column;
    }

    .user-select-field {
      width: 100%;
      min-width: 300px;
    }

    .action-buttons-wrapper {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
    }

    .action-btn {
      height: 56px !important;
      min-width: 140px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
    }

    .grid-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #333;
      margin-bottom: 16px;
    }

    .grid-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .grid-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 0.9rem;
    }

    .info-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: #1976d2;
    }

    .table-container {
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
      background: white;
    }

    .usuarios-table {
      width: 100%;
    }

    .usuarios-table th {
      background: #f5f5f5;
      font-weight: 600;
      color: #333;
      padding: 16px;
    }

    .usuarios-table th mat-icon {
      margin-right: 8px;
      vertical-align: middle;
    }

    .usuarios-table td {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .data-row {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .data-row:hover {
      background-color: #f8f9fa;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      color: #1976d2;
    }

    .user-avatar mat-icon {
      font-size: 32px !important;
      width: 32px !important;
      height: 32px !important;
    }

    .user-info {
      flex: 1;
    }

    .user-cell strong {
      color: #333;
    }

    .user-cell small {
      color: #666;
    }

    .date-cell {
      color: #666;
      font-family: 'Fira Code', monospace;
      font-size: 0.9rem;
    }

    .table-actions {
      display: flex;
      gap: 4px;
    }

    .status-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 500;
      font-size: 0.9rem;
      width: fit-content;
    }

    .status-cell mat-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    .status-ativo {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .status-inativo {
      background: #ffebee;
      color: #c62828;
    }

    .permissions-section {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .permissions-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
      color: #666;
      font-weight: 500;
      flex-wrap: wrap;
    }

    .permissions-stats {
      margin-left: auto;
      display: flex;
      gap: 16px;
    }

    .stats-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.85rem;
    }

    .permissions-actions {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .tree-action-btn {
      min-height: 32px;
      font-size: 0.85rem;
      padding: 0 12px;
    }

    .permissions-tree {
      flex: 1;
      overflow-y: auto;
      max-height: 500px;
    }

    .tree-leaf-node,
    .tree-parent-node {
      min-height: 48px;
      border-bottom: 1px solid #f0f0f0;
    }

    /* Correção 2: Melhorar funcionamento da árvore */
    .tree-toggle-button {
      color: #1976d2 !important;
      background: transparent !important;
    }

    .tree-toggle-button:hover {
      background-color: rgba(25, 118, 210, 0.1) !important;
    }

    .tree-toggle-button mat-icon {
      transition: transform 0.3s ease;
    }

    .node-content {
      width: 100%;
      padding: 8px 0;
    }

    .node-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
    }

    .node-icon {
      color: #1976d2;
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
    }

    .node-name {
      flex: 1;
      font-weight: 500;
      color: #333;
    }

    .node-checkbox {
      margin-left: auto;
    }

    .children-count {
      font-size: 0.8rem;
      color: #999;
      margin-left: 8px;
    }

    .actions-list {
      margin-top: 8px;
      margin-left: 28px;
      padding-left: 16px;
      border-left: 2px solid #e0e0e0;
    }

    .action-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      min-height: 32px;
    }

    .action-icon {
      color: #666;
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    .action-name {
      flex: 1;
      font-size: 0.9rem;
      color: #555;
    }

    .action-checkbox {
      margin-left: auto;
    }

    .no-profile-message {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .large-icon {
      font-size: 4rem !important;
      width: 4rem !important;
      height: 4rem !important;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-profile-message h3 {
      margin: 16px 0 8px 0;
      color: #333;
    }

    .profile-suggestions {
      margin-top: 32px;
    }

    .profile-suggestions h4 {
      color: #333;
      margin-bottom: 16px;
    }

    .profile-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .profile-card {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
      background: white;
    }

    .profile-card:hover {
      border-color: #1976d2;
      background: #f8f9fa;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .profile-card mat-icon {
      font-size: 32px !important;
      width: 32px !important;
      height: 32px !important;
      color: #1976d2;
      margin-bottom: 8px;
    }

    .profile-card strong {
      display: block;
      margin-bottom: 4px;
      color: #333;
    }

    .profile-card span {
      font-size: 0.85rem;
      color: #666;
    }

    .action-buttons-container {
      max-width: 1800px;
      margin: 32px auto 0 auto;
      display: flex;
      justify-content: flex-end;
    }

    .action-buttons {
      display: flex;
      gap: 24px;
      width: calc(50% - 12px); /* Alinha com o card direito */
      justify-content: flex-end;
    }

    .cancel-button,
    .save-button {
      min-width: 140px;
      height: 48px;
      font-weight: 600;
      font-size: 1rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .cards-container {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .user-selection-container {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .action-buttons-wrapper {
        justify-content: stretch;
        width: 100%;
      }

      .action-btn {
        flex: 1;
      }

      .action-buttons-container {
        justify-content: center;
      }

      .action-buttons {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 768px) {
      .usuarios-container {
        padding: 16px;
      }

      .page-header h1 {
        font-size: 2rem;
        flex-direction: column;
        gap: 8px;
      }

      .usuarios-table {
        font-size: 0.9rem;
      }

      .action-buttons {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .permissions-tree {
        max-height: 400px;
      }

      .permissions-actions {
        flex-direction: column;
      }

      .tree-action-btn {
        width: 100%;
      }

      .profile-cards {
        grid-template-columns: 1fr;
      }

      .action-buttons-wrapper {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class UsuariosComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  displayedColumns: string[] = ['usuario', 'dataCadastro', 'status', 'dataUltimoAcesso'];
  displayedColumnsExpanded: string[] = ['usuario', 'dataCadastro', 'status', 'dataUltimoAcesso', 'acoes'];
  dataSource = new MatTableDataSource<Usuario>([]);
  
  tipoPerfilControl = new FormControl('');
  usuarioSelecionadoControl = new FormControl('');
  
  perfilSelecionado: string | null = null;
  
  // Tree Control para permissões
  treeControl = new NestedTreeControl<MenuNode>(node => node.children);
  menuDataSource = new MatTreeNestedDataSource<MenuNode>();

  // Mock data
  tiposPerfil: TipoPerfil[] = [
    { id: 'admin', nome: 'Administrador', descricao: 'Acesso total ao sistema' },
    { id: 'medico', nome: 'Médico', descricao: 'Acesso a funcionalidades médicas' },
    { id: 'enfermeiro', nome: 'Enfermeiro', descricao: 'Acesso a funcionalidades de enfermagem' },
    { id: 'agente', nome: 'Agente de Saúde', descricao: 'Acesso a cadastros e visitas' },
    { id: 'recepcionista', nome: 'Recepcionista', descricao: 'Acesso a agendamentos' }
  ];

  usuariosCadastrados: Usuario[] = [
    { id: 1, nome: 'João Silva', email: 'joao@psf.gov.br', perfil: 'admin', dataCadastro: new Date('2024-01-15'), status: 'Ativo', dataUltimoAcesso: new Date('2024-03-20T14:30:00') },
    { id: 2, nome: 'Maria Santos', email: 'maria@psf.gov.br', perfil: 'medico', dataCadastro: new Date('2024-02-10'), status: 'Ativo', dataUltimoAcesso: new Date('2024-03-19T16:45:00') },
    { id: 3, nome: 'Pedro Costa', email: 'pedro@psf.gov.br', perfil: 'enfermeiro', dataCadastro: new Date('2024-02-20'), status: 'Inativo', dataUltimoAcesso: new Date('2024-03-15T09:20:00') }
  ];

  // Estrutura de menus baseada no sistema atual - EXPANDIDA
  menuData: MenuNode[] = [
    {
      name: 'Cadastros',
      icon: 'person_add',
      permissions: {},
      children: [
        {
          name: 'Cidades',
          icon: 'location_city',
          permissions: {},
          actions: [
            { name: 'Visualizar Lista', type: 'field', permissions: {} },
            { name: 'Novo Registro', type: 'button', permissions: {} },
            { name: 'Alteração de Registro', type: 'button', permissions: {} },
            { name: 'Exclusão de Registro', type: 'button', permissions: {} },
            { name: 'Filtrar Dados', type: 'field', permissions: {} },
            { name: 'Exportar Dados', type: 'button', permissions: {} },
            { name: 'Importar Dados', type: 'button', permissions: {} }
          ]
        },
        {
          name: 'PSF/UBS',
          icon: 'business',
          permissions: {},
          actions: [
            { name: 'Visualizar Lista', type: 'field', permissions: {} },
            { name: 'Novo Registro', type: 'button', permissions: {} },
            { name: 'Alteração de Registro', type: 'button', permissions: {} },
            { name: 'Exclusão de Registro', type: 'button', permissions: {} },
            { name: 'Filtrar por Cidade', type: 'field', permissions: {} },
            { name: 'Exportar Relatório', type: 'button', permissions: {} }
          ]
        },
        {
          name: 'Usuários',
          icon: 'group',
          permissions: {},
          actions: [
            { name: 'Visualizar Lista', type: 'field', permissions: {} },
            { name: 'Novo Registro', type: 'button', permissions: {} },
            { name: 'Alteração de Registro', type: 'button', permissions: {} },
            { name: 'Exclusão de Registro', type: 'button', permissions: {} },
            { name: 'Gerenciar Permissões', type: 'button', permissions: {} },
            { name: 'Resetar Senha', type: 'button', permissions: {} },
            { name: 'Ativar/Desativar Usuário', type: 'button', permissions: {} }
          ]
        }
      ]
    },
    {
      name: 'Fichas de Registros',
      icon: 'assignment',
      permissions: {},
      children: [
        {
          name: 'Cadastro Individual',
          icon: 'person',
          permissions: {},
          actions: [
            { name: 'Visualizar Cadastros', type: 'field', permissions: {} },
            { name: 'Novo Registro', type: 'button', permissions: {} },
            { name: 'Alteração de Registro', type: 'button', permissions: {} },
            { name: 'Exclusão de Registro', type: 'button', permissions: {} },
            { name: 'Filtrar por Agente', type: 'field', permissions: {} },
            { name: 'Filtrar por Cidade', type: 'field', permissions: {} },
            { name: 'Busca Avançada', type: 'field', permissions: {} },
            { name: 'Exportar Lista', type: 'button', permissions: {} },
            { name: 'Imprimir Ficha', type: 'button', permissions: {} },
            { name: 'Histórico de Alterações', type: 'button', permissions: {} }
          ]
        },
        {
          name: 'Cadastro Domiciliar',
          icon: 'home',
          permissions: {},
          actions: [
            { name: 'Visualizar Cadastros', type: 'field', permissions: {} },
            { name: 'Novo Registro', type: 'button', permissions: {} },
            { name: 'Alteração de Registro', type: 'button', permissions: {} },
            { name: 'Exclusão de Registro', type: 'button', permissions: {} },
            { name: 'Ver Componentes Familiares', type: 'button', permissions: {} },
            { name: 'Agrupar por Endereço', type: 'button', permissions: {} },
            { name: 'Filtrar por Microárea', type: 'field', permissions: {} },
            { name: 'Exportar Dados Familiares', type: 'button', permissions: {} },
            { name: 'Imprimir Cadastro', type: 'button', permissions: {} }
          ]
        },
        {
          name: 'Visita Domiciliar',
          icon: 'home_work',
          permissions: {},
          actions: [
            { name: 'Visualizar Visitas', type: 'field', permissions: {} },
            { name: 'Nova Registro', type: 'button', permissions: {} },
            { name: 'Alteração de Registro', type: 'button', permissions: {} },
            { name: 'Exclusão de Registro', type: 'button', permissions: {} },
            { name: 'Filtrar por Status', type: 'field', permissions: {} },
            { name: 'Filtrar por Agente', type: 'field', permissions: {} },
            { name: 'Agendar Visita', type: 'button', permissions: {} },
            { name: 'Exportar Agenda', type: 'button', permissions: {} },
            { name: 'Imprimir Relatório', type: 'button', permissions: {} }
          ]
        }
      ]
    },
    {
      name: 'Relatórios',
      icon: 'assessment',
      permissions: {},
      children: [
        {
          name: 'Usuários por Cidade',
          icon: 'people',
          permissions: {},
          actions: [
            { name: 'Visualizar Relatório', type: 'field', permissions: {} },
            { name: 'Gerar Relatório', type: 'button', permissions: {} },
            { name: 'Exportar PDF', type: 'button', permissions: {} },
            { name: 'Exportar Excel', type: 'button', permissions: {} },
            { name: 'Filtrar Período', type: 'field', permissions: {} },
            { name: 'Filtrar por Cidade', type: 'field', permissions: {} }
          ]
        },
        {
          name: 'Cadastros por Agente',
          icon: 'person_search',
          permissions: {},
          actions: [
            { name: 'Visualizar Dados', type: 'field', permissions: {} },
            { name: 'Gerar Relatório', type: 'button', permissions: {} },
            { name: 'Exportar Excel', type: 'button', permissions: {} },
            { name: 'Filtrar por Agente', type: 'field', permissions: {} },
            { name: 'Comparar Períodos', type: 'button', permissions: {} }
          ]
        },
        {
          name: 'Cidadãos x Doença',
          icon: 'medical_services',
          permissions: {},
          actions: [
            { name: 'Visualizar Dados', type: 'field', permissions: {} },
            { name: 'Gerar Relatório', type: 'button', permissions: {} },
            { name: 'Filtrar por Doença', type: 'field', permissions: {} },
            { name: 'Exportar Lista', type: 'button', permissions: {} }
          ]
        },
        {
          name: 'Gestantes',
          icon: 'pregnant_woman',
          permissions: {},
          actions: [
            { name: 'Visualizar Lista', type: 'field', permissions: {} },
            { name: 'Gerar Relatório', type: 'button', permissions: {} },
            { name: 'Exportar Dados', type: 'button', permissions: {} },
            { name: 'Filtrar por Trimestre', type: 'field', permissions: {} }
          ]
        },
        {
          name: 'Medicação Contínua',
          icon: 'medication',
          permissions: {},
          actions: [
            { name: 'Visualizar Lista', type: 'field', permissions: {} },
            { name: 'Gerar Relatório', type: 'button', permissions: {} },
            { name: 'Filtrar por Medicamento', type: 'field', permissions: {} },
            { name: 'Exportar Lista', type: 'button', permissions: {} }
          ]
        },
        {
          name: 'Cadastros Duplicados',
          icon: 'content_copy',
          permissions: {},
          actions: [
            { name: 'Visualizar Duplicados', type: 'field', permissions: {} },
            { name: 'Mesclar Cadastros', type: 'button', permissions: {} },
            { name: 'Exportar Lista', type: 'button', permissions: {} }
          ]
        },
        {
          name: 'Cadastros Domiciliares',
          icon: 'apartment',
          permissions: {},
          actions: [
            { name: 'Visualizar Relatório', type: 'field', permissions: {} },
            { name: 'Gerar Relatório', type: 'button', permissions: {} },
            { name: 'Exportar Dados', type: 'button', permissions: {} },
            { name: 'Filtrar por Microárea', type: 'field', permissions: {} }
          ]
        },
        {
          name: 'Responsável x Componentes',
          icon: 'family_restroom',
          permissions: {},
          actions: [
            { name: 'Visualizar Dados', type: 'field', permissions: {} },
            { name: 'Gerar Relatório Familiar', type: 'button', permissions: {} },
            { name: 'Exportar Estrutura Familiar', type: 'button', permissions: {} }
          ]
        },
        {
          name: 'Visitas Domiciliares',
          icon: 'home_health',
          permissions: {},
          actions: [
            { name: 'Visualizar Relatório', type: 'field', permissions: {} },
            { name: 'Gerar Relatório', type: 'button', permissions: {} },
            { name: 'Filtrar por Período', type: 'field', permissions: {} },
            { name: 'Exportar Dados', type: 'button', permissions: {} }
          ]
        }
      ]
    },
    {
      name: 'Gráficos',
      icon: 'bar_chart',
      permissions: {},
      children: [
        {
          name: 'Famílias por Agentes',
          icon: 'people_outline',
          permissions: {},
          actions: [
            { name: 'Visualizar Gráfico', type: 'field', permissions: {} },
            { name: 'Configurar Período', type: 'field', permissions: {} },
            { name: 'Exportar Imagem', type: 'button', permissions: {} },
            { name: 'Compartilhar Gráfico', type: 'button', permissions: {} }
          ]
        },
        {
          name: 'Evolução de Cadastros',
          icon: 'trending_up',
          permissions: {},
          actions: [
            { name: 'Visualizar Gráfico', type: 'field', permissions: {} },
            { name: 'Configurar Período', type: 'field', permissions: {} },
            { name: 'Comparar Anos', type: 'button', permissions: {} },
            { name: 'Exportar Dados', type: 'button', permissions: {} }
          ]
        },
        {
          name: 'Distribuição por Doença',
          icon: 'donut_large',
          permissions: {},
          actions: [
            { name: 'Visualizar Gráfico', type: 'field', permissions: {} },
            { name: 'Filtrar Doenças', type: 'field', permissions: {} },
            { name: 'Exportar Gráfico', type: 'button', permissions: {} }
          ]
        }
      ]
    },
    {
      name: 'Configurações',
      icon: 'settings',
      permissions: {},
      children: [
        {
          name: 'Parâmetros do Sistema',
          icon: 'tune',
          permissions: {},
          actions: [
            { name: 'Visualizar Configurações', type: 'field', permissions: {} },
            { name: 'Alterar Parâmetros', type: 'button', permissions: {} },
            { name: 'Backup de Configurações', type: 'button', permissions: {} },
            { name: 'Restaurar Configurações', type: 'button', permissions: {} }
          ]
        },
        {
          name: 'Auditoria e Logs',
          icon: 'history',
          permissions: {},
          actions: [
            { name: 'Visualizar Logs', type: 'field', permissions: {} },
            { name: 'Filtrar por Usuário', type: 'field', permissions: {} },
            { name: 'Exportar Logs', type: 'button', permissions: {} },
            { name: 'Limpar Logs Antigos', type: 'button', permissions: {} }
          ]
        }
      ]
    }
  ];

  ngOnInit(): void {
    this.menuDataSource.data = this.menuData;
    // Expandir alguns nós por padrão para demonstrar que funciona
    this.treeControl.expand(this.menuData[0]); // Expandir "Cadastros"
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  hasChild = (_: number, node: MenuNode) => !!node.children && node.children.length > 0;

  expandirTodos(): void {
    this.treeControl.expandAll();
    this.notificationService.showInfo('Todos os nós foram expandidos');
  }

  recolherTodos(): void {
    this.treeControl.collapseAll();
    this.notificationService.showInfo('Todos os nós foram recolhidos');
  }

  onPerfilChange(event: any): void {
    this.perfilSelecionado = event.value;
    this.usuarioSelecionadoControl.setValue('');
    this.loadUsuariosDoPerfil();
    this.notificationService.showInfo(`Perfil selecionado: ${this.getPerfilNome()}`);
  }

  loadUsuariosDoPerfil(): void {
    // Filtrar usuários do perfil selecionado
    const usuariosDoPerfil = this.usuariosCadastrados.filter(
      u => u.perfil === this.perfilSelecionado
    );
    this.dataSource.data = usuariosDoPerfil;
  }

  getPerfilNome(): string {
    const perfil = this.tiposPerfil.find(p => p.id === this.perfilSelecionado);
    return perfil ? perfil.nome : '';
  }

  openCreateUserDialog(): void {
    const dialogRef = this.dialog.open(UsuarioCreateDialogComponent, {
      width: '600px',
      data: { 
        tiposPerfil: this.tiposPerfil,
        perfilPreSelecionado: this.perfilSelecionado 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const novoUsuario: Usuario = {
          id: this.usuariosCadastrados.length + 1,
          nome: result.nome,
          email: result.email,
          perfil: result.perfil,
          dataCadastro: new Date(),
          status: 'Ativo',
          dataUltimoAcesso: new Date()
        };
        
        this.usuariosCadastrados.push(novoUsuario);
        this.notificationService.showSuccess('Usuário criado com sucesso!');
        
        // Atualizar lista se for do perfil atual
        if (result.perfil === this.perfilSelecionado) {
          this.loadUsuariosDoPerfil();
        }
      }
    });
  }

  adicionarUsuario(): void {
    const usuarioId = this.usuarioSelecionadoControl.value;
    const usuario = this.usuariosCadastrados.find(u => u.id === Number(usuarioId));
    
    if (usuario && this.perfilSelecionado) {
      // Verificar se já existe
      const jaExiste = this.dataSource.data.some(u => u.id === usuario.id);
      
      if (jaExiste) {
        this.notificationService.showWarning('Usuário já está no perfil selecionado!');
        return;
      }
      
      // Adicionar ao perfil
      usuario.perfil = this.perfilSelecionado;
      this.loadUsuariosDoPerfil();
      this.usuarioSelecionadoControl.setValue('');
      this.notificationService.showSuccess(`Usuário ${usuario.nome} adicionado ao perfil!`);
    }
  }

  removerUsuario(usuario: Usuario): void {
    const confirmacao = confirm(`Remover ${usuario.nome} do perfil ${this.getPerfilNome()}?`);
    
    if (confirmacao) {
      const index = this.dataSource.data.findIndex(u => u.id === usuario.id);
      if (index > -1) {
        const dados = [...this.dataSource.data];
        dados.splice(index, 1);
        this.dataSource.data = dados;
        this.notificationService.showSuccess(`Usuário ${usuario.nome} removido!`);
      }
    }
  }

  getStatusIcon(status: string): string {
    return status === 'Ativo' ? 'check_circle' : 'cancel';
  }

  // Métodos para controle de permissões
  getNodePermission(node: MenuNode): boolean {
    return node.permissions?.[this.perfilSelecionado || ''] || false;
  }

  toggleNodePermission(node: MenuNode, event: any): void {
    if (!this.perfilSelecionado) return;
    
    if (!node.permissions) {
      node.permissions = {};
    }
    
    node.permissions[this.perfilSelecionado] = event.checked;
    
    // Se desmarcar um nó pai, desmarcar todos os filhos
    if (!event.checked && node.children) {
      this.desmarcarFilhos(node.children);
    }
    
    // Se desmarcar um nó, desmarcar todas as ações
    if (!event.checked && node.actions) {
      node.actions.forEach(action => {
        if (!action.permissions) action.permissions = {};
        action.permissions[this.perfilSelecionado!] = false;
      });
    }
  }

  private desmarcarFilhos(children: MenuNode[]): void {
    children.forEach(child => {
      if (!child.permissions) child.permissions = {};
      child.permissions[this.perfilSelecionado!] = false;
      
      if (child.children) {
        this.desmarcarFilhos(child.children);
      }
      
      if (child.actions) {
        child.actions.forEach(action => {
          if (!action.permissions) action.permissions = {};
          action.permissions[this.perfilSelecionado!] = false;
        });
      }
    });
  }

  getActionPermission(action: ActionNode): boolean {
    return action.permissions?.[this.perfilSelecionado || ''] || false;
  }

  toggleActionPermission(action: ActionNode, event: any): void {
    if (!this.perfilSelecionado) return;
    
    if (!action.permissions) {
      action.permissions = {};
    }
    
    action.permissions[this.perfilSelecionado] = event.checked;
  }

  getActionIcon(type: string): string {
    return type === 'button' ? 'smart_button' : 'text_fields';
  }

  salvarPermissoes(): void {
    if (!this.perfilSelecionado) return;
    
    this.notificationService.showLoading({
      title: 'Salvando...',
      message: 'Salvando configurações de permissões'
    });
    
    setTimeout(() => {
      this.notificationService.hideLoading();
      this.notificationService.showSuccess('Permissões salvas com sucesso!');
    }, 2000);
  }

  limparCampos(): void {
    this.tipoPerfilControl.setValue('');
    this.usuarioSelecionadoControl.setValue('');
    this.perfilSelecionado = null;
    this.dataSource.data = [];
    
    // Limpar todas as permissões
    this.clearAllPermissions(this.menuData);
    this.menuDataSource.data = [...this.menuData];
    
    this.notificationService.showInfo('Campos limpos');
  }

  private clearAllPermissions(nodes: MenuNode[]): void {
    nodes.forEach(node => {
      node.permissions = {};
      
      if (node.children) {
        this.clearAllPermissions(node.children);
      }
      
      if (node.actions) {
        node.actions.forEach(action => {
          action.permissions = {};
        });
      }
    });
  }

  selecionarPerfil(perfilId: string): void {
    this.tipoPerfilControl.setValue(perfilId);
    this.onPerfilChange({ value: perfilId });
  }

  getPerfilIcon(perfilId: string): string {
    const icons: { [key: string]: string } = {
      'admin': 'admin_panel_settings',
      'medico': 'medical_services',
      'enfermeiro': 'health_and_safety',
      'agente': 'support_agent',
      'recepcionista': 'desk'
    };
    return icons[perfilId] || 'person';
  }

  editarUsuario(usuario: Usuario): void {
    // Implementar edição de usuário
    this.notificationService.showInfo(`Editando usuário: ${usuario.nome}`);
  }

  toggleStatusUsuario(usuario: Usuario): void {
    const novoStatus = usuario.status === 'Ativo' ? 'Inativo' : 'Ativo';
    usuario.status = novoStatus;
    this.notificationService.showSuccess(`Usuário ${usuario.nome} ${novoStatus.toLowerCase()}`);
  }

  habilitarTodos(): void {
    if (!this.perfilSelecionado) return;
    this.setAllPermissions(this.menuData, true);
    this.menuDataSource.data = [...this.menuData];
    this.notificationService.showSuccess('Todas as permissões foram habilitadas');
  }

  desabilitarTodos(): void {
    if (!this.perfilSelecionado) return;
    this.setAllPermissions(this.menuData, false);
    this.menuDataSource.data = [...this.menuData];
    this.notificationService.showSuccess('Todas as permissões foram desabilitadas');
  }

  private setAllPermissions(nodes: MenuNode[], enabled: boolean): void {
    nodes.forEach(node => {
      if (!node.permissions) node.permissions = {};
      node.permissions[this.perfilSelecionado!] = enabled;
      
      if (node.children) {
        this.setAllPermissions(node.children, enabled);
      }
      
      if (node.actions) {
        node.actions.forEach(action => {
          if (!action.permissions) action.permissions = {};
          action.permissions[this.perfilSelecionado!] = enabled;
        });
      }
    });
  }

  getPermissionsCount(): { enabled: number, disabled: number } {
    if (!this.perfilSelecionado) return { enabled: 0, disabled: 0 };
    
    let enabled = 0;
    let disabled = 0;
    
    const countPermissions = (nodes: MenuNode[]) => {
      nodes.forEach(node => {
        const hasPermission = node.permissions?.[this.perfilSelecionado!] || false;
        if (hasPermission) enabled++;
        else disabled++;
        
        if (node.children) {
          countPermissions(node.children);
        }
        
        if (node.actions) {
          node.actions.forEach(action => {
            const hasActionPermission = action.permissions?.[this.perfilSelecionado!] || false;
            if (hasActionPermission) enabled++;
            else disabled++;
          });
        }
      });
    };
    
    countPermissions(this.menuData);
    return { enabled, disabled };
  }
}

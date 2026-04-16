import { Component, OnInit, ViewChild, inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepper } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Observable, delay, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
class SimpleNovosPedidosService {
  getInitialData(): Observable<any> {
    return of({
      clientes: [
        { id: '1', nome: 'Cliente Internacional', pais: 'EUA' },
        { id: '2', nome: 'Importadora Europa', pais: 'Alemanha' }
      ],
      portos: [
        { codigo: 'BRSSZ', nome: 'Santos', pais: 'Brasil' },
        { codigo: 'BRRIO', nome: 'Rio de Janeiro', pais: 'Brasil' }
      ]
    }).pipe(delay(1000));
  }

  saveDraft(data: any): Observable<any> {
    console.log('Salvando draft:', data);
    return of({ success: true }).pipe(delay(500));
  }

  submitExportacao(data: any): Observable<any> {
    console.log('Submetendo exportação:', data);
    return of({ success: true, id: '12345' }).pipe(delay(1000));
  }
}

@Component({
  selector: 'app-novos-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="novos-pedidos-container">
      <div class="header-section">
        <div class="header-content">
          <mat-icon class="header-icon">add_shopping_cart</mat-icon>
          <div class="header-text">
            <h1>Novos Pedidos de Exportação</h1>
            <p>Crie e gerencie novos pedidos de exportação com inteligência artificial</p>
          </div>
        </div>
      </div>

      <div class="stepper-container">
        <mat-stepper #stepper orientation="horizontal" [linear]="true" class="export-stepper">
          
          <!-- Step 1: Informação Básica -->
          <mat-step [stepControl]="informacaoBasicaForm" label="Informação Básica">
            <ng-template matStepLabel>Informação Básica</ng-template>
            
            <mat-card class="step-card">
              <mat-card-header>
                <mat-card-title>Dados Básicos da Exportação</mat-card-title>
                <mat-card-subtitle>Defina informações gerais da operação</mat-card-subtitle>
              </mat-card-header>
              
              <form [formGroup]="informacaoBasicaForm" class="step-form">
                <mat-card-content>
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Nome da Operação</mat-label>
                      <input matInput formControlName="nomeOperacao" placeholder="Ex: Exportação Soja - Janeiro 2024">
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Cliente</mat-label>
                      <mat-select formControlName="clienteId">
                        <mat-option *ngFor="let cliente of clientes" [value]="cliente.id">
                          {{cliente.nome}} - {{cliente.pais}}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Data Prevista</mat-label>
                      <input matInput type="date" formControlName="expectedDate">
                    </mat-form-field>
                  </div>
                </mat-card-content>

                <mat-card-actions class="step-actions">
                  <button mat-raised-button color="primary" 
                          matStepperNext 
                          [disabled]="!informacaoBasicaForm.valid">
                    Próximo
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                </mat-card-actions>
              </form>
            </mat-card>
          </mat-step>

          <!-- Step 2: Produtos -->
          <mat-step [stepControl]="produtosForm" label="Produtos">
            <ng-template matStepLabel>Produtos</ng-template>
            
            <mat-card class="step-card">
              <mat-card-header>
                <mat-card-title>Produtos para Exportação</mat-card-title>
                <mat-card-subtitle>Adicione os produtos que serão exportados</mat-card-subtitle>
              </mat-card-header>
              
              <form [formGroup]="produtosForm" class="step-form">
                <mat-card-content>
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Descrição do Produto</mat-label>
                      <input matInput formControlName="descricao" placeholder="Ex: Soja em Grão">
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="third-width">
                      <mat-label>NCM</mat-label>
                      <input matInput formControlName="ncm" placeholder="12019000">
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="third-width">
                      <mat-label>Quantidade</mat-label>
                      <input matInput type="number" formControlName="quantidade" placeholder="1000">
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="third-width">
                      <mat-label>Unidade</mat-label>
                      <mat-select formControlName="unidade">
                        <mat-option value="MT">MT (Tonelada Métrica)</mat-option>
                        <mat-option value="KG">KG (Quilograma)</mat-option>
                        <mat-option value="TON">TON (Tonelada)</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </mat-card-content>

                <mat-card-actions class="step-actions">
                  <button mat-button matStepperPrevious>
                    <mat-icon>arrow_back</mat-icon>
                    Anterior
                  </button>
                  <button mat-raised-button color="primary" 
                          matStepperNext 
                          [disabled]="!produtosForm.valid">
                    Próximo
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                </mat-card-actions>
              </form>
            </mat-card>
          </mat-step>

          <!-- Step 3: Finalizar -->
          <mat-step label="Finalizar">
            <ng-template matStepLabel>Finalizar</ng-template>
            
            <mat-card class="step-card">
              <mat-card-header>
                <mat-card-title>Finalizar Pedido</mat-card-title>
                <mat-card-subtitle>Revise e confirme os dados da exportação</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="summary-section">
                  <h3>Resumo da Operação</h3>
                  <div class="summary-item">
                    <strong>Operação:</strong> {{informacaoBasicaForm.get('nomeOperacao')?.value}}
                  </div>
                  <div class="summary-item">
                    <strong>Produto:</strong> {{produtosForm.get('descricao')?.value}}
                  </div>
                  <div class="summary-item">
                    <strong>Quantidade:</strong> {{produtosForm.get('quantidade')?.value}} {{produtosForm.get('unidade')?.value}}
                  </div>
                </div>
              </mat-card-content>

              <mat-card-actions class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Anterior
                </button>
                <button mat-raised-button color="primary" 
                        (click)="finalizarPedido()" 
                        [disabled]="saving">
                  <mat-progress-spinner *ngIf="saving" diameter="20" class="spinner-inline"></mat-progress-spinner>
                  <span *ngIf="!saving">Finalizar Pedido</span>
                  <span *ngIf="saving">Salvando...</span>
                </button>
              </mat-card-actions>
            </mat-card>
          </mat-step>

        </mat-stepper>
      </div>
    </div>
  `,
  styles: [`
    .novos-pedidos-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header-section {
      margin-bottom: 30px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1976d2;
    }

    .header-text h1 {
      margin: 0;
      color: #333;
      font-size: 28px;
      font-weight: 500;
    }

    .header-text p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .stepper-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .export-stepper {
      padding: 0;
    }

    .step-card {
      margin: 20px;
      box-shadow: none;
      border: 1px solid #e0e0e0;
    }

    .step-form {
      width: 100%;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      flex: 1;
    }

    .half-width {
      flex: 0 1 calc(50% - 8px);
    }

    .third-width {
      flex: 0 1 calc(33.333% - 11px);
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-top: 1px solid #e0e0e0;
      margin-top: 20px;
    }

    .summary-section {
      padding: 16px;
      background: #f5f5f5;
      border-radius: 4px;
      margin: 16px 0;
    }

    .summary-item {
      margin: 8px 0;
    }

    .spinner-inline {
      display: inline-block;
      margin-right: 8px;
    }

    ::ng-deep .mat-stepper-horizontal {
      margin-top: 0;
    }

    ::ng-deep .mat-step-header {
      padding: 24px;
      background: #f8f9fa;
    }

    ::ng-deep .mat-step-header.cdk-keyboard-focused,
    ::ng-deep .mat-step-header.cdk-program-focused,
    ::ng-deep .mat-step-header:hover {
      background: #e3f2fd;
    }
  `]
})
export class NovosPedidosComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private novosPedidosService = inject(SimpleNovosPedidosService);

  informacaoBasicaForm: FormGroup;
  produtosForm: FormGroup;
  
  clientes: any[] = [];
  saving = false;
  loading = true;

  constructor() {
    this.informacaoBasicaForm = this.fb.group({
      nomeOperacao: ['', [Validators.required]],
      clienteId: ['', [Validators.required]],
      expectedDate: ['', [Validators.required]]
    });

    this.produtosForm = this.fb.group({
      descricao: ['', [Validators.required]],
      ncm: ['', [Validators.required]],
      quantidade: ['', [Validators.required, Validators.min(1)]],
      unidade: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadInitialData();
  }

  private loadInitialData() {
    this.loading = true;
    this.novosPedidosService.getInitialData().subscribe({
      next: (data: any) => {
        this.clientes = data.clientes || [];
        this.loading = false;
        console.log('Dados iniciais carregados:', data);
      },
      error: (error: any) => {
        console.error('Erro ao carregar dados:', error);
        this.loading = false;
        this.snackBar.open('Erro ao carregar dados iniciais', 'Fechar', { duration: 3000 });
      }
    });
  }

  finalizarPedido() {
    if (this.informacaoBasicaForm.valid && this.produtosForm.valid) {
      this.saving = true;
      
      const exportData = {
        informacaoBasica: this.informacaoBasicaForm.value,
        produtos: this.produtosForm.value
      };

      this.novosPedidosService.submitExportacao(exportData).subscribe({
        next: (result: any) => {
          this.saving = false;
          this.snackBar.open('Pedido criado com sucesso!', 'Fechar', { 
            duration: 5000,
            panelClass: ['success-snack']
          });
          console.log('Pedido finalizado:', result);
          // Navegar de volta ou para lista de pedidos
          setTimeout(() => {
            this.router.navigate(['/home-logged']);
          }, 2000);
        },
        error: (error: any) => {
          this.saving = false;
          console.error('Erro ao finalizar pedido:', error);
          this.snackBar.open('Erro ao finalizar pedido', 'Fechar', { duration: 3000 });
        }
      });
    }
  }
}
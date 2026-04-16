// ARQUIVO BACKUP - USE novos-pedidos-minimal.component.ts
/*
import { Component, OnInit, ViewChild, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NotificationService } from '../../../services/notification.service';
import { NovosPedidosService } from './novos-pedidos.service';
import { InformacaoBasicaComponent } from './steps/informacao-basica/informacao-basica.component';
import { ProdutosComponent } from './steps/produtos/produtos.component';
import { LogisticaComponent } from './steps/logistica/logistica.component';
import { DocumentacaoComponent } from './steps/documentacao/documentacao.component';
import { RevisaoConfirmacaoComponent } from './steps/revisao-confirmacao/revisao-confirmacao.component';

interface StepData {
  stepIndex: number;
  stepName: string;
  icon: string;
  isCompleted: boolean;
  data?: any;
}

@Component({
  selector: 'app-novos-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatCardModule, 
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDividerModule,
    MatChipsModule,
    MatSnackBarModule,
    InformacaoBasicaComponent,
    ProdutosComponent,
    LogisticaComponent,
    DocumentacaoComponent,
    RevisaoConfirmacaoComponent
  ],
  templateUrl: './novos-pedidos.component.html',
  styleUrls: ['./novos-pedidos.component.scss']
})
export class NovosPedidosComponent implements OnInit, OnDestroy {
  @ViewChild('stepper', { static: true }) stepper!: MatStepper;
  
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private novosPedidosService = inject(NovosPedidosService);
  private destroy$ = new Subject<void>();
  
  // Controle do stepper
  currentStepIndex = 0;
  totalSteps = 5;
  progressPercentage = 0;
  isLinear = true;
  
  // Estados da aplicação
  loading = false;
  saving = false;
  
  // Forms para cada step
  informacaoBasicaForm!: FormGroup;
  produtosForm!: FormGroup;  
  logisticaForm!: FormGroup;
  documentacaoForm!: FormGroup;
  revisaoForm!: FormGroup;
  
  // Dados agregados
  exportacaoData: any = {};
  
  // Configuração dos steps
  steps: StepData[] = [
    {
      stepIndex: 0,
      stepName: 'Informações Básicas',
      icon: 'info',
      isCompleted: false
    },
    {
      stepIndex: 1,
      stepName: 'Produtos',
      icon: 'inventory_2',
      isCompleted: false
    },
    {
      stepIndex: 2,
      stepName: 'Logística',
      icon: 'local_shipping',
      isCompleted: false
    },
    {
      stepIndex: 3,
      stepName: 'Documentação',
      icon: 'description',
      isCompleted: false
    },
    {
      stepIndex: 4,
      stepName: 'Revisão & Confirmação',
      icon: 'check_circle',
      isCompleted: false
    }
  ];
  
  ngOnInit(): void {
    this.initializeForms();
    this.setupStepperEvents();
    this.loadInitialData();
    this.updateProgress();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private initializeForms(): void {
    // Formulários básicos - serão expandidos pelos componentes filhos
    this.informacaoBasicaForm = this.fb.group({
      isValid: [false, Validators.requiredTrue]
    });
    
    this.produtosForm = this.fb.group({
      isValid: [false, Validators.requiredTrue]
    });
    
    this.logisticaForm = this.fb.group({
      isValid: [false, Validators.requiredTrue]
    });
    
    this.documentacaoForm = this.fb.group({
      isValid: [false, Validators.requiredTrue]
    });
    
    this.revisaoForm = this.fb.group({
      isValid: [false, Validators.requiredTrue]
    });
  }
  
  private setupStepperEvents(): void {
    // Monitora mudanças no stepper
    if (this.stepper) {
      this.stepper.selectionChange
        .pipe(takeUntil(this.destroy$))
        .subscribe(event => {
          this.currentStepIndex = event.selectedIndex;
          this.updateProgress();
          this.updateStepCompletionStatus(event.previouslySelectedIndex);
        });
    }
  }
  
  private loadInitialData(): void {
    this.loading = true;
    
    // Simula carregamento de dados iniciais
    this.novosPedidosService.getInitialData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.exportacaoData = { ...this.exportacaoData, ...data };
          this.loading = false;
          this.notificationService.showSuccess('Dados iniciais carregados com sucesso');
        },
        error: (error) => {
          console.error('Erro ao carregar dados:', error);
          this.loading = false;
          this.notificationService.showError('Erro ao carregar dados iniciais');
        }
      });
  }
  
  private updateProgress(): void {
    this.progressPercentage = Math.round(((this.currentStepIndex + 1) / this.totalSteps) * 100);
  }
  
  private updateStepCompletionStatus(previousStepIndex: number): void {
    if (previousStepIndex >= 0 && previousStepIndex < this.steps.length) {
      // Verifica se o step anterior foi concluído
      const stepCompleted = this.isStepValid(previousStepIndex);
      this.steps[previousStepIndex].isCompleted = stepCompleted;
    }
  }
  
  private isStepValid(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0: return this.informacaoBasicaForm.valid;
      case 1: return this.produtosForm.valid;
      case 2: return this.logisticaForm.valid;
      case 3: return this.documentacaoForm.valid;
      case 4: return this.revisaoForm.valid;
      default: return false;
    }
  }
  
  // ========== NAVEGAÇÃO DO STEPPER ==========
  
  nextStep(): void {
    if (this.currentStepIndex < this.totalSteps - 1) {
      // Valida step atual antes de avançar
      if (this.isStepValid(this.currentStepIndex)) {
        this.stepper.next();
        this.notificationService.showInfo(`Avançando para: ${this.steps[this.currentStepIndex + 1].stepName}`);
      } else {
        this.notificationService.showWarning('Complete todos os campos obrigatórios antes de continuar');
      }
    }
  }
  
  previousStep(): void {
    if (this.currentStepIndex > 0) {
      this.stepper.previous();
    }
  }
  
  goToStep(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < this.totalSteps) {
      this.stepper.selectedIndex = stepIndex;
    }
  }
  
  // ========== EVENTOS DOS COMPONENTES FILHOS ==========
  
  onStepDataChanged(stepIndex: number, data: any): void {
    // Atualiza dados do step específico
    this.exportacaoData = { ...this.exportacaoData, [stepIndex]: data };
    
    // Valida o form correspondente
    this.updateFormValidity(stepIndex, data.isValid || false);
    
    // Salva automaticamente (draft)
    this.saveDraft();
  }
  
  private updateFormValidity(stepIndex: number, isValid: boolean): void {
    switch (stepIndex) {
      case 0:
        this.informacaoBasicaForm.patchValue({ isValid });
        break;
      case 1:
        this.produtosForm.patchValue({ isValid });
        break;
      case 2:
        this.logisticaForm.patchValue({ isValid });
        break;
      case 3:
        this.documentacaoForm.patchValue({ isValid });
        break;
      case 4:
        this.revisaoForm.patchValue({ isValid });
        break;
    }
  }
  
  // ========== PERSISTÊNCIA ==========
  
  private saveDraft(): void {
    // Salva automaticamente como rascunho
    this.novosPedidosService.saveDraft(this.exportacaoData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Rascunho salvo automaticamente');
        },
        error: (error) => {
          console.error('Erro ao salvar rascunho:', error);
        }
      });
  }
  
  saveAndExit(): void {
    this.saving = true;
    
    this.novosPedidosService.saveDraft(this.exportacaoData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.notificationService.showSuccess('Rascunho salvo com sucesso');
          this.router.navigate(['/home-logged/exportacoes/gerenciar']);
        },
        error: (error) => {
          this.saving = false;
          console.error('Erro ao salvar:', error);
          this.notificationService.showError('Erro ao salvar rascunho');
        }
      });
  }
  
  submitExportacao(): void {
    if (this.isAllStepsCompleted()) {
      this.saving = true;
      
      this.novosPedidosService.submitExportacao(this.exportacaoData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.saving = false;
            this.notificationService.showSuccess('Pedido de exportação criado com sucesso!');
            this.router.navigate(['/home-logged/exportacoes/gerenciar']);
          },
          error: (error) => {
            this.saving = false;
            console.error('Erro ao submeter:', error);
            this.notificationService.showError('Erro ao criar pedido de exportação');
          }
        });
    } else {
      this.notificationService.showWarning('Complete todas as etapas antes de submeter o pedido');
    }
  }
  
  private isAllStepsCompleted(): boolean {
    return this.informacaoBasicaForm.valid &&
           this.produtosForm.valid &&
           this.logisticaForm.valid && 
           this.documentacaoForm.valid &&
           this.revisaoForm.valid;
  }
  
  // ========== UTILITÁRIOS ==========
  
  cancelProcess(): void {
    this.notificationService.showInfo('Processo cancelado');
    this.router.navigate(['/home-logged/exportacoes/gerenciar']);
  }
  
  getCurrentStepName(): string {
    return this.steps[this.currentStepIndex]?.stepName || '';
  }
  
  getCompletedStepsCount(): number {
    return this.steps.filter(step => step.isCompleted).length;
  }
}
*/
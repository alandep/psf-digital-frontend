import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-novo-pedido-stepper',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatDividerModule,
    MatChipsModule,
    MatCheckboxModule,
    MatTableModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './novo-pedido-stepper.component.html',
  styleUrls: ['./novo-pedido-stepper.component.scss']
})
export class NovoPedidoStepperComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Formulários para cada step
  informacoesBasicasForm!: FormGroup;
  produtosForm!: FormGroup;
  logisticaForm!: FormGroup;
  documentacaoForm!: FormGroup;

  salvando = false;
  criando = false;

  clientes = [
    { id: '1', nome: 'Agro Import Corporation', pais: 'Estados Unidos' },
    { id: '2', nome: 'Euro Commodities GmbH', pais: 'Alemanha' },
    { id: '3', nome: 'Asia Trade Limited', pais: 'China' },
    { id: '4', nome: 'Brasil Export Partners', pais: 'Reino Unido' },
    { id: '5', nome: 'Mediterranean Grains SA', pais: 'Espanha' },
    { id: '6', nome: 'Nordic Food Industries AS', pais: 'Noruega' }
  ];

  constructor() {
    this.initializeForms();
  }

  ngOnInit() {
    // Auto-preenchimento para demonstração
    setTimeout(() => {
      this.informacoesBasicasForm.patchValue({
        nomeOperacao: 'Exportação Soja Premium - Safra 2025',
        prioridade: 'alta'
      });

      this.produtosForm.patchValue({
        produtoDescricao: 'Soja em grão, qualidade premium para exportação',
        ncm: '1201.90.00',
        unidade: 'MT',
        valorUnitario: 450,
        origem: 'MT'
      });

      this.logisticaForm.patchValue({
        incoterm: 'FOB',
        portoEmbarque: 'santos',
        tipoTransporte: 'maritimo'
      });

      this.documentacaoForm.patchValue({
        moeda: 'USD',
        formaPagamento: 'carta-credito',
        prazoPagamento: 30
      });
    }, 1500);
  }

  private initializeForms(): void {
    // Form 1: Informações Básicas
    this.informacoesBasicasForm = this.fb.group({
      nomeOperacao: ['', [Validators.required, Validators.minLength(5)]],
      cliente: ['', [Validators.required]],
      dataEsperada: ['', [Validators.required]],
      prioridade: ['', [Validators.required]],
      observacoesGerais: ['']
    });

    // Form 2: Produtos
    this.produtosForm = this.fb.group({
      produtoDescricao: ['', [Validators.required, Validators.minLength(10)]],
      ncm: ['', [Validators.required, Validators.pattern(/^\d{4}\.\d{2}\.\d{2}$/)]],
      quantidade: ['', [Validators.required, Validators.min(1)]],
      unidade: ['', [Validators.required]],
      valorUnitario: ['', [Validators.required, Validators.min(0.01)]],
      origem: ['', [Validators.required]]
    });

    // Form 3: Logística
    this.logisticaForm = this.fb.group({
      incoterm: ['', [Validators.required]],
      portoEmbarque: ['', [Validators.required]],
      portoDestino: ['', [Validators.required]],
      tipoTransporte: ['', [Validators.required]],
      transportadora: [''],
      estimativaFrete: ['', [Validators.min(0)]]
    });

    // Form 4: Documentação
    this.documentacaoForm = this.fb.group({
      moeda: ['', [Validators.required]],
      formaPagamento: ['', [Validators.required]],
      prazoPagamento: ['', [Validators.required, Validators.min(1)]],
      bancoImportador: [''],
      // Checkboxes para documentos
      faturaComercial: [true],
      conhecimentoEmbarque: [true],
      certificadoOrigem: [false],
      licencaExportacao: [true],
      certificadoFitossanitario: [false],
      apoliceSeguro: [false]
    });
  }

  // Funções auxiliares
  getTotalValue(): number {
    const quantidade = this.produtosForm?.get('quantidade')?.value || 0;
    const valorUnitario = this.produtosForm?.get('valorUnitario')?.value || 0;
    return quantidade * valorUnitario;
  }

  getClienteNome(): string {
    const clienteId = this.informacoesBasicasForm?.get('cliente')?.value;
    const cliente = this.clientes.find(c => c.id === clienteId);
    return cliente ? `${cliente.nome} - ${cliente.pais}` : '';
  }

  getAllFormsValid(): boolean {
    return this.informacoesBasicasForm?.valid &&
           this.produtosForm?.valid &&
           this.logisticaForm?.valid &&
           this.documentacaoForm?.valid;
  }

  // Função para compilar todos os dados
  getAllFormData(): any {
    return {
      informacoesBasicas: this.informacoesBasicasForm?.value,
      produtos: this.produtosForm?.value,
      logistica: this.logisticaForm?.value,
      documentacao: this.documentacaoForm?.value,
      valorTotal: this.getTotalValue(),
      timestamp: new Date().toISOString()
    };
  }

  onSalvarRascunho() {
    this.salvando = true;

    setTimeout(() => {
      this.salvando = false;
      this.snackBar.open('Rascunho salvo com sucesso! Todas as informações foram preservadas.', 'Fechar', {
        duration: 4000,
        panelClass: ['success-snackbar']
      });
    }, 1500);
  }

  onSubmit() {
    if (this.getAllFormsValid()) {
      this.criando = true;

      setTimeout(() => {
        this.criando = false;
        this.snackBar.open('🎉 Pedido de exportação criado com sucesso! Todas as etapas foram concluídas.', 'Fechar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });

        setTimeout(() => {
          this.router.navigate(['/home-logged/exportacoes/gerenciar']);
        }, 2500);
      }, 3000);
    } else {
      // Identificar quais forms estão inválidos
      const formsStatus = {
        'Informações Básicas': this.informacoesBasicasForm?.valid || false,
        'Produtos': this.produtosForm?.valid || false,
        'Logística': this.logisticaForm?.valid || false,
        'Documentação': this.documentacaoForm?.valid || false
      };

      const invalidForms = Object.entries(formsStatus)
        .filter(([_, valid]) => !valid)
        .map(([name, _]) => name);

      this.snackBar.open(`Por favor, complete as seções: ${invalidForms.join(', ')}`, 'Fechar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  onCancel() {
    this.router.navigate(['/home-logged/exportacoes/gerenciar']);
  }
}

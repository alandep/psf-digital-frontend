import { Component, OnInit, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { ContractsMockService } from '../../../../services/contractsMockService';
import { 
  Contract, 
  ContractFilterOptions,
  ContractCosts,
  CURRENCY_LIST,
  INCOTERM_LIST,
  INCOTERM_LABELS,
  CONTRACT_STATUS_LABELS,
  MIN_CONTRACT_VALUE,
  MAX_CONTRACT_VALUE
} from '../../../../types/contracts';

@Component({
  selector: 'app-contract-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    MatDividerModule,
    MatStepperModule
  ],
  template: `
    <div class="dialog-container">
      
      <!-- Header -->
      <div mat-dialog-title style="display: flex; align-items: center; gap: 12px; padding-bottom: 16px;">
        <mat-icon style="color: #1976d2;">{{isEditMode ? 'edit' : 'add'}}</mat-icon>
        <span>{{isEditMode ? 'Editar' : 'Novo'}} Contrato</span>
        <div style="flex: 1;"></div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        
        <!-- Stepper para criação -->
        <mat-stepper *ngIf="!isEditMode" [selectedIndex]="currentStep" orientation="horizontal">
          
          <!-- Step 1: Informações Básicas -->
          <mat-step [stepControl]="basicInfoForm" label="Informações Básicas">
            <form [formGroup]="basicInfoForm" style="padding: 20px 0;">
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <mat-form-field appearance="outline">
                  <mat-label>Número do Contrato</mat-label>
                  <input matInput formControlName="contract_number" placeholder="EXP/2024/001">
                  <mat-error *ngIf="basicInfoForm.get('contract_number')?.hasError('required')">
                    Número do contrato é obrigatório
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Status</mat-label>
                  <mat-select formControlName="status">
                    <mat-option *ngFor="let status of statusOptions" [value]="status.value">
                      {{status.label}}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <mat-form-field appearance="outline">
                  <mat-label>Exportador</mat-label>
                  <mat-select formControlName="exporter_id">
                    <mat-option *ngFor="let exporter of filterOptions?.exporters" [value]="exporter.id">
                      {{exporter.name}}
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="basicInfoForm.get('exporter_id')?.hasError('required')">
                    Exportador é obrigatório
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Nome do Importador</mat-label>
                  <input matInput formControlName="importer_name" placeholder="Nome da empresa importadora">
                  <mat-error *ngIf="basicInfoForm.get('importer_name')?.hasError('required')">
                    Nome do importador é obrigatório
                  </mat-error>
                </mat-form-field>
              </div>

              <div>
                <mat-form-field appearance="outline" style="width: 100%;">
                  <mat-label>País do Importador</mat-label>
                  <mat-select formControlName="importer_country">
                    <mat-option *ngFor="let country of filterOptions?.countries" [value]="country.code">
                      {{country.name}}
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="basicInfoForm.get('importer_country')?.hasError('required')">
                    País do importador é obrigatório
                  </mat-error>
                </mat-form-field>
              </div>

              <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
                <button mat-raised-button color="primary" 
                        (click)="nextStep()" 
                        [disabled]="!basicInfoForm.valid">
                  Próximo
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>

            </form>
          </mat-step>

          <!-- Step 2: Detalhes Comerciais -->
          <mat-step [stepControl]="commercialForm" label="Detalhes Comerciais">
            <form [formGroup]="commercialForm" style="padding: 20px 0;">
              
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <mat-form-field appearance="outline">
                  <mat-label>Incoterm</mat-label>
                  <mat-select formControlName="incoterm">
                    <mat-option *ngFor="let incoterm of incotermOptions" [value]="incoterm.value">
                      {{incoterm.label}}
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="commercialForm.get('incoterm')?.hasError('required')">
                    Incoterm é obrigatório
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Valor Total</mat-label>
                  <input matInput 
                         type="number" 
                         formControlName="total_value" 
                         placeholder="0.00"
                         (input)="calculateCosts()">
                  <mat-error *ngIf="commercialForm.get('total_value')?.hasError('required')">
                    Valor é obrigatório
                  </mat-error>
                  <mat-error *ngIf="commercialForm.get('total_value')?.hasError('min')">
                    Valor mínimo: {{formatCurrency(minValue, 'USD')}}
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Moeda</mat-label>
                  <mat-select formControlName="currency">
                    <mat-option *ngFor="let currency of currencyOptions" [value]="currency">
                      {{currency}}
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="commercialForm.get('currency')?.hasError('required')">
                    Moeda é obrigatória
                  </mat-error>
                </mat-form-field>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <mat-form-field appearance="outline">
                  <mat-label>Porto de Origem</mat-label>
                  <mat-select formControlName="port_origin">
                    <mat-option *ngFor="let port of originPorts" [value]="port.code">
                      {{port.name}} ({{port.code}})
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="commercialForm.get('port_origin')?.hasError('required')">
                    Porto de origem é obrigatório
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Porto de Destino</mat-label>
                  <mat-select formControlName="port_destination">
                    <mat-option *ngFor="let port of destinationPorts" [value]="port.code">
                      {{port.name}} ({{port.code}})
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="commercialForm.get('port_destination')?.hasError('required')">
                    Porto de destino é obrigatório
                  </mat-error>
                </mat-form-field>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                <mat-form-field appearance="outline">
                  <mat-label>Data do Contrato</mat-label>
                  <input matInput [matDatepicker]="contractDatePicker" formControlName="contract_date">
                  <mat-datepicker-toggle matSuffix [for]="contractDatePicker"></mat-datepicker-toggle>
                  <mat-datepicker #contractDatePicker></mat-datepicker>
                  <mat-error *ngIf="commercialForm.get('contract_date')?.hasError('required')">
                    Data do contrato é obrigatória
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Data de Embarque</mat-label>
                  <input matInput [matDatepicker]="shipmentDatePicker" formControlName="shipment_date">
                  <mat-datepicker-toggle matSuffix [for]="shipmentDatePicker"></mat-datepicker-toggle>
                  <mat-datepicker #shipmentDatePicker></mat-datepicker>
                  <mat-error *ngIf="commercialForm.get('shipment_date')?.hasError('required')">
                    Data de embarque é obrigatória
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Custos calculados -->
              <mat-card *ngIf="calculatedCosts" style="margin-bottom: 20px; background: #f8f9fa;">
                <mat-card-header>
                  <mat-card-title style="font-size: 16px; display: flex; align-items: center; gap: 8px;">
                    <mat-icon style="color: #1976d2;">calculate</mat-icon>
                    Custos Calculados ({{getFormValue(commercialForm, 'incoterm')}})
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                    <div class="cost-item">
                      <div style="font-size: 12px; color: #666;">Frete</div>
                      <div style="font-weight: bold;">{{formatCurrency(calculatedCosts.freight_cost || 0, getFormValue(commercialForm, 'currency'))}}</div>
                    </div>
                    <div class="cost-item">
                      <div style="font-size: 12px; color: #666;">Seguro</div>
                      <div style="font-weight: bold;">{{formatCurrency(calculatedCosts.insurance_cost || 0, getFormValue(commercialForm, 'currency'))}}</div>
                    </div>
                    <div class="cost-item">
                      <div style="font-size: 12px; color: #666;">Manuseio</div>
                      <div style="font-weight: bold;">{{formatCurrency(calculatedCosts.handling_cost || 0, getFormValue(commercialForm, 'currency'))}}</div>
                    </div>
                    <div class="cost-item">
                      <div style="font-size: 12px; color: #666;">Total Custos</div>
                      <div style="font-weight: bold; color: #ff9800;">{{formatCurrency(calculatedCosts.total_costs || 0, getFormValue(commercialForm, 'currency'))}}</div>
                    </div>
                    <div class="cost-item">
                      <div style="font-size: 12px; color: #666;">Valor Líquido</div>
                      <div style="font-weight: bold; color: #4caf50; font-size: 18px;">{{formatCurrency(calculatedCosts.net_value || 0, getFormValue(commercialForm, 'currency'))}}</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <div style="display: flex; justify-content: space-between;">
                <button mat-button (click)="previousStep()">
                  <mat-icon>arrow_back</mat-icon>
                  Anterior
                </button>
                <button mat-raised-button color="primary" 
                        (click)="saveContract()" 
                        [disabled]="!isFormValid() || isLoading">
                  <span *ngIf="isLoading">
                    <mat-progress-spinner diameter="20" mode="indeterminate" style="display: inline-block; margin-right: 8px;"></mat-progress-spinner>
                    Salvando...
                  </span>
                  <span *ngIf="!isLoading">
                    <mat-icon>save</mat-icon>
                    Criar Contrato
                  </span>
                </button>
              </div>

            </form>
          </mat-step>

        </mat-stepper>

        <!-- Formulário simples para edição -->
        <form *ngIf="isEditMode" [formGroup]="editForm" style="padding: 20px 0;">
          
          <!-- Informações básicas -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <mat-form-field appearance="outline">
              <mat-label>Número do Contrato</mat-label>
              <input matInput formControlName="contract_number" readonly>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option *ngFor="let status of statusOptions" [value]="status.value">
                  {{status.label}}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <mat-form-field appearance="outline">
              <mat-label>Nome do Importador</mat-label>
              <input matInput formControlName="importer_name">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>País do Importador</mat-label>
              <mat-select formControlName="importer_country">
                <mat-option *ngFor="let country of filterOptions?.countries" [value]="country.code">
                  {{country.name}}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <mat-form-field appearance="outline">
              <mat-label>Valor Total</mat-label>
              <input matInput 
                     type="number" 
                     formControlName="total_value"
                     (input)="calculateCostsEdit()">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Moeda</mat-label>
              <mat-select formControlName="currency">
                <mat-option *ngFor="let currency of currencyOptions" [value]="currency">
                  {{currency}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Incoterm</mat-label>
              <mat-select formControlName="incoterm" (selectionChange)="calculateCostsEdit()">
                <mat-option *ngFor="let incoterm of incotermOptions" [value]="incoterm.value">
                  {{incoterm.label}}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Custos calculados para edição -->
          <mat-card *ngIf="calculatedCostsEdit" style="margin-bottom: 20px; background: #f8f9fa;">
            <mat-card-header>
              <mat-card-title style="font-size: 16px;">Custos Atualizados</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                <div class="cost-item">
                  <div style="font-size: 12px; color: #666;">Valor Líquido</div>
                  <div style="font-weight: bold; color: #4caf50; font-size: 18px;">
                    {{formatCurrency(calculatedCostsEdit.net_value || 0, getFormValue(editForm, 'currency'))}}
                  </div>
                </div>
                <div class="cost-item">
                  <div style="font-size: 12px; color: #666;">Total Custos</div>
                  <div style="font-weight: bold; color: #ff9800;">
                    {{formatCurrency(calculatedCostsEdit.total_costs || 0, getFormValue(editForm, 'currency'))}}
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

        </form>

      </mat-dialog-content>

      <!-- Ações do Dialog para Edição -->
      <mat-dialog-actions *ngIf="isEditMode" align="end" style="padding: 16px 24px;">
        <button mat-button mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" 
                (click)="saveContract()" 
                [disabled]="!editForm.valid || isLoading">
          <span *ngIf="isLoading">
            <mat-progress-spinner diameter="16" mode="indeterminate" style="display: inline-block; margin-right: 8px;"></mat-progress-spinner>
            Salvando...
          </span>
          <span *ngIf="!isLoading">Salvar Alterações</span>
        </button>
      </mat-dialog-actions>

    </div>
  `,
  styles: [`
    .dialog-container {
      width: 100%;
      max-width: 900px;
    }
    
    .cost-item {
      padding: 8px;
      background: white;
      border-radius: 8px;
      text-align: center;
    }

    ::ng-deep .mat-step-header {
      pointer-events: none;
    }

    mat-form-field {
      width: 100%;
    }
  `]
})
export class ContractEditDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly contractsService = inject(ContractsMockService);
  private readonly dialogRef = inject(MatDialogRef<ContractEditDialogComponent>);
  
  public basicInfoForm!: FormGroup;
  public commercialForm!: FormGroup;
  public editForm!: FormGroup;
  public isLoading = false;
  public currentStep = 0;
  public calculatedCosts: ContractCosts | null = null;
  public calculatedCostsEdit: ContractCosts | null = null;
  
  // Opções para os selects
  public filterOptions: ContractFilterOptions | null = null;
  public statusOptions = Object.entries(CONTRACT_STATUS_LABELS).map(([value, label]) => ({ value, label }));
  public incotermOptions = Object.entries(INCOTERM_LABELS).map(([value, label]) => ({ value, label }));
  public currencyOptions = [...CURRENCY_LIST];
  public minValue = MIN_CONTRACT_VALUE;
  
  // Dados do componente
  public contract: Contract | null = null;
  public isEditMode = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { 
      contract: Contract | null; 
      filterOptions: ContractFilterOptions;
      isEditMode: boolean;
    }
  ) {
    console.log('📝 ContractEditDialogComponent inicializado:', this.data);
    
    this.contract = this.data.contract;
    this.isEditMode = this.data.isEditMode;
    this.filterOptions = this.data.filterOptions;

    // Inicializar formulários
    this.initializeForms();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.contract) {
      this.populateEditForm();
      this.calculateCostsEdit();
    }
  }

  private initializeForms(): void {
    // Formulário de informações básicas (Step 1)
    this.basicInfoForm = this.fb.group({
      contract_number: ['', [Validators.required]],
      status: ['Draft', [Validators.required]],
      exporter_id: ['', [Validators.required]],
      importer_name: ['', [Validators.required]],
      importer_country: ['', [Validators.required]]
    });

    // Formulário comercial (Step 2)
    this.commercialForm = this.fb.group({
      incoterm: ['', [Validators.required]],
      total_value: ['', [Validators.required, Validators.min(this.minValue)]],
      currency: ['', [Validators.required]],
      port_origin: ['', [Validators.required]],
      port_destination: ['', [Validators.required]],
      contract_date: ['', [Validators.required]],
      shipment_date: ['', [Validators.required]]
    });

    // Formulário de edição (formulário único)
    this.editForm = this.fb.group({
      contract_number: [''],
      status: ['', [Validators.required]],
      importer_name: ['', [Validators.required]],
      importer_country: ['', [Validators.required]],
      total_value: ['', [Validators.required, Validators.min(this.minValue)]],
      currency: ['', [Validators.required]],
      incoterm: ['', [Validators.required]]
    });
  }

  private populateEditForm(): void {
    if (this.contract) {
      this.editForm.patchValue({
        contract_number: this.contract.contract_number,
        status: this.contract.status,
        importer_name: this.contract.importer_name,
        importer_country: this.contract.importer_country,
        total_value: this.contract.total_value,
        currency: this.contract.currency,
        incoterm: this.contract.incoterm
      });
    }
  }

  public get originPorts() {
    return this.filterOptions?.ports.filter(p => p.country === 'Brazil') || [];
  }

  public get destinationPorts() {
    const selectedCountry = this.getFormValue(this.commercialForm, 'port_destination');
    return this.filterOptions?.ports.filter(p => p.country !== 'Brazil') || [];
  }

  public nextStep(): void {
    if (this.basicInfoForm.valid) {
      this.currentStep = 1;
    }
  }

  public previousStep(): void {
    this.currentStep = 0;
  }

  public calculateCosts(): void {
    const totalValue = this.getFormValue(this.commercialForm, 'total_value');
    const incoterm = this.getFormValue(this.commercialForm, 'incoterm');
    
    if (totalValue && incoterm) {
      this.calculatedCosts = this.contractsService.calculateCosts(totalValue, incoterm);
    }
  }

  public calculateCostsEdit(): void {
    const totalValue = this.getFormValue(this.editForm, 'total_value');
    const incoterm = this.getFormValue(this.editForm, 'incoterm');
    
    if (totalValue && incoterm) {
      this.calculatedCostsEdit = this.contractsService.calculateCosts(totalValue, incoterm);
    }
  }

  public isFormValid(): boolean {
    return this.basicInfoForm.valid && this.commercialForm.valid;
  }

  public saveContract(): void {
    this.isLoading = true;
    
    if (this.isEditMode) {
      // Editar contrato existente
      const updatedData = {
        ...this.editForm.value,
        calculated_costs: this.calculatedCostsEdit
      };
      
      this.contractsService.updateContract(this.contract!.contract_id!, updatedData).subscribe({
        next: (result) => {
          console.log('✅ Contrato atualizado:', result);
          this.snackBar.open('Contrato atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.dialogRef.close(result);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao atualizar contrato:', error);
          this.snackBar.open('Erro ao atualizar contrato', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      // Criar novo contrato
      const newContractData = {
        ...this.basicInfoForm.value,
        ...this.commercialForm.value,
        country_destination: this.basicInfoForm.value.importer_country,
        calculated_costs: this.calculatedCosts
      };

      this.contractsService.createContract(newContractData).subscribe({
        next: (result) => {
          console.log('✅ Contrato criado:', result);
          this.snackBar.open('Contrato criado com sucesso!', 'Fechar', { duration: 3000 });
          this.dialogRef.close(result);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao criar contrato:', error);
          this.snackBar.open('Erro ao criar contrato', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  public getFormValue(form: FormGroup, fieldName: string): any {
    return form.get(fieldName)?.value;
  }

  public formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(value || 0);
  }
}
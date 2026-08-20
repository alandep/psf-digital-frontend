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
  templateUrl: './contract-edit-dialog.component.html',
  styleUrls: ['./contract-edit-dialog.component.scss']
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

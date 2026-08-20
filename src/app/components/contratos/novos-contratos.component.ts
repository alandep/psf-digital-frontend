import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { ContractsMockService } from '../../../services/contractsMockService';
import { ContractEditDialogComponent } from './contract-edit-dialog/contract-edit-dialog.component';
import {
  ConfirmarAcaoDialogComponent,
  ConfirmDialogData
} from '../admin/usuarios/confirmar-acao-dialog/confirmar-acao-dialog.component';
import { 
  Contract, 
  ContractFilters, 
  ContractFilterOptions,
  CONTRACT_STATUS_LABELS,
  INCOTERM_LABELS,
  CURRENCY_LABELS
} from '../../../types/contracts';

@Component({
  selector: 'app-novos-contratos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatExpansionModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './novos-contratos.component.html',
  styleUrls: ['./novos-contratos.component.scss']
})
export class NovosContratosComponent implements OnInit {
  private readonly contractsService = inject(ContractsMockService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  public contracts: Contract[] = [];
  public filterOptions: ContractFilterOptions | null = null;
  public isLoading = false;
  
  // KPIs
  public totalContracts = 0;
  public totalValue = 0;
  public activeContracts = 0;
  public draftContracts = 0;

  public filtroForm: FormGroup;
  public readonly statusLabels = CONTRACT_STATUS_LABELS;
  public readonly incotermLabels = INCOTERM_LABELS;
  public readonly currencyLabels = CURRENCY_LABELS;

  constructor() {
    this.filtroForm = this.fb.group({
      status: [[]],
      currency: [[]],
      incoterm: [[]],
      countries: [[]],
      exporter_id: [[]],
      value_min: [null],
      value_max: [null]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    
    // Carregar opções de filtro
    this.contractsService.getFilterOptions().subscribe({
      next: (options) => {
        this.filterOptions = options;
      },
      error: () => {
        // Falha silenciosa ao carregar opções de filtro
      }
    });

    // Carregar contratos
    this.loadContracts();
  }

  private loadContracts(filters?: ContractFilters): void {
    this.isLoading = true;
    
    this.contractsService.getContracts(filters).subscribe({
      next: (contracts) => {
        this.contracts = contracts;
        this.calculateKPIs();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar contratos', 'Fechar', { duration: 3000 });
      }
    });
  }

  private calculateKPIs(): void {
    this.totalContracts = this.contracts.length;
    this.totalValue = this.contracts.reduce((sum, c) => sum + c.total_value, 0);
    this.activeContracts = this.contracts.filter(c => c.status === 'Active').length;
    this.draftContracts = this.contracts.filter(c => c.status === 'Draft').length;
  }

  public applyFilters(): void {
    const formValue = this.filtroForm.value;
    
    const filters: ContractFilters = {
      status: formValue.status?.length ? formValue.status : undefined,
      currency: formValue.currency?.length ? formValue.currency : undefined,
      incoterm: formValue.incoterm?.length ? formValue.incoterm : undefined,
      countries: formValue.countries?.length ? formValue.countries : undefined,
      exporter_id: formValue.exporter_id?.length ? formValue.exporter_id : undefined,
      value_min: formValue.value_min || undefined,
      value_max: formValue.value_max || undefined
    };

    this.loadContracts(filters);
  }

  public clearFilters(): void {
    this.filtroForm.reset({
      status: [],
      currency: [],
      incoterm: [],
      countries: [],
      exporter_id: [],
      value_min: null,
      value_max: null
    });
    
    this.loadContracts();
  }

  public openNewContractDialog(): void {
    const dialogRef = this.dialog.open(ContractEditDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'contract-dialog-panel',
      data: {
        contract: null,
        filterOptions: this.filterOptions,
        isEditMode: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Contrato criado com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Recarregar a lista
        this.loadContracts();
      }
    });
  }

  public editContract(contract: Contract): void {
    const dialogRef = this.dialog.open(ContractEditDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'contract-dialog-panel',
      data: {
        contract: { ...contract },
        filterOptions: this.filterOptions,
        isEditMode: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Contrato atualizado com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Recarregar a lista
        this.loadContracts();
      }
    });
  }

  public deleteContract(contract: Contract): void {
    const dialogRef = this.dialog.open(ConfirmarAcaoDialogComponent, {
      width: '440px',
      data: {
        title: 'Excluir Contrato',
        message: `Tem certeza que deseja excluir o contrato ${contract.contract_number}? Esta ação não pode ser desfeita.`,
        icon: 'delete',
        iconColor: '#f44336',
        confirmText: 'Excluir',
        confirmColor: 'warn'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      this.contractsService.deleteContract(contract.contract_id!).subscribe({
        next: () => {
          this.snackBar.open('Contrato excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.loadContracts();
        },
        error: () => {
          this.snackBar.open('Erro ao excluir contrato', 'Fechar', { duration: 3000 });
        }
      });
    });
  }

  public generateDocuments(contract: Contract): void {
    this.snackBar.open('Gerando documentos...', '', { duration: 2000 });
    
    this.contractsService.generateDocuments(contract.contract_id!).subscribe({
      next: (result) => {
        if (result.success) {
          this.snackBar.open('Documentos gerados com sucesso!', 'Fechar', { duration: 5000 });
        }
      },
      error: () => {
        this.snackBar.open('Erro ao gerar documentos', 'Fechar', { duration: 3000 });
      }
    });
  }

  public sendToReceita(contract: Contract): void {
    this.snackBar.open('Enviando para Receita Federal...', '', { duration: 3000 });
    
    this.contractsService.sendToReceita(contract.contract_id!).subscribe({
      next: (result) => {
        if (result.success) {
          this.snackBar.open(`Enviado com sucesso! Protocolo: ${result.protocol}`, 'Fechar', { duration: 8000 });
        }
      },
      error: () => {
        this.snackBar.open('Erro ao enviar para Receita Federal', 'Fechar', { duration: 3000 });
      }
    });
  }

  public formatCurrency(value: number, currency: string): string {
    const symbolMap: Record<string, string> = {
      'USD': 'USD',
      'EUR': 'EUR', 
      'BRL': 'BRL',
      'CNY': 'CNY'
    };
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: symbolMap[currency] || 'USD',
      minimumFractionDigits: 2
    }).format(value || 0);
  }

  public formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  public getStatusLabel(status: string): string {
    return this.statusLabels[status as keyof typeof this.statusLabels] || status;
  }

  public getIncotermLabel(incoterm: string): string {
    return this.incotermLabels[incoterm as keyof typeof this.incotermLabels] || incoterm;
  }

  public getCurrencyLabel(currency: string): string {
    return this.currencyLabels[currency as keyof typeof this.currencyLabels] || currency;
  }

  public getStatusColor(status: string): string {
    switch (status) {
      case 'Active': return '#4caf50';
      case 'Draft': return '#ff9800';
      case 'Closed': return '#2196f3';
      case 'Cancelled': return '#f44336';
      default: return '#666';
    }
  }
}

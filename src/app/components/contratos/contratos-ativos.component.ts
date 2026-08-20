import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  INCOTERM_LABELS,
  CURRENCY_LABELS
} from '../../../types/contracts';

@Component({
  selector: 'app-contratos-ativos',
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
  templateUrl: './contratos-ativos.component.html',
  styleUrls: ['./contratos-ativos.component.scss']
})
export class ContratosAtivosComponent implements OnInit {
  private readonly contractsService = inject(ContractsMockService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  public contracts: Contract[] = [];
  public filterOptions: ContractFilterOptions | null = null;
  public isLoading = false;
  
  // KPIs específicos para contratos ativos
  public activeContracts = 0;
  public totalActiveValue = 0;
  public upcomingShipments = 0;
  public uniqueCountries = 0;

  // Filtros específicos baseados em contratos ativos
  public activeCurrencies: string[] = [];
  public activeIncoterms: { value: string; label: string }[] = [];
  public activeCountries: { code: string; name: string }[] = [];

  public filtroForm: FormGroup;
  public readonly incotermLabels = INCOTERM_LABELS;
  public readonly currencyLabels = CURRENCY_LABELS;

  constructor() {
    this.filtroForm = this.fb.group({
      currency: [[]],
      incoterm: [[]],
      countries: [[]],
      exporter_id: [[]],
      value_min: [null],
      value_max: [null],
      date_from: [null],
      date_to: [null]
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

    // Carregar apenas contratos ativos
    this.loadActiveContracts();
  }

  private loadActiveContracts(additionalFilters?: Partial<ContractFilters>): void {
    this.isLoading = true;
    
    // Sempre filtrar por status "Active"
    const filters: ContractFilters = {
      status: ['Active'],
      ...additionalFilters
    };
    
    this.contractsService.getContracts(filters).subscribe({
      next: (contracts) => {
        this.contracts = contracts;
        this.calculateKPIs();
        this.updateFilterOptions();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar contratos ativos', 'Fechar', { duration: 3000 });
      }
    });
  }

  private calculateKPIs(): void {
    this.activeContracts = this.contracts.length;
    this.totalActiveValue = this.contracts.reduce((sum, c) => sum + c.total_value, 0);
    
    // Embarques nos próximos 30 dias
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    this.upcomingShipments = this.contracts.filter(c => 
      new Date(c.shipment_date!) <= thirtyDaysFromNow
    ).length;

    this.uniqueCountries = new Set(this.contracts.map(c => c.country_destination)).size;
  }

  private updateFilterOptions(): void {
    // Atualizar opções de filtro baseadas nos contratos ativos
    this.activeCurrencies = [...new Set(this.contracts.map(c => c.currency))];
    
    const activeIncotermValues = [...new Set(this.contracts.map(c => c.incoterm))];
    this.activeIncoterms = Object.entries(this.incotermLabels)
      .filter(([value]) => activeIncotermValues.includes(value as any))
      .map(([value, label]) => ({ value, label }));
      
    const activeCountryCodes = [...new Set(this.contracts.map(c => c.country_destination))];
    this.activeCountries = this.filterOptions?.countries.filter(c => 
      activeCountryCodes.includes(c.code)
    ) || [];
  }

  public applyFilters(): void {
    const formValue = this.filtroForm.value;
    
    const additionalFilters: Partial<ContractFilters> = {
      currency: formValue.currency?.length ? formValue.currency : undefined,
      incoterm: formValue.incoterm?.length ? formValue.incoterm : undefined,
      countries: formValue.countries?.length ? formValue.countries : undefined,
      exporter_id: formValue.exporter_id?.length ? formValue.exporter_id : undefined,
      value_min: formValue.value_min || undefined,
      value_max: formValue.value_max || undefined,
      date_from: formValue.date_from || undefined,
      date_to: formValue.date_to || undefined
    };

    this.loadActiveContracts(additionalFilters);
  }

  public clearFilters(): void {
    this.filtroForm.reset({
      currency: [],
      incoterm: [],
      countries: [],
      exporter_id: [],
      value_min: null,
      value_max: null,
      date_from: null,
      date_to: null
    });
    
    this.loadActiveContracts();
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
        this.loadActiveContracts();
      }
    });
  }

  public goToNewContracts(): void {
    this.router.navigate(['/home-logged/contratos/novo']);
  }

  public viewContractDetails(contract: Contract): void {
    // Abre o diálogo de contrato (centralizado) para visualização/edição
    this.editContract(contract);
  }

  public trackShipment(contract: Contract): void {
    this.snackBar.open('Abrindo acompanhamento de status...', '', { duration: 2000 });
    this.router.navigate(['/home-logged/exportacoes/status']);
  }

  public generateDocuments(contract: Contract): void {
    this.snackBar.open('Gerando documentos...', '', { duration: 2000 });
    
    this.contractsService.generateDocuments(contract.contract_id!).subscribe({
      next: (result) => {
        if (result.success) {
          this.snackBar.open('Documentos gerados com sucesso!', 'Fechar', { duration: 3000 });
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
          this.snackBar.open(`Enviado com sucesso! Protocolo: ${result.protocol}`, 'Fechar', { duration: 5000 });
        }
      },
      error: () => {
        this.snackBar.open('Erro ao enviar para Receita Federal', 'Fechar', { duration: 3000 });
      }
    });
  }

  public closeContract(contract: Contract): void {
    const dialogRef = this.dialog.open(ConfirmarAcaoDialogComponent, {
      width: '440px',
      data: {
        title: 'Fechar Contrato',
        message: `Tem certeza que deseja fechar o contrato ${contract.contract_number}? Esta ação não pode ser desfeita.`,
        icon: 'close',
        iconColor: '#f44336',
        confirmText: 'Fechar Contrato',
        confirmColor: 'warn'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      const updatedContract = { ...contract, status: 'Closed' as const };

      this.contractsService.updateContract(contract.contract_id!, updatedContract).subscribe({
        next: () => {
          this.snackBar.open('Contrato fechado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadActiveContracts();
        },
        error: () => {
          this.snackBar.open('Erro ao fechar contrato', 'Fechar', { duration: 3000 });
        }
      });
    });
  }

  public isShipmentSoon(shipmentDate: string | Date | undefined): boolean {
    if (!shipmentDate) return false;
    
    const shipment = new Date(shipmentDate);
    const fourteenDaysFromNow = new Date();
    fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);
    
    return shipment <= fourteenDaysFromNow;
  }

  public getDaysUntilShipment(shipmentDate: string | Date | undefined): number {
    if (!shipmentDate) return 0;
    
    const shipment = new Date(shipmentDate);
    const today = new Date();
    const diffTime = shipment.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  public getDaysColor(shipmentDate: string | Date | undefined): string {
    const days = this.getDaysUntilShipment(shipmentDate);
    
    if (days <= 7) return '#f44336'; // Vermelho - urgente
    if (days <= 14) return '#ff9800'; // Laranja - atenção
    if (days <= 30) return '#ffc107'; // Amarelo - em breve
    return '#4caf50'; // Verde - tranquilo
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

  public getIncotermLabel(incoterm: string): string {
    return this.incotermLabels[incoterm as keyof typeof this.incotermLabels] || incoterm;
  }

  public getCurrencyLabel(currency: string): string {
    return this.currencyLabels[currency as keyof typeof this.currencyLabels] || currency;
  }
}

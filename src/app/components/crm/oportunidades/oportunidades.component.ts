import { Component, OnInit, OnDestroy, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';

import { CrmMockService } from '../../../../services/crmMockService';
import { ExportService } from '../../../../services/exportService';
import { Opportunity, OpportunityStage } from '../../../../types/crm';
import { NovaOportunidadeDialogComponent } from '../dialogs/nova-oportunidade-dialog.component';

@Component({
  selector: 'app-oportunidades',
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
    MatChipsModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule
  ],
  templateUrl: './oportunidades.component.html',
  styleUrls: ['./oportunidades.component.scss']
})
export class OportunidadesComponent implements OnInit, OnDestroy, AfterViewInit {

  private service = inject(CrmMockService);
  private exportService = inject(ExportService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  opportunities: Opportunity[] = [];
  dataSource = new MatTableDataSource<Opportunity>([]);
  isLoading = false;

  filterForm!: FormGroup;

  displayedColumns: string[] = [
    'title', 'customerName', 'estimatedValue', 'probability', 'stage', 'expectedCloseDate', 'assignedUser'
  ];

  stages: OpportunityStage[] = [];

  // Pipeline summary
  pipelineSummary: { stage: OpportunityStage; label: string; count: number; value: number; color: string }[] = [];

  ngOnInit(): void {
    this.initForms();
    this.stages = this.service.getStages();
    this.loadOpportunities();
    this.setupFilterListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private initForms(): void {
    this.filterForm = this.formBuilder.group({
      searchText: [''],
      stage: ['']
    });
  }

  private setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => this.applyFilters());
  }

  loadOpportunities(): void {
    this.isLoading = true;
    this.service.getOpportunities()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.opportunities = data;
          this.dataSource.data = data;
          this.buildPipelineSummary(data);
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar oportunidades', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  private buildPipelineSummary(opps: Opportunity[]): void {
    const stageConfig: { stage: OpportunityStage; label: string; color: string }[] = [
      { stage: 'PROSPECTING', label: 'Prospecção', color: '#90caf9' },
      { stage: 'QUALIFICATION', label: 'Qualificação', color: '#64b5f6' },
      { stage: 'PROPOSAL', label: 'Proposta', color: '#42a5f5' },
      { stage: 'NEGOTIATION', label: 'Negociação', color: '#1e88e5' },
      { stage: 'CLOSED_WON', label: 'Ganho', color: '#4caf50' },
      { stage: 'CLOSED_LOST', label: 'Perdido', color: '#ef5350' }
    ];

    this.pipelineSummary = stageConfig.map(cfg => {
      const stageOpps = opps.filter(o => o.stage === cfg.stage);
      return {
        ...cfg,
        count: stageOpps.length,
        value: stageOpps.reduce((sum, o) => sum + o.estimatedValue, 0)
      };
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    let filtered = [...this.opportunities];

    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      filtered = filtered.filter(o =>
        o.title.toLowerCase().includes(search) ||
        o.customerName.toLowerCase().includes(search) ||
        o.assignedUser.toLowerCase().includes(search)
      );
    }
    if (filters.stage) {
      filtered = filtered.filter(o => o.stage === filters.stage);
    }

    this.dataSource.data = filtered;
  }

  clearFilters(): void {
    this.filterForm.reset({ searchText: '', stage: '' });
  }

  openNewOpportunityDialog(): void {
    const dialogRef = this.dialog.open(NovaOportunidadeDialogComponent, {
      width: '700px',
      maxHeight: '90vh',
      panelClass: 'novo-usuario-panel'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.service.createOpportunity(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe(newOpp => {
              this.opportunities.push(newOpp);
              this.dataSource.data = [...this.opportunities];
              this.buildPipelineSummary(this.opportunities);
              this.snackBar.open('Oportunidade criada com sucesso!', 'OK', { duration: 3000 });
            });
        }
      });
  }

  exportPDF(): void {
    const columns = [
      { key: 'title', label: 'Título' },
      { key: 'customerName', label: 'Cliente' },
      { key: 'estimatedValue', label: 'Valor' },
      { key: 'probability', label: 'Probabilidade' },
      { key: 'stage', label: 'Estágio' },
      { key: 'assignedUser', label: 'Responsável' }
    ];
    this.exportService.exportToPDF('Oportunidades', this.dataSource.data, columns, 'oportunidades');
  }

  exportCSV(): void {
    const columns = [
      { key: 'title', label: 'Título' },
      { key: 'customerName', label: 'Cliente' },
      { key: 'estimatedValue', label: 'Valor Estimado' },
      { key: 'probability', label: 'Probabilidade (%)' },
      { key: 'stage', label: 'Estágio' },
      { key: 'expectedCloseDate', label: 'Previsão Fechamento' },
      { key: 'assignedUser', label: 'Responsável' }
    ];
    this.exportService.exportToCSV(this.dataSource.data, columns, 'oportunidades');
  }

  // ================================
  // HELPERS
  // ================================

  getStageLabel(stage: OpportunityStage): string {
    const map: Record<OpportunityStage, string> = {
      'PROSPECTING': 'Prospecção',
      'QUALIFICATION': 'Qualificação',
      'PROPOSAL': 'Proposta',
      'NEGOTIATION': 'Negociação',
      'CLOSED_WON': 'Ganho',
      'CLOSED_LOST': 'Perdido'
    };
    return map[stage] || stage;
  }

  getStageClass(stage: OpportunityStage): string {
    const map: Record<OpportunityStage, string> = {
      'PROSPECTING': 'stage-prospecting',
      'QUALIFICATION': 'stage-qualification',
      'PROPOSAL': 'stage-proposal',
      'NEGOTIATION': 'stage-negotiation',
      'CLOSED_WON': 'stage-won',
      'CLOSED_LOST': 'stage-lost'
    };
    return map[stage] || '';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}

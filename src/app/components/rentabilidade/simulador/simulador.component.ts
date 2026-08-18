import { Component, OnInit, OnDestroy, ViewChild, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

// Services and Types
import { SimuladorMockService } from '../../../../services/simuladorMockService';
import { SimulacaoInput, SimulacaoResult, SimulacaoHistorico } from '../../../../types/simulador-rentabilidade';

@Component({
  selector: 'app-simulador',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './simulador.component.html',
  styleUrls: ['./simulador.component.scss']
})
export class SimuladorComponent implements OnInit, OnDestroy, AfterViewInit {

  private simuladorService = inject(SimuladorMockService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  simulacaoForm!: FormGroup;
  result: SimulacaoResult | null = null;
  simulating = false;
  loading = true;

  dataSource = new MatTableDataSource<SimulacaoHistorico>();
  displayedColumns: string[] = ['date', 'product', 'country', 'volume', 'receita', 'margem', 'margemPercent'];

  products = ['Soja em Grãos', 'Café Arábica', 'Carne Bovina', 'Frango Congelado', 'Açúcar Cristal', 'Celulose', 'Minério de Ferro', 'Etanol', 'Milho', 'Algodão'];
  units = ['ton', 'kg', 'm³', 'sacos'];
  currencies = ['USD', 'EUR', 'GBP'];
  incoterms = ['FOB', 'CIF', 'CFR', 'EXW', 'FCA', 'DAP'];
  ports = ['Santos', 'Paranaguá', 'Rio Grande', 'Itaguaí', 'Itajaí', 'Salvador', 'Vitória'];
  countries = ['China', 'EUA', 'Japão', 'Alemanha', 'Arábia Saudita', 'Índia', 'Holanda', 'Coreia do Sul', 'Chile', 'Argentina'];

  ngOnInit(): void {
    this.simulacaoForm = this.fb.group({
      product: ['', Validators.required],
      volume: [null, [Validators.required, Validators.min(1)]],
      unit: ['ton', Validators.required],
      pricePerUnit: [null, [Validators.required, Validators.min(0.01)]],
      currency: ['USD', Validators.required],
      incoterm: ['FOB', Validators.required],
      originPort: ['Santos', Validators.required],
      destinationCountry: ['', Validators.required],
      exchangeRate: [5.05, [Validators.required, Validators.min(0.01)]]
    });

    this.loadHistorico();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadHistorico(): void {
    this.simuladorService.getHistorico()
      .pipe(takeUntil(this.destroy$))
      .subscribe(historico => {
        this.dataSource.data = historico;
        this.loading = false;
      });
  }

  simular(): void {
    if (this.simulacaoForm.invalid) return;

    this.simulating = true;
    this.result = null;

    const input: SimulacaoInput = this.simulacaoForm.value;

    this.simuladorService.simular(input)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.result = result;
        this.simulating = false;
      });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
}

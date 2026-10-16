import { Component, OnInit, inject, ViewChild, ElementRef, OnDestroy, PLATFORM_ID, Inject, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { startWith, debounceTime } from 'rxjs';
import { DASHBOARD_SERVICE } from '../../../services/dashboard/dashboard-service.token';
import { IDashboardService } from '../../../services/dashboard/dashboard-service.interface';
import { 
  DashboardCompleto, 
  FiltrosDashboard, 
  OptionsFilters
} from '../../../../types/dashboard';

// Chart.js será importado dinamicamente apenas no cliente
let Chart: any;
let registerables: any;

@Component({
  selector: 'app-dashboard-principal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatGridListModule
  ],
  templateUrl: './dashboard-principal.component.html',
  styleUrl: './dashboard-principal.component.scss'
})
export class DashboardPrincipalComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly dashboardService = inject<IDashboardService>(DASHBOARD_SERVICE);
  private readonly fb = inject(FormBuilder);

  @ViewChild('chartExportacoesMes', { static: false }) chartExportacoesMes!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartExportacoesPais', { static: false }) chartExportacoesPais!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartExportacoesProduto', { static: false }) chartExportacoesProduto!: ElementRef<HTMLCanvasElement>;

  public dashboardData: DashboardCompleto | null = null;
  public optionsFilters: OptionsFilters | null = null;
  public isLoading = false;
  public loadError = false;
  public filtersUnavailable = false;
  public statusMessage = '';
  public filtroForm: FormGroup;

  private charts: { [key: string]: any } = {};
  private chartLibraryLoaded = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.filtroForm = this.fb.group({
      dataInicio: [null],
      dataFim: [null],
      paises: [[]],
      produtos: [[]],
      clientes: [[]]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFormSubscription();
  }

  ngAfterViewInit(): void {
    // Carregar Chart.js quando os elementos estão prontos
    if (isPlatformBrowser(this.platformId)) {
      // Aguarda um frame para garantir que os elementos estão prontos
      requestAnimationFrame(() => {
        this.loadChartLibrary();
      });
    }
  }

  ngOnDestroy(): void {
    // Só destroi gráficos se estiver no cliente
    if (isPlatformBrowser(this.platformId)) {
      Object.values(this.charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
    }
  }

  private loadInitialData(): void {
    this.isLoading = true;
    this.loadError = false;

    // Dados principais do dashboard (KPIs + séries). Um erro aqui mostra o
    // estado de erro honesto, sem fallback para mock.
    this.dashboardService.getDashboardData().subscribe({
      next: (dashboardData) => {
        this.dashboardData = dashboardData;
        this.loadError = false;
        this.isLoading = false;
        this.announceUpdate();

        // Só cria gráficos no lado cliente
        if (isPlatformBrowser(this.platformId) && this.chartLibraryLoaded) {
          this.waitForCanvasAndCreateCharts();
        }
      },
      error: () => {
        this.dashboardData = null;
        this.loadError = true;
        this.isLoading = false;
      }
    });

    // Catálogos de filtro: um erro aqui NÃO bloqueia o restante da tela
    // (Req 8.3) — apenas sinaliza que os filtros estão indisponíveis.
    this.loadOptionsFilters();
  }

  private loadOptionsFilters(): void {
    this.dashboardService.getOptionsFilters().subscribe({
      next: (optionsFilters) => {
        this.optionsFilters = optionsFilters;
        this.filtersUnavailable = false;
      },
      error: () => {
        this.optionsFilters = null;
        this.filtersUnavailable = true;
      }
    });
  }

  private announceUpdate(): void {
    this.statusMessage = 'Dashboard atualizado';
  }

  private async loadChartLibrary(): Promise<void> {
    try {
      // Importa Chart.js dinamicamente apenas no cliente
      const chartModule = await import('chart.js');
      Chart = chartModule.Chart;
      registerables = chartModule.registerables;

      // Registra os componentes do Chart.js
      Chart.register(...registerables);
      this.chartLibraryLoaded = true;

      // Se os dados já estão disponíveis, cria os gráficos
      if (this.dashboardData) {
        this.waitForCanvasAndCreateCharts();
      }
    } catch {
      // Falha ao carregar a biblioteca de gráficos é tratada silenciosamente;
      // a tela continua exibindo KPIs e alternativas textuais.
    }
  }

  private setupFormSubscription(): void {
    this.filtroForm.valueChanges
      .pipe(
        startWith(null),
        debounceTime(500)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  private applyFilters(): void {
    if (!this.filtroForm.value) return;

    const filtros: FiltrosDashboard = {
      periodo: {
        dataInicio: this.filtroForm.value.dataInicio,
        dataFim: this.filtroForm.value.dataFim
      },
      paises: this.filtroForm.value.paises || [],
      produtos: this.filtroForm.value.produtos || [],
      clientes: this.filtroForm.value.clientes || []
    };

    this.isLoading = true;
    this.loadError = false;
    this.dashboardService.getDashboardData(filtros).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loadError = false;
        // Só atualiza gráficos no lado cliente
        if (isPlatformBrowser(this.platformId)) {
          this.updateCharts();
        }
        this.isLoading = false;
        this.announceUpdate();
      },
      error: () => {
        this.dashboardData = null;
        this.loadError = true;
        this.isLoading = false;
      }
    });
  }

  private waitForCanvasAndCreateCharts(): void {
    let attempts = 0;
    const maxAttempts = 10;

    const checkAndCreate = () => {
      attempts++;

      if (this.chartExportacoesMes?.nativeElement &&
          this.chartExportacoesPais?.nativeElement &&
          this.chartExportacoesProduto?.nativeElement) {
        this.createCharts();
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(checkAndCreate, 100);
      }
    };

    checkAndCreate();
  }

  private createCharts(): void {
    if (!this.dashboardData || !Chart) {
      return;
    }

    // Pequeno delay para garantir que o DOM está pronto
    setTimeout(() => {
      this.createLineChart();
      this.createPieChart();
      this.createBarChart();
    }, 50);
  }

  private createLineChart(): void {
    const canvasElement = this.chartExportacoesMes?.nativeElement;
    if (!canvasElement) {
      return;
    }

    if (!this.dashboardData?.exportacoesPorMes || this.dashboardData.exportacoesPorMes.length === 0) {
      return;
    }

    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
      return;
    }

    // Destroi gráfico existente se houver
    if (this.charts['line']) {
      this.charts['line'].destroy();
    }

    try {
      const dados = this.dashboardData.exportacoesPorMes;

      this.charts['line'] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dados.map(item => {
            const date = new Date(item.mes + '-01');
            return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
          }),
          datasets: [{
            label: 'Exportações (R$)',
            data: dados.map(item => item.valor),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            fill: true,
            pointRadius: 5,
            pointHoverRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value: any) {
                  return new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL',
                    minimumFractionDigits: 0
                  }).format(Number(value));
                }
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context: any) {
                  const value = context.parsed.y;
                  return 'Exportações: ' + new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL'
                  }).format(value || 0);
                }
              }
            }
          }
        }
      });
    } catch {
      // Falha isolada na criação do gráfico não impede os demais.
    }
  }

  private createPieChart(): void {
    const canvasElement = this.chartExportacoesPais?.nativeElement;
    if (!canvasElement) {
      return;
    }

    if (!this.dashboardData?.exportacoesPorPais || this.dashboardData.exportacoesPorPais.length === 0) {
      return;
    }

    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
      return;
    }

    // Destroi gráfico existente se houver
    if (this.charts['pie']) {
      this.charts['pie'].destroy();
    }

    try {
      const dados = this.dashboardData.exportacoesPorPais;

      this.charts['pie'] = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: dados.map(item => item.pais),
          datasets: [{
            data: dados.map(item => item.valor),
            backgroundColor: [
              '#FF6384',
              '#36A2EB', 
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
              '#FF6B6B',
              '#4ECDC4'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                usePointStyle: true
              }
            },
            tooltip: {
              callbacks: {
                label: function(context: any) {
                  const label = context.label || '';
                  const value = new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL'
                  }).format(context.parsed || 0);
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = context.dataset.data[context.dataIndex];
                  const percent = ((percentage / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percent}%)`;
                }
              }
            }
          }
        }
      });
    } catch {
      // Falha isolada na criação do gráfico não impede os demais.
    }
  }

  private createBarChart(): void {
    const canvasElement = this.chartExportacoesProduto?.nativeElement;
    if (!canvasElement) {
      return;
    }

    if (!this.dashboardData?.exportacoesPorProduto || this.dashboardData.exportacoesPorProduto.length === 0) {
      return;
    }

    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
      return;
    }

    // Destroi gráfico existente se houver
    if (this.charts['bar']) {
      this.charts['bar'].destroy();
    }

    try {
      const dados = this.dashboardData.exportacoesPorProduto;

      this.charts['bar'] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: dados.map(item => item.produto),
          datasets: [{
            label: 'Valor Exportado (R$)',
            data: dados.map(item => item.valor),
            backgroundColor: [
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(255, 205, 86, 0.8)', 
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)'
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 205, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context: any) {
                  const value = context.parsed.x;
                  return 'Valor: ' + new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL'
                  }).format(value || 0);
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                callback: function(value: any) {
                  return new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL',
                    minimumFractionDigits: 0
                  }).format(Number(value));
                }
              }
            },
            y: {
              ticks: {
                maxRotation: 0,
                font: {
                  size: 12
                }
              }
            }
          }
        }
      });
    } catch {
      // Falha isolada na criação do gráfico não impede os demais.
    }
  }

  private updateCharts(): void {
    // Só atualiza gráficos se estiver no cliente e Chart.js estiver carregado
    if (isPlatformBrowser(this.platformId) && Chart && this.dashboardData) {
      this.waitForCanvasAndCreateCharts();
    }
  }

  public clearFilters(): void {
    this.filtroForm.reset();
  }

  public formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL'
    }).format(value);
  }

  public formatPercentage(value: number): string {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  }

  public formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  // Alternativas textuais acessíveis para os gráficos (Req 10.1): descrevem,
  // em pt-BR, os dados representados em cada gráfico a partir das séries reais.
  public get descricaoExportacoesPorMes(): string {
    const serie = this.dashboardData?.exportacoesPorMes ?? [];
    if (serie.length === 0) {
      return 'Exportações por mês: nenhum dado disponível para o período selecionado.';
    }
    const itens = serie
      .map(item => {
        const data = new Date(item.mes + '-01');
        const rotulo = data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        return `${rotulo}: ${this.formatCurrency(item.valor)}`;
      })
      .join('; ');
    return `Exportações por mês: ${itens}.`;
  }

  public get descricaoExportacoesPorPais(): string {
    const serie = this.dashboardData?.exportacoesPorPais ?? [];
    if (serie.length === 0) {
      return 'Distribuição por país: nenhum dado disponível para o período selecionado.';
    }
    const itens = serie
      .map(item => `${item.pais}: ${this.formatCurrency(item.valor)} (${this.formatPercentage(item.percentual)})`)
      .join('; ');
    return `Distribuição por país: ${itens}.`;
  }

  public get descricaoExportacoesPorProduto(): string {
    const serie = this.dashboardData?.exportacoesPorProduto ?? [];
    if (serie.length === 0) {
      return 'Exportações por produto: nenhum dado disponível para o período selecionado.';
    }
    const itens = serie
      .map(item => `${item.produto}: ${this.formatCurrency(item.valor)}`)
      .join('; ');
    return `Exportações por produto: ${itens}.`;
  }
}
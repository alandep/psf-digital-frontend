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
import { Observable, combineLatest, startWith, debounceTime } from 'rxjs';
import { DashboardMockService } from '@services/dashboardMockService';
import { 
  DashboardCompleto, 
  FiltrosDashboard, 
  OptionsFilters,
  DashboardData
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
  private readonly dashboardService = inject(DashboardMockService);
  private readonly fb = inject(FormBuilder);

  @ViewChild('chartExportacoesMes', { static: false }) chartExportacoesMes!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartExportacoesPais', { static: false }) chartExportacoesPais!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartExportacoesProduto', { static: false }) chartExportacoesProduto!: ElementRef<HTMLCanvasElement>;

  public dashboardData: DashboardCompleto | null = null;
  public optionsFilters: OptionsFilters | null = null;
  public isLoading = false;
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
    console.log('📊 Dashboard Principal iniciando...');
    this.loadInitialData();
    this.setupFormSubscription();
    
    // Debug: verificar dados do serviço separadamente
    this.debugService();
  }

  private debugService(): void {
    console.log('🔍 [DEBUG] Testando serviço separadamente...');
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        console.log('🔍 [DEBUG] Dados recebidos do serviço:', {
          kpis: data?.kpis,
          exportacoesPorMes: data?.exportacoesPorMes,
          exportacoesPorPais: data?.exportacoesPorPais,
          exportacoesPorProduto: data?.exportacoesPorProduto,
          jsonCompleto: JSON.stringify(data, null, 2)
        });
      },
      error: (error) => {
        console.error('🔍 [DEBUG] Erro no serviço:', error);
      }
    });
  }

  ngAfterViewInit(): void {
    console.log('📐 ViewChild elementos disponíveis');
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
    console.log('📊 Carregando dados iniciais...');
    this.isLoading = true;
    
    combineLatest([
      this.dashboardService.getDashboardData(),
      this.dashboardService.getOptionsFilters()
    ]).subscribe({
      next: ([dashboardData, optionsFilters]) => {
        console.log('✅ Dados carregados:', {
          dashboardData: !!dashboardData,
          exportacoesPorMes: dashboardData?.exportacoesPorMes?.length,
          exportacoesPorPais: dashboardData?.exportacoesPorPais?.length,
          exportacoesPorProduto: dashboardData?.exportacoesPorProduto?.length,
          optionsFilters: !!optionsFilters,
          isBrowser: isPlatformBrowser(this.platformId),
          chartLibraryLoaded: this.chartLibraryLoaded
        });
        
        this.dashboardData = dashboardData;
        this.optionsFilters = optionsFilters;
        this.isLoading = false;
        
        // Só cria gráficos no lado cliente
        if (isPlatformBrowser(this.platformId)) {
          // Se Chart.js já foi carregado, cria os gráficos imediatamente
          if (this.chartLibraryLoaded) {
            console.log('📈 Chart.js já carregado, criando gráficos...');
            this.waitForCanvasAndCreateCharts();
          } else {
            console.log('⏳ Chart.js não carregado ainda, aguardando...');
          }
        }
      },
      error: (error) => {
        console.error('❌ Erro ao carregar dados iniciais:', error);
        this.isLoading = false;
      }
    });
  }

  private async loadChartLibrary(): Promise<void> {
    try {
      console.log('📈 Carregando Chart.js...');
      // Importa Chart.js dinamicamente apenas no cliente
      const chartModule = await import('chart.js');
      Chart = chartModule.Chart;
      registerables = chartModule.registerables;
      
      // Registra os componentes do Chart.js
      Chart.register(...registerables);
      this.chartLibraryLoaded = true;
      
      console.log('✅ Chart.js carregado com sucesso!');
      
      // Se os dados já estão disponíveis, cria os gráficos
      if (this.dashboardData) {
        this.waitForCanvasAndCreateCharts();
      }
    } catch (error) {
      console.error('❌ Erro ao carregar Chart.js:', error);
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
    this.dashboardService.getDashboardData(filtros).subscribe({
      next: (data) => {
        this.dashboardData = data;
        // Só atualiza gráficos no lado cliente
        if (isPlatformBrowser(this.platformId)) {
          this.updateCharts();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao aplicar filtros:', error);
        this.isLoading = false;
      }
    });
  }

  private async loadChartLibraryAndCreateCharts(): Promise<void> {
    try {
      // Importa Chart.js dinamicamente apenas no cliente
      const chartModule = await import('chart.js');
      Chart = chartModule.Chart;
      registerables = chartModule.registerables;
      
      // Registra os componentes do Chart.js
      Chart.register(...registerables);
      
      // Agora cria os gráficos
      this.createCharts();
    } catch (error) {
      console.error('Erro ao carregar Chart.js:', error);
    }
  }

  private waitForCanvasAndCreateCharts(): void {
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkAndCreate = () => {
      attempts++;
      console.log(`🔍 Tentativa ${attempts}/${maxAttempts} - Verificando canvas elements...`);
      
      if (this.chartExportacoesMes?.nativeElement && 
          this.chartExportacoesPais?.nativeElement &&
          this.chartExportacoesProduto?.nativeElement) {
        console.log('✅ Todos os canvas elements prontos!');
        this.createCharts();
        return;
      }
      
      if (attempts < maxAttempts) {
        console.log('⏳ Canvas elements não prontos, tentando novamente em 100ms...');
        setTimeout(checkAndCreate, 100);
      } else {
        console.error('❌ Timeout: Canvas elements não ficaram prontos a tempo');
      }
    };
    
    checkAndCreate();
  }

  private createCharts(): void {
    if (!this.dashboardData || !Chart) {
      console.log('⚠️ Não é possível criar gráficos:', {
        temDados: !!this.dashboardData,
        chartCarregado: !!Chart
      });
      return;
    }

    console.log('📊 Criando gráficos...', {
      chartExportacoesMes: !!this.chartExportacoesMes?.nativeElement,
      chartExportacoesPais: !!this.chartExportacoesPais?.nativeElement,
      chartExportacoesProduto: !!this.chartExportacoesProduto?.nativeElement
    });

    // Pequeno delay para garantir que o DOM está pronto
    setTimeout(() => {
      this.createLineChart();
      this.createPieChart();
      this.createBarChart();
    }, 50);
  }

  private createLineChart(): void {
    console.log('📈 [Line Chart] Tentando criar gráfico de linha...');
    
    const canvasElement = this.chartExportacoesMes?.nativeElement;
    if (!canvasElement) {
      console.error('❌ [Line Chart] Canvas não encontrado!');
      return;
    }
    
    if (!this.dashboardData?.exportacoesPorMes || this.dashboardData.exportacoesPorMes.length === 0) {
      console.error('❌ [Line Chart] Dados de exportações por mês não encontrados!', this.dashboardData?.exportacoesPorMes);
      return;
    }

    console.log('✅ [Line Chart] Canvas e dados encontrados, criando contexto...', {
      canvasWidth: canvasElement.width,
      canvasHeight: canvasElement.height,
      dadosLength: this.dashboardData.exportacoesPorMes.length
    });
    
    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
      console.error('❌ [Line Chart] Falha ao obter contexto 2D!');
      return;
    }

    // Destroi gráfico existente se houver
    if (this.charts['line']) {
      console.log('🔄 [Line Chart] Destruindo gráfico anterior...');
      this.charts['line'].destroy();
    }

    try {
      const dados = this.dashboardData.exportacoesPorMes;
      console.log('📊 [Line Chart] Dados processados:', {
        primeiroItem: dados[0],
        ultimoItem: dados[dados.length - 1],
        totalItens: dados.length
      });

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
      
      console.log('🎉 [Line Chart] Gráfico criado com sucesso!');
    } catch (error) {
      console.error('💥 [Line Chart] Erro ao criar gráfico:', error);
    }
  }

  private createPieChart(): void {
    console.log('🥧 [Pie Chart] Tentando criar gráfico de pizza...');
    
    const canvasElement = this.chartExportacoesPais?.nativeElement;
    if (!canvasElement) {
      console.error('❌ [Pie Chart] Canvas não encontrado!');
      return;
    }
    
    if (!this.dashboardData?.exportacoesPorPais || this.dashboardData.exportacoesPorPais.length === 0) {
      console.error('❌ [Pie Chart] Dados de exportações por país não encontrados!', this.dashboardData?.exportacoesPorPais);
      return;
    }

    console.log('✅ [Pie Chart] Canvas e dados encontrados, criando contexto...', {
      canvasWidth: canvasElement.width,
      canvasHeight: canvasElement.height,
      dadosLength: this.dashboardData.exportacoesPorPais.length
    });
    
    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
      console.error('❌ [Pie Chart] Falha ao obter contexto 2D!');
      return;
    }

    // Destroi gráfico existente se houver
    if (this.charts['pie']) {
      console.log('🔄 [Pie Chart] Destruindo gráfico anterior...');
      this.charts['pie'].destroy();
    }

    try {
      const dados = this.dashboardData.exportacoesPorPais;
      console.log('🥧 [Pie Chart] Dados processados:', {
        primeiroItem: dados[0],
        totalItens: dados.length,
        somaValores: dados.reduce((acc, item) => acc + item.valor, 0)
      });

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
      
      console.log('🎉 [Pie Chart] Gráfico criado com sucesso!');
    } catch (error) {
      console.error('💥 [Pie Chart] Erro ao criar gráfico:', error);
    }
  }

  private createBarChart(): void {
    console.log('📊 [Bar Chart] Tentando criar gráfico de barras...');
    
    const canvasElement = this.chartExportacoesProduto?.nativeElement;
    if (!canvasElement) {
      console.error('❌ [Bar Chart] Canvas não encontrado!');
      return;
    }
    
    if (!this.dashboardData?.exportacoesPorProduto || this.dashboardData.exportacoesPorProduto.length === 0) {
      console.error('❌ [Bar Chart] Dados de exportações por produto não encontrados!', this.dashboardData?.exportacoesPorProduto);
      return;
    }

    console.log('✅ [Bar Chart] Canvas e dados encontrados, criando contexto...', {
      canvasWidth: canvasElement.width,
      canvasHeight: canvasElement.height,
      dadosLength: this.dashboardData.exportacoesPorProduto.length
    });
    
    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
      console.error('❌ [Bar Chart] Falha ao obter contexto 2D!');
      return;
    }

    // Destroi gráfico existente se houver
    if (this.charts['bar']) {
      console.log('🔄 [Bar Chart] Destruindo gráfico anterior...');
      this.charts['bar'].destroy();
    }

    try {
      const dados = this.dashboardData.exportacoesPorProduto;
      console.log('📊 [Bar Chart] Dados processados:', {
        primeiroItem: dados[0],
        totalItens: dados.length,
        maiorValor: Math.max(...dados.map(item => item.valor))
      });

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
      
      console.log('🎉 [Bar Chart] Gráfico criado com sucesso!');
    } catch (error) {
      console.error('💥 [Bar Chart] Erro ao criar gráfico:', error);
    }
  }

  private updateCharts(): void {
    // Só atualiza gráficos se estiver no cliente e Chart.js estiver carregado
    console.log('🔄 Atualizando gráficos...', {
      isBrowser: isPlatformBrowser(this.platformId),
      chartLoaded: !!Chart,
      hasData: !!this.dashboardData
    });
    
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
}
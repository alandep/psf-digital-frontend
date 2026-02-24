import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

let Chart: any;

@Component({
  selector: 'app-test-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Teste Chart.js</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div style="position: relative; height: 300px; width: 100%;">
          <canvas #testChart></canvas>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: []
})
export class TestChartComponent implements OnInit, AfterViewInit {
  @ViewChild('testChart', { static: false }) testChart!: ElementRef<HTMLCanvasElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    console.log('🧪 Test Chart Component inicializando...');
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadChartAndCreate();
    }
  }

  private async loadChartAndCreate(): Promise<void> {
    try {
      console.log('📈 [TEST] Carregando Chart.js...');
      const chartModule = await import('chart.js');
      Chart = chartModule.Chart;
      
      Chart.register(...chartModule.registerables);
      console.log('✅ [TEST] Chart.js carregado!');

      // Pequeno delay para garantir que o canvas está pronto
      setTimeout(() => this.createSimpleChart(), 100);
    } catch (error) {
      console.error('❌ [TEST] Erro ao carregar Chart.js:', error);
    }
  }

  private createSimpleChart(): void {
    const canvas = this.testChart?.nativeElement;
    
    if (!canvas) {
      console.error('❌ [TEST] Canvas não encontrado');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ [TEST] Contexto 2D não encontrado');
      return;
    }

    console.log('📊 [TEST] Criando gráfico simples...');

    try {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
          datasets: [{
            label: 'Teste',
            data: [10, 20, 15, 25, 18],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      console.log('🎉 [TEST] Gráfico simples criado com sucesso!');
    } catch (error) {
      console.error('💥 [TEST] Erro ao criar gráfico simples:', error);
    }
  }
}
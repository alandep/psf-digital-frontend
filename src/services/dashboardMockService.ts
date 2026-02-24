import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { 
  DashboardCompleto, 
  FiltrosDashboard, 
  OptionsFilters,
  DashboardData,
  ExportacoesPorMes,
  ExportacoesPorPais,
  ExportacoesPorProduto
} from '../types/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardMockService {

  private readonly dadosMock: DashboardCompleto = {
    kpis: {
      total_exportacoes: 15750000.50,
      total_embarcado: 12300000.25,
      total_pendente: 3450000.25,
      lucro_estimado: 2835000.10,
      margem_media: 18.75,
      contratos_ativos: 45,
      alertas_compliance: 3
    },
    exportacoesPorMes: [
      { mes: '2024-01', valor: 1200000 },
      { mes: '2024-02', valor: 1500000 },
      { mes: '2024-03', valor: 1800000 },
      { mes: '2024-04', valor: 1350000 },
      { mes: '2024-05', valor: 1950000 },
      { mes: '2024-06', valor: 2100000 },
      { mes: '2024-07', valor: 1750000 },
      { mes: '2024-08', valor: 2250000 },
      { mes: '2024-09', valor: 1900000 },
      { mes: '2024-10', valor: 2400000 },
      { mes: '2024-11', valor: 2200000 },
      { mes: '2024-12', valor: 2050000 }
    ],
    exportacoesPorPais: [
      { pais: 'Estados Unidos', valor: 5250000, percentual: 33.3 },
      { pais: 'Alemanha', valor: 3150000, percentual: 20.0 },
      { pais: 'Reino Unido', valor: 2362500, percentual: 15.0 },
      { pais: 'França', valor: 1890000, percentual: 12.0 },
      { pais: 'Japão', valor: 1575000, percentual: 10.0 },
      { pais: 'Outros', valor: 1522500, percentual: 9.7 }
    ],
    exportacoesPorProduto: [
      { produto: 'Café Premium', valor: 4200000 },
      { produto: 'Soja', valor: 3800000 },
      { produto: 'Açúcar Cristal', valor: 2900000 },
      { produto: 'Carne Bovina', valor: 2150000 },
      { produto: 'Milho', valor: 1750000 },
      { produto: 'Laranja', valor: 950000 }
    ]
  };

  private readonly filtrosMock: OptionsFilters = {
    paises: [
      'Estados Unidos',
      'Alemanha', 
      'Reino Unido',
      'França',
      'Japão',
      'Canadá',
      'Holanda',
      'Itália',
      'Espanha',
      'Coreia do Sul'
    ],
    produtos: [
      'Café Premium',
      'Soja',
      'Açúcar Cristal',
      'Carne Bovina',
      'Milho',
      'Laranja',
      'Cacau',
      'Algodão',
      'Frango',
      'Ferro'
    ],
    clientes: [
      'International Trading Co.',
      'Global commodities Ltd.',
      'European Import Group',
      'American Food Corp.',
      'Asian Markets Inc.',
      'Continental Traders',
      'Pacific Commerce',
      'Atlantic Partners',
      'Mediterranean Imports',
      'Northern Trading'
    ]
  };

  getDashboardData(filtros?: FiltrosDashboard): Observable<DashboardCompleto> {
    // Simula filtragem dos dados
    let dadosFiltrados = { ...this.dadosMock };
    
    if (filtros) {
      // Simula aplicação dos filtros
      if (filtros.paises.length > 0) {
        dadosFiltrados.exportacoesPorPais = dadosFiltrados.exportacoesPorPais.filter((item: ExportacoesPorPais) => 
          filtros.paises.includes(item.pais)
        );
      }
      
      if (filtros.produtos.length > 0) {
        dadosFiltrados.exportacoesPorProduto = dadosFiltrados.exportacoesPorProduto.filter((item: ExportacoesPorProduto) => 
          filtros.produtos.includes(item.produto)
        );
      }
    }
    
    return of(dadosFiltrados).pipe(delay(500)); // Simula delay da API
  }

  getOptionsFilters(): Observable<OptionsFilters> {
    return of(this.filtrosMock).pipe(delay(200));
  }

  // Métodos específicos para cada seção
  getKPIs(): Observable<DashboardData> {
    return of(this.dadosMock.kpis).pipe(delay(300));
  }

  getExportacoesPorMes(): Observable<ExportacoesPorMes[]> {
    return of(this.dadosMock.exportacoesPorMes).pipe(delay(400));
  }

  getExportacoesPorPais(): Observable<ExportacoesPorPais[]> {
    return of(this.dadosMock.exportacoesPorPais).pipe(delay(350));
  }

  getExportacoesPorProduto(): Observable<ExportacoesPorProduto[]> {
    return of(this.dadosMock.exportacoesPorProduto).pipe(delay(450));
  }
}
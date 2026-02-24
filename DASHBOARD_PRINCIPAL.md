# Dashboard Principal - Export Intelligence Platform

## Visão Geral
O Dashboard Principal é uma visão executiva geral das exportações, oferecendo indicadores chave de performance (KPIs) e análises gráficas em tempo real.

## Funcionalidades Implementadas

### 📊 Cards KPI
- **Total Exportações**: Valor total exportado
- **Total Embarcado**: Valor já embarcado
- **Total Pendente**: Valor pendente de embarque
- **Lucro Estimado**: Lucro total estimado
- **Margem Média**: Margem média das operações
- **Contratos Ativos**: Quantidade de contratos ativos
- **Alertas Compliance**: Número de alertas de compliance

### 📈 Gráficos Analíticos
1. **Gráfico de Linha**: Exportações por mês (evolução temporal)
2. **Gráfico de Pizza**: Distribuição por país (participação percentual)
3. **Gráfico de Barras**: Exportações por produto (ranking de valores)

### 🎯 Filtros Dinâmicos
- **Período**: Seleção de data início e fim
- **Países**: Filtro múltiplo por países
- **Produtos**: Filtro múltiplo por produtos
- **Clientes**: Filtro múltiplo por clientes

## Arquitetura

### Estrutura de Arquivos
```
src/
├── types/
│   └── dashboard.ts                     # Interfaces TypeScript
├── services/
│   └── dashboardMockService.ts          # Service mock para dados
└── app/components/dashboards/dashboard-principal/
    ├── dashboard-principal.component.ts     # Componente principal
    ├── dashboard-principal.component.html   # Template HTML
    └── dashboard-principal.component.scss   # Estilos SCSS
```

### Tecnologias Utilizadas
- **Angular 20**: Framework principal
- **Angular Material**: Componentes UI
- **Chart.js**: Biblioteca para gráficos
- **TypeScript**: Tipagem estática
- **RxJS**: Programação reativa

## Instalação

### Dependências Necessárias
```bash
# Instalar Chart.js
npm install chart.js
```

### Acesso
O dashboard está disponível através do menu lateral:
- **Menu**: Dashboard Principal
- **Rota**: `/home-logged/dashboards/principal`

## Dados Mock

O serviço `DashboardMockService` simula dados reais da API com:
- Dados de KPIs atualizados
- Histórico mensal de exportações (12 meses)
- Distribuição por 6 países principais
- Top 6 produtos exportados
- Opções de filtros para países, produtos e clientes

## Características Técnicas

### Responsividade
- Layout adaptativo para desktop, tablet e mobile
- Grid system flexível com CSS Grid
- Componentes Material Design responsivos

### Performance
- Componente standalone (lazy loading)
- Debounce de 500ms nos filtros
- Destruição adequada de gráficos para evitar memory leaks

### UX/UI
- Design moderno com gradientes e animações
- Cards KPI com cores temáticas
- Hover effects e transições suaves
- Estados de loading e empty state

## Próximos Passos

1. **Integração Real**: Substituir mock service por API real
2. **Exportação**: Adicionar funcionalidades de exportar dados
3. **Drill-down**: Implementar navegação para detalhes
4. **Alertas**: Integrar sistema de notificações em tempo real
5. **Customização**: Permitir personalização de layout e widgets

## Compatibilidade

- ✅ Angular 20+
- ✅ TypeScript 5+
- ✅ Chart.js 4+
- ✅ Angular Material 20+

---

**Desenvolvido seguindo os padrões da aplicação PSF Digital Frontend**
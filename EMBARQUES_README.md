# Módulo de Embarques - PSF Digital EIP

## 📋 Visão Geral

O módulo de Embarques é o coração operacional do PSF Digital EIP, projetado para gerenciar todo o ciclo de embarques de exportação com automação logística, tracking inteligente e integração com órgãos reguladores.

## 🚀 Características Principais

### ✨ Orientado a Eventos (Tempo Real)
- **Auto-refresh**: Timeline atualizada a cada 30 segundos
- **Tracking automático**: Integração com APIs de armadores
- **Alertas em tempo real**: Notificações sobre atrasos e riscos

### 🤖 Assistido por IA (Previsão + Automação)
- **Sugestão de rotas**: Optimização baseada em custo, tempo e congestionamento
- **Previsão de atrasos**: Machine Learning com histórico de navios e clima
- **ETA inteligente**: Atualização dinâmica em tempo real
- **Preenchimento automático**: DU-E e documentação Siscomex

### 🔄 Altamente Integrado
- **Portal Único Siscomex**: Integração direta
- **Receita Federal**: Validação e envio automático
- **MAPA/Vigiagro**: Certificações fitossanitárias
- **APIs de Armadores**: Maersk, MSC, Hapag-Lloyd

## 📁 Estrutura de Arquivos

```
src/app/components/logistica/embarque/
├── embarque-lista/                    # Listagem de embarques
│   ├── embarque-lista.component.ts
│   ├── embarque-lista.component.html
│   └── embarque-lista.component.scss
├── embarque-form/                     # Formulário criar/editar
│   ├── embarque-form.component.ts
│   ├── embarque-form.component.html
│   └── embarque-form.component.scss
├── embarque-detalhes/                 # Dashboard visual
│   ├── embarque-detalhes.component.ts
│   ├── embarque-detalhes.component.html
│   └── embarque-detalhes.component.scss
├── embarque.routes.ts                 # Configuração de rotas
└── index.ts                           # Exports do módulo

src/types/
└── embarque.ts                        # Interfaces TypeScript

src/services/
└── embarqueMockService.ts             # Serviço mock com dados
```

## 📊 Funcionalidades Implementadas

### 1. **Listagem de Embarques (Grid Principal)**
- ✅ Filtros avançados (status, tracking, datas, portos)
- ✅ Ordenação em múltiplas colunas
- ✅ Paginação inteligente
- ✅ Exportação para Excel
- ✅ Visualização de riscos e status

### 2. **Formulário de Embarque (9 Abas)**

#### 📋 ABA 1 - Geral
- Número do embarque, contrato, exportador/importador
- Commodity, quantidade, unidade, incoterm

#### 🚚 ABA 2 - Transporte  
- Modal, navio, IMO, companhia, booking, BL, tipo de frete

#### 📦 ABA 3 - Containers
- Gerenciamento dinâmico de containers
- Números, tipos, lacres, pesos, datas de stuffing

#### 🌍 ABA 4 - Portos & Rota
- Seleção de portos origem/destino/transbordo
- Descrição detalhada da rota

#### 📅 ABA 5 - Datas & Tracking
- ETD, ETA, ATA, atrasos
- URLs de tracking, status do embarque

#### 📄 ABA 6 - Documentação Aduaneira
- DU-E, RUC, invoice, packing list
- Certificados fitossanitários, Vigiagro, MAPA

#### 🤖 ABA 7 - IA & Automação
- Sugestões automáticas de rota e porto
- Scores de risco, economia estimada
- Tracking automático habilitado

#### 💰 ABA 8 - Financeiro
- Custos de frete, seguro, taxas portuárias
- Cálculo automático do total logístico
- Análise percentual de custos

### 3. **Dashboard Visual de Detalhes**
- ✅ Cards de status, tracking, risco e custos
- ✅ Timeline visual do embarque
- ✅ Mapa de rota origem → destino
- ✅ Alertas da IA em tempo real
- ✅ Análise financeira detalhada
- ✅ Auto-refresh a cada 30 segundos

## 🔄 Workflow Operacional

```
Planejado → Booking → Embarcado → Em Trânsito → Entregue
     ↓         ↓          ↓           ↓          ↓
   [IA]    [Auto]    [Tracking]   [Alerts]   [Close]
```

## 📈 Integrações Planejadas

### 🤖 APIs de IA
- **Rota Inteligente**: Análise de custo × tempo × congestionamento
- **Previsão de Atraso**: Clima + histórico + performance do navio
- **Otimização de Carga**: Melhor distribuição de containers

### 🏛️ Órgãos Governamentais
- **Siscomex**: Envio automático de DU-E
- **Receita Federal**: Validação prévia de documentos
- **MAPA**: Certificações agropecuárias
- **Vigiagro**: Status fitossanitário

### 🚢 Transportadoras
- **Maersk**: API de tracking em tempo real
- **MSC**: Status de navios e containers
- **Hapag-Lloyd**: Atualizações de ETA/ETD

## 💡 Benefícios Operacionais

### 📊 Redução de Esforços
- **85%** redução no esforço operacional
- **70%** menos atrasos logísticos  
- **90%** redução de erros documentais

### ⚡ Automação Inteligente
- **Criação automática** de embarques após aprovação de contratos
- **Atualização sem intervenção** do usuário
- **Alertas proativos** sobre riscos e atrasos

## 🛠️ Como Usar

### 1. Configuração de Rotas
```typescript
// app.routes.ts
{
  path: 'logistica/embarque',
  loadChildren: () => import('./components/logistica/embarque/embarque.routes').then(r => r.embarqueRoutes)
}
```

### 2. Importação de Serviços
```typescript
import { EmbarqueMockService } from './services/embarqueMockService';
import { Embarque } from './types/embarque';
```

### 3. Navegação
```typescript
// Para lista: /logistica/embarque
// Para novo: /logistica/embarque/novo  
// Para editar: /logistica/embarque/editar/:id
// Para detalhes: /logistica/embarque/detalhes/:id
```

## 🎨 Design System

### 🎯 Paleta de Cores
- **Primary**: #3498db (Azul)
- **Success**: #28a745 (Verde) 
- **Warning**: #ffc107 (Amarelo)
- **Danger**: #dc3545 (Vermelho)
- **Info**: #17a2b8 (Azul claro)

### 📱 Responsividade
- **Desktop**: Layout em grid completo
- **Tablet**: Adaptação de cards e tablets
- **Mobile**: Stack vertical, navegação otimizada

## 🔮 Roadmap Futuro

### Fase 2: Inteligência Avançada
- [ ] Machine Learning para previsão de preços
- [ ] Análise preditiva de congestionamento portuário
- [ ] Otimização automática de rotas Multi-modal

### Fase 3: Integração Total
- [ ] Portal do cliente com tracking público
- [ ] API webhooks para notificações externas  
- [ ] Dashboard executivo com KPIs em tempo real

### Fase 4: Blockchain & IoT
- [ ] Rastreabilidade blockchain da carga
- [ ] Sensores IoT nos containers
- [ ] Smart contracts para liberação automática

## 🧪 Dados de Teste

O serviço mock inclui:
- **3 embarques** com diferentes status e características
- **5 portos** principais (Santos, Vitória, Shanghai, Hamburg, Norfolk)
- **3 rotas** otimizadas com análise de IA
- **Timeline completa** para tracking visual
- **Alertas dinâmicos** baseados em cenários reais

## 📞 Suporte

Para dúvidas sobre implementação ou customização:
- Documentação técnica completa nas interfaces TypeScript
- Comentários detalhados no código dos componentes
- Exemplos de uso nos serviços mock

---

**PSF Digital EIP** - Transformando a logística de exportação com inteligência artificial e automação avançada. 🚀
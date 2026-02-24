# 💰 Módulo Contas a Receber - PSF Digital Frontend

## 📋 Visão Geral

O módulo **Contas a Receber** foi desenvolvido para gerenciar completamente os recebimentos da empresa, oferecendo **controle cambial robusto** e **integração bancária simulada** para atender às demandas de uma empresa de exportação.

---

## 🚀 Funcionalidades Implementadas

### ✅ **Gestão Completa de Recebimentos**
- ✅ **CRUD completo** (Criar, Ler, Atualizar, Deletar)
- ✅ **Listagem com filtros avançados**
- ✅ **Busca por múltiplos critérios** (status, moeda, data, valor)
- ✅ **Paginação e ordenação**

### ✅ **Controle Cambial Robusto**
- ✅ **Conversão automática de moedas** (USD, EUR, GBP, JPY, CAD → BRL)
- ✅ **Taxas de câmbio em tempo real** (simulado via mock)
- ✅ **Histórico de taxas cambiais**
- ✅ **Cálculo automático de valores convertidos**
- ✅ **Atualização manual de taxas**
- ✅ **Suporte a 10+ moedas internacionais**

### ✅ **Integração Bancária Simulada**
- ✅ **Processamento de pagamentos** via APIs bancárias (simulado)
- ✅ **Consultoria de status bancário**
- ✅ **Múltiplas contas bancárias**
- ✅ **IDs de transação únicos**
- ✅ **Suporte a diferentes bancos** (BB, Santander, Bradesco)

### ✅ **Formas de Pagamento Avançadas**
- ✅ **Transferência Bancária**
- ✅ **Carta de Crédito**
- ✅ **Cobrança Documentária**
- ✅ **Pagamento Antecipado**

### ✅ **Dashboard e KPIs**
- ✅ **Total Geral** (todos os recebimentos)
- ✅ **Valores Pendentes**
- ✅ **Valores Recebidos**
- ✅ **Contagem de Recebimentos**
- ✅ **Conversões automáticas para BRL**

---

## 📊 Estrutura de Dados

### **Campos Principais (Conforme Solicitado)**
```typescript
interface Recebimento {
  amount: decimal;        // ✅ Valor do recebimento
  currency: varchar;      // ✅ Moeda (USD, EUR, BRL, etc)
  payment_date: date;     // ✅ Data de pagamento
  contract: UUID;         // ✅ Contrato vinculado
}
```

### **Campos Adicionais (Controle Cambial Robusto)**
```typescript
interface RecebimentoCambial {
  exchange_rate?: number;           // Taxa de câmbio
  original_amount?: number;         // Valor original
  original_currency?: string;       // Moeda original
  bank_account?: string;            // Conta bancária
  bank_code?: string;               // Código do banco
  bank_name?: string;               // Nome do banco
  transaction_id?: string;          // ID da transação
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_method: 'wire_transfer' | 'letter_of_credit' | 'collection' | 'advance_payment';
}
```

---

## 🛠️ Arquivos Criados

### **1. Types e Interfaces**
- `src/types/recebimentos.ts` - Definições TypeScript completas

### **2. Service Layer**
- `src/services/recebimentosMockService.ts` - Mock service com dados simulados

### **3. Componentes**
- `src/app/components/financeiro/` - Pasta principal
- `contas-receber.component.ts|html|scss` - Componente principal
- `recebimento-edit-dialog/` - Modal de criação/edição

### **4. Roteamento**
- Rota: `/home-logged/financeiro/contas-receber`
- Já configurada no menu "Financeiro → Contas a Receber"

---

## 🎯 Como Acessar

1. **Faça login na aplicação**
2. **No menu lateral**, clique em **"Financeiro"**
3. **Selecione "Contas a Receber"**
4. **Explore todas as funcionalidades**:
   - ➕ **Criar novo recebimento**
   - 🔍 **Filtrar por diversos critérios**
   - ✏️ **Editar recebimentos existentes**
   - 🏦 **Processar pagamentos bancários**
   - 💱 **Ver conversões cambiais automáticas**

---

## 💼 Casos de Uso Principais

### **1. Recebimento em USD de Cliente Americano**
```
Valor: $250,000.00 USD
Taxa: 5.15 BRL/USD
Convertido: R$ 1,287,500.00 BRL
Forma: Transferência Bancária
Banco: Banco do Brasil
```

### **2. Carta de Crédito Europeia**
```
Valor: €180,000.00 EUR
Taxa: 5.58 BRL/EUR  
Convertido: R$ 1,004,400.00 BRL
Forma: Carta de Crédito
Banco: Santander
```

### **3. Pagamento Antecipado Inglês**
```
Valor: £75,000.00 GBP
Taxa: 6.45 BRL/GBP
Convertido: R$ 483,750.00 BRL
Forma: Pagamento Antecipado
Banco: Bradesco
```

---

## 🔧 Funcionalidades Técnicas

### **Mock Service - Simulação Realista**
- ✅ **Dados de exemplo** com 5 recebimentos
- ✅ **Contratos vinculados** com clientes internacionais  
- ✅ **Contas bancárias múltiplas**
- ✅ **Taxas cambiais atualizadas**
- ✅ **Simulação de falhas** (10% chance para testes)

### **Interface Responsiva**
- ✅ **Design Mobile-First**
- ✅ **Angular Material** seguindo padrões da aplicação
- ✅ **Filtros colapsáveis**
- ✅ **Tabelas responsivas**

### **Performance & UX**
- ✅ **Loading states**
- ✅ **Error handling**
- ✅ **Feedback visual** (SnackBar)
- ✅ **Validações robustas**
- ✅ **Debounce nos filtros** (500ms)

---

## 🌍 Integração Bancária (Simulada)

### **Bancos Suportados**
- 🏦 **Banco do Brasil** (001)
- 🏦 **Santander** (033)  
- 🏦 **Bradesco** (237)

### **APIs Simuladas**
```typescript
// Processar pagamento
processarPagamentoBancario(recebimentoId) → { success, message, transactionId }

// Consultar status
consultarStatusBancario(transactionId) → { status, details }
```

### **Status de Transação**
- ⏳ **Pending** - Aguardando processamento
- 🔄 **Processing** - Em processamento  
- ✅ **Completed** - Recebimento confirmado
- ❌ **Cancelled** - Cancelado

---

## 📈 Controle Cambial Detalhado

### **Moedas Suportadas**
- 🇺🇸 **USD** - Dólar Americano
- 🇪🇺 **EUR** - Euro
- 🇧🇷 **BRL** - Real Brasileiro (base)
- 🇬🇧 **GBP** - Libra Esterlina
- 🇯🇵 **JPY** - Iene Japonês
- 🇨🇦 **CAD** - Dólar Canadense
- E mais...

### **Cálculos Automáticos**
```javascript
// Exemplo de conversão automática
Valor Original: $100,000.00 USD
Taxa: 5.15 BRL/USD
Resultado: R$ 515,000.00 BRL
```

### **Fonte das Taxas**
- 📊 **Banco Central** (simulado)
- 🔄 **Atualização manual** disponível
- 📅 **Data/hora da cotação**

---

## 🚧 Futuras Melhorias (Roadmap)

### **Integração Real**
- [ ] **APIs bancárias reais** (Open Banking)
- [ ] **Taxas cambiais em tempo real** (API do BC)
- [ ] **Webhooks bancários**

### **Relatórios Avançados**
- [ ] **Gráficos de recebimentos**
- [ ] **Análise cambial histórica**  
- [ ] **Projeções de recebimentos**

### **Automação**
- [ ] **Alertas de vencimento**
- [ ] **Reconciliação automática**
- [ ] **Workflows de aprovação**

---

## 📞 Suporte

Para dúvidas sobre a implementação ou sugestões de melhorias, consulte:
- 📁 **Código fonte**: `src/app/components/financeiro/`
- 🔧 **Types**: `src/types/recebimentos.ts`
- 🌐 **Service**: `src/services/recebimentosMockService.ts`

---

## ✅ Status do Desenvolvimento

**✅ CONCLUÍDO** - Todas as funcionalidades solicitadas foram implementadas:

1. ✅ **Campos base** (amount, currency, payment_date, contract)
2. ✅ **Controle cambial robusto e completo** 
3. ✅ **Integração bancária simulada** com documentação completa
4. ✅ **Interface seguindo padrões da aplicação**
5. ✅ **Mock services** para facilitar integração backend

🎉 **Pronto para uso e integração com APIs reais!**
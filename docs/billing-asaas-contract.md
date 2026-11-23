# EIP Billing (Asaas) — contrato de implementação

Fonte única de verdade para backend e frontend. Nomes, rotas, campos e regras abaixo são obrigatórios.

## 1. Precificação (decisão de produto)

Preços de plano (já em `plan`, V6) mantidos; usuários ILIMITADOS em todos os planos (`limit.users` = NULL).

| Plano | Mensal | Anual (10x) | Créditos IA/ciclo | Páginas OCR/ciclo | Armazenamento |
|---|---|---|---|---|---|
| START | 1.290 | 12.900 | 500 | 200 | 5 GB |
| BUSINESS | 2.490 | 24.900 | 5.000 | 2.000 | 100 GB |
| PRO | 4.490 | 44.900 | 20.000 | 10.000 | 500 GB |
| ENTERPRISE | sob consulta (a partir de 6.990) | — | ilimitado | ilimitado | ilimitado |

Pacotes avulsos (pagamento único, válidos até o fim do ciclo atual):
- `AI_PACK` "EIP AI Pack": R$ 390,00 → +10.000 créditos de IA e +2.000 páginas OCR.
- `AI_PACK_PLUS` "EIP AI Pack Plus": R$ 790,00 → +30.000 créditos de IA e +6.000 páginas OCR.

Cupom `FOUNDERS2026` (Programa Cliente Fundador): BUSINESS mensal por R$ 1.790,00 durante 12 cobranças, máximo 50 resgates.

**1 crédito de IA** = `ceil((tokens_entrada + 5 × (tokens_saida + tokens_raciocinio)) / 1000)`, mínimo 1 por chamada com tokens > 0. Tokens vêm do `usageMetadata` real do Vertex AI.
OCR = páginas reais processadas (campo `ocr_pages`). Armazenamento = soma de `document.size_bytes` (tamanho real do objeto no GCS).

Custos de referência (pior caso, uso total da franquia, USD≈R$6):
- IA: ~US$0,75/1M entrada e US$3,75/1M saída → ~R$0,0045 por crédito.
- OCR ~R$0,009/página; GCS ~R$0,20/GB/mês.
- Infra fixa rateada ~R$40/cliente; Asaas cartão 2,99% + R$0,49; impostos ~15%.

Resultado: START custo ≈ R$280 (margem ~78%), BUSINESS ≈ R$550 (~78%), PRO ≈ R$1.130 (~75%), AI Pack ≈ R$135 (~65%), Plus ≈ R$330 (~58%).

## 2. Banco — migration `V40__billing_asaas.sql` (dono: backend-billing)

```sql
ALTER TABLE subscription
  ADD COLUMN IF NOT EXISTS asaas_customer_id text,
  ADD COLUMN IF NOT EXISTS asaas_subscription_id text,
  ADD COLUMN IF NOT EXISTS billing_type text,              -- CREDIT_CARD | PIX | BOLETO
  ADD COLUMN IF NOT EXISTS card_token text,               -- creditCardToken do Asaas (nunca PAN)
  ADD COLUMN IF NOT EXISTS next_due_date date,
  ADD COLUMN IF NOT EXISTS canceled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_reason text,
  ADD COLUMN IF NOT EXISTS coupon_code text,
  ADD COLUMN IF NOT EXISTS coupon_price numeric(18,2),
  ADD COLUMN IF NOT EXISTS coupon_cycles_remaining integer,
  ADD COLUMN IF NOT EXISTS invoices_synced_at timestamptz;

ALTER TABLE invoice
  ADD COLUMN IF NOT EXISTS asaas_payment_id text,
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'SUBSCRIPTION',  -- SUBSCRIPTION | ADDON
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS due_date date,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS billing_type text,
  ADD COLUMN IF NOT EXISTS invoice_url text,
  ADD COLUMN IF NOT EXISTS bank_slip_url text,
  ADD COLUMN IF NOT EXISTS net_value numeric(18,2),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS ux_invoice_asaas_payment ON invoice (asaas_payment_id) WHERE asaas_payment_id IS NOT NULL;
-- status de invoice: OPEN | PAID | OVERDUE | REFUNDED | CANCELED | FAILED

CREATE TABLE IF NOT EXISTS addon_purchase (
  id uuid PRIMARY KEY, organization_id uuid NOT NULL, addon_code text NOT NULL,
  ai_credits integer NOT NULL DEFAULT 0, ocr_pages integer NOT NULL DEFAULT 0,
  amount numeric(18,2) NOT NULL, status text NOT NULL DEFAULT 'PENDING',   -- PENDING | PAID | CANCELED
  billing_type text, invoice_id uuid, asaas_payment_id text,
  period_start timestamptz, period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), paid_at timestamptz);
-- RLS ENABLE+FORCE com a mesma policy organization_id das demais tabelas (copiar padrão V10).

CREATE TABLE IF NOT EXISTS billing_gateway_ref (           -- SEM RLS: usado pelo webhook (sem org na thread)
  gateway_id text PRIMARY KEY,                             -- cus_..., sub_... ou "addon:<uuid>"
  kind text NOT NULL,                                      -- CUSTOMER | SUBSCRIPTION | ADDON
  organization_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS coupon (                        -- global, sem RLS
  code text PRIMARY KEY, description text, plan_code text, billing_interval text,
  fixed_price numeric(18,2) NOT NULL, cycles integer NOT NULL, max_redemptions integer,
  redeemed integer NOT NULL DEFAULT 0, valid_until timestamptz, active boolean NOT NULL DEFAULT true);
INSERT INTO coupon VALUES ('FOUNDERS2026','Programa Cliente Fundador EIP','BUSINESS','MONTHLY',1790.00,12,50,0,'2027-06-30T23:59:59Z',true) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS checkout_acceptance (
  id uuid PRIMARY KEY, organization_id uuid NOT NULL, user_id uuid,
  terms_version text NOT NULL, privacy_version text NOT NULL, billing_consent boolean NOT NULL,
  ip text, user_agent text, accepted_at timestamptz NOT NULL DEFAULT now());
-- RLS igual addon_purchase.

CREATE TABLE IF NOT EXISTS demo_request (                  -- global, sem RLS
  id uuid PRIMARY KEY, name text NOT NULL, email text NOT NULL, phone text, company text, cnpj text,
  message text, origin text, ip text, status text NOT NULL DEFAULT 'NEW', created_at timestamptz NOT NULL DEFAULT now());

UPDATE plan_feature SET limit_value = NULL WHERE feature_key = 'limit.users';
UPDATE organization_entitlement SET limit_value = NULL WHERE feature_key = 'limit.users';
UPDATE subscription SET trial_end = current_period_end WHERE status = 'TRIALING' AND trial_end IS NULL;
UPDATE ai_usage_event SET eip_credits = GREATEST(1, CEIL((COALESCE(input_units,0) + 5 * (COALESCE(output_units,0) + COALESCE(thinking_tokens,0))) / 1000.0))
  WHERE eip_credits IS NULL AND (COALESCE(input_units,0) + COALESCE(output_units,0) + COALESCE(thinking_tokens,0)) > 0;
```

O `UPDATE organization_entitlement` exige `SET LOCAL row_security = off` ou rodar como dono. Em produção o Flyway roda como `postgres`, então funciona. Use um bloco `DO $$ ... $$` sem dependências.

## 3. Medição de uso — `com.eip.platform.billing.UsageQuotaService` (dono: backend-usage)

```java
@Service public class UsageQuotaService {
  public UsageSnapshot snapshot(UUID organizationId);          // leitura em transação readOnly (RLS do org)
  public boolean hasAiRemaining(UUID organizationId);          // used < included (included null = ilimitado)
  public boolean hasOcrRemaining(UUID organizationId);
  public boolean hasStorageFor(UUID organizationId, long extraBytes);
  public List<UsageEntry> statement(UUID organizationId, String feature, int limit); // feature AI|OCR, ciclo atual, mais recente primeiro
  public record UsageSnapshot(OffsetDateTime periodStart, OffsetDateTime periodEnd,
      Meter ai, Meter ocr, Meter storage) {}
  public record Meter(String feature, String label, BigDecimal used, BigDecimal included /*null=ilimitado*/,
      BigDecimal fromPlan, BigDecimal fromPacks, String unit, int percent) {}
  public record UsageEntry(OffsetDateTime occurredAt, String operation, String operationLabel,
      String userName, BigDecimal amount, String unit) {}
}
```

- Ciclo: `subscription.current_period_start..current_period_end` da assinatura mais recente. Se for nulo, usa o mês corrente (America/Sao_Paulo).
- `fromPlan` vem de `organization_entitlement` (`limit.ai_credits`, `limit.ocr_pages`, `limit.storage_gb`). Sem linha, ou com `limit_value` NULL, é ilimitado.
- `fromPacks` = soma de `addon_purchase` com status PAID e `period_end` > now.
- IA usada = `SUM(eip_credits)` de `ai_usage_event` no ciclo com `outcome` de sucesso ou nulo. OCR = `SUM(ocr_pages)`.
- Armazenamento = `SUM(size_bytes)` dos documentos não excluídos, em GB com 2 casas decimais.
- Unidades e rótulos:
  - AI: unit "créditos", label "Créditos de IA".
  - OCR: unit "páginas", label "Páginas OCR".
  - STORAGE: unit "GB", label "Armazenamento".

## 4. Endpoints BFF (dono: backend-billing salvo indicação)

Erros: 4xx `{code,message}` (BusinessRuleException 422; gateway indisponível 503 "Serviço de pagamentos indisponível no momento. Tente novamente em instantes.").

### 4.1 Públicos (sem login; já CSRF-exempt por `/bff/public/signup/**`)
- `GET /bff/public/signup/planos` → `[{code,name,description,monthlyPrice,annualPrice,highlighted,limits:{aiCredits,ocrPages,storageGb,users:null},modules:[...]}]` (ENTERPRISE incluído, preços do banco).
- `GET /bff/public/signup/pacotes` → `[{code,name,description,amount,aiCredits,ocrPages,highlighted}]`.
- `GET /bff/public/signup/cupom/{code}?plan=BUSINESS&interval=MONTHLY` → `{valid,code,price,cycles,message}`.
- `POST /bff/public/signup/demo` `{nome,email,telefone,empresa,cnpj?,mensagem?,origem:'SITE'|'PRECOS_ENTERPRISE'|'TRIAL_BANNER'|'CHECKOUT'}` → `{ok:true}`. Limite de 5 por IP por hora. Envia e-mail para `eip.billing.sales-email`.
- `POST /bff/public/signup/checkout` → cria o tenant, o cliente e a assinatura no Asaas e abre a sessão (igual ao signup). Body:
```json
{ "empresa": {"cnpj","razaoSocial","nomeFantasia","telefone","email","site","segmento"},
  "admin":   {"nome","cpf","email","telefone","senha"},
  "plano":   {"planCode":"START|BUSINESS|PRO","interval":"MONTHLY|ANNUAL","coupon":null},
  "pagamento": {"metodo":"CREDIT_CARD|PIX|BOLETO",
     "cartao":  {"holderName","number","expiryMonth":"MM","expiryYear":"AAAA","ccv"},
     "titular": {"nome","cpfCnpj","email","telefone","cep","numero","complemento"}},
  "aceites": {"termos":true,"privacidade":true,"cobranca":true,"termsVersion":"2026-11","privacyVersion":"2026-11"} }
```
  - Resposta: `{organizationId,planCode,interval,amount,trialEnd,nextDueDate,paymentMethod,cardBrand,cardLast4}`.
  - Regras:
    - 14 dias de avaliação; a primeira cobrança vence em `hoje+14`.
    - O cartão é validado pelo Asaas na criação. Recusa → 422 com a mensagem do Asaas.
    - `remoteIp` = IP do cliente (primeiro valor de X-Forwarded-For).
    - Dados do cartão nunca são logados nem persistidos. Só `card_token`, a bandeira e os últimos 4 dígitos.

### 4.2 Logados (`/bff/assinatura`, RBAC `admin/assinatura`)
- `GET ''` → `SubscriptionView {id,planCode,planName,billingInterval,amount,status,currentPeriodStart,currentPeriodEnd,trialEnd,nextDueDate,cancelAtPeriodEnd,canceledAt,paymentMethod,paymentBrand,paymentLast4,gatewayLinked,coupon:{code,price,cyclesRemaining}|null,licenseMode}`.
- `GET /planos` → mesmo formato do público.
- `GET /pacotes` → mesmo formato do público.
- `GET /uso` → `{periodStart,periodEnd,meters:[Meter AI, Meter OCR, Meter STORAGE]}`.
- `GET /uso/extrato?feature=AI|OCR&limit=200` → `[UsageEntry]`.
- `GET /faturas` → `[{id,number,kind,description,period,planName,amount,status,issuedAt,dueDate,paidAt,billingType,invoiceUrl,bankSlipUrl}]`. Sincroniza com o Asaas se a última sincronização tiver mais de 5 min.
- `GET /faturas/{id}/pdf` → `application/pdf` (segunda via, OpenPDF).
- `GET /faturas/{id}/pix` → `{encodedImage,payload,expirationDate}` (apenas fatura em aberto com billingType PIX).
- `POST /ativar` `{planCode,interval,coupon?,pagamento}` → `SubscriptionView`. Usado por org sem `gatewayLinked`. Primeiro vencimento = `max(hoje, trialEnd)`.
- `POST /plano` `{planCode,interval}` → `SubscriptionView`. Atualiza o valor e o ciclo no Asaas (`updatePendingPayments=true`) e reaplica as entitlements. O novo valor vale a partir da próxima cobrança.
- `POST /forma-pagamento` `{metodo,cartao?,titular?}` → `SubscriptionView`.
- `POST /cancelar` `{reason,comment?}` → `SubscriptionView`. Remove a assinatura no Asaas e marca CANCELED com `cancelAtPeriodEnd=true`.
- `POST /reativar` → `SubscriptionView`. Recria a assinatura no Asaas com `nextDueDate = currentPeriodEnd`, reutilizando `card_token` ou `billing_type`.
- `POST /pacotes` `{addonCode,metodo:'CREDIT_CARD'|'PIX'|'BOLETO',usarCartaoSalvo,cartao?,titular?}` → `{purchaseId,status,invoiceId,invoiceUrl,bankSlipUrl,pix:{encodedImage,payload,expirationDate}|null}`.

### 4.3 Exportação de dados (dono: backend-usage)
- `GET /bff/admin/exportar-dados` → `application/zip` com um `<tabela>.json` por tabela que tenha `organization_id`, mais `LEIA-ME.txt`. RBAC `admin/exportar-dados` view. Registra o security_event `DATA_EXPORTED`.

### 4.4 Webhook
- `POST /webhooks/asaas`:
  - Valida o header `asaas-access-token` contra `eip.asaas.webhook-token` com comparação de tempo constante; inválido → 401.
  - Idempotência via `InboxService.receiveOnce("asaas", id, sha256(body))`.
  - O org é resolvido via `billing_gateway_ref` (payment.externalReference → `addon:<uuid>` ou orgId; senão payment.subscription; senão payment.customer). Em seguida, `TenantScope.runAs(org, ...)`.
  - Eventos:
    - `PAYMENT_CREATED` / `PAYMENT_UPDATED` → upsert da fatura (OPEN).
    - `PAYMENT_CONFIRMED` / `PAYMENT_RECEIVED` → fatura PAID.
      - Se a fatura for de assinatura: status ACTIVE, `current_period_start` = dueDate e `current_period_end` = dueDate + 1 mês ou 1 ano. Decrementa `coupon_cycles_remaining`; ao chegar a 0, PUT do valor cheio no Asaas e limpeza do cupom.
      - Se for de pacote: addon PAID com `period_end` = fim do ciclo.
    - `PAYMENT_OVERDUE` → fatura OVERDUE; a assinatura vai para PAST_DUE.
    - `PAYMENT_REFUNDED`, `PAYMENT_CHARGEBACK_REQUESTED` → fatura REFUNDED; pacote CANCELED.
    - `PAYMENT_DELETED` → fatura CANCELED.
    - Demais eventos → 200 sem efeito.
  - Ao final, `accessPolicyService.evict(org)`. Ignora campos desconhecidos.

## 5. Regras de licença (backend `AccessPolicyService` + frontend `AuthProfileService`)
- TRIALING com fim > agora → FULL.
- TRIALING expirado:
  - com `asaas_subscription_id` → FULL até `trialEnd + 3 dias`, depois READ_ONLY;
  - sem ele → BILLING_ONLY.
- ACTIVE → FULL. PAST_DUE / GRACE_PERIOD → READ_ONLY. SUSPENDED → BILLING_ONLY.
- CANCELED: fim do período > agora → FULL; senão READ_ONLY. TERMINATED → NONE.
- Telas sempre liberadas para ADMINISTRADOR em qualquer modo (inclusive edição): `admin/assinatura` e `admin/exportar-dados`.
- `/bff/acesso/me.subscription` ganha `gatewayLinked` e `cancelAtPeriodEnd`.
- Onboarding `/bff/onboarding/trial`: `daysRemaining = ceil(horas restantes / 24)`; `active = TRIALING && fim > agora`.

## 6. Configuração
```yaml
eip:
  asaas:
    enabled: ${EIP_ASAAS_ENABLED:false}            # cloud: true (falha no boot sem api-key/webhook-token)
    base-url: ${EIP_ASAAS_BASE_URL:https://api-sandbox.asaas.com/v3}
    api-key: ${EIP_ASAAS_API_KEY:}
    webhook-token: ${EIP_ASAAS_WEBHOOK_TOKEN:}
  billing:
    trial-days: 14
    sales-email: ${EIP_SALES_EMAIL:comercial@iaexport.com.br}
    issuer: { name: ${EIP_BILLING_ISSUER_NAME:EIP - Export Intelligence Platform}, cnpj: ${EIP_BILLING_ISSUER_CNPJ:}, address: ${EIP_BILLING_ISSUER_ADDRESS:}, email: ${EIP_BILLING_ISSUER_EMAIL:financeiro@iaexport.com.br} }
```
Com `enabled=false`, o adapter `FakePaymentGateway` simula o Asaas (ids `cus_fake_*`, `sub_fake_*`, `pay_fake_*`):
- Recusa os cartões 5184019740373151 e 4916561358240741 com 422 "Transação não autorizada. Verifique os dados do cartão.".
- Os demais são aprovados.
- Pix devolve um payload fictício.

Secrets em produção: `eip-asaas-api-key`, `eip-asaas-webhook-token`.

## 7. Frontend (resumo)
- **Máscaras:** a diretiva `appMask` formata também ao receber valor programático. Tipos `cpf`, `cnpj`, `telefone`, `cep`, `cartao`, `validade`, `cvv`.
- **Validadores:**
  - telefone com 10 a 11 dígitos; CEP com 8;
  - cartão com Luhn e comprimento por bandeira (Visa 13/16/19, Master 16, Amex 15, Elo 16, Hipercard 13/16/19, Diners 14, Discover 16);
  - CVV com 3 dígitos (4 na Amex);
  - validade com mês 01–12, não vencida e até +20 anos.
- `realApis.subscription = true` nos dois environments.
- Componentes compartilhados de pagamento ficam em `src/app/shared/payment/`: `card-utils.ts` e `payment-method-form.component.ts`.

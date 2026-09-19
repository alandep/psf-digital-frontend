-- V10__finance.sql
-- Finance domain. Maps pagamentos/cambioContrats/hedge/rentabilidade mocks.
-- Money numeric(18,2), FX numeric(18,6). Tenant-scoped (RLS). See V4 for the
-- tenant isolation model.

-- Payments / receivables. Aggregate root with optimistic-lock version column.
CREATE TABLE pagamento (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    export_id       uuid,
    -- RECEBIMENTO/PAGAMENTO
    tipo            text,
    descricao       text,
    amount          numeric(18,2) NOT NULL,
    currency        text DEFAULT 'USD',
    -- PENDENTE/PAGO/ATRASADO/CANCELADO
    status          text NOT NULL DEFAULT 'PENDENTE',
    due_date        date,
    paid_at         timestamptz,
    version         bigint NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pagamento_org_status ON pagamento (organization_id, status);
CREATE INDEX idx_pagamento_org_due ON pagamento (organization_id, due_date);

-- FX contracts. valor is money numeric(18,2); taxa is an FX rate numeric(18,6).
CREATE TABLE cambio_contrato (
    id               uuid PRIMARY KEY,
    organization_id  uuid NOT NULL,
    banco            text,
    moeda            text NOT NULL,
    valor            numeric(18,2) NOT NULL,
    taxa             numeric(18,6) NOT NULL,
    -- COMPRA/VENDA
    tipo             text,
    -- ATIVO/LIQUIDADO/CANCELADO
    status           text NOT NULL DEFAULT 'ATIVO',
    data_contratacao date,
    data_liquidacao  date,
    version          bigint NOT NULL DEFAULT 0,
    created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cambio_contrato_org_status ON cambio_contrato (organization_id, status);

-- Hedge contracts. notional is money numeric(18,2); strike is FX numeric(18,6).
CREATE TABLE hedge_contrato (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    -- NDF/SWAP/OPCAO
    instrumento     text,
    moeda           text NOT NULL,
    notional        numeric(18,2) NOT NULL,
    strike          numeric(18,6),
    vencimento      date,
    -- ATIVO/EXERCIDO/EXPIRADO/CANCELADO
    status          text NOT NULL DEFAULT 'ATIVO',
    version         bigint NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_hedge_contrato_org_status ON hedge_contrato (organization_id, status);

-- Row Level Security for tenant-scoped tables (see V4 for the isolation model).
ALTER TABLE pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamento FORCE ROW LEVEL SECURITY;
CREATE POLICY pagamento_isolation ON pagamento
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE cambio_contrato ENABLE ROW LEVEL SECURITY;
ALTER TABLE cambio_contrato FORCE ROW LEVEL SECURITY;
CREATE POLICY cambio_contrato_isolation ON cambio_contrato
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE hedge_contrato ENABLE ROW LEVEL SECURITY;
ALTER TABLE hedge_contrato FORCE ROW LEVEL SECURITY;
CREATE POLICY hedge_contrato_isolation ON hedge_contrato
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

-- Tenant-scoped seed for the dev org (from V5). RLS is FORCED above, so we set
-- the transaction-local org context to satisfy the WITH CHECK policies.
SELECT set_config('app.current_organization',
                  '00000000-0000-0000-0000-000000000001', true);

-- Payments: one pending receivable linked to the seeded export (...f1) due in
-- ~20 days, and one settled outbound payment.
INSERT INTO pagamento (id, organization_id, export_id, tipo, descricao, amount,
                       currency, status, due_date, paid_at)
VALUES
  ('00000000-0000-0000-0000-000000000a01',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-0000000000f1',
   'RECEBIMENTO', 'Recebimento export EXP-2024-0001', 25000.00,
   'USD', 'PENDENTE', (CURRENT_DATE + 20), NULL),
  ('00000000-0000-0000-0000-000000000a02',
   '00000000-0000-0000-0000-000000000001',
   NULL,
   'PAGAMENTO', 'Frete maritimo', 3200.00,
   'USD', 'PAGO', (CURRENT_DATE - 3), now())
ON CONFLICT (id) DO NOTHING;

-- FX contract (sell USD).
INSERT INTO cambio_contrato (id, organization_id, banco, moeda, valor, taxa,
                             tipo, status, data_contratacao, data_liquidacao)
VALUES
  ('00000000-0000-0000-0000-000000000a03',
   '00000000-0000-0000-0000-000000000001',
   'Banco do Brasil', 'USD', 25000.00, 5.420000,
   'VENDA', 'ATIVO', CURRENT_DATE, (CURRENT_DATE + 30))
ON CONFLICT (id) DO NOTHING;

-- Hedge contract (NDF on USD).
INSERT INTO hedge_contrato (id, organization_id, instrumento, moeda, notional,
                            strike, vencimento, status)
VALUES
  ('00000000-0000-0000-0000-000000000a04',
   '00000000-0000-0000-0000-000000000001',
   'NDF', 'USD', 25000.00, 5.500000, (CURRENT_DATE + 60), 'ATIVO')
ON CONFLICT (id) DO NOTHING;

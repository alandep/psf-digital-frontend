-- V38__finance_receivables_rentabilidade.sql
-- 1) Richer receivable/payable fields on pagamento (created_at/updated_at
--    already exist since V10).
-- 2) rentabilidade_analise: saved profitability analyses (tenant-scoped, RLS).

ALTER TABLE pagamento
    ADD COLUMN IF NOT EXISTS contraparte        text,
    ADD COLUMN IF NOT EXISTS referencia         text,
    ADD COLUMN IF NOT EXISTS conta_bancaria     text,
    ADD COLUMN IF NOT EXISTS contrato_cambio_id uuid,
    ADD COLUMN IF NOT EXISTS observacoes        text;

CREATE TABLE IF NOT EXISTS rentabilidade_analise (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    user_id         uuid,
    exportacao_ref  text,
    produto         text,
    score           integer,
    margem          numeric(9,4),
    lucro_brl       numeric(18,2),
    payload         jsonb NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rentabilidade_analise_org_created
    ON rentabilidade_analise (organization_id, created_at DESC);

ALTER TABLE rentabilidade_analise ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentabilidade_analise FORCE ROW LEVEL SECURITY;
CREATE POLICY rentabilidade_analise_isolation ON rentabilidade_analise
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

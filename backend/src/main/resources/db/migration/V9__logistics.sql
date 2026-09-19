-- V9__logistics.sql
-- Logistics domain. Maps embarque/containers/navios/portos/transportadoras/mapa
-- mocks. All tenant-scoped (RLS). See V4 for the tenant isolation model.

-- Port registry (treated as a tenant-scoped registry to keep isolation simple).
CREATE TABLE porto (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    code            text,
    name            text NOT NULL,
    country         text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_porto_org ON porto (organization_id);

-- Carrier registry (tenant-scoped registry).
CREATE TABLE transportadora (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    name            text NOT NULL,
    tipo            text,
    contato         text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_transportadora_org ON transportadora (organization_id);

-- Vessel registry (tenant-scoped registry).
CREATE TABLE navio (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    name            text NOT NULL,
    imo             text,
    bandeira        text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_navio_org ON navio (organization_id);

-- Shipment aggregate root. version column supports optimistic locking.
CREATE TABLE embarque (
    id                uuid PRIMARY KEY,
    organization_id   uuid NOT NULL,
    export_id         uuid,
    reference         text,
    -- PLANEJADO/EM_TRANSITO/ENTREGUE/CANCELADO
    status            text NOT NULL DEFAULT 'PLANEJADO',
    porto_origem_id   uuid,
    porto_destino_id  uuid,
    navio_id          uuid,
    transportadora_id uuid,
    etd               date,
    eta               date,
    modal             text,
    version           bigint NOT NULL DEFAULT 0,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_embarque_org_status ON embarque (organization_id, status);
CREATE INDEX idx_embarque_org_export ON embarque (organization_id, export_id);
CREATE INDEX idx_embarque_org_eta ON embarque (organization_id, eta);

-- Containers belonging to a shipment.
CREATE TABLE container (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    embarque_id     uuid REFERENCES embarque(id) ON DELETE CASCADE,
    numero          text,
    tipo            text,
    tara            numeric(18,2),
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_container_embarque ON container (embarque_id);
CREATE INDEX idx_container_org ON container (organization_id);

-- Row Level Security for tenant-scoped tables (see V4 for the isolation model).
ALTER TABLE porto ENABLE ROW LEVEL SECURITY;
ALTER TABLE porto FORCE ROW LEVEL SECURITY;
CREATE POLICY porto_isolation ON porto
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE transportadora ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportadora FORCE ROW LEVEL SECURITY;
CREATE POLICY transportadora_isolation ON transportadora
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE navio ENABLE ROW LEVEL SECURITY;
ALTER TABLE navio FORCE ROW LEVEL SECURITY;
CREATE POLICY navio_isolation ON navio
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE embarque ENABLE ROW LEVEL SECURITY;
ALTER TABLE embarque FORCE ROW LEVEL SECURITY;
CREATE POLICY embarque_isolation ON embarque
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE container ENABLE ROW LEVEL SECURITY;
ALTER TABLE container FORCE ROW LEVEL SECURITY;
CREATE POLICY container_isolation ON container
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

-- Tenant-scoped seed for the dev org (from V5). RLS is FORCED above, so we set
-- the transaction-local org context to satisfy the WITH CHECK policies.
SELECT set_config('app.current_organization',
                  '00000000-0000-0000-0000-000000000001', true);

-- Ports: Santos (BR) origin, Shanghai (CN) destination.
INSERT INTO porto (id, organization_id, code, name, country)
VALUES
  ('00000000-0000-0000-0000-000000000901',
   '00000000-0000-0000-0000-000000000001', 'BRSSZ', 'Santos', 'BR'),
  ('00000000-0000-0000-0000-000000000902',
   '00000000-0000-0000-0000-000000000001', 'CNSHA', 'Shanghai', 'CN')
ON CONFLICT (id) DO NOTHING;

-- Carrier.
INSERT INTO transportadora (id, organization_id, name, tipo, contato)
VALUES
  ('00000000-0000-0000-0000-000000000903',
   '00000000-0000-0000-0000-000000000001', 'Maersk', 'MARITIMA',
   'operacoes@maersk.exemplo')
ON CONFLICT (id) DO NOTHING;

-- Vessel.
INSERT INTO navio (id, organization_id, name, imo, bandeira)
VALUES
  ('00000000-0000-0000-0000-000000000904',
   '00000000-0000-0000-0000-000000000001', 'MSC Aurora', '9876543', 'PA')
ON CONFLICT (id) DO NOTHING;

-- Shipment linked to the seeded export (...f1), in transit Santos -> Shanghai.
INSERT INTO embarque (id, organization_id, export_id, reference, status,
                      porto_origem_id, porto_destino_id, navio_id,
                      transportadora_id, etd, eta, modal)
VALUES
  ('00000000-0000-0000-0000-000000000905',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-0000000000f1',
   'EMB-2024-0001', 'EM_TRANSITO',
   '00000000-0000-0000-0000-000000000901',
   '00000000-0000-0000-0000-000000000902',
   '00000000-0000-0000-0000-000000000904',
   '00000000-0000-0000-0000-000000000903',
   (CURRENT_DATE - 5), (CURRENT_DATE + 25), 'MARITIMO')
ON CONFLICT (id) DO NOTHING;

-- Container on the shipment.
INSERT INTO container (id, organization_id, embarque_id, numero, tipo, tara)
VALUES
  ('00000000-0000-0000-0000-000000000906',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000905',
   'MSCU1234567', '40HC', 3800.00)
ON CONFLICT (id) DO NOTHING;

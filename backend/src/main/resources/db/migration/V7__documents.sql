-- V7__documents.sql
-- Documents domain. Maps invoice/packingList/billOfLading/certificados/contracts
-- mocks. Files live in object storage (Cloud Storage); DB holds metadata +
-- a storage_key. Async upload via signed URLs and async processing via a
-- job table (document_job). See V4 for the tenant isolation (RLS) model.

CREATE TABLE document (
    id                uuid PRIMARY KEY,
    organization_id   uuid NOT NULL,
    legal_entity_id   uuid,
    export_id         uuid,
    -- INVOICE/PACKING_LIST/BILL_OF_LADING/CERTIFICATE/CONTRACT/OTHER
    doc_type          text NOT NULL,
    title             text,
    storage_key       text,
    original_filename text,
    media_type        text,
    size_bytes        bigint,
    sha256            text,
    classification    text,
    -- PENDING/UPLOADED/FAILED
    upload_status     text NOT NULL DEFAULT 'PENDING',
    -- PENDING/CLEAN/INFECTED
    scan_status       text NOT NULL DEFAULT 'PENDING',
    version           bigint NOT NULL DEFAULT 0,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_org_type ON document (organization_id, doc_type);
CREATE INDEX idx_document_org_created ON document (organization_id, created_at DESC);
CREATE INDEX idx_document_org_export ON document (organization_id, export_id);

CREATE TABLE document_job (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    document_id     uuid,
    -- OCR/ANALYSIS/EXPORT_ZIP/REPORT
    job_type        text NOT NULL,
    -- QUEUED/PROCESSING/COMPLETED/FAILED
    status          text NOT NULL DEFAULT 'QUEUED',
    result_ref      text,
    error           text,
    attempts        int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),
    available_at    timestamptz NOT NULL DEFAULT now(),
    processed_at    timestamptz
);

-- (status, available_at) drives the worker poll; (organization_id) for tenant reads.
CREATE INDEX idx_document_job_status_available ON document_job (status, available_at);
CREATE INDEX idx_document_job_org ON document_job (organization_id);

-- Row Level Security for tenant-scoped tables (see V4 for the isolation model).
ALTER TABLE document ENABLE ROW LEVEL SECURITY;
ALTER TABLE document FORCE ROW LEVEL SECURITY;
CREATE POLICY document_isolation ON document
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE document_job ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_job FORCE ROW LEVEL SECURITY;
CREATE POLICY document_job_isolation ON document_job
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

-- Tenant-scoped seed for the dev org (from V5). RLS is FORCED above, so we set
-- the transaction-local org context to satisfy the WITH CHECK policies.
SELECT set_config('app.current_organization',
                  '00000000-0000-0000-0000-000000000001', true);

-- Two documents linked to the confirmed export EXP-2024-0001 (...f1 from V5).
INSERT INTO document (id, organization_id, legal_entity_id, export_id, doc_type,
                      title, storage_key, original_filename, media_type,
                      size_bytes, sha256, upload_status, scan_status)
VALUES
  ('00000000-0000-0000-0000-0000000002a1',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-0000000000e1',
   '00000000-0000-0000-0000-0000000000f1',
   'INVOICE', 'Commercial Invoice EXP-2024-0001',
   'organizations/00000000-0000-0000-0000-000000000001/documents/00000000-0000-0000-0000-0000000002a1/invoice.pdf',
   'invoice.pdf', 'application/pdf', 24000, 'abc123',
   'UPLOADED', 'CLEAN'),
  ('00000000-0000-0000-0000-0000000002a2',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-0000000000e1',
   '00000000-0000-0000-0000-0000000000f1',
   'PACKING_LIST', 'Packing List EXP-2024-0001',
   'organizations/00000000-0000-0000-0000-000000000001/documents/00000000-0000-0000-0000-0000000002a2/packing-list.pdf',
   'packing-list.pdf', 'application/pdf', 18500, 'def456',
   'UPLOADED', 'CLEAN')
ON CONFLICT (id) DO NOTHING;

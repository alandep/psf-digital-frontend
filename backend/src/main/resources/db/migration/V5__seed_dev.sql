-- V5__seed_dev.sql
-- Development seed data, matching the frontend mock so the mocked screens have
-- data to render. All inserts are idempotent (ON CONFLICT DO NOTHING with fixed
-- UUIDs) so the migration is safe to re-run in dev.
--
-- NOTE: This seed runs in ALL environments as written. In a real setup it
-- should be gated to dev only (e.g. Flyway placeholders, an env-specific
-- migration location, or a Java callback). Kept simple for now.
--
-- The export-domain tables have FORCE RLS enabled (V4). Flyway runs migrations
-- as the migration role; to insert tenant rows deterministically we set the
-- transaction-local org context so the WITH CHECK policies are satisfied.
SELECT set_config('app.current_organization',
                  '00000000-0000-0000-0000-000000000001', true);

-- Organization + legal entity
INSERT INTO organization (id, name, owner_user_id, status)
VALUES ('00000000-0000-0000-0000-000000000001',
        'Agro Export Brasil Ltda',
        '00000000-0000-0000-0000-0000000000a1',
        'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO legal_entity (id, organization_id, cnpj, razao_social, nome_fantasia)
VALUES ('00000000-0000-0000-0000-0000000000e1',
        '00000000-0000-0000-0000-000000000001',
        '12.345.678/0001-90',
        'Agro Export Brasil Ltda',
        'Agro Export')
ON CONFLICT (id) DO NOTHING;

-- User + credential
INSERT INTO app_user (id, name, email, status)
VALUES ('00000000-0000-0000-0000-0000000000a1',
        'Alan Franco',
        'alan@eip.exemplo',
        'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Password stored with the Spring delegating-encoder {noop} prefix for a
-- guaranteed, deterministic dev login (password: 'senha123'). Swap for a real
-- {bcrypt} hash before any non-dev use.
INSERT INTO user_credential (user_id, password_hash, must_change_password)
VALUES ('00000000-0000-0000-0000-0000000000a1',
        '{noop}senha123',
        false)
ON CONFLICT (user_id) DO NOTHING;

-- Membership: user is ADMINISTRADOR of the org
INSERT INTO organization_membership (id, organization_id, user_id, role, status)
VALUES ('00000000-0000-0000-0000-0000000000b1',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-0000000000a1',
        'ADMINISTRADOR',
        'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO product (id, organization_id, ncm, description)
VALUES ('00000000-0000-0000-0000-0000000000c1',
        '00000000-0000-0000-0000-000000000001',
        '0901.21.00', 'Cafe torrado em graos'),
       ('00000000-0000-0000-0000-0000000000c2',
        '00000000-0000-0000-0000-000000000001',
        '1201.90.00', 'Soja em graos')
ON CONFLICT (id) DO NOTHING;

-- Customers
INSERT INTO customer (id, organization_id, name, country)
VALUES ('00000000-0000-0000-0000-0000000000d1',
        '00000000-0000-0000-0000-000000000001',
        'Global Importers Inc', 'US'),
       ('00000000-0000-0000-0000-0000000000d2',
        '00000000-0000-0000-0000-000000000001',
        'Euro Trading GmbH', 'DE')
ON CONFLICT (id) DO NOTHING;

-- One confirmed export with an item so the Export screen shows data
INSERT INTO export (id, organization_id, legal_entity_id, customer_id, reference,
                    status, destination_country, incoterm, total_amount, currency)
VALUES ('00000000-0000-0000-0000-0000000000f1',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-0000000000e1',
        '00000000-0000-0000-0000-0000000000d1',
        'EXP-2024-0001',
        'CONFIRMADA', 'US', 'FOB', 25000.00, 'USD')
ON CONFLICT (id) DO NOTHING;

INSERT INTO export_item (id, export_id, organization_id, product_id,
                         description, quantity, unit_price)
VALUES ('00000000-0000-0000-0000-0000000000f2',
        '00000000-0000-0000-0000-0000000000f1',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-0000000000c1',
        'Cafe torrado em graos', 1000.000, 25.00)
ON CONFLICT (id) DO NOTHING;

-- V2__organization_identity.sql
-- Organization + Identity domain.
-- NOTE: These tables are intentionally NOT protected by RLS. They are accessed
-- before any organization context exists (login, MFA, org selection), so a
-- transaction-local org filter cannot apply. Isolation for identity data is
-- guarded at the application layer; a dedicated row-security strategy may be
-- added later if needed.

CREATE TABLE organization (
    id            uuid PRIMARY KEY,
    name          text NOT NULL,
    owner_user_id uuid,
    status        text NOT NULL DEFAULT 'ACTIVE',
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE legal_entity (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organization(id),
    cnpj            text NOT NULL,
    razao_social    text NOT NULL,
    nome_fantasia   text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_legal_entity_org ON legal_entity (organization_id);

-- CPF is stored as an HMAC lookup hash + ciphertext per the security
-- architecture; both are nullable to support the mock/dev data.
CREATE TABLE app_user (
    id                uuid PRIMARY KEY,
    name              text NOT NULL,
    email             text NOT NULL,
    cpf_lookup_hash   text,
    cpf_ciphertext    text,
    phone             text,
    status            text NOT NULL DEFAULT 'ACTIVE',
    email_verified_at timestamptz,
    last_login_at     timestamptz,
    created_at        timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_email UNIQUE (email)
);

CREATE TABLE user_credential (
    user_id              uuid PRIMARY KEY REFERENCES app_user(id),
    password_hash        text NOT NULL,
    password_changed_at  timestamptz,
    must_change_password boolean NOT NULL DEFAULT false,
    failed_attempts      int NOT NULL DEFAULT 0,
    locked_until         timestamptz,
    updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE organization_membership (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organization(id),
    user_id         uuid NOT NULL REFERENCES app_user(id),
    role            text NOT NULL,
    status          text NOT NULL DEFAULT 'ACTIVE',
    joined_at       timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_membership UNIQUE (organization_id, user_id)
);

CREATE INDEX idx_membership_user ON organization_membership (user_id);

CREATE TABLE mfa_method (
    id                uuid PRIMARY KEY,
    user_id           uuid NOT NULL REFERENCES app_user(id),
    type              text NOT NULL DEFAULT 'TOTP',
    secret_ciphertext text,
    key_version       int,
    status            text NOT NULL DEFAULT 'PENDING',
    verified_at       timestamptz,
    created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE mfa_recovery_code (
    id        uuid PRIMARY KEY,
    user_id   uuid NOT NULL REFERENCES app_user(id),
    code_hash text NOT NULL,
    used_at   timestamptz
);

CREATE TABLE password_reset (
    id         uuid PRIMARY KEY,
    user_id    uuid NOT NULL REFERENCES app_user(id),
    token_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    used_at    timestamptz,
    request_ip text
);

CREATE TABLE security_event (
    id              uuid PRIMARY KEY,
    user_id         uuid,
    organization_id uuid,
    type            text NOT NULL,
    ip              text,
    occurred_at     timestamptz NOT NULL DEFAULT now()
);

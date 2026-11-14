-- V37__mfa_totp.sql
-- Real MFA. mfa_method / mfa_recovery_code / security_event already exist (V2).
--  * last_used_step: RFC 6238 time-step of the last accepted code (replay protection).
--  * one TOTP row per user (PENDING while enrolling, ACTIVE once confirmed).
-- Identity tables are not RLS-scoped (read before org context exists).
ALTER TABLE mfa_method ADD COLUMN IF NOT EXISTS last_used_step bigint NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS ux_mfa_method_user_type ON mfa_method (user_id, type);
CREATE INDEX IF NOT EXISTS ix_mfa_recovery_user ON mfa_recovery_code (user_id);
CREATE INDEX IF NOT EXISTS ix_security_event_user ON security_event (user_id, occurred_at DESC);
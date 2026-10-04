-- =============================================================================
-- bootstrap-prod.sql  —  BOOTSTRAP DO BANCO DE PRODUÇÃO (modelo "A-variante")
-- =============================================================================
--
-- MODELO A-VARIANTE (resumo do fluxo):
--   * As migrations (Flyway V1..V23) rodam como ADMIN (`postgres`) num passo
--     SEPARADO do runtime do app.
--   * O app em runtime conecta como `eip_app` (NON-SUPERUSER, NON-BYPASSRLS) e
--     NÃO aplica migrations. O schema é validado implicitamente pelo Hibernate
--     (`spring.jpa.hibernate.ddl-auto=validate`, herdado do application.yml base)
--     e o Flyway do app fica DESLIGADO no profile cloud
--     (`spring.flyway.enabled=false` em application-cloud.yml).
--
-- COMO ESTE ARQUIVO É USADO (2 PARTES, Flyway no meio):
--   PARTE 1  → rodar como `postgres`, ANTES do Flyway.
--   (FLYWAY) → aplicar V1..V23 como `postgres` (passo externo; ver deploy/db/README.md).
--   PARTE 2  → rodar como `postgres`, DEPOIS do Flyway (precisa das tabelas já criadas).
--
-- IMPORTANTE:
--   * TODO este arquivo é executado como o usuário `postgres` do Cloud SQL, que é
--     membro de `cloudsqlsuperuser` — pré-requisito para poder setar o atributo
--     BYPASSRLS num role (ALTER ROLE ... BYPASSRLS exige privilégio elevado no
--     Cloud SQL; `postgres` o possui).
--   * NENHUMA senha aparece aqui. As senhas de `eip_app` e `eip_report` já foram
--     definidas no banco via `gcloud sql users set-password`, iguais ao `latest`
--     dos secrets `eip-db-app-password` e `eip-db-reporting-password`.
--   * Todos os comandos são IDEMPOTENTES (podem ser re-executados sem efeito
--     colateral).
--
-- ESTADO ATUAL ASSUMIDO (já provisionado via gcloud, NÃO recriar aqui):
--   * Cloud SQL `eip-sql` (POSTGRES_16), banco `eip`.
--   * Roles BUILT_IN já criados: `postgres` (admin), `eip_app`, `eip_report`.
--   * Senhas de `eip_app`/`eip_report` já setadas = latest dos secrets.
-- =============================================================================


-- #############################################################################
-- ## PARTE 1 — ANTES DO FLYWAY (rodar como `postgres`)                        ##
-- #############################################################################
--
-- Objetivo: deixar o role de REPORTING no estado correto ANTES das migrations.
--
-- POR QUÊ: a V17 cria `eip_report` dentro de um `IF NOT EXISTS`. Como o role JÁ
-- EXISTE (criado via gcloud), a V17 PULA a criação — e portanto NÃO aplica os
-- atributos `NOSUPERUSER BYPASSRLS` que ela só define no CREATE. Sem BYPASSRLS,
-- as consultas cross-tenant do Super Admin seriam filtradas pelo RLS (errado).
-- Então garantimos o atributo aqui, de forma idempotente.
--
-- NÃO definimos senha: ela já veio do Secret Manager via gcloud. Mexer na senha
-- aqui divergiria do secret.
--
-- Requer `postgres` (cloudsqlsuperuser): só um superuser/membro de
-- cloudsqlsuperuser pode conceder BYPASSRLS a outro role no Cloud SQL.
ALTER ROLE eip_report WITH LOGIN NOSUPERUSER BYPASSRLS;

-- OBS DE SEGURANÇA: `eip_app` NÃO recebe BYPASSRLS em momento algum. Ele é o
-- role de runtime do app e DEVE permanecer RLS-enforced (as policies FORCE RLS
-- da V4 e demais migrations continuam valendo para ele).

-- -----------------------------------------------------------------------------
-- >>> PARAR AQUI. Agora rode o FLYWAY (V1..V23) como `postgres`. <<<
-- Ver o passo-a-passo em deploy/db/README.md (Passo 2).
-- Só volte para a PARTE 2 depois que TODAS as migrations tiverem sido aplicadas,
-- pois os GRANTs abaixo dependem das tabelas já existirem.
-- -----------------------------------------------------------------------------


-- #############################################################################
-- ## PARTE 2 — DEPOIS DO FLYWAY (rodar como `postgres`)                       ##
-- #############################################################################
--
-- Objetivo: conceder ao `eip_app` os privilégios de runtime sobre o schema que
-- o Flyway acabou de criar.
--
-- POR QUÊ: como o Flyway rodou como `postgres`, as tabelas pertencem a
-- `postgres`. O `eip_app` (role de runtime, SEM BYPASSRLS) não tem privilégio
-- nenhum sobre elas por padrão. Precisa de USAGE no schema, DML em todas as
-- tabelas e USAGE/SELECT nas sequences — e que isso valha também para objetos
-- FUTUROS (via ALTER DEFAULT PRIVILEGES).
--
-- MODELO CORRETO: GRANT dá o acesso DML; o RLS (FORCE) continua FILTRANDO as
-- linhas por tenant via policy. Como `eip_app` NÃO tem BYPASSRLS, o isolamento
-- multi-tenant permanece garantido. GRANT + FORCE RLS é exatamente o desejado.

-- Acesso ao schema.
GRANT USAGE ON SCHEMA public TO eip_app;

-- DML em TODAS as tabelas existentes criadas pelas migrations.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO eip_app;

-- Uso das sequences (identity/serial) existentes.
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO eip_app;

-- Objetos FUTUROS criados por `postgres` neste schema (p/ migrations futuras):
-- garante que novas tabelas/sequences já nasçam com os grants ao `eip_app`,
-- evitando ter de re-rodar os GRANTs amplos a cada nova migração.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO eip_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO eip_app;

-- Reforço idempotente dos grants de REPORTING. A V17 já concede isto, mas
-- repetimos por segurança (idempotente) para garantir o estado final correto
-- mesmo que a V17 tenha pulado algo por conta do role pré-existente.
GRANT USAGE ON SCHEMA public TO eip_report;
GRANT SELECT ON subscription, organization, ai_usage_event, product_event, lead
    TO eip_report;

-- =============================================================================
-- FIM. Validar conforme deploy/db/README.md (Passo 4):
--   * `eip_app` conecta e opera com RLS valendo (vê só o próprio tenant).
--   * `eip_report` tem BYPASSRLS e SELECT nas 5 tabelas de reporting.
-- =============================================================================

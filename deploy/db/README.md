# Bootstrap do banco de PRODUÇÃO — modelo "A-variante"

> **AVISO:** este documento é um **runbook**. **NADA aqui foi executado** ainda.
> Nenhum SQL foi rodado no banco, nenhum Flyway foi aplicado, nenhuma infra viva
> foi alterada. Execute os passos abaixo manualmente, com revisão, quando for a
> hora do go-live.

## Modelo A-variante (visão geral)

- As **migrations** (Flyway `V1..V23`) são aplicadas por um **passo ADMIN
  separado**, conectando como `postgres` (admin do Cloud SQL).
- O **app em runtime** conecta como `eip_app` (NON-SUPERUSER, **NON-BYPASSRLS**)
  e **NÃO** roda migrations:
  - `spring.flyway.enabled=false` no profile `cloud` (`application-cloud.yml`).
  - o schema é validado implicitamente por `spring.jpa.hibernate.ddl-auto=validate`
    (herdado do `application.yml` base) — se o schema não bater com as entidades,
    o app falha no boot, sem precisar de privilégio de migração.
- O role de reporting `eip_report` tem **BYPASSRLS** (consultas cross-tenant do
  Super Admin), mas **somente SELECT** em 5 tabelas.

### Estado já provisionado (via `gcloud`, não refazer)

- Cloud SQL `eip-sql` (POSTGRES_16, conn `eip-ai-prod:southamerica-east1:eip-sql`),
  banco `eip`.
- Roles BUILT_IN já criados: `postgres` (admin / cloudsqlsuperuser), `eip_app`,
  `eip_report`.
- Secrets `eip-db-app-password` e `eip-db-reporting-password` (versões `latest`
  gravadas). As **senhas** de `eip_app`/`eip_report` **já foram setadas no banco**
  = `latest` dos secrets (via `gcloud sql users set-password`). Por isso o SQL de
  bootstrap **nunca** contém senha.

---

## Pré-requisito: abrir sessão `psql` como `postgres`

Qualquer uma das duas opções abre uma sessão administrativa:

- **Cloud SQL Auth Proxy** (recomendado, pois a mesma conexão serve para o Flyway):

  ```
  # inicia o proxy localmente apontando para a instância
  cloud-sql-proxy eip-ai-prod:southamerica-east1:eip-sql --port 5432
  # noutro terminal, conecta como postgres
  psql "host=127.0.0.1 port=5432 dbname=eip user=postgres"
  ```

- **`gcloud sql connect`** (abre psql direto, bom para rodar as PARTES do .sql):

  ```
  gcloud sql connect eip-sql --user=postgres --database=eip
  ```

A senha de `postgres` é a do próprio Cloud SQL (não é a dos secrets de app).

---

## Passo 1 — PARTE 1 do bootstrap (antes do Flyway), como `postgres`

Executa só o `ALTER ROLE eip_report ... BYPASSRLS` (corrige o atributo que a V17
não aplica, porque o role já existe). Rode a **PARTE 1** de
[`bootstrap-prod.sql`](./bootstrap-prod.sql):

```
psql "host=127.0.0.1 port=5432 dbname=eip user=postgres" \
  -c "ALTER ROLE eip_report WITH LOGIN NOSUPERUSER BYPASSRLS;"
```

> Idempotente. Não mexe em senha. Requer `postgres` (membro de
> `cloudsqlsuperuser`) para poder conceder BYPASSRLS.

---

## Passo 2 — aplicar o Flyway `V1..V23`, como `postgres`

As migrations devem ser aplicadas pelo **admin**, não pelo app. Opções:

- **(RECOMENDADO p/ degustação) Flyway CLI local via proxy**, como `postgres`.
  Aponte o Flyway para o diretório de migrations do backend e para o banco pelo
  proxy. Comando **conceitual** (ajuste caminhos/versão):

  ```
  flyway \
    -url="jdbc:postgresql://127.0.0.1:5432/eip" \
    -user=postgres \
    -locations="filesystem:backend/src/main/resources/db/migration" \
    -baselineOnMigrate=true \
    migrate
  ```

- **(Alternativa) Cloud Run Job / execução pontual com a imagem do backend**,
  passando `SPRING_FLYWAY_ENABLED=true` + `SPRING_DATASOURCE_URL`/`DB_USER=postgres`
  de admin, apenas para migrar e encerrar. Mais pesado de montar que a CLI.

> **Por que não aplicar os `.sql` manualmente?** São 23 migrations com DO-blocks,
> RLS, policies e seed — aplicar à mão é inviável e propenso a erro. Use o Flyway.
>
> **Observação sobre a V17:** ela roda aqui como `postgres`, então os
> `GRANT USAGE/SELECT` ao `eip_report` funcionam normalmente. O `CREATE ROLE`
> dentro do `IF NOT EXISTS` é pulado (role já existe) — por isso o Passo 1
> garantiu o `BYPASSRLS` antes.

---

## Passo 3 — PARTE 2 do bootstrap (depois do Flyway), como `postgres`

Concede ao `eip_app` os privilégios de runtime sobre as tabelas que o Flyway
acabou de criar (DML + sequences + default privileges para objetos futuros) e
reforça os grants do `eip_report`. Rode a **PARTE 2** de
[`bootstrap-prod.sql`](./bootstrap-prod.sql):

```
psql "host=127.0.0.1 port=5432 dbname=eip user=postgres" -f deploy/db/bootstrap-prod.sql
```

> Dica: você pode rodar o arquivo inteiro de novo com `-f`; como tudo é
> idempotente, a PARTE 1 apenas re-afirma o estado e a PARTE 2 aplica os grants.
> O comentário `>>> PARAR AQUI <<<` no arquivo é só uma marcação de leitura — ele
> não interrompe o `psql`. Se quiser rodar estritamente só a PARTE 2, copie o
> trecho a partir do cabeçalho "PARTE 2".

---

## Passo 4 — validar

```
-- eip_app: conecta e enxerga só o próprio tenant (RLS valendo)
psql "host=127.0.0.1 port=5432 dbname=eip user=eip_app"
  SELECT set_config('app.current_organization',
                    '00000000-0000-0000-0000-000000000001', true);
  SELECT count(*) FROM product;   -- deve ver só as linhas do tenant setado
  SELECT count(*) FROM product;   -- sem org setada em nova transação -> 0 linhas (fail-closed)

-- eip_report: BYPASSRLS -> vê todos os tenants nas 5 tabelas de reporting
psql "host=127.0.0.1 port=5432 dbname=eip user=eip_report"
  SELECT count(*) FROM organization;        -- OK (SELECT concedido, RLS ignorado)
  SELECT count(*) FROM customer;            -- deve FALHAR: sem SELECT em customer

-- conferir atributos do role de reporting
psql "host=127.0.0.1 port=5432 dbname=eip user=postgres"
  SELECT rolname, rolbypassrls, rolsuper, rolcanlogin
  FROM pg_roles WHERE rolname IN ('eip_app','eip_report');
  -- esperado: eip_report rolbypassrls=t ; eip_app rolbypassrls=f
```

---

## Nota sobre o seed V5 (login de demonstração)

A migration `V5__seed_dev.sql` roda em **todos** os ambientes e cria dados de
demonstração, incluindo o login:

- **usuário:** `alan@eip.exemplo`
- **senha:** `senha123` (armazenada como `{noop}senha123`)

Para a **degustação** isto é **aceitável e provavelmente desejável** (dá um login
conhecido e dados prontos para a demo). **NÃO** alteramos a V5 agora (mudaria o
schema history e divergiria do ambiente local).

> ⚠️ **Antes de clientes reais:** o seed V5 deve ser **gated** (dev-only) ou
> removido, e a senha de demonstração **trocada** por um `{bcrypt}` real. O
> `{noop}senha123` é fraco e público neste repositório.

---

## Lembrete final

Este README é o **runbook**. Nenhum comando acima foi executado. Revise, aprove e
só então rode os passos manualmente contra o Cloud SQL de produção.

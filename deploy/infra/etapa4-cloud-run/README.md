# Etapa 4 — Cloud Run (backend eip-backend)

> ⛔ **NÃO EXECUTAR / AGUARDANDO AUTORIZAÇÃO.** Arquivos **declarativos** (Terraform). Nenhum
> `terraform init/plan/apply` deve ser rodado sem autorização explícita. Um apply **cria recursos
> faturáveis** na GCP.

Esta pasta **substitui a abordagem GKE** (ver `../etapa4-gke-pod/`, mantida como referência/legado).
A escolha por **Cloud Run** é motivada por **custo mínimo em ambiente OCIOSO** (degustação, sem
clientes) e simplicidade operacional.

## Por que Cloud Run (e por que custa ~US$0 ocioso)

Cloud Run é um serviço gerenciado com **scale-to-zero**. Comparado ao GKE, ele **elimina**:
cluster GKE, Load Balancer, IP estático, sidecar Cloud SQL Auth Proxy, CSI driver /
SecretProviderClass / K8s Secret. E resolve **nativamente**:

| Necessidade        | Como o Cloud Run resolve                                             |
|--------------------|---------------------------------------------------------------------|
| HTTPS + domínio    | `domain_mapping` com TLS gerenciado grátis (`api.iaexport.com.br`)  |
| Cloud SQL          | Connector embutido via volume `cloud_sql_instance` (socket /cloudsql) |
| Secrets            | Injeção direta do Secret Manager como env (`secret_key_ref`)        |
| Custo ocioso       | `min_instance_count = 0` (scale-to-zero) + `cpu_idle = true` → ~US$0 |

Reforços de custo mínimo no `cloud_run.tf`:
- `scaling.min_instance_count = 0` — sem instância rodando quando ocioso (não fatura).
- `scaling.max_instance_count = 2` — teto baixo para degustação (evita custo inesperado).
- `resources.cpu_idle = true` — não paga CPU fora de request.
- `resources.startup_cpu_boost = true` — mitiga o cold start do scale-to-zero.

## Arquivos

```
etapa4-cloud-run/
├── providers.tf        # provider google ~>6.0 (project/region)
├── variables.tf        # project_id, region, deployer, signer, bucket, secrets, sql_connection_name, image, domain
├── project.tf          # habilita APIs: run, aiplatform, storage (sqladmin/secretmanager=Etapa3; AR=Etapa2)
├── runtime_sa.tf       # GSA de runtime eip-run + roles (cloudsql.client, aiplatform.user, secretAccessor por secret)
├── signer.tf           # signer eip-signer + tokenCreator p/ eip-run + role custom de bucket (create+get)
├── bucket.tf           # bucket eip-ai-prod-documents (UBLA + public_access_prevention)
├── cloud_run.tf        # serviço eip-backend (scaling, SA, env, secrets, Cloud SQL volume, probes)
├── domain_mapping.tf   # api.iaexport.com.br -> serviço (TLS gerenciado; DNS é passo manual)
├── iam_invoker.tf      # roles/run.invoker=allUsers (público; app faz auth de sessão/BFF)
├── roles_deployer.tf   # deployer: run.developer + iam.serviceAccountUser sobre eip-run
├── outputs.tf          # service_uri, SAs, domain mapping + DNS records
└── README.md           # este arquivo
```

## Matriz IAM

| Identidade        | Role / permissão                                   | Escopo                      | Onde |
|-------------------|----------------------------------------------------|-----------------------------|------|
| runtime `eip-run` | `roles/cloudsql.client`                            | projeto                     | `runtime_sa.tf` |
| runtime `eip-run` | `roles/aiplatform.user`                            | projeto                     | `runtime_sa.tf` |
| runtime `eip-run` | `roles/secretmanager.secretAccessor`               | por secret (as 2 senhas)    | `runtime_sa.tf` |
| runtime `eip-run` | `roles/iam.serviceAccountTokenCreator`             | sobre `eip-signer`          | `signer.tf` |
| signer `eip-signer` | role custom `eipSignerObjectRW` (create+get)     | bucket documents            | `signer.tf` |
| deployer `deployer` | `roles/run.developer`                            | projeto                     | `roles_deployer.tf` |
| deployer `deployer` | `roles/iam.serviceAccountUser` (actAs)           | sobre `eip-run`             | `roles_deployer.tf` |

> A GSA `eip-pod` do `etapa4-gke-pod/` **NÃO** é usada no Cloud Run (ela depende de Workload
> Identity de pod GKE). O Cloud Run roda diretamente sob `eip-run`.

## ✅ Cloud SQL + JDBC no Cloud Run — RESOLVIDO (opção a: socket factory)

O backend usa `SPRING_DATASOURCE_URL` (JDBC padrão) e **não foi reescrito**. A decisão foi tomada
pela **opção (a)**: a dependência `com.google.cloud.sql:postgres-socket-factory` foi **adicionada ao
`backend/pom.xml`** (versão gerenciada pelo `com.google.cloud:libraries-bom`, escopo `runtime`). Com
a classe no classpath, o `SPRING_DATASOURCE_URL` está **ATIVO** no `cloud_run.tf`:

```
jdbc:postgresql:///eip?cloudSqlInstance=eip-ai-prod:southamerica-east1:eip-sql&socketFactory=com.google.cloud.sql.postgres.SocketFactory
```

**Mecanismo:** o connector embutido do Cloud Run (volume `cloud_sql_instance` + `volume_mounts`, já
declarados) monta o unix socket em `/cloudsql/<conn>`; o `postgres-socket-factory` descobre o socket
pelo parâmetro `cloudSqlInstance` da URL (não requer host/porta). A GSA `eip-run` tem
`roles/cloudsql.client`. O `REPORTING_DATASOURCE_URL` defaulta para `SPRING_DATASOURCE_URL` no
`application-cloud.yml`, então basta definir `SPRING_DATASOURCE_URL`.

> A opção (b) (Auth Proxy como sidecar multi-container) foi **descartada**: a opção (a) integra-se de
> forma mais limpa ao modelo gerenciado do Cloud Run, sem container adicional.

## Passos MANUAIS (fora da IaC)

1. **Senhas e usuários do banco (antes do 1º deploy):** definir os valores dos secrets
   `eip-db-app-password` e `eip-db-reporting-password` (criados vazios na Etapa 3) e criar os
   usuários `eip_app` / `eip_report` no Postgres (role de reporting com `BYPASSRLS`, provisionada por
   um DBA — não pelo Flyway, conforme `application-cloud.yml`).
2. **DNS do domain mapping (pós-apply):** após o apply, obter os records exigidos (output
   `domain_mapping_dns_records` ou `gcloud run domain-mappings describe`) e criar os CNAME/A/AAAA de
   `api.iaexport.com.br` no provedor DNS. O TLS gerenciado é emitido depois que o DNS aponta.
3. **Verificação de domínio:** se exigida, verificar `iaexport.com.br` (Google Search Console) para
   o projeto/conta antes do mapping completar.
4. **Vertex location:** confirmar `global` vs `southamerica-east1` para o Vertex antes do go-live.

## Estimativa de custo OCIOSO (degustação)

| Item                         | Custo ocioso estimado         |
|------------------------------|-------------------------------|
| Cloud Run (min=0, cpu_idle)  | ~US$0 (só paga sob request)   |
| Cloud SQL `db-f1-micro`      | ~US$12–22/mês (**único fixo recorrente**) |
| Artifact Registry            | ~US$0 (armazenamento mínimo)  |
| Firebase Hosting             | ~US$0 (free tier)             |

O **único custo fixo recorrente** em ambiente ocioso é o Cloud SQL `db-f1-micro` (a instância fica
sempre ligada). Tudo o mais tende a ~US$0 enquanto não houver tráfego.

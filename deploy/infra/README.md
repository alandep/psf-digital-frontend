# IaC — Infraestrutura de produção por ETAPAS (eip-ai-prod / southamerica-east1)

> ⛔ **NÃO EXECUTAR / AGUARDANDO AUTORIZAÇÃO POR ETAPA.** Estes arquivos Terraform são
> **definições declarativas**. Nenhuma etapa é aplicada sem autorização explícita do usuário.
> `terraform apply` em etapas 2+ **cria recursos faturáveis** na GCP.

> ℹ️ **Etapa 4 — alvo atual é CLOUD RUN.** A Etapa 4 passou a ser **Cloud Run**
> (`etapa4-cloud-run/`), por **custo mínimo ocioso** (scale-to-zero, sem Load Balancer, HTTPS/domínio
> incluso). A pasta `etapa4-gke-pod/` é **mantida como ALTERNATIVA/legado** (referência caso se
> migre para GKE no futuro) — **não é o alvo atual** e não deve ser aplicada.

## Pré-requisito fora da IaC: projeto + billing (Console)

O **projeto `eip-ai-prod`** e a **vinculação de BILLING** são criados e controlados pelo usuário
**diretamente no Google Cloud Console** — **NÃO entram no Terraform**. A IaC **não** contém
`google_project` nem qualquer recurso de billing; ela **assume o projeto pré-existente com billing
ativo** e apenas o referencia via `var.project_id`.

## Estrutura por etapas (least-privilege incremental)

A pasta é organizada em subpastas, **uma por etapa**. Cada subpasta tem **state próprio**
(`terraform init`/`apply` isolado), então aplicar a Etapa 1 **NÃO** cria recursos das outras etapas.
Isso materializa o "uma etapa por vez" na própria estrutura.

```
deploy/infra/
├── etapa1-wif/                 # Etapa 1 — Federação GitHub->GCP (não cria recurso faturável)
│   ├── providers.tf
│   ├── variables.tf            # project_id, region, github_repo, github_branch
│   ├── project.tf              # SOMENTE 4 APIs mínimas de WIF/SA/IAM
│   ├── wif.tf                  # pool + provider OIDC + SA deployer (SEM roles de projeto) + binding WIF
│   └── (outputs: wif_provider, deploy_service_account — em wif.tf)
├── etapa2-artifact-registry/   # Etapa 2 — Artifact Registry (💲)
│   ├── providers.tf
│   ├── variables.tf
│   ├── project.tf              # API artifactregistry
│   ├── artifact_registry.tf    # repo Docker eip-backend + cleanup policy
│   └── roles.tf                # concede roles/artifactregistry.writer à deployer
├── etapa3-cloud-sql/           # Etapa 3 — Dados e secrets (💲)
│   ├── providers.tf
│   ├── variables.tf
│   ├── project.tf              # APIs sqladmin + secretmanager
│   ├── cloud_sql.tf            # Cloud SQL PostgreSQL 16 (db-f1-micro, zonal, sem HA)
│   └── secrets.tf              # Secret Manager (NOMES, sem valores)
├── etapa4-cloud-run/           # Etapa 4 — Cloud Run (💲) — ALVO ATUAL (scale-to-zero, custo mínimo)
│   ├── providers.tf
│   ├── variables.tf            # + sql_connection_name, image, domain
│   ├── project.tf              # APIs run, aiplatform, storage
│   ├── runtime_sa.tf           # GSA eip-run + roles (cloudsql.client, aiplatform.user, secretAccessor por secret)
│   ├── signer.tf               # signer eip-signer + tokenCreator p/ eip-run + role custom de bucket
│   ├── bucket.tf               # bucket eip-ai-prod-documents
│   ├── cloud_run.tf            # serviço eip-backend (min=0, cpu_idle, secrets, Cloud SQL volume, probes)
│   ├── domain_mapping.tf       # api.iaexport.com.br (TLS gerenciado; DNS manual)
│   ├── iam_invoker.tf          # roles/run.invoker=allUsers (público; app faz auth de sessão/BFF)
│   ├── roles_deployer.tf       # deployer: run.developer + iam.serviceAccountUser sobre eip-run
│   └── outputs.tf              # service_uri, SAs, domain mapping + DNS records
└── etapa4-gke-pod/             # Etapa 4 — GKE + GSA do pod + Firebase (💲) — LEGADO/ALTERNATIVA (não aplicar)
    ├── providers.tf
    ├── variables.tf
    ├── project.tf              # APIs container, aiplatform, storage, compute, firebasehosting
    ├── gsa_pod.tf              # GSA eip-pod + roles do pod + binding WI KSA<->GSA
    └── roles.tf                # concede roles/container.developer + roles/firebasehosting.admin à deployer
```

> **Nenhum valor de segredo aparece nestes arquivos** — apenas nomes de secrets. Os valores são
> definidos fora da IaC (ex.: `gcloud secrets versions add ...`) na etapa correspondente.

## Etapa 1 (WIF) — o que um apply criaria

A Etapa 1 estabelece e valida a federação GitHub→GCP **sem key.json**. Um `apply` em
`etapa1-wif/` cria **SOMENTE**:

- **4 APIs** mínimas: `iam.googleapis.com`, `iamcredentials.googleapis.com`, `sts.googleapis.com`,
  `cloudresourcemanager.googleapis.com`;
- **Workload Identity Pool** (`github-pool`);
- **GitHub OIDC Provider** (`github-provider`, issuer `token.actions.githubusercontent.com`);
- **Service Account `deployer`** — **SEM nenhuma role de projeto**;
- **binding `roles/iam.workloadIdentityUser`** sobre a própria SA (permite o GitHub impersoná-la),
  restrito a `alandep/psf-digital-frontend` + `refs/heads/master` via `attribute_condition`;
- **outputs** `wif_provider` e `deploy_service_account` (para configurar os `vars` do GitHub).

A Etapa 1 **NÃO** cria: Artifact Registry, Cloud SQL, Secret Manager, GSA do pod, GKE, LB/IP, nem
concede qualquer role de projeto à `deployer`. (A validação da autenticação é um teste do
workflow/`gcloud`, não um recurso Terraform.)

## Role concedida à `deployer` POR ETAPA (least-privilege incremental)

| Etapa | Role concedida à `deployer` | Onde (arquivo) |
|-------|-----------------------------|----------------|
| Etapa 1 — WIF | **Nenhuma role de projeto** (apenas o binding `roles/iam.workloadIdentityUser` sobre a própria SA) | `etapa1-wif/wif.tf` |
| Etapa 2 — Artifact Registry | `roles/artifactregistry.writer` | `etapa2-artifact-registry/roles.tf` |
| Etapa 3 — Cloud SQL / Secrets | *(nenhuma role nova para a `deployer`; a GSA de runtime é criada na Etapa 4)* | — |
| Etapa 4 — **Cloud Run (alvo atual)** | `roles/run.developer` + `roles/iam.serviceAccountUser` (actAs sobre `eip-run`) | `etapa4-cloud-run/roles_deployer.tf` |
| Etapa 4 — GKE / Pod / Firebase *(legado/alternativa)* | `roles/container.developer` + `roles/firebasehosting.admin` | `etapa4-gke-pod/roles.tf` |

> **Cloud Run (alvo atual):** a GSA de **runtime** `eip-run` e suas roles (`aiplatform.user`,
> `cloudsql.client`, `secretmanager.secretAccessor` **por secret**) + `serviceAccountTokenCreator`
> sobre o `eip-signer` são criadas na **Etapa 4** (`etapa4-cloud-run/runtime_sa.tf` + `signer.tf`).
> O Cloud Run NÃO usa Workload Identity de pod; roda diretamente sob `eip-run`.
>
> **GKE (legado):** a GSA do pod (`eip-pod`) + binding Workload Identity KSA↔GSA ficam em
> `etapa4-gke-pod/gsa_pod.tf` (referência; não é o alvo atual).

## APIs habilitadas por etapa

| Etapa | APIs |
|-------|------|
| Etapa 1 — WIF | `iam`, `iamcredentials`, `sts`, `cloudresourcemanager` |
| Etapa 2 — Artifact Registry | `artifactregistry` |
| Etapa 3 — Cloud SQL / Secrets | `sqladmin`, `secretmanager` |
| Etapa 4 — **Cloud Run (alvo atual)** | `run`, `aiplatform`, `storage` |
| Etapa 4 — GKE / Pod / Firebase *(legado/alternativa)* | `container`, `aiplatform`, `storage`, `compute`, `firebasehosting` |

## Como seria aplicado (NÃO rodar agora)

```sh
# NÃO EXECUTAR. Apenas referência do fluxo por etapa.
# Cada subpasta tem seu PRÓPRIO state (init/apply isolado).
#
# Etapa 1 (não-faturável) — após autorização:
#   cd etapa1-wif && terraform init && terraform plan && terraform apply
#
# Etapas 2+ (💲 faturáveis) — cada uma só após sua própria autorização:
#   cd etapa2-artifact-registry && terraform init && terraform apply
#   cd etapa3-cloud-sql         && terraform init && terraform apply
#   cd etapa4-cloud-run         && terraform init && terraform apply   # ALVO ATUAL (Cloud Run)
#   # etapa4-gke-pod/ é LEGADO/ALTERNATIVA — NÃO aplicar (mantida como referência).
```

> **Variáveis comuns** (`project_id`, `region`, `github_repo`, `github_branch`) são **duplicadas**
> em cada subpasta porque cada etapa tem state isolado — mantém cada `apply` autossuficiente e sem
> acoplamento entre states. A SA `deployer` criada na Etapa 1 é referenciada nas etapas seguintes
> pelo e-mail determinístico `deployer@<project_id>.iam.gserviceaccount.com`.

# Manifests Kubernetes — EIP backend (GKE Autopilot, southamerica-east1)

Manifests **versionados** do backend para o GKE Autopilot em produção (`eip-ai-prod`,
região `southamerica-east1`).

> ⛔ **Nada aqui é aplicado automaticamente.** Estes arquivos só são aplicados na **fase faturável (💲)**,
> depois do checkpoint de aprovação de custos. A Fase 0 apenas cria/versiona os YAML.

## Arquivos (base)

| Arquivo | O que faz |
|---------|-----------|
| `serviceaccount.yaml` | KSA `eip-ksa` com annotation de Workload Identity (GSA `eip-pod@eip-ai-prod...`). Sem key.json. |
| `deployment.yaml` | Deployment do backend, `replicas: 1`, imagem `...eip-backend:GIT_SHA_PLACEHOLDER` (SHA injetado no CD, **nunca `latest`**), requests `250m/512Mi` (512Mi a MEDIR, pode subir p/ 1Gi) / limits `500m/1Gi`, probes liveness/readiness, env `SPRING_PROFILES_ACTIVE=cloud`/`PORT=8080`, datasource `127.0.0.1:5432` (via sidecar), DB/REPORTING via `secretKeyRef`, `GOOGLE_CLOUD_PROJECT=eip-ai-prod`, `VERTEX_LOCATION` placeholder, sidecar `cloud-sql-proxy`. |
| `service.yaml` | Service ClusterIP na porta 8080. |

## Exposição: B (produção) vs A (dev/teste)

| Pasta | Uso | Conteúdo |
|-------|-----|----------|
| `expose-b/` | **PRODUÇÃO (alvo)** | Ingress GKE (HTTP(S) LB gerenciado) + IP estático + `ManagedCertificate` para `api.iaexport.com.br`. |
| `expose-a/` | **Apenas dev/teste técnico** | `Service NodePort` ou `kubectl port-forward`. NÃO é produção. |

## Segredos (sem valores aqui)

O `deployment.yaml` referencia o Secret do K8s `eip-db-credentials` (chaves `db-user`, `db-password`,
`reporting-db-user`, `reporting-db-password`), que será alimentado pelo Secret Manager na fase 💲.
Nenhum valor de segredo aparece nestes manifests.

## Observação sobre o ambiente local

O ambiente local continua sendo o `backend/docker-compose.yml` (profile `local`), **inalterado**.
Estes manifests são exclusivos de produção na GCP.

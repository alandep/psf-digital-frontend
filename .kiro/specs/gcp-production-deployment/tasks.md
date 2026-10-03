# Plano de Implementação: Deployment de Produção na GCP

## Visão Geral

Plano incremental para preparar e implantar o EIP na GCP a partir do GitHub, **priorizando custo e
simplicidade**. As tarefas estão organizadas em fases. **Toda a Fase 0 é não-faturável** (apenas
código, manifests e workflows — não cria cobrança). Em seguida há um **CHECKPOINT DE APROVAÇÃO DE
CUSTOS** obrigatório. Só **depois** da aprovação explícita do usuário sobre o `design.md` + relatório
de custos é que começam as fases de provisionamento, que **passam a gerar cobrança**.

Linguagens: Java 21 / Spring Boot 3.5.6 (backend), Angular 20 (frontend), YAML/HCL para
manifests K8s e workflows do GitHub Actions. Edições apenas via ferramentas de arquivo
(nunca PowerShell para editar código).

**Decisões definitivas aplicadas:** região de produção **`southamerica-east1` (São Paulo)**; exposição
de produção = **Caminho B** (LB + IP estático + TLS gerenciado + `api.iaexport.com.br`); frontend em
**`iaexport.com.br`** (Firebase Hosting, apex); projeto **`eip-ai-prod`**; pipeline com **CI (`ci.yml`,
em PR, sem deploy)** separado de **CD (`cd.yml`, em `master`, com deploy)**; imagem sempre
`eip-backend:<git-sha>` (nunca `latest`).

> ⛔ **TRAVA:** nenhuma tarefa marcada com 💲 pode ser executada antes do checkpoint de aprovação de
> custos (tarefa 4). As tarefas da Fase 0 (1–3) são seguras e não geram cobrança.

## Tasks

- [ ] 1. Fase 0 — Preparação do backend (não-faturável)
  - [ ] 1.1 Declarar grupos de health probes explícitos
    - Em `backend/src/main/resources/application.yml`, adicionar `management.endpoint.health.group.liveness.include=livenessState` (mantendo o group `readiness: readinessState,db` já existente) para probes estáveis no GKE.
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 1.2 Ajustar o Dockerfile para o pod mínimo (JVM 21)
    - Em `backend/Dockerfile`, trocar o entrypoint fixo `-XX:+UseZGC` por `JAVA_OPTS` parametrizável via env, com default seguro para pod pequeno: `ENV JAVA_OPTS="-XX:MaxRAMPercentage=70 -XX:+UseG1GC"` e `ENTRYPOINT ["sh","-c","exec java $JAVA_OPTS -jar app.jar"]`. G1 como default (footprint menor em heaps pequenos); ZGC permanece opção para pods maiores via override de `JAVA_OPTS`. Manter `EXPOSE 8080`, `server.port=${PORT:8080}` e o build multi-stage idêntico (só muda o runtime).
    - _Requirements: 4.4_

  - [ ]* 1.3 Teste de integração dos endpoints de probe
    - Subir o backend (Testcontainers com PostgreSQL) e verificar `/actuator/health/liveness` e `/actuator/health/readiness` (readiness inclui `db`).
    - **Propriedade 9: Readiness reflete o estado do banco**
    - **Validates: Requisitos 4.2, 4.3, 5.1, 5.2**

- [ ] 2. Fase 0 — Preparação do frontend (não-faturável)
  - [ ] 2.1 Configurar `environment.prod.ts` para produção real
    - Em `src/environments/environment.prod.ts`: `production:true`, `useMockServices:false`, `bffBaseUrl:'https://api.iaexport.com.br'` (Caminho B), `realApis` com `auth:true` e `ai:true` (demais `false`, mesmo conjunto do dev). Manter a interface `Environment`/`RealApiFlags` intacta e comentar que o front de produção fala com o backend real via HTTPS em `api.iaexport.com.br`.
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ]* 2.2 Verificar o build de produção
    - Rodar `node_modules\.bin\ng.cmd build --configuration=production` e confirmar saída em `dist/psf-digital-frontend` sem o mock ativo.
    - _Requirements: 12.1_

- [ ] 3. Fase 0 — Manifests, config de infra e workflows como código (não-faturável)
  - [ ] 3.1 Criar manifests K8s versionados do backend
    - Criar `deploy/k8s/`: Deployment (`replicas:1`, imagem `southamerica-east1-docker.pkg.dev/eip-ai-prod/eip-backend/eip-backend:GIT_SHA_PLACEHOLDER` — SHA injetado no CD, nunca `latest`; requests `250m/512Mi` com comentário "512Mi a MEDIR, pode subir p/ 1Gi", limits `500m/1Gi`, probes liveness/readiness, `SPRING_PROFILES_ACTIVE=cloud`, `PORT=8080`, datasource via `127.0.0.1:5432`, DB_*/REPORTING_* via `secretKeyRef`, `GOOGLE_CLOUD_PROJECT=eip-ai-prod`, `VERTEX_LOCATION` placeholder, `serviceAccountName: eip-ksa`), sidecar `cloud-sql-proxy`, Service ClusterIP, ServiceAccount `eip-ksa` com annotation de Workload Identity. Refs de Secret sem valores.
    - _Requirements: 1.2, 2.1, 2.3, 4.1, 4.2_

  - [ ] 3.2 Criar manifests de exposição (B = produção; A = dev/teste)
    - Criar `deploy/k8s/expose-b/` (**produção**: Ingress GKE + IP estático + `ManagedCertificate` para `api.iaexport.com.br`) e `deploy/k8s/expose-a/` (**apenas dev/teste técnico**: NodePort ou `port-forward`, claramente marcado como não-produção). Documentar que só um é aplicado e que o alvo de produção é o B.
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ] 3.3 Criar config de infra como código (IaC) sem aplicar — estrutura POR ETAPA (least-privilege incremental)
    - Criar `deploy/infra/` organizado em subpastas por etapa, cada uma com state próprio (apply isolado), de modo que aplicar a Etapa 1 NÃO crie recursos das demais:
      - `etapa1-wif/`: APENAS as 4 APIs mínimas de WIF/SA/IAM (`iam`, `iamcredentials`, `sts`, `cloudresourcemanager`), Workload Identity Pool, GitHub OIDC Provider (issuer `token.actions.githubusercontent.com`, condição de repo `alandep/psf-digital-frontend` + branch `refs/heads/master`), SA `deployer` **SEM nenhuma role de projeto** e binding `roles/iam.workloadIdentityUser` sobre a própria SA, + outputs `wif_provider`/`deploy_service_account`.
      - `etapa2-artifact-registry/`: Artifact Registry `eip-backend` em `southamerica-east1` + cleanup policy (keep-last-10 + idade); concede incrementalmente `roles/artifactregistry.writer` à `deployer`.
      - `etapa3-cloud-sql/`: Cloud SQL (`db-f1-micro`, zonal, sem HA) em `southamerica-east1` + Secret Manager (nomes, sem valores).
      - `etapa4-gke-pod/`: GSA_Pod `eip-pod` (roles `aiplatform.user`/`cloudsql.client`/`secretmanager.secretAccessor`/GCS) + binding WI KSA↔GSA; concede incrementalmente `roles/container.developer` e `roles/firebasehosting.admin` à `deployer`.
    - **O PROJETO `eip-ai-prod` e o BILLING NÃO entram na IaC** — são criados/controlados pelo usuário no Console; a IaC assume o projeto pré-existente via `var.project_id`.
    - **Arquivos de definição apenas — não executar.**
    - _Requirements: 2.1, 3.3, 3.4, 6.1, 6.2, 6.3, 10.3_

  - [ ] 3.4 Criar workflows do GitHub Actions — CI e CD separados (arquivos, sem deploy real agora)
    - Criar `.github/workflows/ci.yml` (dispara em `pull_request` e pushes de branch ≠ `master`): jobs `backend` (`mvn -B verify`, gate 1.4/2.4/3.6/4.4; 5.5 `continue-on-error`), `frontend` (`npm ci` + `ng build --configuration=production` + `ng test` headless best-effort), `docker-build` (docker build SEM push). **Sem deploy, sem login GCP.**
    - Criar `.github/workflows/cd.yml` (dispara em `push` na `master`): repetir o gate, depois `build-and-push` (auth WIF via `google-github-actions/auth` com `workload_identity_provider`+`service_account` como *vars*, docker build + push `eip-backend:${{ github.sha }}`), `deploy-backend` (auth WIF, `get-credentials`, `kubectl set image`/apply `:${{ github.sha }}`, `kubectl rollout status`), `deploy-frontend` (`firebase deploy` via WIF/OIDC). Nunca `latest`. Placeholders (PROJECT_ID=`eip-ai-prod`, REGION=`southamerica-east1`, cluster, WIF provider, firebase project) com comentário "preencher após provisionamento (fase 💲)". Comentário no topo: só funciona após a infra faturável e os vars/secrets de WIF existirem; não cria nada em PR.
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

  - [ ]* 3.5 Check estático anti-`latest` e anti-segredo
    - Adicionar ao job `test` um check que falha se algum manifesto/workflow usar `latest` ou se houver padrão de segredo/`key.json` versionado.
    - **Propriedade 1 / Propriedade 2**
    - **Validates: Requisitos 1.3, 2.2**

  - [ ] 3.6 Confirmar preservação do Docker Compose local
    - Verificar (diff) que `backend/docker-compose.yml` permanece inalterado e que `docker-compose.cloud.yml` segue como ferramenta de dev-cloud, não de prod.
    - _Requirements: 8.1, 8.2_

- [ ] 4. 🛑 CHECKPOINT DE APROVAÇÃO DE CUSTOS (humano obrigatório)
  - Apresentar ao usuário o Relatório de Pré-Aprovação do `design.md` (recursos, região, tamanhos, custos estimados, free tiers, IAM, rede, secrets, domínio/HTTPS, rollback) e os três pontos de economia (LB A/B, Cloud SQL, pod mínimo).
  - **BLOQUEIO:** nenhuma tarefa 💲 abaixo pode iniciar sem aprovação explícita do usuário sobre o design.md e os custos. Região (`southamerica-east1`), exposição de produção (**Caminho B**), domínios (`iaexport.com.br` / `api.iaexport.com.br`) e projeto (`eip-ai-prod`) já estão decididos; o checkpoint confirma apenas a aprovação de custos para `southamerica-east1`/Caminho B.
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

> ⬇️ **A PARTIR DAQUI AS TAREFAS GERAM COBRANÇA (💲). Só executar após a tarefa 4 aprovada.**

- [ ] 5. 💲 Fase 1 — Fundação GCP (projeto, WIF, Artifact Registry)
  - [ ] 5.1 Confirmar o projeto `eip-ai-prod` + billing (FORA da IaC — Console)
    - O projeto `eip-ai-prod` e a vinculação de billing são criados/controlados pelo usuário **diretamente no Google Cloud Console** — **NÃO entram no Terraform** (sem `google_project`/billing na IaC). Esta tarefa apenas confirma o pré-requisito (projeto existente com billing ativo, isolado de `eip-ai-dev`). As APIs são habilitadas **incrementalmente por etapa** pela própria IaC (Etapa 1 = `iam`/`iamcredentials`/`sts`/`cloudresourcemanager`; demais APIs nas etapas seguintes).
    - _Requirements: 10.3_

  - [ ] 5.2 💲 Provisionar WIF (pool/provider) + SA `deployer` SEM roles de projeto (least-privilege por etapa)
    - Aplicar `deploy/infra/etapa1-wif/`: pool/provider OIDC com condição de repo (`alandep/psf-digital-frontend`) + branch `refs/heads/master`, SA `deployer` **criada SEM nenhuma role de projeto** e binding `roles/iam.workloadIdentityUser` sobre a própria SA. Sem chave persistente. As roles de projeto da `deployer` são concedidas incrementalmente nas etapas de AR/GKE/Firebase (5.3, 7.x, 8.x), não aqui.
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 5.3 💲 Provisionar Artifact Registry + cleanup policy + role incremental da `deployer`
    - Aplicar `deploy/infra/etapa2-artifact-registry/`: repo Docker regional `eip-backend` em `southamerica-east1` com policy keep-last-10 + delete por idade; concede incrementalmente `roles/artifactregistry.writer` à SA `deployer` (push de imagens).
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 6. 💲 Fase 2 — Dados e secrets (Cloud SQL, Secret Manager, GSA do pod)
  - [ ] 6.1 💲 Provisionar Cloud SQL (`db-f1-micro`, zonal, sem HA) em `southamerica-east1`
    - Criar instância PostgreSQL 16 em SP, disco mínimo; criar usuário de app e role `eip_report`; sem IP público desnecessário. Registrar que é config econômica inicial a redimensionar antes de SLA rigoroso.
    - _Requirements: 5.1, 5.3, 5.4_

  - [ ] 6.2 💲 Criar secrets no Secret Manager
    - `eip-db-app-password` e `eip-db-reporting-password`; conceder `secretAccessor` à GSA_Pod.
    - _Requirements: 2.1, 2.2_

  - [ ] 6.3 💲 Provisionar GSA_Pod + binding Workload Identity
    - GSA com `aiplatform.user`, `cloudsql.client`, acesso ao bucket GCS de prod; binding KSA↔GSA. Sem `key.json`.
    - _Requirements: 2.3, 2.4_

- [ ] 7. 💲 Fase 3 — GKE Autopilot e exposição
  - [ ] 7.1 💲 Criar o cluster GKE Autopilot (`southamerica-east1`) e aplicar o Deployment do backend
    - Aplicar `deploy/infra/etapa4-gke-pod/` (GSA `eip-pod` + roles do pod + binding WI KSA↔GSA; concede incrementalmente `roles/container.developer` e `roles/firebasehosting.admin` à SA `deployer`) e, em seguida, `deploy/k8s/` com imagem `:<GIT_SHA>`; Cloud SQL Auth Proxy sidecar; Flyway migra no startup; aguardar readiness UP. Medir RSS/heap/CPU e, se necessário, subir request de memória para 1Gi; validar G1 vs ZGC.
    - _Requirements: 1.2, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3_

  - [ ] 7.2 💲 Aplicar a exposição de produção (Caminho B)
    - Aplicar `deploy/k8s/expose-b/`: Ingress GKE + IP estático + `ManagedCertificate` para `api.iaexport.com.br`; configurar DNS A/AAAA de `api.iaexport.com.br` → IP do LB. (Caminho A permanece disponível apenas para dev/teste técnico.)
    - _Requirements: 11.2, 11.4_

- [ ] 8. 💲 Fase 4 — Frontend (Firebase Hosting)
  - [ ] 8.1 💲 Configurar o projeto Firebase, domínio custom e publicar o frontend
    - Pré-requisito de IAM: a role `roles/firebasehosting.admin` da SA `deployer` é concedida incrementalmente na Etapa 4 (`deploy/infra/etapa4-gke-pod/roles.tf`), aplicada em 7.1 — garantir que já esteja ativa antes do `firebase deploy` via WIF. Vincular Firebase ao `eip-ai-prod`; verificação de domínio `iaexport.com.br` + registros DNS indicados pelo Firebase; `firebase deploy` do `dist/psf-digital-frontend`; confirmar HTTPS no apex `iaexport.com.br`; `bffBaseUrl` já aponta a `https://api.iaexport.com.br` (Caminho B).
    - _Requirements: 11.3, 12.2, 12.3_

- [ ] 9. 💲 Fase 5 — Pipeline end-to-end e rollback
  - [ ] 9.1 💲 Executar o CD completo em push de `master` (`cd.yml`)
    - `push master → gate (1.4/2.4/3.6/4.4) → build → push image (eip-backend:<SHA>) → kubectl set image/apply :<SHA> → kubectl rollout status (aguardar readiness) → firebase deploy`. Confirmar que o `ci.yml` em PR roda os mesmos checks SEM deploy.
    - _Requirements: 1.1, 1.2, 1.4, 9.1, 9.4, 9.7, 9.8_

  - [ ] 9.2 💲 Validar rollback por SHA
    - Re-aplicar o SHA anterior (sem rebuild) e confirmar readiness UP na versão anterior.
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 9.3 Smoke do caminho feliz com Vertex real
    - Único check com provedor real (fora do CI): UI→BFF→Vertex→ledger, confirmando registro em `ai_usage_event`.
    - _Requirements: 2.3_

- [ ] 10. 💲 Checkpoint final — garantir rollout saudável
  - Confirmar que todos os gates passaram, readiness UP, cleanup policy ativa e nenhum segredo versionado. Em caso de dúvida, perguntar ao usuário.

## Notes

- Tarefas marcadas com `*` são testes opcionais (rodam em CI; sem Maven local) e não devem ser executadas localmente pelo agente.
- Tarefas marcadas com 💲 **geram cobrança** e só podem iniciar após a tarefa 4 (checkpoint de aprovação de custos).
- A Fase 0 (tarefas 1–3) é 100% não-faturável: apenas código, manifests e workflows versionados.
- Os testes pendentes da `ai-resilience-hardening` (1.4, 2.4, 3.6, 4.4) entram no **gate** (bloqueante) tanto no `ci.yml` (PR) quanto no `cd.yml` (`master`); 5.5 é best-effort.
- **CI (`ci.yml`) = PR, build/test, SEM deploy. CD (`cd.yml`) = `master`, push imagem + rollout + firebase.**
- Imagem sempre `eip-backend:<git-sha>` em `southamerica-east1-docker.pkg.dev/eip-ai-prod/eip-backend` — **nunca `latest`**.
- Rollback sempre por **Git SHA** (re-aplicar o SHA anterior, sem rebuild).
- Produção: região `southamerica-east1`, Caminho B (`api.iaexport.com.br`), frontend `iaexport.com.br`.
- O `docker-compose.yml` local permanece intacto.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.6"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.2", "3.1", "3.3"] },
    { "id": 2, "tasks": ["3.2", "3.4"] },
    { "id": 3, "tasks": ["3.5"] },
    { "id": 4, "tasks": ["5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3"] },
    { "id": 6, "tasks": ["6.1"] },
    { "id": 7, "tasks": ["6.2", "6.3"] },
    { "id": 8, "tasks": ["7.1"] },
    { "id": 9, "tasks": ["7.2", "8.1"] },
    { "id": 10, "tasks": ["9.1"] },
    { "id": 11, "tasks": ["9.2", "9.3"] }
  ]
}
```

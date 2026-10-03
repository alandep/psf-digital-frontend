# Documento de Requisitos: Deployment de Produção na GCP

## Introdução

Este documento define, em notação EARS, os requisitos para preparar o EIP (backend Spring Boot +
frontend Angular 20) para deployment automatizado e econômico na GCP a partir do GitHub, derivados
do `design.md` aprovado. Os requisitos cobrem reprodutibilidade por SHA, ausência de segredos no
código, autenticação WIF sem chave persistente, probes de liveness/readiness, migrations Flyway no
deploy, limpeza do Artifact Registry, rollback por SHA, preservação do Docker Compose local, o gate
de testes essenciais no CI (incluindo os testes pendentes da spec `ai-resilience-hardening`) e a
**trava de não-provisionar recursos faturáveis sem aprovação explícita** do usuário sobre o design e
o relatório de custos.

Esta spec é **somente documentação e preparação de código/manifests**. A criação de infraestrutura é
posterior e condicionada à aprovação.

## Glossário

- **Pipeline_CI_CD**: o conjunto de workflows do GitHub Actions que constrói, testa e implanta o EIP, composto por **Pipeline_CI** (`ci.yml`, em PR, sem deploy) e **Pipeline_CD** (`cd.yml`, em `master`, com deploy).
- **Pipeline_Deploy**: a parte do Pipeline_CI_CD responsável por publicar imagem e aplicar o deploy no GKE/Firebase.
- **Build_Imagem**: o processo que constrói e publica a imagem Docker do backend no Artifact Registry.
- **Backend_GKE**: a carga do backend Spring Boot em execução no GKE Autopilot.
- **Frontend_Firebase**: o frontend Angular hospedado no Firebase Hosting.
- **Artifact_Registry**: o repositório Docker regional das imagens do backend.
- **WIF**: Workload Identity Federation (autenticação GitHub→GCP via OIDC, sem chave persistente).
- **SA_Deploy**: a service account de deploy, impersonada via WIF, com permissões mínimas.
- **GSA_Pod**: a Google service account vinculada ao pod do GKE (acesso a Vertex AI e GCS via Workload Identity).
- **Secret_Manager**: o serviço GCP que guarda segredos (senhas do banco).
- **Cloud_SQL**: a instância PostgreSQL gerenciada em `southamerica-east1` (zonal, sem HA, tier mínimo inicial).
- **Regiao_Producao**: `southamerica-east1` (São Paulo), região oficial de produção (backend + banco).
- **Dominio_Frontend**: `iaexport.com.br` (apex), domínio custom do Frontend_Firebase.
- **Dominio_Backend**: `api.iaexport.com.br`, domínio do Backend_GKE exposto pelo Caminho B.
- **Caminho_B**: exposição de produção = HTTP(S) Load Balancer gerenciado (Ingress GKE) + IP estático + certificado TLS gerenciado + `Dominio_Backend`.
- **Caminho_A**: exposição apenas de desenvolvimento/teste técnico (NodePort/`port-forward`), nunca produção.
- **Pipeline_CI**: workflow `ci.yml` que roda em Pull Request (e pushes de branch não-`master`); faz build/test e NÃO faz deploy.
- **Pipeline_CD**: workflow `cd.yml` que roda em push/merge na branch `master`; faz push de imagem + rollout no GKE + deploy do frontend.
- **Git_SHA**: o identificador de commit usado como tag de imagem e unidade de rollback.
- **Compose_Local**: o `backend/docker-compose.yml` do ambiente local de desenvolvimento.
- **Checkpoint_Custos**: o ponto de aprovação humana do relatório de custos antes de qualquer recurso faturável.
- **Gate_Testes**: o conjunto de testes essenciais que deve passar antes de publicar imagem/deploy.

## Requisitos

### Requisito 1: Reprodutibilidade do deploy por SHA

**User Story:** Como engenheiro de release, quero que cada deploy seja identificado pelo Git SHA do commit, para que o estado implantado seja reproduzível e rastreável.

#### Acceptance Criteria

1. WHEN o Build_Imagem publica uma imagem no Artifact_Registry, THE Build_Imagem SHALL taggear a imagem com o Git_SHA do commit que originou o build (ex.: `eip-backend:<Git_SHA>` em `southamerica-east1-docker.pkg.dev/eip-ai-prod/eip-backend`).
2. THE Pipeline_Deploy SHALL referenciar a imagem a implantar pelo seu Git_SHA.
3. IF um manifesto ou passo de deploy referenciar a tag `latest`, THEN THE Pipeline_Deploy SHALL falhar o deploy e reportar erro de configuração.
4. WHEN o mesmo Git_SHA é aplicado novamente, THE Pipeline_Deploy SHALL implantar o mesmo artefato de imagem previamente publicado para aquele Git_SHA.

### Requisito 2: Ausência de segredos no código

**User Story:** Como responsável de segurança, quero que nenhum segredo esteja no código ou nas imagens, para que o vazamento de repositório não exponha credenciais.

#### Acceptance Criteria

1. THE Backend_GKE SHALL obter as senhas de banco (aplicação e reporting) a partir do Secret_Manager em tempo de execução.
2. THE Build_Imagem SHALL produzir imagens sem senhas de banco e sem chave de service account embutidas.
3. WHERE o Backend_GKE precisa de credenciais Google (Vertex AI, GCS), THE Backend_GKE SHALL obter as credenciais via Workload Identity da GSA_Pod sem usar arquivo `key.json`.
4. THE Backend_GKE SHALL operar em produção sem a montagem de ADC por volume usada no ambiente de desenvolvimento.

### Requisito 3: Autenticação WIF sem chave persistente

**User Story:** Como responsável de segurança, quero que o GitHub Actions autentique na GCP sem chave de service account persistente, para reduzir a superfície de ataque.

#### Acceptance Criteria

1. WHEN o Pipeline_CI_CD precisa acessar recursos da GCP, THE Pipeline_CI_CD SHALL autenticar via WIF usando OIDC.
2. THE Pipeline_CI_CD SHALL operar sem nenhum arquivo de chave de SA (`credentials_json`) armazenado nos segredos do repositório.
3. THE WIF SHALL restringir a impersonação da SA_Deploy ao repositório e à branch autorizados por condição de atributo.
4. THE SA_Deploy SHALL possuir apenas os papéis mínimos necessários (`roles/container.developer`, `roles/artifactregistry.writer`, `roles/iam.workloadIdentityUser` e o papel mínimo de publicação do Firebase).

### Requisito 4: Probes de liveness e readiness

**User Story:** Como operador, quero que o GKE verifique a saúde do backend por probes dedicadas, para que apenas pods saudáveis recebam tráfego.

#### Acceptance Criteria

1. THE Backend_GKE SHALL expor o endpoint `/actuator/health/liveness` refletindo o liveness state da aplicação.
2. THE Backend_GKE SHALL expor o endpoint `/actuator/health/readiness` incluindo o estado do banco de dados.
3. WHILE o banco de dados estiver inacessível ou as migrations não tiverem concluído, THE Backend_GKE SHALL reportar readiness diferente de UP.
4. WHEN o liveness probe falha de forma persistente, THE Backend_GKE SHALL ser reiniciado pelo GKE.

### Requisito 5: Migrations Flyway no deploy

**User Story:** Como engenheiro de banco, quero que as migrations Flyway sejam aplicadas no deploy, para que o schema esteja sempre consistente com o código implantado.

#### Acceptance Criteria

1. WHEN o Backend_GKE inicia, THE Backend_GKE SHALL executar as migrations Flyway pendentes (V1 a V23 e posteriores) antes de aceitar tráfego.
2. IF uma migration Flyway falha durante o startup, THEN THE Backend_GKE SHALL reportar readiness diferente de UP e THE Pipeline_Deploy SHALL falhar o rollout.
3. THE Backend_GKE SHALL preservar as políticas de RLS/FORCE ROW LEVEL SECURITY definidas em V4 e V8 após as migrations.
4. THE Cloud_SQL SHALL iniciar com configuração econômica (`db-f1-micro`, zonal, sem HA, disco mínimo) e THE design.md SHALL registrar que essa configuração deve ser redimensionada (HA e/ou tier maior) antes de assumir um SLA mais rigoroso.

### Requisito 6: Limpeza do Artifact Registry

**User Story:** Como responsável de custos, quero uma política de limpeza no Artifact Registry, para evitar acúmulo de imagens e custo de armazenamento.

#### Acceptance Criteria

1. THE Artifact_Registry SHALL aplicar uma política de limpeza que retém no máximo as N imagens mais recentes.
2. WHERE existem imagens que excedem a retenção ou ultrapassam o limite de idade configurado, THE Artifact_Registry SHALL removê-las automaticamente.
3. THE Artifact_Registry SHALL preservar a imagem referenciada pelo deploy ativo.

### Requisito 7: Rollback por SHA

**User Story:** Como engenheiro de release, quero reverter um deploy re-aplicando o SHA anterior, para restaurar rapidamente uma versão estável.

#### Acceptance Criteria

1. WHEN um rollback é solicitado, THE Pipeline_Deploy SHALL re-aplicar os manifestos e a imagem correspondentes ao Git_SHA anterior.
2. THE Pipeline_Deploy SHALL executar o rollback sem reconstruir a imagem do Git_SHA anterior.
3. WHEN o rollback conclui, THE Backend_GKE SHALL servir a versão do Git_SHA anterior com readiness UP.

### Requisito 8: Preservação do ambiente local (Docker Compose)

**User Story:** Como desenvolvedor, quero que o ambiente local em Docker Compose continue funcionando, para não perder o fluxo de desenvolvimento atual.

#### Acceptance Criteria

1. THE Compose_Local SHALL permanecer funcional e inalterado em sua capacidade de subir `app` + `db` no profile `local`.
2. WHERE mudanças de preparação para a GCP são aplicadas ao backend, THE Compose_Local SHALL continuar iniciando o backend no profile `local` com o banco PostgreSQL em container.

### Requisito 9: Gate de testes essenciais no CI

**User Story:** Como engenheiro de qualidade, quero que testes essenciais passem antes de qualquer deploy, para evitar publicar código quebrado — já que não há Maven local, o CI é onde esses testes finalmente rodam.

#### Acceptance Criteria

1. WHEN um push ocorre na branch `master`, THE Gate_Testes SHALL executar os testes essenciais antes de qualquer passo de Build_Imagem ou Pipeline_Deploy.
2. THE Gate_Testes SHALL incluir a compilação do backend e o build de produção do frontend.
3. THE Gate_Testes SHALL incluir os testes pendentes da spec `ai-resilience-hardening`: 1.4 (taxonomia de erro), 2.4 (validação de resposta), 3.6 (reconciliação parcial/review) e 4.4 (redação e desfecho de ledger).
4. IF qualquer teste do Gate_Testes falha, THEN THE Pipeline_CI_CD SHALL interromper a execução antes de publicar imagem ou implantar.
5. WHERE o teste 5.5 (componente/serviço do frontend) ainda não está estável, THE Pipeline_CI_CD SHALL executá-lo como best-effort sem bloquear o deploy.
6. THE Pipeline_CI_CD SHALL executar os testes do Gate_Testes usando runners default do GitHub, sem ferramentas pagas.
7. WHEN um Pull Request é aberto ou atualizado, THE Pipeline_CI SHALL executar o Gate_Testes e o build (backend compile/test, frontend build/test, Docker build) sem publicar imagem nem implantar.
8. WHEN um push ou merge ocorre na branch `master`, THE Pipeline_CD SHALL executar o Gate_Testes e, somente após aprovação do gate, publicar a imagem `eip-backend:<Git_SHA>` e executar o rollout no GKE e o deploy do frontend.

### Requisito 10: Trava de não-provisionamento sem aprovação

**User Story:** Como responsável de billing, quero que nenhum recurso faturável seja criado sem minha aprovação explícita do design e do relatório de custos, para manter o controle de gastos.

#### Acceptance Criteria

1. THE Checkpoint_Custos SHALL preceder toda tarefa que crie qualquer recurso faturável da GCP.
2. WHILE o Checkpoint_Custos não for aprovado explicitamente pelo usuário, THE Pipeline_CI_CD SHALL não criar recursos faturáveis (GKE, Cloud_SQL, Load Balancer, Artifact_Registry, IP estático).
3. THE design.md SHALL apresentar o relatório de pré-aprovação com recursos, região, tamanhos, custos estimados, free tiers, papéis IAM, rede, secrets, domínio/HTTPS e rollback antes de qualquer provisionamento.
4. WHERE uma tarefa é de preparação não-faturável (código, manifests, workflows, configuração), THE Pipeline_CI_CD SHALL permitir sua execução sem o Checkpoint_Custos.

### Requisito 11: Exposição do backend (B é produção; A é dev/teste)

**User Story:** Como arquiteto, quero o Caminho B como exposição de produção pública com domínio e TLS gerenciados, mantendo o Caminho A apenas como atalho de desenvolvimento/teste técnico.

#### Acceptance Criteria

1. WHERE o Caminho_A é usado, THE Backend_GKE SHALL ser exposto sem HTTP(S) Load Balancer gerenciado (NodePort ou `port-forward`), e THE design.md SHALL marcar esse caminho como apenas desenvolvimento/teste técnico, não produção.
2. WHERE o Caminho_B (produção) é usado, THE Backend_GKE SHALL ser exposto por HTTP(S) Load Balancer gerenciado (Ingress GKE) com IP estático e certificado TLS gerenciado pelo Google, servindo o Dominio_Backend `api.iaexport.com.br`.
3. THE Frontend_Firebase SHALL ser servido por HTTPS do Firebase Hosting no Dominio_Frontend `iaexport.com.br` (apex) independentemente do caminho de exposição do backend.
4. THE Caminho_B SHALL ser o alvo de produção, e THE Backend_GKE SHALL NOT ser exposto a usuários finais pelo Caminho_A.

### Requisito 12: Configuração de produção do frontend

**User Story:** Como desenvolvedor frontend, quero que o build de produção aponte para o backend real em `api.iaexport.com.br`, para que a aplicação publicada não rode mockada.

#### Acceptance Criteria

1. THE Frontend_Firebase SHALL ser construído com `useMockServices` igual a `false` em produção.
2. THE Frontend_Firebase SHALL direcionar as chamadas de BFF ao backend de produção usando `bffBaseUrl` igual a `https://api.iaexport.com.br` (Caminho_B).
3. THE Frontend_Firebase SHALL habilitar as `realApis` necessárias (no mínimo `auth` e `ai`) em produção.

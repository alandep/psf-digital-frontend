# ETAPA 1 — Workload Identity Federation (GitHub -> GCP), sem chave de SA persistente.
# NÃO EXECUTAR agora. Aguardando autorização explícita do usuário.
#
# LEAST-PRIVILEGE POR ETAPA: a SA `deployer` é CRIADA aqui, mas SEM nenhuma role de projeto.
# As roles de etapas futuras (artifactregistry.writer, container.developer, firebasehosting.admin)
# são concedidas INCREMENTALMENTE nas subpastas das respectivas etapas:
#   - roles/artifactregistry.writer  -> etapa2-artifact-registry/
#   - roles/container.developer      -> etapa4-gke-pod/
#   - roles/firebasehosting.admin    -> etapa4-gke-pod/
# O ÚNICO binding desta etapa é roles/iam.workloadIdentityUser SOBRE A PRÓPRIA SA — não é uma
# permissão de projeto; é o que permite o GitHub impersonar a SA (parte essencial da Etapa 1).

# Pool OIDC do GitHub.
resource "google_iam_workload_identity_pool" "github" {
  project                   = var.project_id
  workload_identity_pool_id = "github-pool"
  display_name              = "GitHub Actions Pool"

  depends_on = [google_project_service.etapa1]
}

# Provider OIDC do GitHub Actions.
resource "google_iam_workload_identity_pool_provider" "github" {
  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  display_name                       = "GitHub Actions Provider"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  # Condição de atributo: só o repo autorizado E a branch master podem impersonar.
  attribute_condition = "attribute.repository == \"${var.github_repo}\" && attribute.ref == \"refs/heads/${var.github_branch}\""
}

# SA de deploy — CRIADA SEM NENHUMA ROLE DE PROJETO nesta etapa (least-privilege por etapa).
resource "google_service_account" "deployer" {
  project      = var.project_id
  account_id   = "deployer"
  display_name = "CI/CD Deployer (via WIF, sem key)"

  depends_on = [google_project_service.etapa1]
}

# ⚠️ ETAPA FUTURA — NÃO APLICAR AQUI.
# As roles de projeto da deployer foram REMOVIDAS da Etapa 1 e passaram a ser concedidas
# incrementalmente na subpasta de cada etapa (ver cabeçalho). Mantido abaixo apenas como
# documentação de "o que vai onde":
#   roles/artifactregistry.writer -> etapa2-artifact-registry/roles.tf
#   roles/container.developer     -> etapa4-gke-pod/roles.tf
#   roles/firebasehosting.admin   -> etapa4-gke-pod/roles.tf

# Binding: o principal do pool (restrito ao repo/branch) pode impersonar a SA deployer.
# Este binding é SOBRE A PRÓPRIA SA (não é uma role de projeto) e é parte essencial da Etapa 1.
resource "google_service_account_iam_member" "deployer_wif" {
  service_account_id = google_service_account.deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repo}"
}

# Saídas úteis para preencher os `vars` do cd.yml APÓS a Etapa 1.
output "wif_provider" {
  description = "Valor de vars.WIF_PROVIDER no cd.yml."
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "deploy_service_account" {
  description = "Valor de vars.DEPLOY_SERVICE_ACCOUNT no cd.yml."
  value       = google_service_account.deployer.email
}

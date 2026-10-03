# APIs da ETAPA 1 — SOMENTE o mínimo para WIF/SA/IAM. NÃO EXECUTAR agora.
#
# Least-privilege POR ETAPA: habilitamos aqui apenas as APIs estritamente necessárias para
# estabelecer e validar a federação GitHub -> GCP (sem key.json). As APIs de etapas futuras
# (container, sqladmin, artifactregistry, secretmanager, aiplatform, compute, storage) NÃO são
# habilitadas aqui — cada uma mora na subpasta da sua etapa e só é habilitada quando a etapa
# for autorizada.
locals {
  etapa1_apis = [
    "iam.googleapis.com",                  # Service Accounts / IAM
    "iamcredentials.googleapis.com",       # impersonation / short-lived tokens (WIF)
    "sts.googleapis.com",                  # Security Token Service (troca OIDC -> token GCP)
    "cloudresourcemanager.googleapis.com", # gerenciamento de IAM no projeto
  ]
}

resource "google_project_service" "etapa1" {
  for_each                   = toset(local.etapa1_apis)
  project                    = var.project_id
  service                    = each.value
  disable_dependent_services = false
  disable_on_destroy         = false
}

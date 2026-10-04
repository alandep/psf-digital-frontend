# ⛔ NÃO EXECUTAR — Etapa 4 (Cloud Run) — aguardando autorização
#
# GSA de RUNTIME do Cloud Run (eip-run) com IAM least-privilege.
#
# POR QUE eip-run (e NÃO eip-pod):
#   A GSA eip-pod pertence ao desenho GKE (etapa4-gke-pod/, com binding Workload Identity KSA<->GSA
#   que só existe em GKE). No Cloud Run NÃO há KSA nem Workload Identity de pod — o serviço roda
#   DIRETAMENTE sob uma GSA (template.service_account). Para manter o state desta etapa isolado e
#   simples, criamos uma GSA de runtime PRÓPRIA (eip-run) com exatamente as mesmas roles mínimas
#   que o eip-pod teria. A eip-pod do etapa4-gke-pod NÃO é usada aqui.
#
# E-mail determinístico: eip-run@eip-ai-prod.iam.gserviceaccount.com

resource "google_service_account" "run" {
  project      = var.project_id
  account_id   = "eip-run"
  display_name = "EIP backend runtime (Cloud Run) — Vertex/Cloud SQL via ADC; assina URLs via signer"

  depends_on = [google_project_service.etapa4]
}

# Roles de PROJETO estritamente necessárias ao runtime:
#   - aiplatform.user : chamar Vertex AI (Gemini) via ADC
#   - cloudsql.client : abrir conexão ao Cloud SQL via connector embutido do Cloud Run
# NÃO incluir storage.* aqui: o acesso a objetos é exercido pela signed URL (identidade do signer),
# não pelo runtime. NÃO incluir secretmanager.secretAccessor amplo: ver bindings POR SECRET abaixo.
locals {
  run_roles = [
    "roles/aiplatform.user", # Vertex AI (Gemini)
    "roles/cloudsql.client", # Cloud SQL (connector embutido do Cloud Run)
  ]
}

resource "google_project_iam_member" "run_roles" {
  for_each = toset(local.run_roles)
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.run.email}"
}

# secretAccessor POR SECRET (least-privilege) — somente as 2 senhas de banco.
# Necessário porque o Cloud Run injeta DB_PASSWORD/REPORTING_DB_PASSWORD do Secret Manager
# usando a identidade de RUNTIME (eip-run). Evita conceder acesso a TODOS os secrets do projeto.
resource "google_secret_manager_secret_iam_member" "run_db_app_password" {
  project   = var.project_id
  secret_id = var.db_app_password_secret_id # eip-db-app-password
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.run.email}"
}

resource "google_secret_manager_secret_iam_member" "run_db_reporting_password" {
  project   = var.project_id
  secret_id = var.db_reporting_password_secret_id # eip-db-reporting-password
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.run.email}"
}

# NOTA: o binding roles/iam.serviceAccountTokenCreator do eip-run SOBRE o eip-signer
# (para IAM signBlob das URLs V4) está em signer.tf, junto da definição do signer.

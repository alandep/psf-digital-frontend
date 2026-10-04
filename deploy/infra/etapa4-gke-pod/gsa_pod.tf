# ⛔ NÃO EXECUTAR — ETAPA 4 (fase faturável) — aguardando autorização do usuário.
# GSA do pod (eip-pod) com IAM least-privilege + binding Workload Identity KSA<->GSA.
#
# Mudanças vs. versão anterior:
#   - REMOVIDO roles/storage.objectAdmin (o pod NÃO toca objetos; só pede signBlob ao signer).
#   - REMOVIDO roles/secretmanager.secretAccessor do escopo de PROJETO; agora é POR SECRET.
#   - serviceAccountTokenCreator sobre o signer e permissões de bucket do signer vivem em signer.tf.

resource "google_service_account" "pod" {
  project      = var.project_id
  account_id   = "eip-pod"
  display_name = "EIP backend pod (Vertex/Cloud SQL via Workload Identity; assina URLs via signer)"

  depends_on = [google_project_service.etapa4]
}

# Roles de PROJETO estritamente necessárias ao pod.
#   - aiplatform.user : chamar Vertex AI (Gemini) via ADC
#   - cloudsql.client : abrir conexão ao Cloud SQL via Auth Proxy (sidecar)
# NÃO incluir storage.* aqui: o acesso a objetos é exercido pela signed URL (identidade do signer),
# não pelo pod. NÃO incluir secretmanager.secretAccessor amplo: ver bindings por-secret abaixo.
locals {
  pod_roles = [
    "roles/aiplatform.user", # Vertex AI (Gemini)
    "roles/cloudsql.client", # Cloud SQL Auth Proxy (sidecar)
  ]
}

resource "google_project_iam_member" "pod_roles" {
  for_each = toset(local.pod_roles)
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.pod.email}"
}

# secretAccessor POR SECRET (least-privilege) — somente as 2 senhas de banco.
# Evita conceder acesso a TODOS os secrets do projeto.
resource "google_secret_manager_secret_iam_member" "pod_db_app_password" {
  project   = var.project_id
  secret_id = var.db_app_password_secret_id # eip-db-app-password
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.pod.email}"
}

resource "google_secret_manager_secret_iam_member" "pod_db_reporting_password" {
  project   = var.project_id
  secret_id = var.db_reporting_password_secret_id # eip-db-reporting-password
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.pod.email}"
}

# Binding Workload Identity: a KSA default/eip-ksa impersona a GSA eip-pod. (INALTERADO)
resource "google_service_account_iam_member" "pod_wi" {
  service_account_id = google_service_account.pod.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[default/eip-ksa]"
}

# NOTA: o binding roles/iam.serviceAccountTokenCreator do eip-pod SOBRE o eip-signer
# (para IAM signBlob das URLs V4) está em signer.tf, junto da definição do signer.

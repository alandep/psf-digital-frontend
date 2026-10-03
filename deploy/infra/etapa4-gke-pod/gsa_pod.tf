# ETAPA 4 — GSA do pod (eip-pod) + binding Workload Identity KSA<->GSA. NÃO EXECUTAR agora.
resource "google_service_account" "pod" {
  project      = var.project_id
  account_id   = "eip-pod"
  display_name = "EIP backend pod (Vertex/GCS/Cloud SQL via Workload Identity)"

  depends_on = [google_project_service.etapa4]
}

locals {
  pod_roles = [
    "roles/aiplatform.user",              # chamar Vertex AI
    "roles/cloudsql.client",              # conectar via Cloud SQL Auth Proxy
    "roles/secretmanager.secretAccessor", # ler senhas de banco do Secret Manager
    "roles/storage.objectAdmin",          # documentos no bucket GCS
  ]
}

resource "google_project_iam_member" "pod_roles" {
  for_each = toset(local.pod_roles)
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.pod.email}"
}

# Binding Workload Identity: a KSA default/eip-ksa impersona a GSA eip-pod.
resource "google_service_account_iam_member" "pod_wi" {
  service_account_id = google_service_account.pod.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[default/eip-ksa]"
}

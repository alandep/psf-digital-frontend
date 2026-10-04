# ⛔ NÃO EXECUTAR — Etapa 4 (Cloud Run) — aguardando autorização
#
# APIs da ETAPA 4 (Cloud Run) — habilitadas APENAS quando esta etapa for autorizada.
#
# NÃO duplicar APIs já habilitadas em etapas anteriores:
#   - sqladmin.googleapis.com + secretmanager.googleapis.com -> Etapa 3
#   - artifactregistry.googleapis.com                        -> Etapa 2
# As APIs abaixo (run / aiplatform / storage) ainda NÃO foram habilitadas e entram aqui.
locals {
  etapa4_apis = [
    "run.googleapis.com",        # Cloud Run (serviço gerenciado, scale-to-zero)
    "aiplatform.googleapis.com", # Vertex AI (consumido pelo backend)
    "storage.googleapis.com",    # GCS (documentos / fluxo de Signed URL V4)
  ]
}

resource "google_project_service" "etapa4" {
  for_each                   = toset(local.etapa4_apis)
  project                    = var.project_id
  service                    = each.value
  disable_dependent_services = false
  disable_on_destroy         = false
}

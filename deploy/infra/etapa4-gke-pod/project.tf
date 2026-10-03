# APIs da ETAPA 4 — habilitadas APENAS quando esta etapa for autorizada. NÃO EXECUTAR agora.
locals {
  etapa4_apis = [
    "container.googleapis.com",      # GKE
    "aiplatform.googleapis.com",     # Vertex AI (consumido pelo pod)
    "storage.googleapis.com",        # GCS (documentos)
    "compute.googleapis.com",        # LB / IP estático (Caminho B)
    "firebasehosting.googleapis.com" # Firebase Hosting (deploy do frontend pela deployer)
  ]
}

resource "google_project_service" "etapa4" {
  for_each                   = toset(local.etapa4_apis)
  project                    = var.project_id
  service                    = each.value
  disable_dependent_services = false
  disable_on_destroy         = false
}

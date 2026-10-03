# API da ETAPA 2 — habilitada APENAS quando esta etapa for autorizada. NÃO EXECUTAR agora.
locals {
  etapa2_apis = [
    "artifactregistry.googleapis.com", # Artifact Registry
  ]
}

resource "google_project_service" "etapa2" {
  for_each                   = toset(local.etapa2_apis)
  project                    = var.project_id
  service                    = each.value
  disable_dependent_services = false
  disable_on_destroy         = false
}

# APIs da ETAPA 3 — habilitadas APENAS quando esta etapa for autorizada. NÃO EXECUTAR agora.
locals {
  etapa3_apis = [
    "sqladmin.googleapis.com",      # Cloud SQL
    "secretmanager.googleapis.com", # Secret Manager
  ]
}

resource "google_project_service" "etapa3" {
  for_each                   = toset(local.etapa3_apis)
  project                    = var.project_id
  service                    = each.value
  disable_dependent_services = false
  disable_on_destroy         = false
}

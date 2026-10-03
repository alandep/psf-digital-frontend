# ETAPA 3 — Secret Manager — apenas os NOMES dos secrets. SEM valores. NÃO EXECUTAR agora.
#
# Os valores (versões) são adicionados FORA da IaC na fase 💲, ex.:
#   echo -n "<senha>" | gcloud secrets versions add eip-db-app-password --data-file=-
# Nenhum segredo real aparece neste repositório.

resource "google_secret_manager_secret" "db_app_password" {
  project   = var.project_id
  secret_id = "eip-db-app-password"
  replication {
    auto {}
  }

  depends_on = [google_project_service.etapa3]
}

resource "google_secret_manager_secret" "db_reporting_password" {
  project   = var.project_id
  secret_id = "eip-db-reporting-password"
  replication {
    auto {}
  }

  depends_on = [google_project_service.etapa3]
}

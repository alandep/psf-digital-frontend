# ETAPA 3 — Cloud SQL PostgreSQL — configuração ECONÔMICA INICIAL. NÃO EXECUTAR agora.
#
# ⚠️ db-f1-micro, zonal, SEM HA, disco mínimo. Deve ser REDIMENSIONADA (HA/tier maior)
#    antes de assumir um SLA mais rigoroso (ver requirements 5.4).
resource "google_sql_database_instance" "eip" {
  project          = var.project_id
  name             = var.sql_instance_name
  region           = var.region
  database_version = "POSTGRES_16"

  settings {
    tier              = "db-f1-micro" # tier mínimo (econômico inicial)
    availability_type = "ZONAL"       # sem HA (REGIONAL dobraria o custo)
    disk_type         = "PD_HDD"      # disco mais barato para o início
    disk_size         = 10            # GB (mínimo)
    disk_autoresize   = true

    backup_configuration {
      enabled = true # backups mínimos; ajustar quando houver criticidade
    }

    ip_configuration {
      ipv4_enabled = false # sem IP público; conexão via Cloud SQL Auth Proxy (IAM)
    }
  }

  deletion_protection = true

  depends_on = [google_project_service.etapa3]
}

# Banco de aplicação.
resource "google_sql_database" "eip" {
  project  = var.project_id
  name     = "eip"
  instance = google_sql_database_instance.eip.name
}

# Usuário de aplicação. A SENHA NÃO vem daqui — vem do Secret Manager (secrets.tf),
# definida fora da IaC na fase 💲. Declarada sem password para não versionar segredo.
# Na aplicação real, usar google_sql_user com password lido de data.google_secret_manager_secret_version.

# ⛔ NÃO EXECUTAR — Etapa 4 (Cloud Run) — aguardando autorização
#
# Serviço Cloud Run (eip-backend) — gerenciado, scale-to-zero, custo mínimo em ambiente OCIOSO.
#
# POR QUE Cloud Run (vs. GKE): elimina cluster, Load Balancer, IP estático, sidecar Cloud SQL
# Auth Proxy, CSI driver/SecretProviderClass/K8s Secret. O Cloud Run resolve nativamente:
#   - HTTPS + domínio customizado (domain_mapping.tf, TLS gerenciado grátis);
#   - Cloud SQL (connector embutido via volume cloud_sql_instance abaixo);
#   - secrets (injeção direta do Secret Manager como env via value_source.secret_key_ref);
#   - scale-to-zero (min_instance_count = 0 -> ~US$0 quando ocioso).
#
# ==============================================================================================
# ✅ Cloud SQL + JDBC no Cloud Run — RESOLVIDO pela OPÇÃO (a): socket factory
# ==============================================================================================
# O backend usa SPRING_DATASOURCE_URL (JDBC padrão) e NÃO foi reescrito. Decisão TOMADA (opção a):
# a dependência com.google.cloud.sql:postgres-socket-factory foi ADICIONADA ao backend/pom.xml
# (versão gerenciada pelo com.google.cloud:libraries-bom). Com a classe no classpath, o
# SPRING_DATASOURCE_URL abaixo está ATIVO e usa socketFactory=
# com.google.cloud.sql.postgres.SocketFactory + cloudSqlInstance=<conn>.
#
# MECANISMO: o connector embutido do Cloud Run (volume cloud_sql_instance abaixo) monta o unix
# socket em /cloudsql/<conn> (volume_mounts). O postgres-socket-factory descobre o socket pelo
# parâmetro cloudSqlInstance da URL — NÃO requer DB host/porta. A GSA eip-run tem
# roles/cloudsql.client. REPORTING_DATASOURCE_URL defaulta para SPRING_DATASOURCE_URL no
# application-cloud.yml, então basta definir SPRING_DATASOURCE_URL (feito abaixo).
# ==============================================================================================

resource "google_cloud_run_v2_service" "backend" {
  project  = var.project_id
  name     = "eip-backend"
  location = var.region

  # Ingress público: a app faz sua PRÓPRIA auth de sessão/BFF (login + CSRF). Ver iam_invoker.tf
  # para o trade-off do roles/run.invoker=allUsers (necessário para o SPA funcionar).
  ingress = "INGRESS_TRAFFIC_ALL"

  # Serviço stateless e recriável; manter deletion_protection=false evita travar recriações no CD.
  deletion_protection = false

  template {
    # Identidade de RUNTIME: o container roda sob a GSA eip-run (runtime_sa.tf).
    service_account = google_service_account.run.email

    # --- CUSTO MÍNIMO OCIOSO ---
    scaling {
      min_instance_count = 0 # scale-to-zero: ~US$0 quando não há requisições (degustação ociosa)
      max_instance_count = 2 # teto baixo p/ degustação (evita custo inesperado sob carga)
    }

    # Volume do connector embutido do Cloud SQL: habilita o acesso ao banco pela instância da
    # Etapa 3 (monta o socket em /cloudsql/<conn>). A GSA eip-run tem roles/cloudsql.client.
    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [var.sql_connection_name] # eip-ai-prod:southamerica-east1:eip-sql
      }
    }

    containers {
      image = var.image # SHA real injetado pelo CD; default é placeholder (variables.tf)

      resources {
        # 512Mi causou OOM no boot do Spring Boot (JPA + entidades + Vertex client); subido para
        # "1Gi" (medição real). CPU "1" é suficiente p/ degustação.
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
        # cpu_idle=true: NÃO paga CPU fora de request (reforça custo mínimo ocioso).
        cpu_idle = true
        # startup_cpu_boost=true: CPU extra no cold start (ajuda a mitigar o scale-to-zero).
        startup_cpu_boost = true
      }

      # Monta o socket do Cloud SQL em /cloudsql (par do volume "cloudsql" acima).
      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }

      # --- Variáveis de ambiente (sem segredos literais; senhas vêm do Secret Manager) ---
      env {
        name  = "SPRING_PROFILES_ACTIVE"
        value = "cloud"
      }
      # NÃO definir env PORT: o Cloud Run injeta PORT automaticamente (reservado) e o Spring lê server.port=${PORT:8080}.
      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = "eip-ai-prod"
      }
      env {
        # TODO: confirmar "global" vs "southamerica-east1" para o Vertex ANTES do go-live.
        name  = "VERTEX_LOCATION"
        value = "global"
      }
      env {
        name  = "GCS_BUCKET"
        value = var.documents_bucket
      }
      env {
        name  = "GCS_SIGNER_SA"
        value = "eip-signer@eip-ai-prod.iam.gserviceaccount.com"
      }
      env {
        name  = "DB_USER"
        value = "eip_app"
      }
      env {
        name  = "REPORTING_DB_USER"
        value = "eip_report"
      }

      env {
        name = "SPRING_DATASOURCE_URL"
        # Cloud SQL via socket factory (opção a). O connector do Cloud Run (volume cloud_sql_instance)
        # monta o socket; o postgres-socket-factory (no classpath via pom) o descobre pelo cloudSqlInstance.
        value = "jdbc:postgresql:///eip?cloudSqlInstance=${var.sql_connection_name}&socketFactory=com.google.cloud.sql.postgres.SocketFactory"
      }
      # Nota: REPORTING_DATASOURCE_URL defaulta para SPRING_DATASOURCE_URL no application-cloud.yml,
      # então NÃO é necessário um env separado para a URL de reporting.

      # --- Senhas via Secret Manager (injeção nativa do Cloud Run; SEM CSI, SEM K8s Secret) ---
      env {
        name = "DB_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = var.db_app_password_secret_id # eip-db-app-password
            version = "latest"
          }
        }
      }
      env {
        name = "REPORTING_DB_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = var.db_reporting_password_secret_id # eip-db-reporting-password
            version = "latest"
          }
        }
      }

      # --- MFA / e-mail transacional (Brevo) ---
      # ATENÇÃO: no profile cloud o backend se RECUSA a iniciar sem a chave MFA e as credenciais
      # SMTP (fail-fast intencional). Os 3 secrets abaixo devem existir e ter versão antes do deploy.
      env {
        name = "EIP_MFA_ENCRYPTION_KEY"
        value_source {
          secret_key_ref {
            secret  = var.mfa_encryption_key_secret_id # eip-mfa-encryption-key
            version = "latest"
          }
        }
      }
      env {
        name = "EIP_MAIL_USER"
        value_source {
          secret_key_ref {
            secret  = var.mail_user_secret_id # eip-mail-user
            version = "latest"
          }
        }
      }
      env {
        name = "EIP_MAIL_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = var.mail_password_secret_id # eip-mail-password
            version = "latest"
          }
        }
      }
      env {
        name  = "EIP_MAIL_STARTTLS_REQUIRED"
        value = "true"
      }
      env {
        name  = "EIP_MAIL_FROM_NAME"
        value = "EIP - Export Intelligence Platform"
      }
      env {
        name  = "EIP_MAIL_FROM"
        value = var.mail_from
      }
      env {
        name  = "EIP_APP_BASE_URL"
        value = var.app_base_url
      }
      env {
        name  = "EIP_SUPER_ADMIN_EMAILS"
        value = var.super_admin_emails
      }
      env {
        name  = "EIP_GCP_TENANT_PROVISIONING"
        value = var.gcp_tenant_provisioning_enabled
      }

      # --- Cobrança (Asaas) ---
      # ATENÇÃO: o backend não sobe no profile cloud sem a chave de API e o token do webhook
      # (fail-fast intencional). Os 2 secrets abaixo devem existir e ter versão antes do deploy.
      env {
        name  = "EIP_ASAAS_ENABLED"
        value = "true"
      }
      env {
        name  = "EIP_ASAAS_BASE_URL"
        value = var.asaas_base_url
      }
      env {
        name = "EIP_ASAAS_API_KEY"
        value_source {
          secret_key_ref {
            secret  = var.asaas_api_key_secret_id # eip-asaas-api-key
            version = "latest"
          }
        }
      }
      env {
        name = "EIP_ASAAS_WEBHOOK_TOKEN"
        value_source {
          secret_key_ref {
            secret  = var.asaas_webhook_token_secret_id # eip-asaas-webhook-token
            version = "latest"
          }
        }
      }
      env {
        name  = "EIP_BILLING_ISSUER_CNPJ"
        value = var.billing_issuer_cnpj
      }
      env {
        name  = "EIP_SALES_EMAIL"
        value = var.sales_email
      }

      # --- Probes (os grupos de health já existem no backend / Actuator) ---
      # startup_probe generoso: cold start (scale-to-zero) + Flyway podem demorar no 1º boot.
      startup_probe {
        http_get {
          path = "/actuator/health/readiness"
        }
        initial_delay_seconds = 10
        period_seconds        = 10
        timeout_seconds       = 5
        failure_threshold     = 30 # ~ até 300s para o app ficar pronto (Flyway + warmup)
      }
      liveness_probe {
        http_get {
          path = "/actuator/health/liveness"
        }
        period_seconds    = 30
        timeout_seconds   = 5
        failure_threshold = 3
      }
    }
  }

  depends_on = [
    google_project_service.etapa4,
    google_project_iam_member.run_roles,
    google_secret_manager_secret_iam_member.run_db_app_password,
    google_secret_manager_secret_iam_member.run_db_reporting_password,
    google_secret_manager_secret_iam_member.run_mfa_encryption_key,
    google_secret_manager_secret_iam_member.run_mail_user,
    google_secret_manager_secret_iam_member.run_mail_password,
    google_secret_manager_secret_iam_member.run_asaas_api_key,
    google_secret_manager_secret_iam_member.run_asaas_webhook_token,
  ]
}

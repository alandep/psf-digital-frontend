# ETAPA 2 — Artifact Registry (Docker) em southamerica-east1 + cleanup policy. NÃO EXECUTAR agora.
resource "google_artifact_registry_repository" "eip_backend" {
  project       = var.project_id
  location      = var.region
  repository_id = var.ar_repo_name
  format        = "DOCKER"
  description   = "Imagens do backend EIP (tag = Git SHA, nunca latest)."

  # Mantém as 10 imagens mais recentes.
  cleanup_policies {
    id     = "keep-last-10"
    action = "KEEP"
    most_recent_versions {
      keep_count = 10
    }
  }

  # Remove imagens antigas (> 30 dias).
  cleanup_policies {
    id     = "delete-older-than-30d"
    action = "DELETE"
    condition {
      older_than = "2592000s" # 30 dias
    }
  }

  depends_on = [google_project_service.etapa2]
}

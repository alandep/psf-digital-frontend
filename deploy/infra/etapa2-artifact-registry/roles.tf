# ETAPA 2 — concessão INCREMENTAL de role à SA deployer (least-privilege por etapa).
# A deployer foi criada SEM roles de projeto na Etapa 1. Aqui ela recebe APENAS a role
# necessária para esta etapa: push de imagens no Artifact Registry.
resource "google_project_iam_member" "deployer_artifactregistry_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer" # push de imagens
  member  = "serviceAccount:${var.deployer_account_id}@${var.project_id}.iam.gserviceaccount.com"
}

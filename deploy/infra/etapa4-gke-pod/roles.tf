# ETAPA 4 — concessão INCREMENTAL de roles à SA deployer (least-privilege por etapa).
# A deployer foi criada SEM roles de projeto na Etapa 1. Aqui ela recebe APENAS as roles
# necessárias para esta etapa:
#   - roles/container.developer   -> aplicar manifests no GKE
#   - roles/firebasehosting.admin -> publicar o frontend (Firebase Hosting)
locals {
  deployer_etapa4_roles = [
    "roles/container.developer",   # aplicar manifests no GKE
    "roles/firebasehosting.admin", # publicar frontend (Firebase Hosting)
  ]
}

resource "google_project_iam_member" "deployer_etapa4_roles" {
  for_each = toset(local.deployer_etapa4_roles)
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:${var.deployer_account_id}@${var.project_id}.iam.gserviceaccount.com"
}

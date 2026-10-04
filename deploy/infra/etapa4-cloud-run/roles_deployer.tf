# ⛔ NÃO EXECUTAR — Etapa 4 (Cloud Run) — aguardando autorização
#
# Concessão INCREMENTAL de roles à SA deployer (do CD) — least-privilege por etapa.
# A deployer foi criada SEM roles de projeto na Etapa 1. Aqui ela recebe APENAS o necessário
# para IMPLANTAR no Cloud Run:
#
#   - roles/run.developer : criar/atualizar revisões do serviço Cloud Run. Preferido ao invés de
#       roles/run.admin (mais amplo: administra IAM do serviço). Se o CD precisar gerenciar o
#       binding allUsers (iam_invoker.tf) ou o domain mapping e run.developer não bastar, promover
#       para roles/run.admin — documentar a decisão. Começamos pelo MENOS privilégio.
#
#   - roles/iam.serviceAccountUser SOBRE a GSA eip-run : o deployer precisa de "actAs" sobre a
#       runtime SA para implantar um serviço que RODA como eip-run (exigência do Cloud Run).
#       Binding de RECURSO (sobre a eip-run), não no projeto -> least-privilege.

resource "google_project_iam_member" "deployer_run_developer" {
  project = var.project_id
  role    = "roles/run.developer"
  member  = "serviceAccount:${var.deployer_account_id}@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_service_account_iam_member" "deployer_act_as_run" {
  service_account_id = google_service_account.run.name # eip-run
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${var.deployer_account_id}@${var.project_id}.iam.gserviceaccount.com"
}

# ALTERNATIVA (COMENTADA): se run.developer for insuficiente para o CD gerenciar IAM do serviço
# (allUsers) ou o domain mapping, usar run.admin no lugar do run.developer acima.
# resource "google_project_iam_member" "deployer_run_admin" {
#   project = var.project_id
#   role    = "roles/run.admin"
#   member  = "serviceAccount:${var.deployer_account_id}@${var.project_id}.iam.gserviceaccount.com"
# }

# ⛔ NÃO EXECUTAR — Etapa 4 (Cloud Run) — aguardando autorização
#
# Invoker PÚBLICO do serviço (degustação): roles/run.invoker para allUsers.
#
# TRADE-OFF (documentado e ACEITO para degustação):
#   Com allUsers, o endpoint HTTP do Cloud Run é publicamente invocável (qualquer um alcança a
#   porta HTTP do serviço). Isso é ACEITÁVEL porque a aplicação faz a PRÓPRIA autenticação de
#   sessão/BFF (login + CSRF, cookies Secure/SameSite=Lax — ver application-cloud.yml); o Cloud Run
#   apenas expõe a porta, não substitui a auth da app.
#
#   SEM allUsers, o Cloud Run exigiria IAM (token de identidade) em CADA request — o que QUEBRARIA
#   o SPA servido pelo Firebase Hosting (o browser não envia tokens IAM do Cloud Run). Por isso o
#   allUsers fica ATIVO aqui, de forma consciente e documentada.
#
#   Endurecimento futuro (fora de degustação): colocar o serviço atrás de um balanceador com IAP,
#   ou exigir invoker autenticado se o front migrar para um proxy que injete identidade.

resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.backend.name # eip-backend
  role     = "roles/run.invoker"
  member   = "allUsers"
}

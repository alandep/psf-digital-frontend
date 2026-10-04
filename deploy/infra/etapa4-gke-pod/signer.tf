# ⛔ NÃO EXECUTAR — ETAPA 4 (fase faturável) — aguardando autorização do usuário.
# Signer SA (eip-signer) + permissões necessárias para o fluxo de Signed URL V4.
#
# POR QUE O SIGNER PRECISA DE PERMISSÃO DE BUCKET (correção importante):
#   Doc oficial do GCS: se a signed URL permite ao usuário ler/gravar dados do objeto, a SERVICE
#   ACCOUNT que assina a URL precisa, ela mesma, dessa permissão sobre o objeto. (Reescrito para
#   conformidade de licenciamento.) O GCS valida a operação contra as permissões do SIGNER.
#
# FLUXO:
#   pod GSA (eip-pod) --signBlob--> eip-signer assina a URL V4 --> cliente usa a URL
#     --> GCS valida contra as permissões do eip-signer no bucket eip-ai-prod-documents.
#
# INVENTÁRIO REAL DO StoragePort (confirmado no código) — exatamente 3 métodos:
#   signedUpload   -> PUT -> storage.objects.create
#   signedDownload -> GET -> storage.objects.get
#   buildKey       -> apenas monta string (NÃO toca GCS)
# NÃO há DELETE nem LIST de objeto. Logo o signer precisa SÓ de create + get, SEM delete/list.

resource "google_service_account" "signer" {
  project      = var.project_id
  account_id   = var.signer_account_id # eip-signer
  display_name = "EIP GCS signer (assina Signed URLs V4 de upload/download; identidade da URL)"

  depends_on = [google_project_service.etapa4]
}

# O pod (eip-pod) pode pedir signBlob ao signer. Binding de RECURSO (sobre o signer), não no projeto.
# Mantido explícito por clareza/portabilidade (no Autopilot+WI tende a estar implícito).
resource "google_service_account_iam_member" "pod_sign_blob" {
  service_account_id = google_service_account.signer.name
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${google_service_account.pod.email}"
}

# ----------------------------------------------------------------------------------------------
# PERMISSÕES DE BUCKET DO SIGNER — restritas a eip-ai-prod-documents (binding de BUCKET, nunca projeto)
# ----------------------------------------------------------------------------------------------
#
# OPÇÃO RECOMENDADA (ATIVA): role customizada com EXATAMENTE create + get (least-privilege exato).
# Trade-off: exige manutenção da role custom; em troca não concede storage.objects.list.
resource "google_project_iam_custom_role" "signer_object_rw" {
  project     = var.project_id
  role_id     = "eipSignerObjectRW"
  title       = "EIP Signer Object Create+Get"
  description = "Permissões mínimas que a Signed URL V4 do EIP representa: criar e ler objetos."
  permissions = [
    "storage.objects.create", # autoriza o PUT da signedUpload
    "storage.objects.get",    # autoriza o GET da signedDownload
  ]
}

resource "google_storage_bucket_iam_member" "signer_bucket_object_rw" {
  bucket = var.documents_bucket # eip-ai-prod-documents (criado na etapa de storage / bucket.tf)
  role   = google_project_iam_custom_role.signer_object_rw.id
  member = "serviceAccount:${google_service_account.signer.email}"
}

# ----------------------------------------------------------------------------------------------
# ALTERNATIVA ACEITÁVEL (COMENTADA): roles predefinidas no bucket.
#   objectCreator (cobre create) + objectViewer (cobre get, MAS inclui list).
#   Trade-off: mais simples de manter; concede um leve excesso (storage.objects.list) não usado.
# Para usar esta alternativa: comentar a role custom + o binding acima e descomentar os 2 blocos.
# ----------------------------------------------------------------------------------------------
# resource "google_storage_bucket_iam_member" "signer_bucket_object_creator" {
#   bucket = var.documents_bucket
#   role   = "roles/storage.objectCreator"
#   member = "serviceAccount:${google_service_account.signer.email}"
# }
#
# resource "google_storage_bucket_iam_member" "signer_bucket_object_viewer" {
#   bucket = var.documents_bucket
#   role   = "roles/storage.objectViewer" # inclui storage.objects.list (excesso leve)
#   member = "serviceAccount:${google_service_account.signer.email}"
# }

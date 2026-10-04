# ⛔ NÃO EXECUTAR — Etapa 4 (Cloud Run) — PROPOSTO — aguardando autorização do usuário.
# Bucket de documentos de produção (eip-ai-prod-documents).
#
# STATUS: PROPOSTO. O bucket é, conceitualmente, da ETAPA DE STORAGE. É declarado aqui para que o
# binding de bucket do signer (signer.tf) seja resolvível nesta mesma IaC. Se a etapa de storage
# criar o bucket em outro state, REMOVER/COMENTAR este arquivo e referenciar o bucket por nome
# (var.documents_bucket) — o binding do signer.tf continua válido pelo nome.
#
# Postura de segurança:
#   - uniform_bucket_level_access = true  (sem ACLs legadas; IAM é a única fonte de verdade)
#   - public_access_prevention    = "enforced"  (bloqueia qualquer exposição pública)
#   - location = southamerica-east1 (São Paulo), alinhado à região oficial de produção.

resource "google_storage_bucket" "documents" {
  project  = var.project_id
  name     = var.documents_bucket # eip-ai-prod-documents
  location = var.region           # southamerica-east1

  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  # Documentos são acessados exclusivamente via Signed URL V4 (identidade do signer).
  # Nenhum acesso público; nenhuma ACL por objeto.

  depends_on = [google_project_service.etapa4]
}

# ⛔ NÃO EXECUTAR — Etapa 4 (Cloud Run) — aguardando autorização
#
# Outputs da ETAPA 4 (Cloud Run). Nenhum segredo exposto.

output "service_uri" {
  description = "URL HTTPS gerado pelo Cloud Run para o serviço eip-backend (run.app)."
  value       = google_cloud_run_v2_service.backend.uri
}

output "runtime_service_account_email" {
  description = "E-mail da GSA de runtime do Cloud Run (eip-run)."
  value       = google_service_account.run.email
}

output "signer_service_account_email" {
  description = "E-mail do signer SA (eip-signer) que assina as Signed URLs V4."
  value       = google_service_account.signer.email
}

output "domain_mapping_name" {
  description = "Domínio customizado mapeado para o serviço (api.iaexport.com.br)."
  value       = google_cloud_run_domain_mapping.backend.name
}

output "domain_mapping_dns_records" {
  description = <<-EOT
    Registros DNS exigidos pelo domain mapping. Criar estes records no provedor DNS para completar
    o mapeamento e disparar a emissão do TLS gerenciado (passo manual pós-apply).
  EOT
  value       = google_cloud_run_domain_mapping.backend.status[0].resource_records
}

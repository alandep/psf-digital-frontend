# ⛔ NÃO EXECUTAR — Etapa 4 (Cloud Run) — aguardando autorização
#
# ⚠️ DESABILITADO POR PADRÃO (count via var.enable_domain_mapping, default false).
#    O domain mapping do Cloud Run NÃO é permitido em southamerica-east1 (retorna Error 501),
#    e na DEGUSTAÇÃO evitamos subir Load Balancer. Portanto api.iaexport.com.br é
#    ARQUITETURA FUTURA — será entregue via Global External LB + Serverless NEG quando houver
#    justificativa comercial. Enquanto isso, o backend é consumido pela URL NATIVA run.app
#    (ex.: https://eip-backend-mturyukj4a-rj.a.run.app). Para habilitar no futuro, basta
#    passar -var="enable_domain_mapping=true" numa região suportada.
#
# Domain mapping: api.iaexport.com.br -> serviço Cloud Run eip-backend.
# TLS gerenciado automaticamente pelo Cloud Run (certificado provisionado após o DNS apontar).
#
# ⚠️ PASSO MANUAL DE DNS (pós-apply): o domain mapping só completa (e o TLS só é emitido) DEPOIS que
#    os registros DNS de api.iaexport.com.br apontarem para o Cloud Run. Após o apply, consultar os
#    records exigidos (ex.: `gcloud run domain-mappings describe --domain api.iaexport.com.br
#    --region southamerica-east1`) e criar no provedor DNS os CNAME/A/AAAA retornados
#    (tipicamente CNAME -> ghs.googlehosted.com, ou A/AAAA para apex). O output
#    domain_mapping_dns_records (outputs.tf) expõe esses records após o apply.
#
# ⚠️ VERIFICAÇÃO DE DOMÍNIO: o domínio raiz iaexport.com.br pode precisar estar verificado para o
#    projeto/conta (Google Search Console / webmaster-central). Se o mapping falhar por verificação
#    pendente, verificar o domínio e reaplicar. Este é um passo manual, fora da IaC.

resource "google_cloud_run_domain_mapping" "backend" {
  # Desabilitado por padrão (ver cabeçalho): não suportado em southamerica-east1 e sem LB na degustação.
  count = var.enable_domain_mapping ? 1 : 0

  project  = var.project_id
  location = var.region
  name     = var.domain # api.iaexport.com.br

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = google_cloud_run_v2_service.backend.name # eip-backend
  }

  depends_on = [google_cloud_run_v2_service.backend]
}

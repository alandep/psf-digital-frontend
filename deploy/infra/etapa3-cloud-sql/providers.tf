# Provider Terraform — ETAPA 3 (Cloud SQL + Secret Manager). ⛔ NÃO EXECUTAR agora.
# Aplicar SOMENTE quando a Etapa de dados/secrets for autorizada (fase 💲).
# Pré-requisito: projeto/billing no Console. Esta etapa cria recursos FATURÁVEIS (Cloud SQL).
terraform {
  required_version = ">= 1.5"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

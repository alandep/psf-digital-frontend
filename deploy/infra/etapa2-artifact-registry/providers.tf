# Provider Terraform — ETAPA 2 (Artifact Registry). ⛔ NÃO EXECUTAR agora.
# Aplicar SOMENTE quando a Etapa de Artifact Registry for autorizada (fase 💲).
# Pré-requisito: Etapa 1 (WIF) já aplicada (a SA deployer já existe) + projeto/billing no Console.
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

# Provider Terraform — ETAPA 4 (GKE + GSA do pod + roles incrementais da deployer).
# ⛔ NÃO EXECUTAR agora. Aplicar SOMENTE quando a Etapa de GKE/pod/Firebase for autorizada (fase 💲).
# Pré-requisitos: Etapa 1 (SA deployer existe) + projeto/billing no Console.
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

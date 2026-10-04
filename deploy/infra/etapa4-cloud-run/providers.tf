# ⛔ NÃO EXECUTAR — Etapa 4 (Cloud Run) — aguardando autorização
#
# Provider Terraform — ETAPA 4 (Cloud Run gerenciado, scale-to-zero, custo mínimo ocioso).
# Esta pasta SUBSTITUI a abordagem GKE (ver etapa4-gke-pod/, mantida como referência/legado).
# Aplicar SOMENTE quando a Etapa 4 (Cloud Run) for autorizada (fase 💲).
# Pré-requisitos: Etapa 1 (SA deployer existe) + Etapa 3 (Cloud SQL + secrets) + projeto/billing no Console.
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

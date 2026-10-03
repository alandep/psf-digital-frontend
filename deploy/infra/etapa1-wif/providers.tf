# Provider Terraform — ETAPA 1 (WIF). Apenas definição declarativa.
# ⛔ NÃO EXECUTAR agora (sem init/plan/apply). Aguardando autorização explícita do usuário.
#
# PRÉ-REQUISITO (fora da IaC): o projeto `eip-ai-prod` e a vinculação de BILLING são
# criados/controlados pelo usuário DIRETAMENTE no Google Cloud Console. A IaC assume o
# projeto pré-existente com billing ativo (via var.project_id). NÃO há google_project
# nem recurso de billing aqui.
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

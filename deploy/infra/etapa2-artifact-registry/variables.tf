# Variáveis da ETAPA 2 (Artifact Registry). Nenhum segredo aqui.
variable "project_id" {
  description = "Projeto GCP de produção pré-existente (criado pelo usuário no Console, com billing ativo)."
  type        = string
  default     = "eip-ai-prod"
}

variable "region" {
  description = "Região oficial de produção (São Paulo)."
  type        = string
  default     = "southamerica-east1"
}

variable "ar_repo_name" {
  description = "Nome do repositório Docker no Artifact Registry."
  type        = string
  default     = "eip-backend"
}

# A SA deployer é criada na Etapa 1. Como esta etapa tem state próprio, referenciamos a SA
# pelo e-mail conhecido (account_id fixo "deployer") para conceder a role incremental.
variable "deployer_account_id" {
  description = "account_id da SA de deploy criada na Etapa 1."
  type        = string
  default     = "deployer"
}

# Variáveis da ETAPA 4 (GKE + GSA do pod + roles incrementais da deployer). Nenhum segredo aqui.
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

# A SA deployer é criada na Etapa 1. Esta etapa tem state próprio, então referenciamos a SA
# pelo e-mail conhecido (account_id fixo "deployer") para conceder as roles incrementais.
variable "deployer_account_id" {
  description = "account_id da SA de deploy criada na Etapa 1."
  type        = string
  default     = "deployer"
}

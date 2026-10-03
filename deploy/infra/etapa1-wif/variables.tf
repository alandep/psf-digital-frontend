# Variáveis da ETAPA 1 (WIF). Nenhum valor de segredo aqui.
# O projeto já existe (criado pelo usuário no Console, com billing ativo) — a IaC só o referencia.
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

variable "github_repo" {
  description = "Repositório GitHub autorizado a impersonar a SA deployer via WIF (formato org/repo)."
  type        = string
  default     = "alandep/psf-digital-frontend"
}

variable "github_branch" {
  description = "Branch autorizada a disparar o CD (deploy)."
  type        = string
  default     = "master"
}

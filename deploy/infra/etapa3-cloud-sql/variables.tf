# Variáveis da ETAPA 3 (Cloud SQL + Secret Manager). Nenhum valor de segredo aqui.
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

variable "sql_instance_name" {
  description = "Nome da instância Cloud SQL."
  type        = string
  default     = "eip-sql"
}

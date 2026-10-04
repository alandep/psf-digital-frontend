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

# --- Signer SA + bucket de documentos (fluxo de Signed URL V4). Nenhum segredo aqui. ---

variable "signer_account_id" {
  description = "account_id do signer SA que assina as Signed URLs V4 (identidade que o GCS valida)."
  type        = string
  default     = "eip-signer"
}

variable "documents_bucket" {
  description = "Nome do bucket GCS de documentos (binding de bucket do signer, restrito a este bucket)."
  type        = string
  default     = "eip-ai-prod-documents"
}

# --- Secrets de senha de banco (secretAccessor POR SECRET na GSA do pod). Nenhum segredo aqui. ---

variable "db_app_password_secret_id" {
  description = "secret_id (nome) do Secret Manager com a senha do usuário de app (eip_app)."
  type        = string
  default     = "eip-db-app-password"
}

variable "db_reporting_password_secret_id" {
  description = "secret_id (nome) do Secret Manager com a senha do usuário de reporting (eip_report)."
  type        = string
  default     = "eip-db-reporting-password"
}

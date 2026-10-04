# ⛔ NÃO EXECUTAR — Etapa 4 (Cloud Run) — aguardando autorização
#
# Variáveis da ETAPA 4 (Cloud Run). Nenhum segredo aqui — apenas nomes/identificadores.
# Cada etapa tem state próprio; a SA deployer (Etapa 1), os secrets e o Cloud SQL (Etapa 3)
# são referenciados pelos nomes/e-mails determinísticos conhecidos.

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

# A SA deployer é criada na Etapa 1. Esta etapa tem state próprio, então a referenciamos
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

# --- Secrets de senha de banco (secretAccessor POR SECRET na GSA de runtime). Nenhum segredo aqui. ---

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

# --- Cloud SQL (Etapa 3). Connection name usado pelo connector embutido do Cloud Run. ---

variable "sql_connection_name" {
  description = "Connection name da instância Cloud SQL (projeto:regiao:instancia) — habilita o connector embutido do Cloud Run."
  type        = string
  default     = "eip-ai-prod:southamerica-east1:eip-sql"
}

# --- Imagem do container (Artifact Registry, Etapa 2). ---

variable "image" {
  description = <<-EOT
    Imagem do backend no Artifact Registry (Etapa 2). O SHA REAL é injetado pelo CD a cada deploy
    (ex.: via -var="image=.../eip-backend:<sha>"); o default abaixo é apenas um PLACEHOLDER para
    manter o arquivo declarativo válido. NÃO comitar um SHA real como default.
  EOT
  type        = string
  default     = "southamerica-east1-docker.pkg.dev/eip-ai-prod/eip-backend/eip-backend:GIT_SHA_PLACEHOLDER"
}

# --- Domínio público do backend (domain mapping do Cloud Run). ---

variable "domain" {
  description = "Domínio customizado do backend (domain mapping do Cloud Run, TLS gerenciado automático)."
  type        = string
  default     = "api.iaexport.com.br"
}

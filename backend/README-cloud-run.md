# Rodar o backend com Vertex AI real (perfil `cloud`)

Guia rápido para a verificação manual da Fase 2 (Requisitos 2.2, 14.1, 14.2).
Usa o override `docker-compose.cloud.yml` com credenciais ADC montadas read-only.

## 1. Autenticar o ADC no host (uma vez)

```bash
gcloud auth application-default login
gcloud config set project eip-ai-dev
```

Isso grava as credenciais no diretório gcloud do host
(Linux/macOS: `~/.config/gcloud`; Windows: `%APPDATA%\gcloud`).

## 2. Subir o backend no perfil `cloud`

Aponte `ADC_DIR` para o diretório gcloud do host e suba os serviços (a partir de `backend/`):

```bash
# Linux/macOS
export ADC_DIR=$HOME/.config/gcloud
# Windows (PowerShell)
$env:ADC_DIR="$env:APPDATA\gcloud"

docker compose -f docker-compose.yml -f docker-compose.cloud.yml up -d
```

## 3. Verificar

- `docker compose logs app` deve exibir `ADC resolved for Vertex AI`.
- Dispare uma chamada de IA real e confirme um registro em `ai_usage_event`
  com contagem de tokens real (não valores de mock).

> O modelo `gemini-3.8-flash` e a location `global` precisam existir de fato no
> projeto. O id do modelo é configurado em `ai_model_config` (router); a env var
> apenas define projeto/location (`GOOGLE_CLOUD_PROJECT` / `VERTEX_LOCATION`).

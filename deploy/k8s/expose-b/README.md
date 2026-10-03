# Caminho B — Exposição de PRODUÇÃO (alvo)

Este diretório contém os manifests da exposição de **produção** do backend: HTTP(S) Load Balancer
gerenciado (Ingress GKE) + IP estático + certificado TLS gerenciado pelo Google + domínio
`api.iaexport.com.br`.

> ⚠️ Nada aqui é aplicado automaticamente. Aplicar apenas na **fase faturável (💲)**, após o
> checkpoint de aprovação de custos. O LB gerenciado tem custo fixo (~US$ 18+/mês).

## Arquivos

- `ingress.yaml` — Ingress GKE (classe `gce`), IP estático (`global-static-ip-name: eip-backend-ip`),
  certificado gerenciado (`managed-certificates: eip-backend-cert`), host `api.iaexport.com.br`,
  roteando para o Service `eip-backend:8080`.
- `managedcertificate.yaml` — `ManagedCertificate` do Google para `api.iaexport.com.br`.

## Pré-requisitos de DNS/TLS (não bloqueiam a Fase 0)

1. Reservar o IP estático global na fase 💲:
   `gcloud compute addresses create eip-backend-ip --global` (NÃO EXECUTAR agora).
2. Criar registro **A/AAAA de `api.iaexport.com.br`** apontando ao IP estático do LB.
3. O `ManagedCertificate` só é emitido/validado após o DNS resolver para o IP do LB.

O usuário controla o DNS de `iaexport.com.br`, então os registros podem ser criados quando a infra
faturável existir.

# Caminho A — APENAS dev/teste técnico (NÃO é produção) ⚠️

Este diretório oferece exposição **somente para desenvolvimento/teste técnico**. Não há HTTPS público
estável nem domínio próprio. **Nunca** use este caminho para atender usuários finais — produção é o
**Caminho B** (`../expose-b/`).

## Opções

1. **`kubectl port-forward` (recomendado para teste ad hoc, custo zero, nada aplicado):**
   ```
   kubectl port-forward svc/eip-backend 8080:8080
   ```
   Acessa em `http://localhost:8080` enquanto o comando roda. Sem exposição externa.

2. **`nodeport.yaml` (Service NodePort):** expõe numa porta do nó (`30080`). Sem IP estável nem TLS
   gerenciado. Aplicar apenas em cenário de teste controlado.

> Nenhum destes cria recursos faturáveis de LB/IP estático. Mesmo assim, o cluster GKE em si é
> faturável — então nada aqui é aplicado antes do checkpoint de custos.

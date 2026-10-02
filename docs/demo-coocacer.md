# Demo Coocacer Araguari — Roteiro de Apresentação (EIP)

## Demo Coocacer Araguari — Roteiro de Apresentação (EIP)

**Data/hora:** sexta-feira, 02/10/2026, às 16h (Google Meet)
**Duração:** 20 a 30 minutos
**Objetivo:** apresentar o EIP (Export Intelligence Platform) de ponta a ponta e evidenciar o papel da IA na exportação de café, com foco nas dores e no discurso de rastreabilidade/sustentabilidade da Coocacer Araguari.

**Modo da demo:** a apresentação roda em **modo mock (determinístico)**. Todas as flags `realApis.*` estão `false`, ou seja, 100% mock — respostas instantâneas e previsíveis, sem dependência de backend ou da GCP em tempo de execução. Isso garante uma demo estável e sem surpresas ao vivo. A **IA real na GCP (Vertex AI)** é apresentada como **roadmap de implantação**, não como pré-requisito para a venda.

---

## Preparação (fazer ANTES da reunião)

- [ ] Subir o backend: a partir de `backend/`, rodar `docker compose up -d`; confirmar `GET http://localhost:8080/actuator/health` → `UP`. (Opcional, pois a demo roda em mock; mas é bom ter de pé.)
- [ ] Subir o front: `npx ng serve --configuration=development`; abrir http://localhost:4200.
- [ ] Confirmar que as flags `realApis` estão todas `false` em `src/environments/environment.ts` (modo mock, determinístico).
- [ ] Fazer login de teste antes da call: `alan@eip.exemplo` / `senha123` / MFA `123456` → cair na home logada.
- [ ] Abrir as abas/telas-chave previamente (aquecer o lazy-load) para não haver atraso ao vivo.
- [ ] Usar janela anônima limpa; fechar notificações; zoom do navegador em ~100–110%.
- [ ] Ter um plano B: se algo travar, recarregar a rota; o app é mock, então é previsível.

---

## Roteiro minuto a minuto (sugestão de 25 min)

1. **Abertura e login (2 min)**
   - **Rota:** `/login`
   - **Objetivo:** abrir a apresentação e demonstrar entrada segura.
   - **Destacar:** fluxo `identify → senha → MFA`; narrar segurança (sessão autenticada, MFA de 6 dígitos).

2. **Visão geral / indicadores (3 min)**
   - **Rota:** `/home-logged/dashboards/principal`
   - **Objetivo:** mostrar a visão end-to-end da operação de exportação.
   - **Destacar:** KPIs consolidados, panorama único da operação, do início ao recebimento.

3. **Contratos (2 min)**
   - **Rota:** `/home-logged/contratos/ativos` (também `/contratos/novo`, `/contratos/templates`)
   - **Objetivo:** mostrar a base contratual da operação.
   - **Destacar:** contratos ativos, criação de novo contrato e uso de templates como ponto de partida.

4. **Produtos & NCM com IA (3 min)**
   - **Rota:** `/home-logged/produtos/ncm` (também `/produtos/catalogo`, `/produtos/certificacoes`)
   - **Objetivo:** demonstrar classificação NCM apoiada por IA.
   - **Destacar:** sugestão de NCM assistida por IA; catálogo de produtos e certificações para café rastreável.

5. **Lotes & rastreabilidade (2 min)**
   - **Rota:** `/home-logged/lotes/rastreabilidade` (também `/lotes/controle`)
   - **Objetivo:** mostrar rastreabilidade do café.
   - **Destacar:** rastreabilidade de origem até embarque — aderente ao discurso de café rastreável/sustentável da Coocacer.

6. **Documentação & certificados com IA (3 min)**
   - **Rota:** `/home-logged/documentos/invoice`, `/documentos/certificados`, `/documentos/due`, `/documentos/packing-list`
   - **Objetivo:** mostrar o coração do piloto — documentação.
   - **Destacar:** a IA lê e concilia documentos e aponta pendências automaticamente.

7. **Logística & embarques (3 min)**
   - **Rota:** `/home-logged/logistica/embarque` (lista com "Resumo de Embarques"), `/logistica/portos`
   - **Objetivo:** mostrar acompanhamento de embarque.
   - **Destacar:** visão consolidada de embarques e portos; status e evolução da carga.

8. **Compliance & licenças (2 min)**
   - **Rota:** `/home-logged/compliance/licencas`, `/compliance/regulamentacoes`, `/compliance/due-diligence`, `/compliance/sancoes`
   - **Objetivo:** mostrar o controle de conformidade.
   - **Destacar:** licenças, regulamentações, due diligence e checagem de sanções em um só lugar.

9. **Câmbio, pagamentos e recebimentos (2 min)**
   - **Rota:** `/home-logged/financeiro/cambio`, `/financeiro/pagamentos`, `/financeiro/contas-receber`
   - **Objetivo:** fechar o ciclo financeiro da exportação.
   - **Destacar:** câmbio, pagamentos e contas a receber conectados à operação.

10. **Auditoria & workflows (1 min)**
    - **Rota:** `/home-logged/admin/auditoria`, `/automacao/regras-ativas`
    - **Objetivo:** mostrar governança e automação.
    - **Destacar:** trilha de auditoria e regras de automação ativas.

11. **Assistente de IA / AI Operations (2 min)**
    - **Rota:** `/home-logged/assistente-ia`, `/ai-operations/dashboard`
    - **Objetivo:** fechar com o diferencial de IA.
    - **Destacar:** resumo, tradução, análise de risco e acompanhamento proativo — a IA ao longo de todo o processo.

---

## Mensagens-chave (o que repetir)

- Menos trabalho manual e menos retrabalho.
- Visibilidade end-to-end (origem → embarque → recebimento).
- IA ao longo de todo o processo: leitura/conferência de documentos, pendências e risco, NCM, Incoterms/rotas, tradução/resumo, compliance e acompanhamento proativo.
- Multi-tenant com isolamento por organização (RLS) e trilha de auditoria.
- Aderência ao café rastreável e sustentável da Coocacer.

---

## IA: modo da demo vs. produção

Na **demo**, a IA roda em **modo mock determinístico**: respostas instantâneas e previsíveis (NCM, resumo, tradução, risco, extração e chat), ideal para apresentação ao vivo sem riscos de latência ou indisponibilidade.

Em **produção**, os motores de IA serão plugados na **GCP (Vertex AI)** por meio de um adapter ativado pelo profile `cloud`, **sem alterar as telas** — o gateway de IA já é desenhado para troca por configuração. Posicionar isso como **roadmap de implantação**: é uma decisão de ativação, não um bloqueio para a venda.

---

## Escopo inicial sugerido (gancho comercial, alinhado ao e-mail de retorno)

- Começar com **conferência de documentos e acompanhamento de pendências** como piloto.
- Em seguida, expandir para **logística, compliance e financeiro**.

---

## Perguntas prováveis & respostas curtas

- **"A IA é confiável?"** — Humano no circuito: a IA sugere, a pessoa decide. Tudo com trilha de auditoria.
- **"Meus dados ficam isolados?"** — Sim, multi-tenant com RLS (isolamento por organização).
- **"Integra com Siscomex/MAPA?"** — Telas de integração previstas (`/integracoes/siscomex`, `/integracoes/mapa`) — roadmap/piloto.
- **"Quanto custa a IA?"** — Os motores rodam na GCP sob o seu controle de billing; arquitetura pensada para custo.

---

## Checklist final (10 min antes)

- [ ] Backend UP (opcional)
- [ ] Front no ar
- [ ] Login testado
- [ ] Telas aquecidas
- [ ] Flags em modo mock
- [ ] Roteiro à mão
- [ ] Água e tela cheia :)

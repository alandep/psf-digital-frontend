Sim. E eu faria uma mudança conceitual importante: **essa tela não deve mais ser tratada como “tela de login”**. Ela deve virar a **Home Pública do EIP**, e o login passa a ser apenas uma das jornadas disponíveis.

O que você descreveu envolve, na realidade, quatro coisas diferentes na mesma entrada do produto: **site institucional + autenticação segura + aquisição/conversão SaaS + central de inteligência de comércio exterior**. A tela atual é funcional para desenvolvimento, mas simples demais para o EIP que você está construindo.

## 1. O que eu mudaria primeiro na tela atual

O cabeçalho atual:

> Export Intelligence Platform | Login

viraria algo próximo de:

**EIP — Export Intelligence Platform**

`Produto | Soluções | IA | Inteligência de Mercado | Segurança | Preços | Sobre o EIP | Entrar`

E no lado direito:

**Entrar** | **Experimentar grátis**

O card de CPF/senha **não deveria dominar a Home**. Na Home pública, o elemento principal deve explicar o produto:

> **Sua exportação. Uma única plataforma.**
> Gerencie operações, documentos, logística, financeiro e compliance com inteligência artificial integrada.
>
> **[Experimentar grátis] [Conhecer os planos]**
>
> Já é cliente? **Entrar no EIP**

A partir de **Entrar**, aí sim mostramos a experiência de autenticação.

---

# 2. Nova jornada de login

A primeira melhoria é não pedir empresa antes de saber quem é o usuário.

### Etapa 1 — Identificação

```text
Acesse sua conta

CPF
[________________]

[Continuar]

Esqueci minha senha

────────── ou ──────────

Acessar como demonstração
```

Depois de informar o CPF, o backend verifica as organizações às quais aquele usuário possui membership.

Se existir apenas uma:

```text
Alan Franco
Empresa vinculada:

✓ Exportadora ABC Ltda.
  CNPJ ••.•••.•••/0001-••

Senha
[________________]

[Entrar]
```

Se houver várias:

```text
Escolha onde deseja entrar

○ Exportadora ABC Ltda.
  CNPJ final 0001

○ Trading XYZ Ltda.
  CNPJ final 0001

○ Agro ABC Ltda.
  CNPJ final 0002
```

Depois senha.

Isso casa perfeitamente com a arquitetura multiempresa que desenhamos.

---

# 3. Mas eu faria uma pequena alteração de segurança

Na tela **antes de autenticar**, eu evitaria revelar abertamente todas as empresas associadas a qualquer CPF digitado.

Caso contrário, alguém poderia testar CPFs e descobrir:

> “Este CPF está associado à empresa X, Y e Z.”

Melhor fluxo:

```text
CPF
↓
Senha
↓
credenciais válidas
↓
MFA, quando aplicável
↓
organizações disponíveis
↓
escolher empresa
↓
entrar
```

Portanto, eu atenderia à sua ideia de seleção de empresa, mas **depois de validar a identidade**.

---

# 4. Recuperação de senha é P0

Hoje isso está faltando e precisa ser implementado **antes de colocar o EIP publicamente na internet**.

Link:

> **Esqueci minha senha**

Fluxo:

```text
CPF ou e-mail
      ↓
Localizar conta
      ↓
Enviar código/link
      ↓
Token temporário
      ↓
Nova senha
      ↓
Invalidar sessões quando apropriado
      ↓
Confirmação
```

Na resposta pública, não diga:

> “CPF não cadastrado.”

Prefira:

> “Se existir uma conta correspondente aos dados informados, enviaremos as instruções de recuperação.”

Isso reduz enumeração de contas.

---

# 5. MFA/2FA precisa deixar de ser apenas uma configuração visual

Esse ponto é muito importante.

Se sua tela de configurações diz que o EIP possui MFA, precisamos fechar o circuito completo:

```text
CPF
 ↓
Senha
 ↓
MFA habilitado?
 ├── NÃO → seleção da empresa
 │
 └── SIM
       ↓
   Código autenticador
       ↓
   Validar
       ↓
   seleção da empresa
       ↓
      EIP
```

Eu priorizaria **TOTP por aplicativo autenticador** na V1.

E geraria códigos de recuperação:

```text
CÓDIGOS DE RECUPERAÇÃO

8FJ2-K7PA
M4KL-82PZ
...
```

Mostrados uma única vez ao habilitar MFA.

Mais tarde podemos incorporar passkeys/WebAuthn.

---

# 6. Step-up authentication

Mesmo depois de logado, algumas ações devem solicitar novamente MFA/senha:

**alterar cartão, cancelar assinatura, exportar todos os dados da empresa, trocar Owner, alterar MFA, gerar credencial API, operações administrativas extremamente sensíveis.**

Isso aumenta bastante a segurança do SaaS.

---

# 7. “Experimentar o EIP” precisa ser outra jornada

Eu removeria da Home pública o atual:

> Acessar como Demo

e substituiria por:

> **Experimentar grátis**

Porque “Demo” soa como ambiente falso.

O fluxo seria:

```text
Experimentar o EIP
        ↓
Criar conta
        ↓
Nome
CPF
E-mail corporativo
Telefone
Senha
        ↓
Validar e-mail
        ↓
MFA recomendado
        ↓
Tour do produto
        ↓
Planos
        ↓
Iniciar período de experiência
        ↓
Cadastrar empresa
        ↓
Onboarding
        ↓
EIP
```

---

# 8. Aqui eu mudaria ligeiramente sua ordem

Você disse:

> tour → planos → experimentar → decidiu comprar → cadastra empresa.

Eu cadastraria **uma empresa simplificada antes de liberar o ambiente real de trial**, porque praticamente todos os dados do EIP precisam de um tenant.

Não precisamos exigir cadastro fiscal completo imediatamente.

Podemos fazer:

```text
Quero experimentar
↓
Conta
↓
Empresa

CNPJ
Razão social
Nome fantasia
Segmento

↓
Tenant criado
↓
Trial
```

Depois, se contratar:

```text
Complete o cadastro da empresa

Inscrição estadual
Endereço
Contatos
Configurações fiscais
...
```

Isso preserva sua regra:

> **Nenhuma operação existe sem empresa.**

---

# 9. Trial

Eu começaria com:

> ### Experimente o EIP por 14 dias
>
> Conheça a plataforma antes de contratar.
>
> ✓ Usuários ilimitados
> ✓ AI Hub
> ✓ Operação de exportação
> ✓ Documentos
> ✓ Logística
> ✓ Compliance
>
> **[Começar meu teste]**

Para a primeira fase comercial, eu consideraria **não exigir cartão para começar o trial**.

Isso reduz atrito.

Depois:

```text
14 dias
↓
7 dias restantes
↓
3 dias restantes
↓
1 dia restante
↓
trial expirado
```

E o usuário nunca perde os dados simplesmente porque o trial acabou.

---

# 10. Tour guiado

Aqui existe uma oportunidade excelente para o AI Hub.

No primeiro acesso:

> 👋 **Bem-vindo ao EIP, Alan.**
>
> Vou apresentar a plataforma e ajudar você a configurar sua primeira operação de exportação.
>
> Leva aproximadamente 5 minutos.
>
> **[Começar tour] [Explorar sozinho]**

Tour:

```text
1/8 Command Center
2/8 AI Hub
3/8 Produtos e NCM
4/8 Exportações
5/8 Documentos
6/8 Logística
7/8 Financeiro
8/8 Compliance
```

E depois:

> **Agora vamos criar sua primeira operação.**

O usuário pode pular, voltar ou reiniciar o tour depois.

---

# 11. A Home Pública que eu desenharia

Visualmente, eu abandonaria o grande fundo cinza vazio que aparece no seu print.

A Home teria aproximadamente:

```text
┌─────────────────────────────────────────────────────┐
│ EIP   Produto Soluções IA Segurança Preços   Entrar │
│                                      Experimentar   │
├─────────────────────────────────────────────────────┤
│                                                     │
│   SUA EXPORTAÇÃO.               [EIP DASHBOARD]     │
│   UMA ÚNICA PLATAFORMA.                             │
│                                                     │
│   Operação, documentos,         imagem/mockup       │
│   logística, financeiro,        bonito do EIP       │
│   compliance e IA.                                  │
│                                                     │
│   [Experimentar grátis] [Ver planos]                │
│                                                     │
├─────────────────────────────────────────────────────┤
│          INTELIGÊNCIA DE COMÉRCIO EXTERIOR          │
├─────────────────────────────────────────────────────┤
│ USD/BRL   EUR/BRL   Alertas Portuários   Notícias   │
├─────────────────────────────────────────────────────┤
│                                                     │
│                POR QUE EIP?                         │
│                                                     │
│ Operações | IA | Documentos | Compliance | BI       │
│                                                     │
├─────────────────────────────────────────────────────┤
│                   PLANOS                            │
│ START       BUSINESS ⭐       PRO       ENTERPRISE   │
├─────────────────────────────────────────────────────┤
│ Missão       Visão        Valores                   │
├─────────────────────────────────────────────────────┤
│ Links oficiais | Segurança | Privacidade | Termos   │
├─────────────────────────────────────────────────────┤
│ © EIP | CNPJ | endereço | contato                   │
└─────────────────────────────────────────────────────┘
```

---

# 12. Seu carrossel é uma excelente ideia — mas eu o chamaria de EIP Intelligence

Não faria um carrossel publicitário comum.

Faria algo mais sofisticado:

> ## **EIP Intelligence**
>
> Inteligência para quem opera o comércio exterior.

Cards:

```text
💱 CÂMBIO
USD/BRL
R$ X,XX
▲ x,xx%

Atualizado às 15:42
Fonte: ...
```

```text
⚓ LOGÍSTICA
ALERTA PORTUÁRIO

Congestionamento...
Impacto: ALTO

[Entenda o impacto]
```

```text
🌎 COMÉRCIO EXTERIOR
MERCADO

China anuncia...
Possível impacto:
Carne bovina brasileira

[Análise EIP]
```

```text
💡 OPORTUNIDADE
NOVO MERCADO

...
```

Isso faz a Home parecer uma plataforma de inteligência, não simplesmente uma página de software.

---

# 13. IA pode transformar notícia em informação útil

Em vez de apenas reproduzir:

> “China restringe carne brasileira.”

O EIP pode produzir:

```text
IMPACTO EIP

Setores afetados:
● frigoríficos
● tradings
● pecuária

Mercado:
China

Impacto estimado:
ALTO

O que acompanhar:
• habilitações
• certificados
• embarques em trânsito
• comunicados oficiais
```

Sempre deixando explícito o que é **fonte externa** e o que é **análise automatizada do EIP**.

Isso pode virar uma grande vantagem competitiva.

---

# 14. Câmbio deve vir de fonte confiável

Para câmbio, eu integraria fonte oficial como o Banco Central quando a métrica exibida for compatível com os dados oficiais, identificando claramente **qual cotação é apresentada, horário/data e fonte**.

Não mostre simplesmente:

> Dólar R$5,32

Mostre:

```text
USD/BRL
R$ X,XXXX

Referência: PTAX
Atualização: dd/mm/aaaa
Fonte: Banco Central do Brasil
```

---

# 15. Publicidade: sim, mas extremamente controlada

Sua ideia de monetizar espaço pode funcionar.

Mas eu permitiria **um único espaço patrocinado por vez** dentro do EIP Intelligence.

Exemplo:

```text
PATROCINADO

MSC
Soluções marítimas para sua exportação.

[Conhecer]

Conteúdo patrocinado
```

Não colocaria banner piscando, popup, takeover ou vários anúncios.

O EIP precisa continuar transmitindo uma imagem **B2B premium**.

---

# 16. E isso merece arquitetura própria

```text
PUBLIC_CONTENT

id
type

NEWS
ALERT
OPPORTUNITY
FX
ADVERTISEMENT
SYSTEM_NOTICE

title
summary
image
source
source_url

impact_level
sector
country

published_at
expires_at

priority
active
```

E publicidade:

```text
AD_CAMPAIGN

advertiser
title
creative
target_url

start_at
end_at

impressions_limit
clicks_limit

status
```

Isso permitirá vender publicidade futuramente sem misturar anúncio com notícia.

---

# 17. Regra obrigatória para patrocinado

Nunca permita que:

**anúncio pareça alerta do EIP.**

Todo anúncio deve mostrar:

> **PATROCINADO**

E eu proibiria anunciantes que criem conflito sério com a confiança da plataforma.

---

# 18. Links oficiais

Eu criaria no rodapé:

### Brasil

[Portal Único Siscomex](https://www.gov.br/siscomex/pt-br/paginas/portal-unico-siscomex?utm_source=chatgpt.com) — a iniciativa brasileira de janela única para interação entre governo e operadores de comércio exterior. ([Serviços e Informações do Brasil][1])

[Receita Federal — Exportação / Portal Único](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/exportacao-portal-unico?utm_source=chatgpt.com) — procedimentos e orientação aduaneira de exportação. ([Serviços e Informações do Brasil][2])

[ANTAQ — Portos](https://www.gov.br/antaq/pt-br/assuntos/instalacoes-portuarias/portos?utm_source=chatgpt.com) — informações relacionadas ao setor portuário brasileiro. ([Serviços e Informações do Brasil][3])

E acrescentaria Banco Central, SECEX/MDIC e MAPA conforme os módulos/segmentos atendidos.

### Internacional

[World Trade Organization — WTO/OMC](https://www.wto.org/?utm_source=chatgpt.com) — regras e informações relacionadas ao comércio internacional. ([Organização Mundial do Comércio][4])

[World Customs Organization — WCO/OMA](https://www.wcoomd.org/en/about-us/what-is-the-wco/discover-the-wco.aspx?utm_source=chatgpt.com) — organismo internacional especializado em matérias aduaneiras. ([WCOOMD][5])

[International Maritime Organization — IMO](https://www.imo.org/en/about/pages/default.aspx?utm_source=chatgpt.com) — agência especializada da ONU responsável pelo arcabouço internacional de segurança, proteção e desempenho ambiental da navegação. ([Organização Marítima Internacional][6])

Mas eu colocaria isso em um menu **“Links oficiais”**, não 15 logotipos espalhados pela Home.

---

# 19. Missão, visão e valores

Eu proporia inicialmente:

### Missão

> **Simplificar e integrar a operação de comércio exterior, conectando pessoas, processos, dados e inteligência para tornar as exportações mais eficientes, seguras e previsíveis.**

### Visão

> **Ser uma plataforma brasileira de referência em inteligência e gestão integrada de exportações, conectando empresas ao comércio global por meio de tecnologia e inteligência artificial.**

### Valores

**Confiança • Segurança • Inovação • Transparência • Eficiência • Inteligência • Foco no cliente**

Não colocaria os sete valores gigantes na Home. Um bloco elegante próximo ao footer é suficiente.

---

# 20. Rodapé

Algo assim:

```text
EIP
Export Intelligence Platform

Produto              Empresa               Recursos
Exportações          Sobre o EIP           EIP Intelligence
AI Hub               Missão                Central de ajuda
Compliance           Segurança             Links oficiais
Logística            Privacidade           Status
Financeiro           Termos de Uso         Contato
API                   LGPD

────────────────────────────────────────────────────────

EIP — Export Intelligence Platform
[Razão social]
CNPJ: XX.XXX.XXX/XXXX-XX
[Endereço empresarial]

© 2026 EIP. Todos os direitos reservados.

Privacidade | Termos | Cookies | Segurança
```

**Não inventaria seu CNPJ/endereço**: esses dois entram como configuração institucional no CMS/Admin e só são publicados quando você cadastrar os dados reais da empresa que comercializará o EIP.

---

# 21. Mais uma funcionalidade que eu acrescentaria

No topo da Home:

```text
🟢 Todos os sistemas operacionais
```

Clicável para:

> `status.eip...`

Quando houver problema:

```text
🟡 Instabilidade no processamento de documentos
```

Isso transmite maturidade de SaaS.

---

# 22. EIP Intelligence pode ser parcialmente público

Eu faria uma estratégia interessante:

Na Home:

> 4–6 notícias/alertas resumidos.

Ao clicar:

```text
Análise completa disponível no EIP

[Experimentar grátis]
```

Assim o Intelligence também vira **aquisição de clientes**.

Posteriormente isso ainda pode ser indexável e gerar tráfego orgânico.

---

# 23. A arquitetura completa da Home fica assim

```text
                    EIP PUBLIC
                        │
        ┌───────────────┼─────────────────┐
        │               │                 │
     VISITOR         CUSTOMER          TRIAL
        │               │                 │
        ▼               ▼                 ▼
    Marketing          Login          Sign-up
        │               │                 │
        │           CPF/Senha             │
        │               │              Empresa
        │              MFA                │
        │               │               Trial
        │           Organization           │
        │            Selector              │
        │               │                 │
        │               └────────┬────────┘
        │                        ▼
        │                       EIP
        │
        ├── Produto
        ├── Soluções
        ├── AI Hub
        ├── EIP Intelligence
        ├── Preços
        ├── Segurança
        ├── Missão/Visão/Valores
        ├── Links oficiais
        ├── Legal
        └── Sponsored Content
```

## 24. Ordem que eu passaria para desenvolvimento

Eu não faria tudo simultaneamente. A prioridade seria **P0: autenticação e segurança** — recuperação de senha, MFA real, seleção de organização, proteção contra enumeração, sessões e step-up. Depois **P1: aquisição SaaS** — Home pública, cadastro, empresa/tenant, trial de 14 dias, tour, planos e conversão para assinatura. Em seguida **P2: conteúdo** — EIP Intelligence, câmbio, alertas, notícias, oportunidades, links oficiais, missão/visão/valores e status. Por último **P3: monetização de mídia** — anunciantes, campanhas, impressões, cliques, validade, aprovação e identificação de patrocinado.

**Eu não mexeria na tela atual isoladamente.** Faria essa evolução já como a **nova arquitetura pública definitiva do EIP**, porque login, trial, empresa, planos e billing agora fazem parte da mesma jornada comercial que desenhamos anteriormente.

O próximo passo mais produtivo é eu montar o **PRD técnico “EIP Public Portal, Identity & Trial v1.0”**, tela por tela e endpoint por endpoint — `/`, `/login`, `/forgot-password`, `/mfa`, `/select-company`, `/signup`, `/trial`, `/pricing`, `/intelligence` — incluindo banco de dados, APIs, estados, regras de segurança, tour guiado e critérios de aceite, pronto para entregar à IA que está programando seu EIP.

[1]: https://www.gov.br/siscomex/pt-br/paginas/portal-unico-siscomex?utm_source=chatgpt.com "Portal Único Siscomex — Siscomex"
[2]: https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/exportacao-portal-unico?utm_source=chatgpt.com "Exportação Portal Único — Receita Federal"
[3]: https://www.gov.br/antaq/pt-br/assuntos/instalacoes-portuarias/portos?utm_source=chatgpt.com "Portos — Agência Nacional de Transportes Aquaviários (ANTAQ)"
[4]: https://www.wto.org/?utm_source=chatgpt.com "World Trade Organization - Home page - Global trade"
[5]: https://www.wcoomd.org/en/about-us/what-is-the-wco/discover-the-wco.aspx?utm_source=chatgpt.com "World Customs Organization"
[6]: https://www.imo.org/en/about/pages/default.aspx?utm_source=chatgpt.com "Introduction to IMO"

Perfeito. Vou continuar já transformando isso em uma especificação implementável. A prioridade será preservar o EIP existente e substituir gradualmente o `/login` atual por uma **camada pública + Identity + Trial**, sem misturar autenticação, marketing e billing no mesmo componente.

# PRD — EIP Public Portal, Identity & Trial v1.0

## 25. Objetivo

Construir a porta de entrada definitiva do EIP para produção.

Ela deverá atender simultaneamente quatro perfis:

| Perfil               | Objetivo                           |
| -------------------- | ---------------------------------- |
| Visitante            | Conhecer o EIP                     |
| Prospect             | Experimentar e comparar planos     |
| Cliente              | Entrar com segurança               |
| Usuário multiempresa | Escolher em qual empresa trabalhar |

A arquitetura será:

```text
PUBLIC PORTAL
      │
      ├── Marketing
      ├── EIP Intelligence
      ├── Pricing
      ├── Institutional
      │
      ├── Identity
      │     ├── Login
      │     ├── Password Recovery
      │     ├── MFA
      │     └── Organization Selection
      │
      └── Acquisition
            ├── Signup
            ├── Company
            ├── Trial
            ├── Guided Tour
            └── Conversion
```

---

# 26. Rotas públicas

Eu estabeleceria:

```text
/
 /login
 /signup
 /forgot-password
 /reset-password
 /mfa
 /select-company

 /pricing
 /trial

 /intelligence
 /intelligence/:slug

 /product
 /solutions
 /ai

 /security
 /privacy
 /terms
 /cookies

 /about
 /contact

 /official-links
```

E:

```text
/app/*
```

fica protegido.

Isso cria uma divisão muito clara:

> `eip.com.br` → público
> `app.eip.com.br` → aplicação

Se inicialmente você quiser continuar no mesmo Angular, tudo bem. A separação pode ser lógica antes de ser física.

---

# 27. Primeira tela `/`

Eu faria o Hero desta forma:

> ### EXPORT INTELLIGENCE PLATFORM
>
> # Sua exportação. Uma única plataforma.
>
> Operações, documentos, logística, financeiro, compliance e inteligência artificial trabalhando juntos para transformar a gestão das suas exportações.
>
> **[Experimentar grátis por 14 dias]**
>
> **[Conhecer os planos]**
>
> Já possui uma conta? **Entrar no EIP**

Do lado direito, não colocaria uma imagem genérica.

Usaria uma **imagem real do Command Center do EIP**, apresentada dentro de um mockup elegante.

Isso é muito mais convincente.

---

# 28. Barra de confiança

Logo abaixo:

```text
USUÁRIOS ILIMITADOS

IA INTEGRADA

DADOS DA SUA EMPRESA PROTEGIDOS

PORTABILIDADE DE DADOS

COMPLIANCE & AUDITORIA
```

Sem exagerar em selos que o EIP ainda não possui.

Não escrever:

> ISO 27001 Certified

se você ainda não possui certificação.

Podemos escrever:

> Arquitetura orientada às boas práticas de segurança

quando isso refletir a implementação real.

---

# 29. Seção "Conheça o EIP"

Seis cards:

### Operações de Exportação

Do contrato ao embarque, centralize o acompanhamento das operações.

### AI Hub

IA integrada para auxiliar análise, documentos, classificação, tradução e tomada de decisão.

### Documentos

Centralização e gestão dos documentos relacionados à operação.

### Logística

Acompanhe embarques, portos, transportadoras e etapas logísticas.

### Financeiro

Centralize informações financeiras relacionadas às operações.

### Compliance

Apoie controles, verificações e processos de conformidade da operação internacional.

E botão:

**[Conhecer todas as funcionalidades]**

---

# 30. EIP Intelligence na Home

Eu colocaria uma faixa inteira:

> ## EIP Intelligence
>
> **O que está acontecendo agora no comércio exterior?**

Visual:

```text
┌─────────────┐ ┌──────────────────┐ ┌─────────────────┐
│ 💱 CÂMBIO   │ │ ⚓ LOGÍSTICA      │ │ 🌎 MERCADOS     │
│             │ │                  │ │                 │
│ USD/BRL     │ │ Alerta portuário │ │ China           │
│ R$ X,XXXX   │ │                  │ │ ...             │
│             │ │ Impacto: ALTO    │ │                 │
└─────────────┘ └──────────────────┘ └─────────────────┘

┌───────────────────────────────────────────────────────┐
│ 💡 OPORTUNIDADE                                       │
│ Novo mercado/oportunidade identificada...             │
│                                      [Ver análise]     │
└───────────────────────────────────────────────────────┘
```

E:

**[Acessar EIP Intelligence]**

---

# 31. Não deixar IA publicar notícias sozinha

Isso precisa entrar no requisito técnico.

Pipeline:

```text
Sources
   ↓
Collector
   ↓
Deduplication
   ↓
AI Classification
   ↓
AI Summary
   ↓
Impact Analysis
   ↓
Confidence / Rules
   ↓
Publication Policy
   ↓
EIP Intelligence
```

Para conteúdo sensível ou de alto impacto, podemos exigir:

```text
REVIEW_REQUIRED
```

antes da publicação.

---

# 32. Estrutura da notícia

```text
INTELLIGENCE_ITEM

id
type

NEWS
ALERT
OPPORTUNITY
FX
REGULATION
LOGISTICS
MARKET

title
slug
summary
content

source_name
source_url
source_published_at

country
sector
commodity

impact_level
confidence_level

ai_generated
review_status

published_at
expires_at

status
```

---

# 33. Impact Level

Padronizaria:

```text
INFORMATIONAL
LOW
MEDIUM
HIGH
CRITICAL
```

Mas `CRITICAL` deve ser usado com parcimônia.

Visual:

```text
🟢 Informativo
🟡 Atenção
🟠 Impacto relevante
🔴 Alto impacto
```

Não quero a Home parecendo um painel de emergência permanentemente.

---

# 34. Personalização depois do login

Aqui o EIP Intelligence fica ainda mais interessante.

Deslogado:

> notícias gerais.

Logado:

```text
Empresa exporta:
Café
Soja
Carne

Mercados:
China
EUA
Europa
```

O EIP poderá priorizar:

> **Notícias potencialmente relevantes para sua operação.**

Isso pode futuramente usar:

```text
NCM
produto
país destino
porto
modal
cliente
Incoterm
```

para personalização.

---

# 35. Página `/login`

A Home deixa de carregar o formulário gigante.

O login ganha uma página limpa:

```text
┌────────────────────────────────────────────┐
│                  EIP                       │
│                                            │
│          Acesse sua conta                  │
│                                            │
│ CPF                                        │
│ [____________________________]             │
│                                            │
│ Senha                                      │
│ [________________________ 👁]              │
│                                            │
│ □ Manter-me conectado                      │
│                                            │
│ [             ENTRAR             ]         │
│                                            │
│ Esqueci minha senha                        │
│                                            │
│ ───────────────────────────────────        │
│                                            │
│ Ainda não utiliza o EIP?                   │
│ [ Experimentar grátis ]                    │
└────────────────────────────────────────────┘
```

---

# 36. CPF

Internamente:

```text
input:
123.456.789-00

backend:
12345678900
```

Nunca confie apenas na máscara.

Validação frontend melhora UX.

Validação backend é obrigatória.

---

# 37. Login endpoint

Conceitualmente:

```text
POST /api/v1/auth/login
```

Request:

```json
{
  "cpf": "12345678900",
  "password": "..."
}
```

Resposta **não deve ainda entregar acesso irrestrito ao tenant**.

Pode retornar um estado de autenticação:

```json
{
  "authenticationState": "MFA_REQUIRED",
  "challengeId": "..."
}
```

ou:

```json
{
  "authenticationState": "ORGANIZATION_SELECTION_REQUIRED"
}
```

ou:

```json
{
  "authenticationState": "AUTHENTICATED",
  "redirect": "/app"
}
```

---

# 38. Estados da autenticação

Formalizaria:

```text
IDENTIFICATION_REQUIRED

PASSWORD_REQUIRED

MFA_REQUIRED

ORGANIZATION_SELECTION_REQUIRED

AUTHENTICATED

PASSWORD_RESET_REQUIRED

ACCOUNT_LOCKED

ACCOUNT_DISABLED
```

Isso facilita muito o frontend.

---

# 39. MFA

Tela:

```text
Verificação em duas etapas

Abra seu aplicativo autenticador
e informe o código de 6 dígitos.

[_] [_] [_] [_] [_] [_]

[Verificar]

Usar código de recuperação
```

E opção:

> Confiar neste dispositivo

Eu deixaria essa funcionalidade configurável conforme a política de segurança.

---

# 40. Primeiro cadastro do MFA

Quando o administrador exigir MFA:

```text
Login
↓
Password valid
↓
MFA enrollment required
↓
QR Code
↓
TOTP
↓
Confirm code
↓
Recovery codes
↓
MFA enabled
```

E **não considere MFA habilitado simplesmente porque o QR Code foi exibido**.

Só depois da confirmação de um código válido.

---

# 41. Recuperação de senha

`/forgot-password`

```text
Recupere seu acesso

Informe seu CPF ou e-mail.

[________________________]

[Enviar instruções]
```

Resposta:

> Se encontrarmos uma conta correspondente, enviaremos as instruções de recuperação.

Nunca:

> CPF inexistente.

---

# 42. Password Reset Token

Estrutura:

```text
PASSWORD_RESET

id
user_id

token_hash

created_at
expires_at
used_at

request_ip
```

Não salve token recuperável em texto puro se a arquitetura permitir armazenar apenas hash.

Uso único.

Expiração curta.

Depois:

```text
reset successful
↓
used_at
↓
invalidate reset token
↓
invalidate relevant sessions
↓
security notification
```

---

# 43. Proteção contra brute force

Precisamos de:

```text
rate limiting

progressive delay

failed attempt monitoring

IP/device signals

temporary challenge/lock where appropriate
```

Não criaria uma regra simplista:

> 3 erros = conta bloqueada por 24 horas

porque um atacante poderia bloquear contas de terceiros deliberadamente.

---

# 44. Seleção da empresa

Depois de senha + MFA:

```text
Em qual empresa deseja trabalhar?

┌──────────────────────────────────┐
│ Agro Exportadora Brasil Ltda.    │
│ CNPJ ••.•••.•••/0001-••         │
│                                  │
│ Administrador                    │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Trading ABC Ltda.                │
│ CNPJ ••.•••.•••/0001-••         │
│                                  │
│ Financeiro                       │
└──────────────────────────────────┘
```

Se só tiver uma:

> entrar automaticamente.

Se tiver várias:

> mostrar seletor.

---

# 45. Endpoint de seleção

```text
POST /api/v1/auth/select-organization
```

Request:

```json
{
  "organizationId": "..."
}
```

Backend:

```text
authenticated?
↓
valid membership?
↓
organization active?
↓
license permits access?
↓
create tenant context/session
```

Nunca confiar no `organizationId` só porque veio da interface.

---

# 46. Trocar empresa sem logout

Depois de autenticado, no avatar:

```text
Alan Franco

Agro ABC Ltda.
Administrador

────────────────
Trocar empresa
Minha conta
Segurança
Sair
```

Isso é muito importante para usuários multiempresa.

---

# 47. Signup

`/signup`

Eu faria em wizard.

### Passo 1/4 — Sua conta

```text
Nome
CPF
E-mail
Telefone
Senha
```

### Passo 2/4 — Sua empresa

```text
CNPJ
Razão Social
Nome Fantasia
Segmento
```

Se houver integração confiável disponível, CNPJ pode preencher alguns campos automaticamente.

### Passo 3/4 — Objetivo

```text
O que você deseja melhorar?

□ Gestão das exportações
□ Documentos
□ Logística
□ Compliance
□ Financeiro
□ IA
□ Integrações
```

Isso é onboarding **e informação comercial**.

### Passo 4/4

> **Seu EIP está pronto.**

**[Começar período de experiência]**

---

# 48. CNPJ já cadastrado

Caso alguém tente cadastrar:

```text
12.345.678/0001-00
```

e já exista:

Não diga:

> Erro — CNPJ duplicado.

Diga:

> **Esta empresa já possui uma organização no EIP.**
>
> Se você trabalha nesta empresa, solicite acesso ao administrador responsável.
>
> **[Solicitar acesso]**

Isso cria uma jornada que ainda não tínhamos.

---

# 49. Solicitar acesso à empresa

Excelente funcionalidade para usuários ilimitados.

```text
ACCESS_REQUEST

id
organization_id
requester_user_id
message
status

PENDING
APPROVED
REJECTED
EXPIRED

created_at
resolved_at
resolved_by
```

Owner/Admin recebe:

> **Alan solicitou acesso à Agro ABC.**

`[Aprovar] [Recusar]`

---

# 50. Trial

Estrutura:

```text
TRIAL

organization_id
plan_reference

started_at
expires_at

status

ACTIVE
EXPIRING
EXPIRED
CONVERTED

converted_at
```

Eu colocaria inicialmente:

**14 dias.**

---

# 51. Não liberar tudo no trial

Não por avareza, mas por segurança/custo.

Trial:

```text
✓ Exportações
✓ Produtos
✓ Documentos
✓ AI Hub
✓ Logística
✓ Financeiro
✓ Compliance
✓ BI

LIMITADO:
AI credits
OCR
storage
external integrations
```

Não liberaria algumas integrações sensíveis automaticamente.

---

# 52. Banner permanente durante trial

Dentro do EIP:

```text
🎯 Você está experimentando o EIP Business.

Restam 11 dias.

[Conhecer planos]
```

Depois:

```text
Restam 3 dias
```

E:

```text
Seu período de experiência terminou.

Seus dados continuam preservados.

[Escolher um plano]
```

---

# 53. Trial → assinatura

Essa conversão precisa ser **não destrutiva**.

```text
TRIAL TENANT
     ↓
PLAN SELECTED
     ↓
LEGAL ACCEPTANCE
     ↓
PAYMENT
     ↓
PAYMENT CONFIRMED
     ↓
SUBSCRIPTION ACTIVE
```

Mesmo:

```text
organization_id
users
products
exports
documents
```

Nada de copiar trial para uma “conta oficial”.

**É a mesma organização.**

Só muda a licença.

---

# 54. Planos

`/pricing`

Já alinhado:

### START

**R$ 1.290/mês**

### BUSINESS ⭐

**R$ 2.490/mês**

### PRO

**R$ 4.490/mês**

### ENTERPRISE

**A partir de R$ 6.990/mês**

E toggle:

```text
[ Mensal ] [ Anual — economize ]
```

Usuários ilimitados destacado em todos.

---

# 55. Comparador

Embaixo dos cards:

```text
COMPARE OS PLANOS

                         START BUSINESS PRO
Usuários                   ∞      ∞      ∞
CNPJ                       1      1      1
Exportações                ...     ∞      ∞
AI Hub                     ✓      ✓✓     ✓✓
OCR                        ...
Compliance
Workflow
BI
API
Integrações
Auditoria
```

Mas sem uma tabela com 70 linhas inicialmente.

Coloque:

> **Ver comparação completa**

---

# 56. Tour

Eu implementaria o tour através de uma definição orientada a dados:

```text
PRODUCT_TOUR

id
code
version
name
status
```

```text
TOUR_STEP

tour_id
sequence
route
target_selector
title
content
position
```

Isso evita hardcode.

---

# 57. Estado individual

```text
USER_TOUR_PROGRESS

user_id
tour_id

current_step
started_at
completed_at
skipped_at
```

Assim:

> “Continuar tour”

funciona em outro login.

---

# 58. Tour não pode quebrar a aplicação

Se:

```text
target_selector
```

não existir por mudança de frontend:

**pular o passo e registrar erro.**

Não travar o usuário.

---

# 59. Tour contextual

Além do tour inicial, cada módulo pode ter:

> `?` **Conhecer esta tela**

Por exemplo:

**Exportações → Fazer tour deste módulo**

Isso reduz necessidade de suporte.

---

# 60. AI onboarding

Depois do tour:

> **Olá, Alan. Posso ajudar a configurar sua primeira exportação.**

A IA pode perguntar:

```text
Qual produto sua empresa exporta?

Para qual país?

Já possui cliente/importador?

Qual Incoterm costuma utilizar?
```

Mas não deve gravar dados críticos silenciosamente.

Mostra:

> “Vou cadastrar estas informações. Confirma?”

---

# 61. Missão, visão e valores no CMS

Não hardcode no Angular.

Crie:

```text
PUBLIC_SETTING

key
value
type
updated_at
updated_by
```

Exemplos:

```text
COMPANY_LEGAL_NAME
COMPANY_CNPJ
COMPANY_ADDRESS

MISSION
VISION
VALUES

SUPPORT_EMAIL
COMMERCIAL_EMAIL
PHONE
```

Assim você altera o rodapé sem deploy.

---

# 62. Links oficiais também administráveis

```text
OFFICIAL_LINK

id
category
name
description
url
country
display_order
active
```

Categorias:

```text
BRAZIL
CUSTOMS
PORTS
FOREIGN_TRADE
INTERNATIONAL
REGULATORY
```

---

# 63. Publicidade

Só entraria depois.

```text
ADVERTISER
AD_CAMPAIGN
AD_CREATIVE
AD_IMPRESSION
AD_CLICK
```

Cada anúncio:

```text
PATROCINADO
```

obrigatoriamente.

E eu colocaria limite:

> **máximo 1 publicidade visível por viewport/bloco Intelligence.**

---

# 64. Ad targeting — cuidado

Eu **não usaria dados confidenciais das operações do cliente para publicidade**.

Por exemplo, não faria:

> cliente está exportando 500 toneladas para Shanghai → mostrar anúncio específico de uma empresa porque sabemos dessa operação.

Isso criaria um problema sério de confiança.

No máximo segmentação contextual ampla e transparente:

```text
category = logistics
country = Brazil
public page = intelligence
```

Sem explorar informação operacional privada.

---

# 65. Cookie consent

A Home pública também introduz isso.

Precisamos separar:

```text
ESSENTIAL
ANALYTICS
PREFERENCES
MARKETING
```

Cookies essenciais não dependem do mesmo tratamento dos opcionais.

Analytics/marketing precisam respeitar a política jurídica definida para o produto.

---

# 66. SEO

Aqui temos uma nova oportunidade.

Páginas públicas:

```text
/intelligence/china-...
/intelligence/portos-...
/intelligence/cambio-...
```

podem gerar tráfego orgânico.

Alguém pesquisa:

> “congestionamento porto Shanghai exportação Brasil”

e encontra uma análise pública do EIP.

Isso pode virar aquisição orgânica.

---

# 67. Segurança do conteúdo externo

Notícia externa pode conter HTML ou conteúdo malicioso.

Pipeline deve sanitizar.

Nunca:

```text
fetch external html
↓
innerHTML
```

diretamente na Home.

---

# 68. Performance

A Home precisa carregar rápido.

Não quero:

```text
Home
↓
20 APIs
↓
AI
↓
câmbio
↓
10 feeds
↓
notícias
↓
ads
```

antes de aparecer.

Faça:

```text
Static/Public shell
        ↓
Hero aparece
        ↓
Lazy load Intelligence
        ↓
Cached public API
```

---

# 69. API pública agregadora

Criaria:

```text
GET /api/v1/public/home
```

Resposta conceitual:

```json
{
  "fx": [],
  "alerts": [],
  "news": [],
  "opportunities": [],
  "sponsored": [],
  "systemStatus": {}
}
```

Cache:

```text
CDN
+
application cache
```

A Home não deve consultar diretamente dez fornecedores externos.

---

# 70. CMS mínimo

No Super Admin:

```text
CONTEÚDO PÚBLICO

Dashboard

EIP Intelligence
├── Notícias
├── Alertas
├── Oportunidades
└── Câmbio

Institucional
├── Missão
├── Visão
├── Valores
├── Empresa
└── Contato

Links oficiais

Publicidade

SEO

Legal
```

Isso transforma a Home em produto administrável.

---

# 71. Analytics do funil

Precisamos medir:

```text
HOME_VIEWED
CTA_TRIAL_CLICKED
PRICING_VIEWED
PLAN_SELECTED
SIGNUP_STARTED
SIGNUP_COMPLETED
TRIAL_STARTED
TOUR_STARTED
TOUR_COMPLETED
FIRST_EXPORT_CREATED
CHECKOUT_STARTED
SUBSCRIPTION_STARTED
```

Então conseguimos calcular:

```text
10000 visitantes
 ↓
600 signup
 ↓
400 trial
 ↓
250 tour
 ↓
180 primeira exportação
 ↓
80 pagantes
```

E descobrir onde melhorar.

---

# 72. Security events

Separados de product analytics:

```text
LOGIN_SUCCEEDED
LOGIN_FAILED
MFA_FAILED
PASSWORD_RESET_REQUESTED
PASSWORD_RESET_COMPLETED
ORGANIZATION_SWITCHED
ACCOUNT_LOCKED
RECOVERY_CODE_USED
```

Security logs não devem virar marketing analytics.

---

# 73. Sessões

Criaria gerenciamento:

> **Configurações → Segurança → Sessões ativas**

```text
Chrome — Windows
Uberlândia, Brasil*
Agora

iPhone
Brasil*
Há 2 horas

[Encerrar sessão]
```

Localização apenas aproximada quando disponível e apropriada.

Botão:

> **Encerrar todas as outras sessões**

---

# 74. Tela Segurança

Finalmente a opção MFA que você já possui passa a ter substância:

```text
SEGURANÇA

Senha
Última alteração: ...

Autenticação em dois fatores
● Ativada

Aplicativo autenticador
Configurado

Códigos de recuperação
6 restantes
[Gerar novos]

Sessões
3 dispositivos
[Gerenciar]

Histórico de segurança
[Visualizar]
```

---

# 75. Recuperação quando perdeu MFA

Isso precisa existir **antes de habilitar MFA em produção**.

Fluxos:

```text
Authenticator
↓
Recovery Code
```

Se perdeu ambos:

> recuperação reforçada de conta.

Para Owner de empresa, isso precisa ser especialmente seguro. Não deve existir um botão simples que desabilite MFA apenas porque alguém controla o e-mail.

---

# 76. P0 de Identity

Eu classificaria como bloqueador de produção:

**login seguro, password hashing adequado, recuperação de senha, MFA real, recovery codes, sessão, logout, logout de todas as sessões, rate limiting, logs de segurança, seleção segura de organização e isolamento multi-tenant.**

Trial e Home bonita são importantes.

Mas **Identity vem primeiro**.

---

# 77. P0 do Public Portal

Depois:

```text
/
 /login
 /forgot-password
 /reset-password
 /mfa
 /select-company

 /signup
 /pricing
 /trial

Header
Hero
Produto
Planos
Security
Institutional
Footer
Legal
```

---

# 78. P1

Depois:

```text
Guided Tour
AI onboarding
EIP Intelligence
FX
News
Alerts
Opportunities
CMS
Official Links
SEO
Status
Analytics
```

---

# 79. P2

Só depois:

```text
Advertisement Platform
Campaign Management
Impressions
Clicks
Advertiser Portal
Advanced personalization
Advanced lead scoring
A/B testing
```

---

# 80. Critério final de aceite

Antes de chamar isso de pronto, uma pessoa que **nunca viu o EIP** deverá conseguir:

```text
Google
 ↓
EIP
 ↓
entender em < 1 minuto o que é
 ↓
ver funcionalidades
 ↓
ver preço
 ↓
experimentar
 ↓
criar conta
 ↓
cadastrar empresa
 ↓
entrar no trial
 ↓
seguir tour
 ↓
criar primeira operação
 ↓
escolher plano
 ↓
pagar
 ↓
continuar usando
```

Sem falar com você.

E um cliente existente:

```text
Home
 ↓
Entrar
 ↓
CPF + senha
 ↓
MFA
 ↓
Empresa
 ↓
EIP
```

Em poucos segundos.

---

## 81. A principal mudança em relação à imagem que você me mostrou

Hoje temos:

```text
localhost:4200/login
        ↓
LOGIN
```

A arquitetura final passa a ser:

```text
                 EIP
                  │
        ┌─────────┴─────────┐
        │                   │
    NÃO SOU CLIENTE      SOU CLIENTE
        │                   │
        ▼                   ▼
       HOME               LOGIN
        │                   │
 Produto/IA              Password
 Intelligence              MFA
 Preços                  Empresa
 Trial                      │
 Empresa                    │
 Tour                       │
        └─────────┬─────────┘
                  ▼
              EIP APP
```

Isso muda completamente a percepção do produto: **de um sistema corporativo com uma tela de autenticação para um SaaS comercializável.**

E eu acrescentaria uma regra ao prompt da IA que está desenvolvendo o sistema: **ela não deve simplesmente editar o componente atual de `/login` e colocar todas essas coisas nele.** Deve primeiro mapear o Identity existente e separar `PublicShell`, `AuthShell` e `AppShell`, reutilizando o que já funciona. Isso evita criar uma Home gigantesca acoplada à autenticação.

Na próxima parte, o passo mais útil é fechar o **modelo físico de banco + contratos completos das APIs + máquina de estados do Identity/Trial + critérios Given/When/Then**, e então gerar um **Prompt Mestre de Implementação dessa evolução da Home**, no mesmo padrão que fizemos para SaaS & Billing, pronto para você entregar diretamente à IA que programa o EIP.

Continuando, agora vou fechar a parte que transforma o desenho em **contrato técnico implementável**. E vou manter a regra central: se sua base atual já possuir `USER`, `TENANT`, autenticação ou RBAC equivalentes, a implementação deve **adaptar**, não duplicar.

# 82. Modelo físico — Identity, Public Portal & Trial

Eu separaria as tabelas por domínio:

```text
IDENTITY
├── USER
├── USER_CREDENTIAL
├── USER_SESSION
├── MFA_METHOD
├── MFA_RECOVERY_CODE
├── PASSWORD_RESET
└── SECURITY_EVENT

ORGANIZATION
├── ORGANIZATION
├── LEGAL_ENTITY
├── ORGANIZATION_MEMBERSHIP
├── ROLE
├── PERMISSION
├── MEMBERSHIP_ROLE
└── ACCESS_REQUEST

ACQUISITION
├── TRIAL
├── ONBOARDING
├── PRODUCT_TOUR
├── TOUR_STEP
└── USER_TOUR_PROGRESS

PUBLIC
├── PUBLIC_SETTING
├── INTELLIGENCE_ITEM
├── OFFICIAL_LINK
└── AD_CAMPAIGN
```

---

# 83. `USER`

Conceitualmente:

```text
USER

id                  UUID PK
cpf_normalized      VARCHAR
name                VARCHAR
email               VARCHAR
phone               VARCHAR
status              VARCHAR
email_verified_at   TIMESTAMP NULL
phone_verified_at   TIMESTAMP NULL
last_login_at       TIMESTAMP NULL
created_at
updated_at
```

Eu separaria dados de identidade dos dados específicos da empresa.

Um usuário não é:

```text
Alan + Empresa ABC
```

Ele é:

```text
Alan
   ├── membro da Empresa ABC
   ├── membro da Empresa XYZ
   └── eventualmente membro de outra organização
```

Isso resolve corretamente seu requisito multiempresa.

---

# 84. CPF

Armazenar normalizado:

```text
12345678900
```

Exibir:

```text
123.456.789-00
```

E criar unicidade conforme a estratégia real de identidade do EIP.

Mas existe uma decisão importante: **CPF é um identificador muito brasileiro**.

Como o EIP pretende operar no comércio exterior, eu não faria a arquitetura de autenticação depender eternamente de:

```text
cpf
```

Melhor abstração:

```text
USER_IDENTITY

id
user_id
type

CPF
EMAIL
FOREIGN_DOCUMENT
FEDERATED_IDENTITY

identifier_normalized
verified_at
```

Na V1 brasileira:

> CPF + senha.

Mas a arquitetura não impede amanhã um executivo estrangeiro de acessar o EIP.

---

# 85. Credenciais

```text
USER_CREDENTIAL

user_id
password_hash
password_changed_at
must_change_password
failed_attempts
locked_until
updated_at
```

Nunca:

```text
password
senha
senha_descriptografavel
```

A senha não deve ser recuperável.

Recuperação de senha significa:

> definir uma **nova senha**,

não enviar a antiga.

---

# 86. Sessões

```text
USER_SESSION

id
user_id
organization_id NULL

session_token_hash
refresh_token_hash

device_id
device_name

ip_address
user_agent

created_at
last_seen_at
expires_at
revoked_at

revocation_reason
```

`organization_id` só entra depois da seleção do contexto empresarial.

---

# 87. Um detalhe importante: autenticação ≠ contexto

Podemos ter:

```text
AUTHENTICATED USER
```

mas ainda não:

```text
ACTIVE ORGANIZATION CONTEXT
```

Isso é exatamente o cenário:

```text
CPF
↓
senha
↓
MFA
↓
Alan autenticado
↓
3 empresas disponíveis
↓
escolher empresa
↓
contexto tenant estabelecido
```

Essa separação é muito boa para segurança.

---

# 88. Membership

```text
ORGANIZATION_MEMBERSHIP

id
organization_id
user_id

status

INVITED
ACTIVE
SUSPENDED
REVOKED

joined_at
revoked_at

created_at
updated_at
```

Constraint:

```text
UNIQUE(organization_id, user_id)
```

---

# 89. Owner

Não colocaria simplesmente:

```text
role = OWNER
```

e encerraria o assunto.

Criaria uma relação explícita de propriedade/responsabilidade:

```text
ORGANIZATION

id
...
owner_user_id
```

Além do RBAC.

Assim o sistema sabe inequivocamente quem pode:

```text
transferir propriedade
encerrar tenant
cancelar assinatura
solicitar exportação completa
```

conforme as políticas que definirmos.

---

# 90. MFA

```text
MFA_METHOD

id
user_id

type
TOTP

secret_encrypted
verified_at

status
PENDING
ACTIVE
DISABLED

created_at
disabled_at
```

Observe:

> `secret_encrypted`

e não hash puro, porque o servidor precisa do segredo para verificar TOTP.

Esse segredo deve receber proteção forte e adequada à infraestrutura.

---

# 91. Recovery codes

```text
MFA_RECOVERY_CODE

id
user_id
code_hash
created_at
used_at
```

O código apresentado ao usuário pode ser:

```text
Y8K4-P2LM
```

Mas o banco guarda representação não reutilizável, como hash adequado.

Depois do uso:

```text
used_at != null
```

e nunca funciona novamente.

---

# 92. Password reset

```text
PASSWORD_RESET

id
user_id

token_hash

requested_at
expires_at
used_at

request_ip
user_agent
```

Eu começaria com validade curta, por exemplo:

> **30 minutos**

mas deixaria configurável.

---

# 93. Security Events

```text
SECURITY_EVENT

id
user_id NULL
organization_id NULL

type

LOGIN_SUCCESS
LOGIN_FAILURE
MFA_SUCCESS
MFA_FAILURE
PASSWORD_RESET_REQUEST
PASSWORD_RESET_SUCCESS
RECOVERY_CODE_USED
SESSION_REVOKED
ORGANIZATION_SWITCH
SUSPICIOUS_LOGIN

ip_address
user_agent

metadata_safe

occurred_at
```

Nunca coloque senha, token ou segredo dentro de `metadata_safe`.

---

# 94. Trial

```text
TRIAL

id
organization_id

status

ACTIVE
EXPIRING
EXPIRED
CONVERTED
CANCELED

started_at
expires_at
converted_at

trial_plan_id
created_at
updated_at
```

Constraint importante:

```text
UNIQUE trial ativo por organization
```

E precisamos de regra antifraude para impedir:

```text
trial termina
↓
cria outra conta
↓
mesmo CNPJ
↓
mais 14 dias
```

O CNPJ/organização resolve boa parte disso.

---

# 95. Trial não cria banco paralelo

Nunca:

```text
trial_database
production_database
```

para a mesma organização.

Use:

```text
ORGANIZATION
       │
       ├── TRIAL LICENSE
       │
       └── PAID LICENSE
```

Os dados permanecem.

---

# 96. Onboarding

```text
ONBOARDING_PROGRESS

organization_id
user_id

company_completed
product_completed
customer_completed
team_completed
first_export_completed

percentage

started_at
completed_at
updated_at
```

Mas eu não confiaria exclusivamente no boolean.

Exemplo:

```text
first_export_completed
```

pode ser derivado da existência real de uma operação válida.

---

# 97. Tour

```text
PRODUCT_TOUR

id
code
version
name
active
```

```text
TOUR_STEP

id
tour_id

sequence
route
target
title
content
position

optional
```

```text
USER_TOUR_PROGRESS

user_id
tour_id

current_step
status

NOT_STARTED
IN_PROGRESS
COMPLETED
SKIPPED

started_at
completed_at
```

---

# 98. Public Settings

```text
PUBLIC_SETTING

key
value
type

PUBLIC
PRIVATE

updated_at
updated_by
```

Cuidado:

Só configurações explicitamente marcadas como públicas podem aparecer em:

```text
/api/v1/public/*
```

Nunca faça:

```text
SELECT * FROM SETTINGS
```

e envie para o frontend.

---

# 99. Intelligence

```text
INTELLIGENCE_ITEM

id
type

title
slug
summary
content

source_name
source_url
source_published_at

country_code
sector
commodity

impact_level

ai_generated
ai_model_reference NULL
review_status

DRAFT
REVIEW_REQUIRED
APPROVED
REJECTED

publication_status

SCHEDULED
PUBLISHED
EXPIRED
ARCHIVED

published_at
expires_at

created_at
updated_at
```

---

# 100. Evidência da notícia

Eu acrescentaria:

```text
INTELLIGENCE_SOURCE

id
intelligence_item_id

source_name
source_url
source_type

OFFICIAL
NEWS
MARKET_DATA
OTHER

published_at
retrieved_at
```

Uma notícia pode ter várias fontes.

Isso será muito importante para credibilidade.

---

# 101. EIP AI Analysis

Separaria:

```text
FATO
```

de:

```text
ANÁLISE EIP
```

Na interface:

> **Fonte:** comunicado oficial / veículo X
> **Resumo:** ...
>
> **Análise EIP AI:** possível impacto sobre...

Nunca apresentar inferência da IA como se tivesse sido escrita pelo órgão oficial.

---

# 102. Publicidade

```text
ADVERTISER

id
legal_name
trade_name
cnpj
website
status
```

```text
AD_CAMPAIGN

id
advertiser_id

name
start_at
end_at

status

DRAFT
PENDING_APPROVAL
ACTIVE
PAUSED
ENDED

target_url
impression_limit
click_limit
```

```text
AD_CREATIVE

id
campaign_id
headline
description
image_reference
cta
```

---

# 103. Métricas publicitárias

```text
AD_METRIC_DAILY

campaign_id
date
impressions
clicks
```

Eu evitaria começar armazenando um evento identificável para cada impressão se não houver necessidade.

Privacidade por design.

---

# 104. API — autenticação

Teremos conceitualmente:

```text
POST /api/v1/auth/login
POST /api/v1/auth/mfa/verify
POST /api/v1/auth/mfa/enroll
POST /api/v1/auth/mfa/confirm
POST /api/v1/auth/recovery-code/verify

POST /api/v1/auth/password/forgot
POST /api/v1/auth/password/reset

GET  /api/v1/auth/organizations
POST /api/v1/auth/select-organization
POST /api/v1/auth/switch-organization

GET  /api/v1/auth/sessions
DELETE /api/v1/auth/sessions/:id
POST /api/v1/auth/sessions/revoke-others

POST /api/v1/auth/logout
```

---

# 105. API — signup

```text
POST /api/v1/public/signup/start
POST /api/v1/public/signup/verify-email
POST /api/v1/public/signup/company
POST /api/v1/public/trial/start
```

Mas não precisamos obrigatoriamente de quatro endpoints se o backend atual trabalhar melhor com outra composição.

O importante é o **contrato funcional**.

---

# 106. API — Home

```text
GET /api/v1/public/home
GET /api/v1/public/pricing
GET /api/v1/public/intelligence
GET /api/v1/public/intelligence/:slug
GET /api/v1/public/official-links
GET /api/v1/public/system-status
```

Nenhum exige autenticação.

Por isso:

> tudo retornado precisa ser considerado público.

---

# 107. `/public/home`

Eu faria retornar:

```json
{
  "hero": {},
  "institutional": {},
  "fx": [],
  "alerts": [],
  "news": [],
  "opportunities": [],
  "sponsored": [],
  "systemStatus": {}
}
```

Mas cada bloco deve poder falhar isoladamente.

Se câmbio cair:

```text
Home continua funcionando.
```

Se notícias caírem:

```text
Home continua funcionando.
```

---

# 108. Signup — resposta

Depois de conta + empresa:

```json
{
  "organizationId": "...",
  "trial": {
    "status": "ACTIVE",
    "expiresAt": "..."
  },
  "nextAction": "START_ONBOARDING"
}
```

Não retornar informações internas desnecessárias.

---

# 109. Error contract

Padronizaria o backend:

```json
{
  "code": "AUTH_INVALID_CREDENTIALS",
  "message": "Não foi possível autenticar.",
  "correlationId": "..."
}
```

Não:

```text
NullPointerException...
SQL...
user_id...
```

---

# 110. Alguns códigos

```text
AUTH_INVALID_CREDENTIALS
AUTH_MFA_REQUIRED
AUTH_MFA_INVALID
AUTH_ACCOUNT_DISABLED
AUTH_RATE_LIMITED

ORG_SELECTION_REQUIRED
ORG_ACCESS_DENIED
ORG_SUSPENDED

SIGNUP_CNPJ_ALREADY_REGISTERED

TRIAL_ALREADY_USED
TRIAL_EXPIRED

PASSWORD_RESET_INVALID
PASSWORD_RESET_EXPIRED
```

Frontend traduz para mensagens amigáveis.

---

# 111. Máquina de estados — Login

```text
START
  ↓
CREDENTIALS
  ↓
VALID?
 ├── NO → FAILURE
 │
 └── YES
       ↓
     MFA?
     ├── YES → MFA_CHALLENGE
     │            ↓
     │          VALID?
     │            ↓
     └────────────┤
                  ↓
          ORGANIZATIONS
                  ↓
          ┌───────┴────────┐
          │                │
          1               >1
          │                │
          ▼                ▼
       SELECT          USER SELECT
          └───────┬────────┘
                  ▼
             AUTHENTICATED
```

---

# 112. Máquina de estados — Trial

```text
NOT_STARTED
     ↓
   ACTIVE
     ↓
  EXPIRING
     ↓
 ┌───┴──────────┐
 │              │
PAYMENT       NO PAYMENT
 │              │
 ▼              ▼
CONVERTED     EXPIRED
```

`EXPIRING` pode ser estado calculado, não necessariamente persistido.

Exemplo:

```text
expires_at - now <= 3 days
```

---

# 113. Máquina de estados — Signup

```text
ACCOUNT_STARTED
↓
EMAIL_PENDING
↓
IDENTITY_VERIFIED
↓
COMPANY_PENDING
↓
ORGANIZATION_CREATED
↓
TRIAL_READY
↓
ONBOARDING
↓
ACTIVATED
```

Precisamos permitir retomar signup abandonado.

---

# 114. Given/When/Then — Login

### Login normal

```text
GIVEN
usuário ativo
senha válida
MFA desabilitado
1 organização ativa

WHEN
login realizado

THEN
usuário autenticado
organização selecionada
sessão criada
security event registrado
```

---

# 115. Multiempresa

```text
GIVEN
usuário possui memberships em A, B e C

WHEN
credenciais e MFA são válidos

THEN
sistema apresenta organizações autorizadas

AND
não apresenta organizações sem membership
```

---

# 116. Ataque alterando organizationId

```text
GIVEN
Alan pertence à empresa A

AND
não pertence à empresa B

WHEN
envia manualmente organizationId=B

THEN
acesso negado

AND
nenhum dado de B é retornado
```

P0.

---

# 117. Recuperação

```text
GIVEN
CPF não cadastrado

WHEN
solicita recuperação

THEN
resposta pública é semanticamente equivalente
à de uma conta existente
```

Isso impede enumeração simples.

---

# 118. MFA

```text
GIVEN
senha correta
MFA ativo

WHEN
código MFA não foi validado

THEN
não criar sessão de aplicação plenamente autenticada
```

P0.

---

# 119. Recovery Code

```text
GIVEN
recovery code válido

WHEN
utilizado

THEN
autenticação permitida conforme política

AND
code marked used

AND
mesmo código nunca funciona novamente
```

---

# 120. Trial

```text
GIVEN
CNPJ nunca utilizou trial

WHEN
signup concluído

THEN
organization criada

AND
trial ACTIVE

AND
expires_at = configured duration
```

---

# 121. Segundo trial

```text
GIVEN
mesma organização/CNPJ já utilizou trial

WHEN
novo usuário tenta gerar outro trial

THEN
não criar novo período automaticamente
```

Pode encaminhar para:

> falar com comercial / escolher plano.

---

# 122. Conversão

```text
GIVEN
trial possui produtos
clientes
documentos
operações
usuários

WHEN
pagamento confirmado

THEN
mesma organization permanece

AND
mesmos IDs permanecem

AND
dados permanecem

AND
license becomes paid
```

P0.

---

# 123. Trial expirado

```text
GIVEN
trial expirou

WHEN
usuário entra

THEN
dados NÃO são apagados

AND
sistema apresenta estado de trial expirado

AND
permite escolher plano

AND
permite tratamento dos dados conforme política
```

---

# 124. Tour

```text
GIVEN
usuário nunca completou tour

WHEN
primeiro acesso ao EIP

THEN
oferecer tour

BUT
permitir pular
```

Eu não tornaria o tour obrigatório.

---

# 125. Homepage degradation

```text
GIVEN
serviço de notícias indisponível

WHEN
visitante abre Home

THEN
Hero, produto, preços, login e footer funcionam normalmente
```

---

# 126. Publicidade

```text
GIVEN
campanha patrocinada ativa

WHEN
é apresentada

THEN
exibir identificação PATROCINADO
```

Sem exceção.

---

# 127. Arquitetura Angular

Pelo print, seu desenvolvimento está rodando em:

```text
localhost:4200
```

o que é consistente com o servidor de desenvolvimento frequentemente usado em projetos Angular, mas **não vou concluir apenas pela porta que seu frontend é Angular**.

A IA de desenvolvimento deve verificar isso no projeto.

Se for Angular, eu organizaria conceitualmente:

```text
app/
├── public/
│   ├── home
│   ├── pricing
│   ├── intelligence
│   ├── product
│   └── institutional
│
├── auth/
│   ├── login
│   ├── forgot-password
│   ├── reset-password
│   ├── mfa
│   └── organization-selector
│
├── acquisition/
│   ├── signup
│   ├── trial
│   ├── onboarding
│   └── tour
│
├── app-shell/
│
└── shared/
```

---

# 128. Três shells

Essa decisão eu realmente recomendo:

```text
PUBLIC SHELL
Header público
Footer público
SEO
Marketing

AUTH SHELL
Login
MFA
Recovery
Signup

APP SHELL
Sidebar
Command Center
Módulos EIP
```

Não colocar sidebar do sistema na Home.

Não colocar footer de marketing dentro do Command Center.

Não misturar.

---

# 129. Guardas

Conceitualmente:

```text
AuthGuard
OrganizationGuard
LicenseGuard
PermissionGuard
MfaGuard
```

Por exemplo:

```text
/app/exports

AuthGuard
   ↓
OrganizationGuard
   ↓
LicenseGuard
   ↓
PermissionGuard
```

Isso dá uma defesa em camadas.

---

# 130. Mas frontend guard não é segurança

Mesmo que Angular bloqueie:

```text
/app/financial
```

o backend continua tendo que validar.

Nunca:

> botão está escondido, então usuário não consegue acessar.

Ele pode chamar a API manualmente.

---

# 131. O Command Center deve conhecer o estado comercial

Depois do login:

```text
ACTIVE
→ dashboard normal

TRIAL
→ dashboard + trial banner

PAST_DUE
→ dashboard + billing warning

READ_ONLY
→ dashboard sem edição

TRIAL_EXPIRED
→ conversion experience
```

Isso conecta este PRD ao SaaS & Billing que acabamos de projetar.

---

# 132. Uma melhoria comercial importante

Na Home eu colocaria:

> **Veja o EIP funcionando**

Além de:

> Experimentar grátis.

Pode existir uma demonstração guiada **sem criar conta**, com telas controladas.

Isso é diferente do trial.

Temos então:

```text
TOUR PÚBLICO
Sem cadastro
Dados fictícios

TRIAL
Cadastro
Empresa
Ambiente próprio
Dados do prospect
```

Essa separação é excelente.

---

# 133. “Acessar como Demo” atual

Portanto, eu não descartaria totalmente o recurso da sua tela.

Eu o transformaria em:

> **Ver demonstração interativa**

e não:

> Acessar como Demo.

A demonstração deve ter:

```text
DEMO TENANT
dados fictícios
somente leitura quando necessário
reset periódico
nenhuma informação real
```

E uma faixa permanente:

> **Ambiente demonstrativo — dados fictícios**

---

# 134. Demo → Trial

Dentro da demonstração:

> Gostou do que viu?

**[Criar minha empresa no EIP]**

Isso inicia signup.

Excelente funil:

```text
HOME
↓
DEMO
↓
TRIAL
↓
PAID
```

---

# 135. Lead capture

Se o visitante não quiser trial:

> **Agendar demonstração**

Campos mínimos:

```text
Nome
Empresa
E-mail corporativo
Telefone
```

Não peça 15 informações.

Depois o comercial pode qualificar.

---

# 136. CRM interno inicial

Mesmo sem integração externa, crie:

```text
LEAD

id
name
company_name
email
phone

source

HOME
DEMO
PRICING
INTELLIGENCE
EVENT
REFERRAL

status

NEW
CONTACTED
QUALIFIED
TRIAL
CUSTOMER
LOST

created_at
```

Isso é muito importante para você começar a vender o EIP.

---

# 137. Origem do lead

Como você pretende prospectar empresas em feiras agropecuárias, isso fica ainda mais interessante.

Podemos registrar:

```text
CAMARU_2026
FEMEC_2027
EXPOZEBU_2027
GOOGLE
LINKEDIN
DIRECT
REFERRAL
```

E descobrir posteriormente:

> Qual feira realmente trouxe clientes?

---

# 138. UTM

Preservar:

```text
utm_source
utm_medium
utm_campaign
utm_content
```

durante:

```text
visitante
↓
signup
↓
trial
↓
cliente
```

Assim você consegue atribuição comercial.

---

# 139. Conversão por canal

Super Admin:

```text
AQUISIÇÃO

Canal       Leads  Trials  Clientes  Conversão

Google       500     80       16       3,2%
LinkedIn     120     30       11       9,2%
Camaru        50     22        8      16,0%
Indicação     30     18       12      40,0%
```

Isso começa a transformar o EIP também em uma empresa SaaS mensurável.

---

# 140. Prompt Mestre — Public Portal & Identity

Agora vem a parte que eu entregaria à IA que está programando o EIP.

# EIP PUBLIC PORTAL, IDENTITY & TRIAL V1.0

## MASTER IMPLEMENTATION SPECIFICATION

Você deverá evoluir a atual entrada do EIP para uma arquitetura pública completa de SaaS, preservando integralmente as funcionalidades existentes.

## REGRA ABSOLUTA

NÃO comece alterando a atual tela `/login`.

Primeiro faça Discovery & Impact Analysis.

Identifique:

* framework frontend;
* backend;
* banco;
* autenticação existente;
* hashing de senha;
* sessão/JWT;
* refresh tokens;
* modelo de usuário;
* modelo de empresa/tenant;
* RBAC/ABAC;
* MFA existente;
* recuperação de senha existente;
* guards;
* interceptors;
* rotas;
* e-mail;
* filas;
* cache;
* storage;
* observabilidade.

Não recrie estruturas equivalentes já existentes.

---

## OBJETIVO

Transformar a atual tela de login em uma arquitetura composta por:

PUBLIC SHELL

AUTH SHELL

APP SHELL

e implementar as jornadas:

HOME → PRODUCT → PRICING → SIGNUP → COMPANY → TRIAL → TOUR → PAID

e:

HOME → LOGIN → PASSWORD → MFA → ORGANIZATION → EIP.

---

## PUBLIC ROUTES

Implementar/adaptar:

/

/login

/signup

/forgot-password

/reset-password

/mfa

/select-company

/pricing

/trial

/intelligence

/intelligence/:slug

/product

/solutions

/ai

/security

/privacy

/terms

/about

/contact

/official-links

Preservar rotas existentes quando houver impacto de compatibilidade.

---

## HOME

A Home pública deverá conter:

Header profissional

Hero

Proposta de valor

CTA Experimentar grátis

CTA Conhecer planos

CTA Entrar

Produtos/módulos

AI Hub

EIP Intelligence

Pricing preview

Security/Trust

Missão

Visão

Valores

Links oficiais

Footer institucional

Dados legais da empresa

Status do sistema.

Não inventar CNPJ ou endereço.

Esses dados deverão vir de configuração administrável.

---

## LOGIN

Implementar:

CPF

Senha

Mostrar/ocultar senha

Recuperação de senha

MFA

Seleção de organização

Sessões

Logout.

Não revelar organizações associadas ao CPF antes de autenticação suficiente.

---

## MULTIEMPRESA

Um USER poderá pertencer a múltiplas ORGANIZATIONS através de MEMBERSHIP.

Após autenticação:

1 organização autorizada:
selecionar automaticamente.

Mais de uma:
exibir seletor.

Permitir troca de organização posteriormente sem compartilhar dados entre tenants.

---

## MFA

Implementar MFA real.

Inicialmente TOTP.

Fluxo:

Password
→ MFA Challenge
→ Organization
→ Application.

Criar:

MFA enrollment

TOTP verification

Recovery codes

MFA disable com step-up

Security events.

Não considerar MFA ativo até confirmação válida do primeiro código.

---

## PASSWORD RECOVERY

Criar fluxo seguro.

Resposta pública não deverá confirmar existência de CPF/e-mail.

Token:

uso único

expiração curta

armazenamento seguro

invalidação após uso.

Após reset, considerar revogação de sessões conforme política.

---

## TRIAL

Implementar trial configurável, inicialmente 14 dias.

Trial pertence à ORGANIZATION.

Não criar banco ou tenant paralelo.

Conversão para plano pago deverá preservar:

organization_id

users

products

customers

exports

documents

history.

Nunca copiar dados para uma nova conta durante conversão.

---

## COMPANY

Cadastro da organização/CNPJ é obrigatório antes de utilizar funcionalidades reais do EIP.

Evitar múltiplos trials para o mesmo CNPJ.

Quando CNPJ já existir:

não criar organização duplicada.

Oferecer:

Solicitar acesso à empresa.

---

## GUIDED TOUR

Implementar tour orientado a dados.

Permitir:

start

next

previous

skip

resume

restart.

Não bloquear aplicação caso um target visual não exista.

Registrar progresso por usuário.

---

## PUBLIC DEMO

Transformar "Acessar como Demo" em:

"Ver demonstração interativa".

Usar tenant exclusivo com dados fictícios.

Identificar permanentemente:

AMBIENTE DEMONSTRATIVO — DADOS FICTÍCIOS.

Demo e Trial são conceitos diferentes.

---

## EIP INTELLIGENCE

Implementar arquitetura para:

Câmbio

Notícias

Alertas

Logística

Regulação

Oportunidades

Mercados.

Todo conteúdo externo deverá preservar fonte.

Distinguir claramente:

FONTE

RESUMO

ANÁLISE EIP/AI.

Não permitir que inferência de IA seja apresentada como declaração da fonte.

---

## PUBLICIDADE

Preparar arquitetura, mas considerar P2.

Publicidade deverá:

ser claramente marcada como PATROCINADO;

não se confundir com alertas;

não utilizar dados operacionais confidenciais do tenant para targeting;

não poluir a Home.

Máximo inicial recomendado:
1 peça patrocinada por bloco/viewport relevante.

---

## SECURITY

P0:

Tenant isolation

Password security

MFA

Recovery

Rate limiting

Session management

Organization authorization

Security logs

Step-up authentication

Secure storage

No secrets in frontend

No sensitive data in logs.

Frontend guards não substituem autorização backend.

---

## ANALYTICS

Registrar:

HOME_VIEWED

PRICING_VIEWED

DEMO_STARTED

SIGNUP_STARTED

SIGNUP_COMPLETED

TRIAL_STARTED

TOUR_STARTED

TOUR_COMPLETED

FIRST_EXPORT_CREATED

PLAN_SELECTED

CHECKOUT_STARTED

SUBSCRIPTION_STARTED.

Preservar UTM/source quando apropriado.

---

## PRIORIDADES

P0:

Identity
Password Recovery
MFA
Session Security
Multi-Organization
Tenant Isolation

P1:

Public Home
Signup
Company
Trial
Pricing
Guided Tour
Demo

P2:

EIP Intelligence
CMS
SEO
Lead Management
Official Links
Status

P3:

Advertising
Advanced targeting
Campaign analytics
A/B testing.

---

## PRIMEIRA EXECUÇÃO

NÃO IMPLEMENTE.

Execute exclusivamente Discovery & Impact Analysis.

Retorne:

1. arquitetura atual;
2. stack;
3. auth existente;
4. user model;
5. tenant/company model;
6. RBAC;
7. MFA atual;
8. password recovery atual;
9. sessão/JWT;
10. rotas;
11. componentes que serão reutilizados;
12. componentes afetados;
13. tabelas existentes reutilizáveis;
14. novas tabelas propostas;
15. migrations propostas;
16. APIs propostas;
17. riscos;
18. vulnerabilidades encontradas;
19. plano incremental de implementação;
20. commits propostos;
21. testes;
22. dúvidas bloqueantes.

Finalize com:

GO / NO-GO PARA IMPLEMENTAÇÃO

e NÃO altere nenhum arquivo antes de autorização expressa.

## 141. O que eu faria agora no seu desenvolvimento

Eu daria **esse Prompt Mestre + o prompt do SaaS & Billing anterior** para a IA de desenvolvimento, mas mandaria executar **somente Discovery**.

O resultado que queremos receber dela agora não é código. Queremos algo parecido com:

> “Encontrei autenticação X, tabela Y, serviço Z, configuração MFA apenas visual, não existe backend TOTP, empresa está ligada diretamente ao usuário, `/login` está no módulo X, existem estes guards, estas migrations serão necessárias...”

A partir desse diagnóstico real do seu código, nós confrontamos o que **já existe** com toda a arquitetura que desenhamos e aí damos a ordem para implementar **P0 Identity primeiro**. Esse método reduz bastante o risco de uma evolução tão grande da Home acabar introduzindo regressões justamente quando você está preparando o EIP para sair do localhost e ir para produção.

Continuando, agora eu fecharia o que ainda falta antes de mandar a IA mexer no código: **fluxos visuais, segurança de produção, Intelligence, administração da Home e estratégia de implantação**. Há também uma correção importante no que desenhamos: eu evitaria colocar CPF em URLs, logs, analytics ou eventos; ele deve ficar restrito ao domínio de identidade.

# 142. Jornada pública definitiva do EIP

A experiência completa deve ser pensada como um funil único:

```text
VISITANTE
   │
   ├───────────────┬────────────────┬─────────────────┐
   │               │                │                 │
   ▼               ▼                ▼                 ▼
CONHECER          DEMO            TRIAL             LOGIN
   │               │                │                 │
Produto         Dados fictícios    Conta             CPF
IA              Tour público       Empresa            Senha
Intelligence        │              14 dias            MFA
Segurança           │                │                 │
Preços              └──────┐         │             Empresa
   │                       │         │                 │
   └───────────────► CONVERSÃO ◄────┘                 │
                           │                           │
                         PLANO                         │
                           │                           │
                        CHECKOUT                       │
                           │                           │
                        CLIENTE ◄──────────────────────┘
                           │
                           ▼
                         EIP APP
```

O ponto central é: **Home, demo, trial, planos e login não podem parecer produtos diferentes**.

A identidade visual e a linguagem precisam ser contínuas.

---

# 143. Header definitivo

Eu faria:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ EIP                                                                    │
│ Export Intelligence Platform                                           │
│                                                                        │
│ Produto  Soluções  IA  Intelligence  Segurança  Preços                │
│                                                                        │
│                              Entrar   [ Experimentar grátis ]           │
└────────────────────────────────────────────────────────────────────────┘
```

Quando rolar a página:

> header sticky, menor.

No mobile:

> menu hambúrguer + CTA Experimentar.

---

# 144. Hero — eu reduziria bastante o texto

Nada de explicar 25 módulos logo no primeiro bloco.

### Título

> # Sua exportação. Uma única plataforma.

### Subtítulo

> **Centralize operações, documentos, logística, financeiro e compliance com inteligência artificial integrada à sua rotina de comércio exterior.**

CTAs:

**Experimentar grátis por 14 dias**

**Ver demonstração**

Abaixo:

> Já utiliza o EIP? **Entrar**

---

# 145. Uma animação que faria sentido

Do lado direito:

```text
CONTRATO
    ↓
PRODUTO / NCM
    ↓
EXPORTAÇÃO
    ↓
DOCUMENTOS
    ↓
LOGÍSTICA
    ↓
CÂMBIO
    ↓
COMPLIANCE
    ↓
EMBARQUE

       EIP AI
     acompanha
     todo fluxo
```

Mas como animação discreta.

Não quero um site cheio de efeitos.

---

# 146. Segunda seção: problema → solução

Título:

> ## Sua exportação não deveria estar espalhada em planilhas, e-mails e sistemas desconectados.

Depois:

```text
ANTES DO EIP                   COM O EIP

Planilhas                     Operação centralizada
E-mails                       Workflow
Documentos dispersos          Gestão documental
Controles manuais             Automação
Dados isolados                Inteligência integrada
Retrabalho                    Processo rastreável
```

Essa seção vende melhor o produto do que simplesmente listar funcionalidades.

---

# 147. Terceira seção: fluxo operacional

Mostrar:

```text
CONTRATO
   ↓
PRODUTO
   ↓
EXPORTAÇÃO
   ↓
LOTE
   ↓
DOCUMENTOS
   ↓
LOGÍSTICA
   ↓
FINANCEIRO
   ↓
COMPLIANCE
```

E uma linha atravessando tudo:

> **EIP AI**

Assim o prospect entende que IA não é um chatbot colocado no canto.

Ela atravessa a operação.

---

# 148. AI Hub

Aqui podemos vender melhor seu diferencial.

> # IA onde o trabalho acontece.

Cards:

**Assistente de Exportação**
Contexto da operação.

**Leitura documental**
Extração e análise.

**NCM**
Assistência na classificação.

**Tradução**
Conteúdo operacional.

**Risco & Compliance**
Apoio à análise.

**Rotas & Logística**
Recomendações e contexto.

**Chat com documentos**
Perguntas sobre arquivos da operação.

**Previsões & recomendações**
Apoio à tomada de decisão.

Sempre deixando claro que determinadas análises são assistivas e não substituem validações legais, fiscais ou aduaneiras quando necessárias.

---

# 149. Uma coisa que eu colocaria na Home: "Como funciona"

```text
1
CADASTRE SUA EMPRESA

2
CONFIGURE PRODUTOS E CLIENTES

3
CRIE SUA EXPORTAÇÃO

4
ACOMPANHE TODO O PROCESSO

5
USE A IA EM CADA ETAPA
```

CTA:

> **Começar agora**

Isso reduz a sensação de produto complexo.

---

# 150. Demonstração interativa

Quando clicar:

> **Ver demonstração**

não mandaria imediatamente para um login fake.

Abriria:

```text
Conheça o EIP

Explore uma empresa fictícia e veja
como uma operação de exportação funciona.

Empresa demonstrativa:
Brasil Agro Export S.A.

Dados:
100% fictícios

[Entrar na demonstração]
```

---

# 151. Demo tenant

Eu criaria um tenant especial:

```text
tenant_type = DEMO
```

Regras:

```text
Dados fictícios
Reset automático
Sem billing
Sem dados pessoais reais
Sem integrações reais
Sem envio de e-mails externos
Sem chamadas operacionais reais
Sem alterações críticas
```

---

# 152. Demo precisa ser protegida contra abuso

Um ambiente demo público pode virar fonte de consumo de:

**IA, OCR, storage, API e infraestrutura.**

Então:

```text
DEMO_AI_LIMIT
DEMO_SESSION_LIMIT
DEMO_RATE_LIMIT
DEMO_TIMEOUT
```

E não permitir upload irrestrito.

---

# 153. CTA dentro da Demo

Faixa superior permanente:

> **Você está conhecendo o EIP em um ambiente demonstrativo. Todos os dados são fictícios.**

**[Criar minha empresa]**

No final do tour:

> ### Pronto para experimentar com sua própria operação?
>
> **Experimente grátis por 14 dias**

Esse é um funil muito bom.

---

# 154. Signup progressivo

Eu evitaria uma ficha gigantesca.

Tela 1:

```text
CRIE SUA CONTA

Nome
CPF
E-mail
Telefone
Senha
```

Tela 2:

```text
SUA EMPRESA

CNPJ
```

Ao informar CNPJ, quando houver integração adequada:

```text
Razão social     preenchida
Nome fantasia    preenchido
Endereço          preenchido
```

Usuário confirma.

---

# 155. Não exija tudo antes do trial

Não peça logo:

```text
Inscrição estadual
regime tributário
todos os endereços
banco
portos
certificados
integrações
...
```

Isso mata conversão.

Faça progressive profiling.

---

# 156. Onboarding adaptativo

Depois do signup:

> **O que você deseja fazer primeiro?**

```text
○ Criar uma operação de exportação
○ Organizar documentos
○ Conhecer o AI Hub
○ Configurar compliance
○ Integrar meu ERP
○ Apenas explorar
```

O tour muda conforme a resposta.

Isso é melhor que obrigar todos a assistir ao mesmo tour.

---

# 157. Time to First Value

Essa passa a ser uma métrica essencial:

```text
TTFV =
first_value_event_at
-
trial_started_at
```

Eu gostaria que o usuário chegasse ao primeiro valor em **minutos**, não dias.

---

# 158. O que é "primeiro valor"?

Não necessariamente primeira exportação completa.

Pode ser:

```text
produto importado
+
IA sugere/enriquece NCM
```

ou:

```text
documento enviado
+
EIP extrai informações
```

ou:

```text
operação criada
+
Command Center atualizado
```

Vamos medir qual desses eventos mais correlaciona com conversão.

---

# 159. Trial Command Center

Durante trial, o dashboard deve ajudar a vender.

Exemplo:

```text
BEM-VINDO AO EIP

Seu período de experiência
11 dias restantes

Configuração
██████████████░░░░ 70%

✓ Empresa
✓ Produto
✓ Cliente
○ Primeira exportação
○ Convidar equipe

────────────────────────────

Descubra o EIP

[AI Hub]
[Exportações]
[Documentos]
[Compliance]
[Logística]
```

---

# 160. Não mostrar dashboard vazio

Se não houver dados:

> “Nenhuma exportação cadastrada.”

é ruim.

Melhor:

> ### Crie sua primeira exportação
>
> Leva poucos minutos e o EIP pode ajudar no preenchimento.
>
> **[Criar exportação]**
>
> ou
>
> **[Carregar exemplo]**

---

# 161. Dados de exemplo no trial

Eu permitiria:

> **Carregar dados de exemplo**

Mas esses dados precisam ser marcados:

```text
sample_data = true
```

E botão:

> Remover dados de exemplo

Isso permite experimentar dashboards sem precisar cadastrar tudo.

---

# 162. Conversão contextual

Não mostre apenas:

> “Compre agora.”

Use momentos de valor.

Depois de uma análise:

> **O EIP analisou seu primeiro documento.**

Depois:

> “Continue utilizando AI Document Intelligence com o plano Business.”

Isso é muito mais natural.

---

# 163. Trial expiration

D-7:

> Seu teste continua por mais 7 dias.

D-3:

> Faltam 3 dias.

D-1:

> Seu período termina amanhã.

D0:

> Seu período de experiência terminou.

Sempre:

**[Escolher plano]**

---

# 164. Não criar dark patterns

Não esconda cancelamento.

Não faça contagem regressiva falsa.

Não invente:

> “Só restam 2 vagas!”

se isso não for verdade.

O EIP deve transmitir confiança.

---

# 165. Página Segurança

Eu faria uma página pública forte:

> # Segurança faz parte da arquitetura do EIP.

Blocos:

```text
Identidade & MFA

Controle de acesso

Isolamento entre empresas

Criptografia

Auditoria

Backups

Continuidade

Privacidade

Gestão de incidentes

Segurança de IA
```

Mas cada afirmação precisa refletir algo realmente implementado.

---

# 166. Trust Center

Posteriormente:

```text
/trust
```

com:

```text
Security
Privacy
Data Processing
Subprocessors
Availability
AI
Legal
Status
```

Isso ajuda muito em vendas B2B.

---

# 167. EIP Intelligence — fontes

Eu priorizaria fontes em níveis.

```text
TIER 1
Órgãos oficiais

TIER 2
Organizações internacionais

TIER 3
Portos, autoridades e entidades setoriais

TIER 4
Imprensa econômica especializada

TIER 5
Outras fontes verificadas
```

A IA não deveria dar o mesmo peso a tudo.

---

# 168. Score interno de confiabilidade

Internamente:

```text
SOURCE_RELIABILITY

OFFICIAL = highest
VERIFIED_INSTITUTION
SPECIALIZED_MEDIA
GENERAL_MEDIA
UNVERIFIED
```

Isso ajuda o pipeline.

Mas eu não exibiria uma falsa precisão como:

> “Confiabilidade 93,7%”

para o usuário.

---

# 169. Notícias duplicadas

Um evento pode aparecer em 20 fontes.

Não queremos 20 cards.

Pipeline:

```text
20 articles
   ↓
semantic clustering
   ↓
1 event
   ↓
multiple sources
   ↓
1 EIP Intelligence Item
```

Isso deixa o Intelligence muito melhor.

---

# 170. Atualização de uma notícia

Imagine:

08h:

> China anuncia restrição.

14h:

> Governo brasileiro publica esclarecimento.

18h:

> Restrição vale apenas para determinada categoria.

Não crie três notícias desconectadas.

Crie:

```text
INTELLIGENCE EVENT
     │
     ├── Update 08:00
     ├── Update 14:00
     └── Update 18:00
```

Isso é muito mais profissional.

---

# 171. Impacto por empresa

Quando logado:

```text
IMPACT ASSESSMENT

Este evento pode afetar sua empresa.

Motivos:

✓ Você possui produtos deste setor
✓ Existem operações para China
✓ Há embarques ativos

Operações potencialmente relacionadas:
3
```

Aqui o EIP começa a se diferenciar fortemente.

---

# 172. Mas cuidado com decisões automatizadas

Eu apresentaria:

> **Possível impacto identificado pelo EIP**

e não:

> “Sua exportação será bloqueada.”

A menos que haja uma regra oficial inequívoca e aplicável à operação.

---

# 173. Intelligence Watchlist

Usuário poderá seguir:

```text
País
Produto
NCM
Porto
Commodity
Cliente
Rota
Tema regulatório
```

Exemplo:

> 🔔 Avisar-me sobre mudanças relacionadas à China + carne bovina.

Isso cria retenção.

---

# 174. Alertas

Dentro do EIP:

```text
EIP INTELLIGENCE ALERT

China / Carne bovina
Impacto potencial: ALTO

3 operações podem exigir atenção.

[Analisar operações]
```

Isso liga notícia → operação.

É muito mais valioso que uma página de notícias comum.

---

# 175. Home deslogada não pode mostrar dados privados

Parece óbvio, mas merece teste automatizado.

`/api/v1/public/home`

jamais pode retornar:

```text
customer
export
invoice
document
tenant
user
```

mesmo por bug de serialização.

---

# 176. CMS Intelligence

Super Admin:

```text
EIP INTELLIGENCE

Hoje

12 itens coletados
 8 agrupados
 5 analisados
 3 publicados
 2 aguardando revisão

[Revisar conteúdo]
```

Cada item:

```text
Título
Fonte
Resumo
Impacto
Setores
Países
AI Analysis
Status
```

Botões:

```text
Aprovar
Editar
Rejeitar
Agendar
Publicar
Arquivar
```

---

# 177. Publicidade no CMS

Separado:

```text
MONETIZAÇÃO
└── Publicidade
```

Nunca dentro de:

```text
Intelligence → Notícias
```

Isso mantém separação editorial.

---

# 178. Controle comercial do anúncio

```text
Advertiser
Campaign
Creative
Contract
Start
End
Placement
Impressions
Clicks
CTR
Revenue
```

Depois você pode cobrar:

```text
CPM
CPC
mensalidade fixa
patrocínio de newsletter
patrocínio de categoria
```

Mas eu começaria por **mensalidade fixa**, muito mais simples.

---

# 179. Onde permitir anúncio

Eu escolheria apenas:

```text
Home → Intelligence
Intelligence → feed
Newsletter futura
```

Eu **não colocaria propaganda dentro de Exportações, Financeiro, Compliance ou Documentos**.

O cliente está pagando pelo SaaS.

Não devemos transformar a aplicação operacional em portal de anúncios.

---

# 180. Plano pago e publicidade

Eu faria outra regra:

**Home pública:** pode ter patrocinado.

**EIP Intelligence:** pode ter patrocinado discreto.

**Aplicação operacional:** sem anúncios.

Mesmo Start.

Isso preserva a percepção premium.

---

# 181. Missão, visão e valores — versão que eu congelaria

### Missão

> **Simplificar e integrar o comércio exterior por meio de tecnologia e inteligência, conectando pessoas, processos e dados para tornar as exportações mais eficientes, seguras e previsíveis.**

### Visão

> **Ser uma plataforma brasileira de referência em inteligência e gestão integrada de exportações, conectando empresas ao comércio global.**

### Valores

> **Confiança · Segurança · Inovação · Transparência · Eficiência · Inteligência · Foco no cliente**

Isso combina melhor com o posicionamento que estamos dando ao produto.

---

# 182. Footer legal

Configuração:

```text
Razão social
Nome fantasia
CNPJ
Endereço
Cidade
Estado
CEP
Telefone
E-mail comercial
E-mail suporte
E-mail privacidade
```

Mas eu exibiria só o necessário:

```text
EIP — Export Intelligence Platform
Operado por [RAZÃO SOCIAL]
CNPJ XX.XXX.XXX/XXXX-XX

[ENDEREÇO]

Termos | Privacidade | Cookies | Segurança
```

---

# 183. Central de links oficiais

Em vez de uma lista gigantesca no footer:

> **Links oficiais de Comércio Exterior**

leva para:

```text
/official-links
```

Categorias:

**Comércio Exterior Brasil**

**Aduana**

**Portos**

**Câmbio**

**Agronegócio**

**Organizações Internacionais**

**Sanções & Compliance**

---

# 184. Link externo

Sempre mostrar indicador:

> ↗

e abrir de maneira consistente.

Aviso discreto:

> Você será direcionado para um site externo.

Não precisamos assustar o usuário.

---

# 185. Feature Flags para lançamento

Isso é muito importante.

Não faça um deploy em que tudo fica automaticamente público.

Crie:

```text
PUBLIC_HOME_ENABLED
PUBLIC_PRICING_ENABLED
PUBLIC_DEMO_ENABLED
TRIAL_ENABLED
MFA_ENABLED
INTELLIGENCE_ENABLED
ADS_ENABLED
```

Assim podemos lançar progressivamente.

---

# 186. Estratégia de rollout

Eu faria:

```text
FASE A
Identity interno

FASE B
Nova Home em staging

FASE C
Home pública produção
sem trial

FASE D
Demo pública

FASE E
Trial para convidados

FASE F
Trial público

FASE G
EIP Intelligence

FASE H
Publicidade
```

Isso reduz bastante o risco.

---

# 187. Não abrir trial para o mundo no primeiro dia

Primeiro:

> **Trial por convite.**

Pegamos 5 empresas.

Depois 10.

Depois 20.

Observamos:

```text
erros
TTFV
uso IA
abandono
dúvidas
custo
conversão
```

Depois:

> **Experimentar grátis**

aberto.

---

# 188. Founders integrado ao signup

Se o lead tiver:

```text
offer_code = FOUNDERS2026
```

depois do trial:

```text
EIP Business
R$2.490/mês

Programa Founders
R$1.790/mês
por 12 meses
```

Não hardcode.

Use `COMMERCIAL_AGREEMENT/PROMOTION`.

---

# 189. Lead → Trial → Customer

Uma mesma identidade comercial precisa continuar:

```text
LEAD
 ↓
USER
 ↓
ORGANIZATION
 ↓
TRIAL
 ↓
SUBSCRIPTION
```

Não crie duplicatas no CRM quando converter.

---

# 190. Lead score

Futuramente:

```text
+10 pricing viewed
+20 demo completed
+25 CNPJ registered
+30 first export
+20 invited teammate
+40 checkout started
```

Isso ajuda comercial.

Mas P2.

---

# 191. Emails transacionais necessários

Antes do lançamento:

```text
Verifique seu e-mail

Bem-vindo ao EIP

Recuperação de senha

Senha alterada

MFA ativado

Novo login

Usuário convidado

Solicitação de acesso

Trial iniciado

Trial termina em 3 dias

Trial terminou

Pagamento confirmado

Pagamento falhou

Assinatura ativada

Assinatura cancelada

Data export ready
```

Templates versionados.

---

# 192. Não misturar e-mail comercial e segurança

Usuário pode cancelar:

> newsletter.

Mas não:

> aviso de alteração de senha.

Categorias:

```text
SECURITY
TRANSACTIONAL
PRODUCT
INTELLIGENCE
MARKETING
```

Isso precisa existir no modelo.

---

# 193. Preferências

```text
NOTIFICATION_PREFERENCE

user_id

security_email      required
transactional_email required

product_email       boolean
intelligence_email  boolean
marketing_email     boolean
```

Conforme regras jurídicas aplicáveis.

---

# 194. EIP Intelligence Digest

Depois podemos criar:

> **EIP Morning Intelligence**

Todo dia:

```text
Câmbio
3 principais alertas
2 oportunidades
Portos
Mercados
Regulação
```

E para cliente:

> “2 desses eventos podem afetar suas operações.”

Isso pode ser um excelente mecanismo de retenção.

---

# 195. Mobile

A Home precisa ser pensada mobile desde o início.

No celular:

```text
EIP

Sua exportação.
Uma única plataforma.

[Experimentar grátis]
[Ver demonstração]

────────────

USD/BRL
EUR/BRL

────────────

Alerta principal

────────────

Conheça o EIP
```

Não tentar reproduzir desktop em miniatura.

---

# 196. Acessibilidade

P0 de qualidade:

```text
labels reais
keyboard navigation
focus visible
aria onde necessário
contraste
mensagens de erro associadas ao campo
não depender apenas de cor
```

MFA de seis dígitos também precisa funcionar bem com colar código.

---

# 197. Login UX

Permita colar senha.

Não bloqueie password managers.

Não invente regras como:

> “não pode colar senha.”

Isso piora segurança.

---

# 198. Senha

Na criação:

```text
Senha

[________________]

✓ requisito...
✓ requisito...
```

Mas eu privilegiaria **comprimento e senhas fortes** em vez de regras absurdas que obrigam combinações artificiais.

Também devemos permitir password manager.

---

# 199. Erros

Não:

> “Erro 401.”

Use:

> **Não foi possível entrar. Confira seus dados e tente novamente.**

Detalhes técnicos ficam nos logs com `correlationId`.

---

# 200. Loading

Depois de Entrar:

```text
Verificando sua conta...
```

MFA:

```text
Validando código...
```

Empresa:

```text
Preparando seu ambiente...
```

Não deixar botão aparentemente travado.

---

# 201. Double click

Todas as operações importantes devem ser resistentes a:

```text
click
click
click
```

Signup, trial, checkout, invitation, password reset etc.

Idempotência quando necessário.

---

# 202. Observabilidade da jornada

Quero conseguir seguir:

```text
request_id
correlation_id

HOME
↓
SIGNUP
↓
ORGANIZATION
↓
TRIAL
↓
CHECKOUT
```

sem registrar informação sensível indevida.

Isso será muito útil quando o primeiro cliente disser:

> “Cliquei e não funcionou.”

---

# 203. Métrica que eu colocaria no Super Admin no primeiro dia

```text
ACQUISITION TODAY

Visitors                 42
Pricing views             18
Demo starts                8
Signups                    5
Trials                     3
Activated                  2
Paid                       1
```

Depois:

```text
Conversion
Visitor → Trial
Trial → Activated
Activated → Paid
```

---

# 204. Launch Gate

Eu só abriria publicamente quando:

```text
✓ Login
✓ Recovery
✓ MFA
✓ Multiempresa
✓ Tenant isolation
✓ Signup
✓ Trial
✓ Trial conversion
✓ Billing
✓ Terms
✓ Privacy
✓ Session management
✓ Audit
✓ Backup restore tested
✓ Monitoring
✓ Rate limiting
✓ Error handling
✓ Emails
✓ Mobile
✓ Accessibility básica
```

---

# 205. E eu acrescentaria uma fase antes do "mar aberto"

Chamaria de:

> ## EIP PRIVATE BETA

Fluxo:

```text
5 empresas
↓
10 empresas
↓
20 empresas Founders
↓
ajustes
↓
PUBLIC LAUNCH
```

Para cada empresa beta, mediríamos:

**tempo para cadastro, tempo para primeira operação, quantidade de dúvidas, módulos utilizados, consumo de IA, erros, custo por tenant, NPS/feedback, intenção de continuar e disposição real de pagar.**

Isso é muito mais valioso do que simplesmente publicar e esperar cadastros.

---

## 206. Ordem de execução que eu congelaria

Neste ponto, temos três grandes especificações que precisam conversar:

**EIP Core** — seu produto atual.

**EIP SaaS Commercialization & Billing** — planos, assinatura, Stripe/provider, licença, inadimplência, cancelamento e portabilidade.

**EIP Public Portal, Identity & Trial** — Home, login, MFA, recovery, empresa, demo, trial, tour e Intelligence.

Eu faria o desenvolvimento exatamente nesta ordem:

> **Identity P0 → Multi-tenant Security → Public Home → Signup/Company → Trial → Guided Tour → Billing Conversion → Intelligence → Ads.**

E **não autorizaria a IA a iniciar pela Home bonita**. Recuperação de senha, MFA real e isolamento de empresa são mais importantes para produção do que carrossel, notícias e publicidade.

Depois que o Discovery da IA retornar a estrutura real do seu código, a próxima etapa não deveria mais ser outro documento conceitual. Deve ser um **Plano de Implementação por Sprint/Commit**, dizendo literalmente quais componentes criar ou alterar, migrations, endpoints, testes e sequência de deploy — mas usando os **nomes reais das classes, tabelas, módulos e serviços que já existem no seu EIP**, para não duplicarmos arquitetura.

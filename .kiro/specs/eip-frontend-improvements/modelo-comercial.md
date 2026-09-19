Sim. Para o EIP, eu estruturaria exatamente como um **SaaS B2B por empresa (CNPJ/tenant)**, e não por usuário. Isso combina muito melhor com um sistema de exportação em que várias pessoas de comércio exterior, financeiro, logística, compliance e diretoria precisam trabalhar na mesma operação.

Pelo escopo do EIP — exportações, documentos, NCM, OCR/IA, compliance, Siscomex, logística, financeiro etc. — eu também **não colocaria um preço baixo de software genérico**. Ele resolve processos empresariais de alto valor.

### Modelo comercial que eu adotaria

Minha proposta inicial seria:

| Plano              |            Preço |   Usuários | Indicado para               |
| ------------------ | ---------------: | ---------: | --------------------------- |
| **EIP Start**      |   **R$ 990/mês** | Ilimitados | Pequeno exportador          |
| **EIP Business**   | **R$ 1.990/mês** | Ilimitados | Exportador recorrente       |
| **EIP Pro**        | **R$ 3.490/mês** | Ilimitados | Operação mais complexa      |
| **EIP Enterprise** |     Sob consulta | Ilimitados | Grandes exportadores/grupos |

A diferença entre planos **não seria quantidade de usuários**. Eu diferenciaria por recursos e/ou volume: número de processos de exportação por mês, armazenamento, quantidade de documentos processados por IA/OCR, integrações, automações, API, compliance avançado e nível de suporte.

Para começar a vender e conseguir os primeiros clientes, eu provavelmente destacaria o **Business por R$ 1.990/mês** como plano principal e permitiria uma condição de lançamento, por exemplo **R$ 1.490/mês durante os primeiros 12 meses** para um grupo limitado de clientes fundadores. Isso evita desvalorizar o produto permanentemente.

### A experiência de contratação

Eu faria o EIP funcionar assim:

**Site do EIP → Criar conta → Cadastrar empresa/CNPJ → Criar administrador → Escolher plano → Aceitar Termos de Uso + Política de Privacidade → Cadastrar cartão → Pagamento aprovado → tenant ativado → administrador convida quantos colaboradores quiser.**

Depois disso, dentro do próprio EIP haveria **Configurações → Assinatura e faturamento**, mostrando plano, preço, próxima cobrança, cartão, histórico de faturas, alteração do cartão e cancelamento.

Para isso, [Stripe](https://stripe.com/br/?utm_source=chatgpt.com) é uma opção bastante adequada. O Stripe Billing atualmente suporta assinaturas, cobrança recorrente, testes, descontos, recuperação de pagamentos e portal para o cliente administrar assinatura e faturamento. A tarifa publicada no Brasil para Billing é 0,7% do volume faturado, além do processamento do pagamento; a página de preços atualmente informa 3,99% mais uma tarifa fixa para cartões nacionais. ([Stripe][1])

Mais importante: **eu não armazenaria número de cartão dentro do banco do EIP**. O provedor de pagamentos deve tokenizar e manter esses dados.

### Inadimplência: não apague os dados

Aqui eu mudaria um pouco sua ideia para criar uma experiência empresarial muito mais segura.

Se a cobrança falhar, eu faria:

**Dia 0:** cobrança recusada → avisar administrador e tentar novamente.

**Dias 1–7:** sistema continua funcionando normalmente e solicita atualização do cartão.

**Dias 8–15:** avisos mais fortes de inadimplência.

**Após 15 dias:** tenant entra em **modo suspenso/read-only**. O cliente não cria novas exportações nem executa processos, mas ainda consegue entrar em uma área restrita para regularizar pagamento e solicitar/exportar seus dados.

**Após 60 ou 90 dias:** possibilidade de encerramento definitivo da conta, conforme previsto contratualmente, respeitando obrigações legais de conservação.

Isso é muito melhor do que simplesmente bloquear tudo no primeiro cartão recusado.

### E a propriedade dos dados?

Eu deixaria isso extremamente claro no contrato.

Algo conceitualmente assim:

> Os dados, documentos e informações inseridos pelo CLIENTE no EIP permanecem sob domínio e responsabilidade do CLIENTE. A contratação do EIP não transfere à CONTRATADA a propriedade sobre tais conteúdos.

Mas juridicamente é importante separar **propriedade contratual dos dados empresariais** de **titularidade de dados pessoais pela LGPD**. A LGPD define papéis de controlador e operador e assegura direitos aos titulares de dados pessoais; em muitos tratamentos realizados dentro do EIP para uma empresa cliente, o cliente poderá atuar como controlador e o EIP como operador, conforme o caso. ([Planalto][2])

A LGPD também estabelece direitos relacionados a acesso, correção, eliminação e portabilidade de dados pessoais, observadas as condições legais. ([Planalto][2])

### O backup na saída é uma excelente ideia

Eu transformaria isso em um diferencial comercial do EIP:

**“Seus dados são seus. Sempre.”**

Quando a empresa cancelar ou tiver sua assinatura definitivamente encerrada, poderia solicitar um **Pacote de Exportação EIP**, contendo, conforme aplicável:

* banco de dados lógico da empresa em CSV/JSON;
* invoices;
* documentos de exportação;
* certificados;
* arquivos anexados;
* cadastros de produtos/NCM;
* clientes e fornecedores;
* operações e histórico;
* registros financeiros pertinentes;
* documentos gerados pelo EIP.

Eu evitaria prometer entregar literalmente um **dump completo do banco de dados**, porque seu banco multi-tenant poderá conter estruturas internas, propriedade intelectual, metadados do EIP e eventualmente referências compartilhadas.

A obrigação contratual melhor seria entregar **todos os dados pertencentes ao tenant em formato estruturado, interoperável e legível por máquina**, juntamente com os arquivos/documentos correspondentes.

### Termos de Uso

Seu contrato precisa ter pelo menos: objeto e licença de uso; definição da empresa contratante; usuários ilimitados; planos e preços; cobrança recorrente; reajuste; inadimplência; suspensão; cancelamento; propriedade intelectual do EIP; propriedade dos dados do cliente; exportação/backup; prazo de retenção; exclusão; confidencialidade; LGPD; controlador/operador; segurança; disponibilidade/SLA; integrações externas; IA; limitações de responsabilidade; uso indevido; suporte; rescisão; alterações contratuais; legislação e foro.

E eu criaria **dois documentos separados**:

**Termos de Uso/Contrato SaaS do EIP** + **Política de Privacidade e Proteção de Dados**.

Dependendo dos clientes que você pretende atender, também vale ter um **DPA/Anexo de Tratamento de Dados Pessoais** para contratos empresariais maiores.

A LGPD prevê inclusive regras sobre término do tratamento e hipóteses nas quais determinados dados podem ou devem ser conservados após o encerramento. Portanto, o contrato não deveria simplesmente dizer que “todo dado será apagado imediatamente”. ([Planalto][2])

### Uma arquitetura comercial que eu acho especialmente boa para o EIP

Eu faria o **CNPJ ser a unidade de licenciamento**:

**1 CNPJ = 1 assinatura EIP = usuários ilimitados.**

Dentro desse tenant:

`Empresa → Administrador → usuários ilimitados → perfis/permissões → RBAC`

Ou seja, o fato de não cobrar por usuário **não significa abrir mão de controle de usuários**. Você continua tendo administrador, gestor, operador, financeiro, compliance, somente leitura etc.; apenas não cobra por cadeira.

E existe uma oportunidade comercial interessante: **CNPJ adicional do mesmo grupo econômico** poderia custar, por exemplo, +R$ 500 ou +R$ 700/mês, em vez de exigir uma nova assinatura completa.

---

Eu acho que você chegou em um ponto importante do EIP: **não estamos mais falando somente de terminar o software. Estamos falando de transformar o EIP em um produto comercial que uma empresa consegue conhecer, contratar, pagar, usar e cancelar sem depender de você fazer tudo manualmente.**

Eu estruturaria agora quatro frentes em paralelo: **(1) planos e precificação definitiva, (2) fluxo completo de assinatura/pagamento/suspensão no sistema, (3) Termos de Uso + Política de Privacidade + DPA e (4) site comercial do EIP com página de preços e “Começar agora”.**

E, para a primeira versão, eu colocaria **R$ 990 / R$ 1.990 / R$ 3.490** como base de trabalho. Depois dos primeiros 10–20 clientes, você terá dados reais para recalibrar os preços.

Se você quiser, o próximo passo pode ser eu desenhar **a especificação completa dessa nova área do EIP**, incluindo telas, banco de dados, status da assinatura, webhooks de pagamento, regras de bloqueio/desbloqueio, planos e o texto-base dos Termos de Uso. Isso já pode ficar em formato de requisito para você passar diretamente para o desenvolvimento.

[1]: https://stripe.com/br/pricing?utm_source=chatgpt.com "Preços e tarifas"
[2]: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm?utm_source=chatgpt.com "L13709compilado"

Perfeito. Eu transformaria isso em um **novo módulo comercial do EIP: “Assinatura & Licenciamento SaaS”**, já pensando em algo que seu desenvolvedor possa implementar.

## 1. Modelo comercial do EIP

A licença deve pertencer à **empresa/tenant**, e não ao usuário.

Minha sugestão inicial:

| Plano          |       Mensal |         Anual |   Usuários |
| -------------- | -----------: | ------------: | ---------: |
| **Start**      |       R$ 990 |      R$ 9.900 | Ilimitados |
| **Business** ⭐ | **R$ 1.990** | **R$ 19.900** | Ilimitados |
| **Pro**        |     R$ 3.490 |     R$ 34.900 | Ilimitados |
| **Enterprise** | Sob consulta |  Sob consulta | Ilimitados |

No anual, aproximadamente dois meses de desconto.

Eu ainda criaria o **Programa Cliente Fundador EIP**: Business por **R$ 1.490/mês durante 12 meses** para, por exemplo, os primeiros 20 clientes. Depois, preço normal.

A cobrança continuaria sendo por empresa, mas cada plano teria limites de **processos/operações, documentos, armazenamento, IA/OCR, integrações e APIs**. Assim você não penaliza a empresa por contratar mais funcionários.

## 2. Jornada de contratação

A experiência que eu colocaria no site seria:

**Conhece EIP → Teste/Demonstração → Criar conta → Dados da empresa → Plano → Termos → Pagamento → Ativação imediata → Primeiro acesso.**

Depois de clicar em **“Começar agora”**, o usuário informa CNPJ, razão social, nome fantasia, nome do responsável, CPF do responsável quando necessário, e-mail corporativo, telefone e senha.

Na tela seguinte:

> **Escolha seu plano**
>
> ☑ Start — R$ 990/mês
> ☑ Business — R$ 1.990/mês
> ☑ Pro — R$ 3.490/mês
>
> **Usuários ilimitados em todos os planos.**

Depois:

> ☑ Li e aceito os **Termos de Uso e Contrato de Licenciamento SaaS do EIP**
> ☑ Declaro ter lido a **Política de Privacidade**
> ☑ Autorizo a cobrança recorrente do plano contratado.

É importante registrar no banco **versão dos termos, data/hora, usuário responsável e evidência técnica apropriada do aceite**.

## 3. Pagamento

Eu integraria o EIP inicialmente com [Stripe](https://stripe.com/br/?utm_source=chatgpt.com).

O Billing suporta assinatura, diferentes modelos de preço, cobrança recorrente, descontos, períodos de teste e gerenciamento do ciclo da assinatura. ([Stripe][1])

E a própria Stripe oferece **Customer Portal**, no qual o cliente pode atualizar forma de pagamento, consultar faturas e administrar sua assinatura. ([Suporte Stripe][2])

Isso permite que o EIP tenha:

**Configurações → Assinatura e faturamento**

mostrando plano atual, situação da assinatura, valor, próxima cobrança, forma de pagamento, histórico e botões como **Alterar cartão**, **Alterar plano** e **Cancelar assinatura**.

O EIP **não deve armazenar os dados brutos do cartão**. O PSP deve cuidar dessa parte.

## 4. Status da assinatura no EIP

Eu criaria estes estados:

```text
TRIAL
ACTIVE
PAYMENT_FAILED
GRACE_PERIOD
SUSPENDED
CANCELED
TERMINATED
```

E separaria isso do status operacional do tenant:

```text
FULL_ACCESS
READ_ONLY
BILLING_ONLY
DISABLED
```

Essa separação é importante.

Por exemplo:

```text
ACTIVE
→ FULL_ACCESS

PAYMENT_FAILED
→ FULL_ACCESS

GRACE_PERIOD
→ FULL_ACCESS + ALERTA

SUSPENDED
→ READ_ONLY

CANCELED ainda dentro do período pago
→ FULL_ACCESS

TERMINATED
→ BILLING_ONLY / EXPORT_DATA
```

## 5. Régua de inadimplência

Eu usaria uma política como:

**D+0:** cobrança recusada → aviso por e-mail e dentro do EIP.

**D+3:** nova tentativa + alerta.

**D+7:** nova tentativa + aviso de risco de suspensão.

**D+15:** assinatura suspensa.

Quando suspenso, o cliente não consegue criar ou modificar operações, mas consegue acessar **Faturamento**, regularizar o pagamento e acessar os mecanismos previstos para obtenção dos seus dados.

Se pagar:

**webhook → pagamento confirmado → ACTIVE → FULL_ACCESS automaticamente.**

A Stripe possui recursos para lembretes e novas tentativas de pagamentos malsucedidos. ([Stripe][3])

## 6. Webhooks

Eu não confiaria no navegador para determinar se uma empresa está paga.

O backend recebe eventos do provedor de pagamentos e atualiza a assinatura.

Arquitetura:

```text
STRIPE
   ↓
/api/webhooks/stripe
   ↓
Billing Service EIP
   ↓
Subscription
   ↓
Tenant License
   ↓
Permission Middleware
```

Entre os eventos relevantes estarão alterações da assinatura, pagamentos confirmados, pagamentos malsucedidos e cancelamentos. A própria documentação da Stripe orienta o acompanhamento do ciclo da assinatura por webhooks. ([Suporte Stripe][4])

E todos os eventos devem ser **idempotentes**, para o mesmo webhook não gerar duas operações.

## 7. Estrutura de banco

Eu criaria algo próximo disto:

```text
TENANT
id
cnpj
razao_social
nome_fantasia
status
created_at

SUBSCRIPTION
id
tenant_id
plan_id
provider
provider_customer_id
provider_subscription_id
status
billing_cycle
current_period_start
current_period_end
grace_period_end
cancel_at_period_end
created_at
updated_at

PLAN
id
code
name
monthly_price
annual_price
active

PLAN_LIMIT
plan_id
feature
limit
unit

PAYMENT
id
tenant_id
subscription_id
provider_payment_id
amount
status
due_date
paid_at

TERMS_ACCEPTANCE
id
tenant_id
user_id
terms_version
privacy_version
accepted_at
ip_address
evidence_hash

DATA_EXPORT
id
tenant_id
requested_by
status
requested_at
expires_at
download_reference

BILLING_EVENT
id
tenant_id
provider
event_id
event_type
payload_hash
processed_at
```

E principalmente: **todas as tabelas de negócio devem possuir `tenant_id`**, direta ou indiretamente, com isolamento robusto entre clientes.

## 8. Usuários ilimitados ≠ acesso sem controle

Esse ponto é fundamental.

O EIP pode anunciar:

> **Usuários ilimitados. Sem cobrança por usuário.**

Mas internamente continuará tendo RBAC/ABAC.

Exemplo:

```text
ADMINISTRADOR
DIRETOR
COMEX
LOGÍSTICA
FINANCEIRO
COMPLIANCE
OPERADOR
CONSULTA
AUDITOR
```

O administrador da empresa poderá criar 5, 20 ou 100 usuários sem mudar a mensalidade.

Isso vira inclusive argumento comercial:

> **O EIP cresce junto com sua equipe. Você não paga mais porque contratou mais pessoas.**

## 9. Proteção contra compartilhamento da licença

Usuários ilimitados **dentro da empresa contratante**, não usuários ilimitados para terceiros.

Os Termos devem deixar claro que a licença corresponde ao CNPJ/organização contratante e suas condições contratuais.

Você pode vender:

**CNPJ principal:** incluso.

**CNPJ adicional do mesmo grupo:** +R$ 500/mês, por exemplo.

**Grupo empresarial:** negociação Enterprise.

Isso evita que uma trading compre uma licença e simplesmente disponibilize o EIP para dezenas de empresas juridicamente independentes fora do modelo contratado.

---

# 10. Termos de Uso/Contrato SaaS

Abaixo está uma primeira base que depois deverá receber os dados da empresa proprietária do EIP e passar por revisão jurídica antes da publicação.

# TERMOS DE USO E LICENCIAMENTO DE SOFTWARE COMO SERVIÇO – EIP

**Versão 1.0**

Estes Termos disciplinam a contratação e utilização da plataforma EIP – Export Integration Platform pela pessoa jurídica identificada no momento da contratação, doravante denominada **CONTRATANTE**, e pela empresa responsável pela disponibilização e operação da plataforma EIP, doravante denominada **CONTRATADA**.

## 1. OBJETO

1.1. O presente instrumento tem por objeto a concessão à CONTRATANTE de licença temporária, limitada, não exclusiva, não transferível e condicionada à manutenção de assinatura válida para acesso à plataforma EIP, disponibilizada no modelo Software as a Service – SaaS.

1.2. A contratação não implica transferência de propriedade intelectual, código-fonte ou qualquer direito de propriedade sobre a plataforma EIP.

## 2. LICENÇA POR EMPRESA

2.1. A assinatura do EIP será vinculada à pessoa jurídica ou organização identificada durante a contratação.

2.2. Salvo disposição específica do plano contratado, não haverá cobrança individual por usuário, podendo a CONTRATANTE cadastrar os usuários necessários à sua operação.

2.3. Os usuários cadastrados deverão possuir vínculo ou autorização legítima da CONTRATANTE.

2.4. A utilização da mesma assinatura por outras pessoas jurídicas independentes poderá depender da contratação de licenças adicionais, conforme condições comerciais vigentes.

## 3. PLANOS E PAGAMENTO

3.1. O acesso ao EIP dependerá da contratação e manutenção de plano de assinatura válido.

3.2. Os valores, periodicidade, funcionalidades, limites e demais condições comerciais aplicáveis serão aqueles apresentados à CONTRATANTE no momento da contratação.

3.3. Nas contratações recorrentes, a CONTRATANTE autoriza a realização das cobranças correspondentes conforme a periodicidade selecionada e as condições apresentadas na contratação.

3.4. Alterações de preços e reajustes observarão o contrato, a legislação aplicável e eventual comunicação prévia exigível.

## 4. INADIMPLÊNCIA

4.1. A ausência de pagamento poderá resultar na limitação ou suspensão temporária de determinadas funcionalidades ou do acesso operacional ao EIP, observados os prazos e comunicações estabelecidos pela CONTRATADA.

4.2. Sempre que tecnicamente e juridicamente aplicável, antes da suspensão serão realizadas tentativas razoáveis de comunicação à CONTRATANTE para regularização do pagamento.

4.3. A regularização dos valores pendentes poderá resultar na reativação do acesso, observadas as condições comerciais aplicáveis.

## 5. DADOS DA CONTRATANTE

5.1. A contratação do EIP não transfere à CONTRATADA direitos de propriedade sobre informações, documentos, arquivos e demais conteúdos empresariais inseridos pela CONTRATANTE na plataforma.

5.2. A CONTRATANTE permanece responsável pela legitimidade, qualidade e legalidade dos dados e documentos que inserir, importar ou tratar por meio do EIP.

5.3. A CONTRATADA poderá tratar os dados na medida necessária à prestação, segurança, manutenção, suporte e evolução dos serviços, respeitada a legislação aplicável e a Política de Privacidade.

## 6. EXPORTAÇÃO DOS DADOS

6.1. Em caso de encerramento da assinatura, a CONTRATANTE poderá solicitar, durante o período previsto nestes Termos ou nas condições comerciais aplicáveis, a exportação dos dados empresariais mantidos no EIP e pertencentes ao seu ambiente.

6.2. A exportação poderá ser fornecida em formatos estruturados e tecnicamente razoáveis, tais como CSV, JSON, PDF e/ou os formatos originais dos documentos armazenados, conforme a natureza da informação.

6.3. O direito de exportação não implica fornecimento do código-fonte, estruturas proprietárias internas, algoritmos, modelos, informações de outros clientes ou demais elementos integrantes da propriedade intelectual da CONTRATADA.

## 7. RETENÇÃO E EXCLUSÃO

7.1. Após o encerramento definitivo da relação contratual, os dados poderão permanecer armazenados durante período de retenção definido pela CONTRATADA, observadas obrigações legais, regulatórias, de segurança e demais hipóteses legítimas de conservação.

7.2. Decorrido o período aplicável, os dados poderão ser eliminados ou anonimizados, ressalvadas as hipóteses em que sua conservação seja necessária ou permitida pela legislação.

## 8. PROTEÇÃO DE DADOS PESSOAIS

8.1. As partes comprometem-se a cumprir a legislação aplicável de proteção de dados pessoais, inclusive a Lei nº 13.709/2018 – Lei Geral de Proteção de Dados Pessoais – LGPD.

8.2. Quando a CONTRATADA tratar dados pessoais em nome e de acordo com as instruções da CONTRATANTE, os papéis e responsabilidades das partes serão definidos conforme a legislação aplicável e, quando necessário, por instrumento específico de tratamento de dados.

8.3. A CONTRATADA adotará medidas técnicas e administrativas apropriadas para proteção dos dados tratados na plataforma, consideradas a natureza das informações, os riscos envolvidos e o estado da técnica.

## 9. SEGURANÇA

9.1. A CONTRATADA adotará mecanismos razoáveis de segurança destinados à proteção da confidencialidade, integridade e disponibilidade da plataforma e das informações nela armazenadas.

9.2. A CONTRATANTE é responsável pela gestão dos usuários, credenciais, permissões e dispositivos utilizados para acessar seu ambiente, sem prejuízo dos controles de segurança disponibilizados pelo EIP.

## 10. PROPRIEDADE INTELECTUAL

10.1. A plataforma EIP, incluindo código, arquitetura, interfaces, identidade visual, funcionalidades, fluxos, modelos, algoritmos, documentação e demais componentes de propriedade da CONTRATADA são protegidos pela legislação aplicável.

10.2. A licença concedida à CONTRATANTE limita-se ao direito de utilização do serviço durante a vigência da assinatura.

## 11. INTELIGÊNCIA ARTIFICIAL

11.1. Determinadas funcionalidades do EIP poderão utilizar inteligência artificial para classificação, extração, tradução, geração, análise, recomendação ou processamento de informações.

11.2. Resultados produzidos por sistemas automatizados poderão exigir validação humana, especialmente quando relacionados a informações fiscais, aduaneiras, financeiras, regulatórias, logísticas ou de compliance.

11.3. A utilização de funcionalidades de inteligência artificial não substitui as verificações e responsabilidades profissionais e empresariais aplicáveis à operação da CONTRATANTE.

## 12. INTEGRAÇÕES COM TERCEIROS

12.1. O EIP poderá integrar-se a sistemas, APIs e serviços de terceiros.

12.2. A disponibilidade de integrações externas poderá depender dos respectivos provedores, de suas APIs, autorizações, credenciais e políticas.

## 13. DISPONIBILIDADE E MANUTENÇÃO

13.1. A CONTRATADA empregará esforços tecnicamente razoáveis para manter a plataforma disponível e segura.

13.2. Poderão ocorrer indisponibilidades relacionadas a manutenção programada ou emergencial, falhas de infraestrutura, serviços de terceiros, eventos de segurança ou circunstâncias fora do controle razoável da CONTRATADA.

## 14. CANCELAMENTO

14.1. A CONTRATANTE poderá solicitar o cancelamento da assinatura pelos meios disponibilizados pela plataforma, observadas as condições do plano contratado.

14.2. O cancelamento não prejudicará obrigações financeiras já constituídas.

14.3. Encerrada a assinatura, serão aplicadas as regras de acesso, retenção e exportação de dados previstas neste instrumento.

## 15. RESPONSABILIDADES DA CONTRATANTE

A CONTRATANTE compromete-se a utilizar o EIP de forma lícita, manter suas informações cadastrais atualizadas, administrar adequadamente os acessos concedidos aos seus usuários e não utilizar a plataforma para violação de direitos de terceiros ou prática de atividades ilícitas.

## 16. ALTERAÇÕES

Estes Termos poderão ser atualizados para refletir alterações legais, regulatórias, técnicas ou comerciais, observados os deveres de informação e demais requisitos da legislação aplicável.

## 17. DISPOSIÇÕES GERAIS

A eventual invalidade de determinada disposição não prejudicará as demais cláusulas deste instrumento.

As partes buscarão solucionar de boa-fé eventuais divergências decorrentes da utilização ou contratação do EIP.

A legislação aplicável, foro e demais condições jurídicas específicas serão definidos na versão contratual definitiva, observadas as normas cogentes aplicáveis.

---

**ACEITE ELETRÔNICO**

Ao selecionar a opção correspondente a “Li e aceito os Termos de Uso e Contrato de Licenciamento SaaS do EIP” e concluir a contratação, o representante declara possuir poderes para contratar em nome da organização informada e manifesta sua concordância com estes Termos.

Há uma razão para eu ter deixado algumas cláusulas mais prudentes: a LGPD distingue **controlador e operador** e determina que o operador trate dados conforme as instruções do controlador. Ela também contém regras específicas para término do tratamento e conservação. ([Planalto][5]) Por isso, antes de colocar esse documento em produção, vale revisão de advogado especializado em contratos SaaS/LGPD.

## 11. Uma decisão importante sobre backup

Eu estabeleceria no produto:

> **Após encerramento: 30 dias para exportação dos dados.**

E permitiria gerar:

```text
EIP_EXPORT_EMPRESA_XXXXXXXX_2026.zip

/empresa
/produtos
/clientes
/fornecedores
/exportacoes
/lotes
/documentos
/invoices
/logistica
/financeiro
/compliance
/auditoria
/metadata
manifest.json
```

O `manifest.json` explica versão, data da exportação, estrutura e arquivos.

Depois do período de retenção, ocorre o procedimento de eliminação/anonimização aplicável, ressalvadas as informações cuja conservação seja legalmente necessária. Isso conversa melhor com as regras da LGPD sobre término do tratamento. ([Planalto][5])

## 12. E eu acrescentaria uma coisa ao seu projeto

Criaria um **EIP Subscription Command Center** exclusivo para você.

Ali você enxergaria:

**MRR** | **ARR** | empresas ativas | trials | inadimplentes | cancelamentos | receita mensal | plano por cliente | data da próxima cobrança | falhas de pagamento | empresas suspensas | consumo de IA | armazenamento | exportações de dados solicitadas.

Isso transforma o EIP de um sistema que você desenvolveu em um **SaaS efetivamente administrável**.

A primeira meta comercial poderia ser bem objetiva: **10 clientes Business × R$ 1.990 = R$ 19.900 de MRR**; 50 clientes nesse mesmo ticket seriam **R$ 99.500 de MRR**, antes de considerar descontos, impostos, custos, churn e mistura de planos.

Eu também acho interessante integrar diretamente o Stripe durante o desenvolvimento. O portal já permite ao cliente atualizar pagamento, consultar faturas e administrar assinaturas, reduzindo bastante o que você precisa construir do zero. ([Suporte Stripe][2])

[Documentação do Stripe Billing](https://docs.stripe.com/billing?utm_source=chatgpt.com)

O próximo passo técnico é transformar tudo isso em um **documento de requisitos do módulo “EIP SaaS & Billing”**, tela por tela e API por API, incluindo histórias de usuário, endpoints, tabelas, webhooks, regras de negócio, critérios de aceite e fluxo visual. Esse documento já pode virar praticamente o prompt/especificação para a IA ou equipe que está desenvolvendo seu EIP.

[1]: https://stripe.com/br/billing/features?utm_source=chatgpt.com "Stripe Billing | Modelos de assinaturas, recursos e mais"
[2]: https://support.stripe.com/questions/billing-customer-portal?locale=pt-BR&utm_source=chatgpt.com "Portal de clientes do Billing : Stripe: Ajuda e suporte"
[3]: https://stripe.com/br/billing/pricing?utm_source=chatgpt.com "Stripe Billing | Precificação"
[4]: https://support.stripe.com/questions/how-to-determine-when-a-subscription-cycles-using-webhooks?locale=pt-BR&utm_source=chatgpt.com "Como determinar quando um ciclo de assinatura usa webhooks : Stripe: Ajuda e suporte"
[5]: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm?utm_source=chatgpt.com "L13709compilado"

Continuando, eu transformaria a especificação anterior em requisitos práticos para o desenvolvimento.

## 13. Módulo `EIP SaaS & Billing`

Ele deve ser um módulo transversal da plataforma. Praticamente toda requisição autenticada passa por uma validação:

```text
Usuário autenticado
      ↓
Identifica Tenant
      ↓
Consulta licença/assinatura
      ↓
Assinatura permite operação?
      ↓
SIM → continua
NÃO → aplica READ_ONLY / BILLING_ONLY
```

Eu evitaria consultar a Stripe a cada ação. O **EIP mantém o estado local da assinatura**, atualizado por webhooks da Stripe.

### Backend

Eu separaria pelo menos estes serviços:

```text
BillingService
SubscriptionService
PlanService
EntitlementService
PaymentService
DataExportService
TermsService
TenantLicenseService
```

O `EntitlementService` é particularmente importante. Em vez do código perguntar:

```text
if plan == "PRO"
```

ele pergunta:

```text
canUse("AI_OCR")
canUse("API_ACCESS")
canUse("ADVANCED_COMPLIANCE")
canUse("ERP_INTEGRATION")
canCreateExport()
```

Isso permite mudar seus planos no futuro sem reescrever o EIP.

---

## 14. Tela pública de preços

Eu criaria:

```text
/precos
```

Com três cards principais.

### START

**R$ 990/mês**

Para empresas iniciando ou com menor volume de exportações.

Usuários ilimitados, gestão de exportações, produtos/NCM, documentos, logística básica, financeiro básico, dashboard e IA essencial.

### BUSINESS — MAIS ESCOLHIDO

**R$ 1.990/mês**

Tudo do Start + automações, IA avançada, OCR, compliance, workflow, BI, integrações e maior capacidade operacional.

### PRO

**R$ 3.490/mês**

Tudo do Business + API, integrações avançadas, compliance avançado, auditoria avançada, maiores limites de IA/documentos e suporte prioritário.

Em todos:

> **Usuários ilimitados. O EIP cobra pela operação da sua empresa, não pelo tamanho da sua equipe.**

Esse pode virar um dos principais argumentos comerciais do EIP.

---

## 15. Eu faria uma alteração na precificação

Pensando melhor no seu produto, **não colocaria limite de quantidade de exportações no Business e Pro**.

Isso cria uma situação ruim: justamente quando o cliente começa a usar muito o EIP e perceber valor, você o pune.

Eu faria:

**Start:** limites de volume.

**Business:** exportações ilimitadas para o CNPJ contratado, com política de uso razoável para recursos de custo variável.

**Pro:** exportações ilimitadas + recursos avançados.

O que tem custo direto para você — OCR, IA generativa, armazenamento extraordinário, APIs pagas, consultas externas — pode ter franquia.

Por exemplo:

```text
BUSINESS
Exportações: ilimitadas
Usuários: ilimitados
Produtos: ilimitados
Clientes: ilimitados
Documentos armazenados: franquia ampla
IA: 5.000 créditos/mês
OCR: 2.000 páginas/mês
```

Excedente de IA/OCR pode ser comprado adicionalmente.

---

# 16. Checkout

Rota:

```text
/checkout
```

Eu faria apenas quatro etapas.

**1 — Empresa**

CNPJ → consulta/validação cadastral → razão social → nome fantasia.

**2 — Administrador**

Nome → e-mail → telefone → senha/MFA.

**3 — Plano**

Mensal/anual → Start/Business/Pro → cupom, quando aplicável.

**4 — Pagamento e aceite**

Resumo:

```text
EIP Business

R$ 1.990,00/mês
Usuários ilimitados
Renovação automática

[ Dados do cartão ]

☑ Termos de Uso
☑ Política de Privacidade

[ CONTRATAR E ATIVAR EIP ]
```

Pagamento confirmado:

> **🎉 Sua empresa agora está no EIP**
>
> Sua assinatura Business está ativa.
>
> Vamos configurar sua primeira operação?
>
> **[COMEÇAR CONFIGURAÇÃO]**

---

# 17. Onboarding

Aqui existe uma oportunidade enorme.

Depois da compra, **não jogue o cliente diretamente no dashboard vazio**.

Abra um assistente:

```text
Bem-vindo ao EIP

Vamos configurar sua empresa.

✓ Empresa
○ Dados fiscais
○ Produtos
○ Clientes
○ Integrações
○ Usuários
○ Primeira exportação
```

E a IA do EIP acompanha:

> **Olá, Alan. Eu sou o assistente EIP. Posso ajudar sua empresa a configurar a plataforma e preparar a primeira operação de exportação.**

O cliente precisa chegar ao primeiro resultado útil rapidamente.

---

# 18. Trial

Eu **não daria 30 dias gratuitos** para qualquer pessoa entrar e consumir IA/OCR.

Para um SaaS B2B desse tipo, eu testaria:

### 14 dias gratuitos

Mas exigindo:

**CNPJ + e-mail corporativo + telefone + cartão.**

E:

> Você não será cobrado durante o período de avaliação. Cancele antes do término para evitar a primeira cobrança.

Também poderia existir:

**“Agendar demonstração”**

para empresas que não querem inserir cartão antes de conhecer o sistema.

---

# 19. Área `Minha assinatura`

Dentro do EIP:

```text
Configurações
 └── Assinatura e faturamento
```

Tela:

```text
PLANO ATUAL

EIP Business
R$ 1.990/mês

Status: ● ATIVO

Próxima cobrança:
16/10/2026

Forma de pagamento:
Mastercard •••• 1234

[ ALTERAR FORMA DE PAGAMENTO ]

────────────────────────

USO DO PLANO

IA
████████░░ 3.920 / 5.000 créditos

OCR
██████░░░░ 1.180 / 2.000 páginas

Armazenamento
████░░░░░░ 21 GB / 100 GB

────────────────────────

[ HISTÓRICO DE FATURAS ]
[ ALTERAR PLANO ]
[ CANCELAR ASSINATURA ]
```

---

# 20. Não permita downgrade destrutivo

Imagine:

Cliente Pro possui uma integração que Start não suporta.

Ele solicita downgrade.

Nunca apague os dados.

A regra deve ser:

```text
PRO → START

Dados existentes:
PRESERVADOS

Funcionalidade Pro:
READ_ONLY ou INATIVA

Novos dados usando recurso Pro:
BLOQUEADOS
```

Se voltar ao Pro, tudo reaparece.

---

# 21. Cancelamento

Eu evitaria dificultar propositalmente.

O cliente clica:

**Cancelar assinatura**

O EIP pergunta o motivo:

```text
○ Preço
○ Não estou utilizando
○ Faltam funcionalidades
○ Problemas técnicos
○ Migrei para outro sistema
○ Outro
```

Depois:

> Sua assinatura permanecerá ativa até **16/10/2026**.
>
> Após essa data, sua empresa não poderá criar ou alterar operações.
>
> Seus dados serão mantidos pelo período contratualmente previsto para permitir sua exportação.

Botões:

**Manter assinatura**

**Confirmar cancelamento**

Esses motivos de cancelamento também alimentam seu dashboard de produto.

---

# 22. Exportação dos dados

Na área:

```text
Configurações
→ Dados da empresa
→ Exportar meus dados
```

Botão:

**GERAR PACOTE DE DADOS**

O sistema cria um job assíncrono:

```text
REQUESTED
↓
PROCESSING
↓
READY
↓
EXPIRED
```

E registra auditoria completa.

Eu adicionaria:

> O pacote poderá conter informações confidenciais da sua empresa. Por segurança, somente administradores autorizados podem solicitar a exportação.

E exigiria **MFA novamente** para gerar/baixar o pacote.

---

# 23. Suspensão por inadimplência

A experiência precisa ser profissional.

Não mostrar:

> ACESSO BLOQUEADO!

Eu usaria:

> ### Assinatura pendente
>
> Não identificamos a regularização da assinatura da sua empresa.
>
> Para proteger a continuidade dos seus dados, nenhuma informação foi excluída.
>
> Regularize a assinatura para restaurar todas as funcionalidades do EIP.
>
> **[REGULARIZAR PAGAMENTO]**
>
> **[EXPORTAR DADOS]**

O cliente inadimplente pode visualizar seus dados, mas não alterar processos, conforme a política contratual definida.

---

# 24. Reativação automática

Isso deve acontecer sem você.

```text
Pagamento confirmado
      ↓
Stripe webhook
      ↓
EIP valida assinatura
      ↓
subscription = ACTIVE
      ↓
tenant = FULL_ACCESS
      ↓
cache invalidado
      ↓
acesso restaurado
```

E-mail:

> **Pagamento confirmado**
>
> Identificamos o pagamento da assinatura EIP.
> O acesso completo da sua empresa foi restabelecido.

---

# 25. Segurança do webhook

Isso é obrigatório no requisito técnico.

O endpoint:

```text
POST /api/webhooks/stripe
```

deve validar assinatura/autenticidade do evento e nunca simplesmente acreditar no JSON recebido.

Além disso:

```text
event_id UNIQUE
```

Se a Stripe enviar o mesmo evento várias vezes, o EIP processa uma única vez.

---

# 26. API sugerida

Seu desenvolvedor pode trabalhar aproximadamente com:

```text
POST /api/public/signup
POST /api/checkout/session

GET  /api/billing/plans
GET  /api/billing/subscription
GET  /api/billing/payments
GET  /api/billing/usage

POST /api/billing/change-plan
POST /api/billing/cancel
POST /api/billing/reactivate
POST /api/billing/customer-portal

POST /api/data-export
GET  /api/data-export/:id

GET  /api/legal/terms/current
POST /api/legal/terms/accept

POST /api/webhooks/stripe
```

Todos os endpoints internos devem derivar o `tenant_id` da identidade autenticada.

**Nunca aceite simplesmente:**

```text
tenant_id = request.body.tenant_id
```

para decidir de qual empresa ler dados.

Isso é essencial para evitar vazamento entre tenants.

---

# 27. Controle de funcionalidades

Eu criaria uma tabela de `FEATURES`.

Exemplo:

```text
EXPORT_MANAGEMENT
PRODUCT_CATALOG
DOCUMENT_MANAGEMENT
AI_ASSISTANT
AI_OCR
AI_TRANSLATION
AI_NCM
COMPLIANCE_BASIC
COMPLIANCE_ADVANCED
WORKFLOW_DESIGNER
BI_ADVANCED
ERP_INTEGRATION
BANK_INTEGRATION
API_ACCESS
AUDIT_ADVANCED
```

E:

```text
PLAN_FEATURE

START → AI_ASSISTANT
BUSINESS → AI_ASSISTANT
BUSINESS → AI_OCR
PRO → API_ACCESS
...
```

Assim amanhã você pode lançar:

**EIP Customs**, **EIP Agro**, **EIP Trading**, **EIP Enterprise**

sem reconstruir o sistema de cobrança.

---

# 28. Command Center comercial para você

Eu colocaria no seu ambiente de Super Admin:

```text
EIP BUSINESS COMMAND CENTER

MRR                 R$ 37.810
ARR                 R$ 453.720

Empresas ativas          21
Trials                     8
Inadimplentes              2
Cancelamentos              1

MRR por plano

Start       R$  6.930
Business    R$ 23.880
Pro         R$  6.980

CHURN
1,7%

ARPA
R$ 1.800

──────────────

⚠ 2 pagamentos com falha
⚠ 1 trial termina amanhã
⚠ Empresa XYZ atingiu 90% da franquia IA
```

E a IA do próprio EIP pode começar a analisar **seu próprio SaaS**:

> “O MRR cresceu 12,4% neste mês. Três clientes Business ultrapassaram 80% da franquia de IA e são potenciais candidatos ao Pro.”

Isso combina perfeitamente com a filosofia de IA transversal que você já definiu para o EIP.

## 29. Métricas que eu colocaria desde o primeiro cliente

Não espere ter 100 clientes.

Desde o primeiro dia registre:

**MRR, ARR, ARPA, novos MRR, expansion MRR, contraction MRR, churn MRR, churn de clientes, trial→paid, CAC, LTV, tempo até primeira exportação, usuários ativos por empresa, operações por tenant, consumo de IA, OCR e armazenamento.**

Especialmente:

> **Time to First Value (TTFV)**

Quanto tempo existe entre:

**pagamento → primeira exportação/processo útil criado no EIP.**

Esse indicador pode ser extremamente importante para seu onboarding.

## 30. Próxima etapa do desenvolvimento

Eu dividiria a implementação em cinco sprints:

| Sprint | Entrega                                                         |
| ------ | --------------------------------------------------------------- |
| **1**  | Plans + Subscription + Tenant License + Feature Entitlements    |
| **2**  | Stripe + checkout + cartão + webhooks                           |
| **3**  | tela Assinatura/Faturamento + cancelamento + alteração de plano |
| **4**  | inadimplência + suspensão + reativação + exportação de dados    |
| **5**  | Command Center SaaS + métricas + onboarding + trial             |

Só depois disso eu abriria o **“Compre agora” publicamente**.

A partir daí, o EIP passa a ter um ciclo comercial completo:

**Visitante → Lead → Trial → Empresa → Assinante → Onboarding → Cliente ativo → Renovação → Upgrade/Downgrade → Inadimplência → Recuperação → Cancelamento → Exportação → Retenção/eliminação.**

E há mais uma peça que considero necessária antes de publicar: além dos Termos de Uso que fizemos, precisamos elaborar a **Política de Privacidade completa do EIP e o DPA (Acordo de Tratamento de Dados)**. Depois disso, eu fecharia tudo com uma **especificação única para desenvolvimento**, inclusive os prompts/instruções que você poderá entregar à IA que está programando o EIP.

Vamos fechar agora a camada jurídica/privacidade e depois transformar tudo em um pacote único de implementação.

## 31. Política de Privacidade do EIP

Eu separaria totalmente a Política de Privacidade dos Termos de Uso. A política abaixo é uma **base de produto**, que deve ser completada com razão social, CNPJ, endereço, canal do encarregado/privacidade, fornecedores efetivamente utilizados, prazos de retenção e fluxos reais antes da publicação.

# POLÍTICA DE PRIVACIDADE — EIP EXPORT INTEGRATION PLATFORM

**Versão 1.0**

A presente Política de Privacidade descreve como os dados pessoais podem ser tratados no contexto da plataforma EIP – Export Integration Platform (“EIP”), incluindo seu website, ambiente de contratação, autenticação, suporte e funcionalidades disponibilizadas aos clientes.

## 1. OBJETIVO

O EIP busca tratar dados pessoais de forma compatível com a legislação aplicável, especialmente a Lei nº 13.709/2018 – Lei Geral de Proteção de Dados Pessoais (“LGPD”).

Esta Política deve ser interpretada em conjunto com os Termos de Uso, contratos aplicáveis e, quando existente, instrumento específico de tratamento de dados celebrado com a empresa contratante.

## 2. PAPÉIS NO TRATAMENTO

Dependendo da operação realizada, a empresa responsável pelo EIP poderá atuar em diferentes papéis previstos pela legislação.

Em relação aos dados necessários para cadastro, contratação, cobrança, segurança, relacionamento comercial e administração do próprio serviço, o responsável pelo EIP poderá determinar as finalidades e os meios do tratamento nos limites aplicáveis.

Em relação a determinados dados pessoais inseridos ou tratados pela empresa cliente por meio do EIP, a empresa cliente poderá atuar como controladora e o responsável pelo EIP poderá atuar como operador, tratando dados conforme instruções legítimas da contratante e as condições aplicáveis.

A definição dos papéis dependerá de cada atividade de tratamento.

## 3. DADOS QUE PODERÃO SER TRATADOS

Conforme a utilização do serviço, poderão ser tratados dados como:

* nome;
* e-mail;
* telefone;
* cargo e departamento;
* dados profissionais;
* informações cadastrais de representantes e usuários;
* informações relacionadas à empresa contratante;
* registros de autenticação e segurança;
* endereço IP e registros técnicos;
* histórico de utilização;
* registros de auditoria;
* comunicações com suporte;
* dados contidos em documentos e operações inseridos pelo cliente;
* informações necessárias ao faturamento e à administração da assinatura.

Informações de pagamento poderão ser processadas por prestadores especializados de pagamento. O EIP deverá evitar armazenar números completos de cartões e códigos de segurança quando tais informações puderem ser processadas diretamente pelo provedor de pagamentos.

## 4. FINALIDADES

Os dados poderão ser tratados para:

* criação e administração de contas;
* autenticação e controle de acesso;
* execução do serviço contratado;
* gerenciamento de usuários e permissões;
* processamento de assinatura e faturamento;
* suporte;
* segurança e prevenção de abuso;
* registro de auditoria;
* cumprimento de obrigações legais ou regulatórias;
* exercício regular de direitos;
* manutenção e melhoria do serviço;
* comunicação operacional;
* execução de integrações solicitadas ou habilitadas pelo cliente;
* funcionalidades de inteligência artificial, quando aplicável e devidamente configuradas.

## 5. BASES LEGAIS

O tratamento será realizado com fundamento nas bases legais aplicáveis a cada finalidade, conforme a LGPD, podendo envolver, entre outras hipóteses, execução de contrato, cumprimento de obrigação legal ou regulatória, exercício regular de direitos, legítimo interesse, proteção contra fraude e, quando aplicável, consentimento.

A base jurídica adequada deverá ser determinada conforme a atividade específica de tratamento.

## 6. COMPARTILHAMENTO

Dados poderão ser compartilhados, quando necessário, com prestadores responsáveis por infraestrutura em nuvem, segurança, autenticação, comunicação, suporte, pagamentos, processamento de documentos, inteligência artificial, integrações e outros serviços necessários à operação do EIP.

O compartilhamento deverá ser limitado ao necessário para a finalidade correspondente e sujeito a medidas contratuais e de segurança adequadas.

Dados também poderão ser disponibilizados quando exigido por lei, ordem judicial ou autoridade competente, nos limites aplicáveis.

## 7. INTELIGÊNCIA ARTIFICIAL

O EIP poderá utilizar recursos de inteligência artificial para funcionalidades como extração de informações, OCR, tradução, classificação, geração de documentos, análise, recomendações, pesquisa e assistência aos usuários.

O EIP buscará limitar o envio de informações a fornecedores externos ao necessário para a execução da funcionalidade correspondente.

As condições de utilização de cada fornecedor e os mecanismos de proteção aplicáveis deverão ser avaliados antes de sua integração ao ambiente de produção.

Resultados gerados por inteligência artificial poderão conter imprecisões e devem ser validados pelos usuários quando utilizados em processos fiscais, aduaneiros, financeiros, jurídicos, regulatórios, logísticos ou de compliance.

## 8. SEGURANÇA

Serão adotadas medidas técnicas e administrativas compatíveis com os riscos envolvidos, que poderão incluir:

* criptografia;
* controle de acesso;
* segregação lógica entre empresas;
* autenticação multifator;
* gestão de privilégios;
* registros de auditoria;
* monitoramento;
* cópias de segurança;
* gestão de vulnerabilidades;
* controles de infraestrutura;
* procedimentos de resposta a incidentes.

Nenhum sistema conectado à internet pode ser considerado absolutamente imune a incidentes, razão pela qual os controles serão continuamente avaliados e aprimorados.

## 9. RETENÇÃO

Os dados serão mantidos pelo período necessário ao cumprimento das finalidades para as quais foram tratados, observando obrigações legais, regulatórias, contratuais, prevenção de fraudes, segurança e exercício regular de direitos.

Após o encerramento da contratação, os dados empresariais do cliente poderão permanecer disponíveis durante o período contratualmente estabelecido para exportação.

Após o período aplicável, os dados poderão ser eliminados ou anonimizados, ressalvadas as hipóteses legais de conservação.

## 10. DIREITOS DOS TITULARES

Os titulares poderão exercer os direitos previstos na legislação aplicável, observadas as circunstâncias e os papéis desempenhados em cada tratamento.

Quando o EIP atuar exclusivamente como operador em nome de uma empresa cliente, determinadas solicitações poderão precisar ser direcionadas ou encaminhadas à respectiva empresa controladora.

## 11. TRANSFERÊNCIA INTERNACIONAL

Determinados fornecedores de infraestrutura, tecnologia ou inteligência artificial poderão realizar tratamento ou armazenamento de informações fora do Brasil.

Quando aplicável, serão observados os requisitos legais relacionados à transferência internacional de dados.

## 12. COOKIES E TECNOLOGIAS SEMELHANTES

O website e a plataforma poderão utilizar cookies e tecnologias semelhantes necessários para autenticação, segurança, preferências, funcionamento do serviço e, quando aplicável, análises de utilização.

Cookies não essenciais deverão ser tratados de acordo com os requisitos legais aplicáveis e as configurações disponibilizadas ao usuário.

## 13. ALTERAÇÕES DESTA POLÍTICA

Esta Política poderá ser atualizada para refletir mudanças legais, técnicas ou operacionais.

A versão e a data de vigência deverão permanecer disponíveis aos usuários.

## 14. CONTATO

Solicitações relacionadas à privacidade e proteção de dados poderão ser encaminhadas ao canal de privacidade indicado pela empresa responsável pelo EIP.

Os dados completos do responsável pelo EIP e o canal correspondente serão informados na versão definitiva desta Política.

---

**Última atualização:** [DATA]

**Responsável pelo EIP:** [RAZÃO SOCIAL]

**CNPJ:** [CNPJ]

**Canal de Privacidade:** [E-MAIL]

A LGPD prevê diferentes papéis para controlador e operador e direitos dos titulares, então é importante que o texto final corresponda à arquitetura e aos tratamentos que realmente serão executados. [Lei Geral de Proteção de Dados — texto oficial](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm?utm_source=chatgpt.com)

---

# 32. DPA do EIP

Para pequenas empresas, o aceite dos Termos + Política pode resolver grande parte do fluxo comercial. Mas quando você chegar em uma empresa maior, é bastante provável que TI/Jurídico/Compliance queira saber:

> “Quem é o controlador? Quem é operador? Onde os dados ficam? Existem suboperadores? Como são tratados incidentes? Como ocorre exclusão? Há transferência internacional?”

Por isso eu deixaria um **DPA — Data Processing Agreement** pronto.

Ele seria anexado ao contrato Business/Enterprise quando necessário e estabeleceria: objeto e duração do tratamento; categorias de dados; titulares; finalidade; instruções da contratante; confidencialidade; segurança; suboperadores; incidentes; solicitações de titulares; auditoria; retenção; eliminação; exportação; transferências internacionais e término.

Eu **não publicaria agora um DPA definitivo** sem saber quais fornecedores você realmente utilizará, porque precisamos declarar corretamente AWS/Azure/GCP, OpenAI ou outro provedor de IA, e-mail, OCR, observabilidade, backups etc.

---

# 33. Registro de fornecedores/suboperadores

Crie no próprio EIP uma tabela:

```text
SUBPROCESSOR

id
name
service
purpose
data_categories
processing_country
contract_status
dpa_status
active
created_at
updated_at
```

E no Super Admin:

```text
Governança
   └── Privacidade
        ├── Suboperadores
        ├── Tratamentos
        ├── Termos
        ├── Incidentes
        ├── Solicitações LGPD
        └── Retenção
```

Isso já prepara seu produto para conversar com departamentos de compliance de clientes maiores.

---

# 34. Versionamento jurídico

Não coloque simplesmente um PDF de Termos no site.

Crie:

```text
LEGAL_DOCUMENT

id
type
version
content_hash
published_at
effective_at
status
```

Exemplo:

```text
TERMS_OF_USE      1.0
PRIVACY_POLICY    1.0
DPA               1.0
AI_POLICY         1.0
```

E:

```text
LEGAL_ACCEPTANCE

tenant_id
user_id
document_id
accepted_at
ip_address
user_agent
content_hash
```

Assim, daqui a quatro anos você consegue provar:

> Empresa ABC aceitou a versão 1.7 dos Termos em determinada data.

---

# 35. Mudança importante nos Termos

Eu também acrescentaria uma cláusula específica de **portabilidade/continuidade**, porque isso pode virar um diferencial do EIP.

## CLÁUSULA — PORTABILIDADE, CONTINUIDADE E EXPORTAÇÃO DOS DADOS

A CONTRATANTE permanecerá com direito de acesso aos dados empresariais por ela inseridos ou gerados em decorrência de suas operações no ambiente EIP, observados os limites legais, técnicos e contratuais aplicáveis.

O encerramento ou a suspensão da assinatura por inadimplência não implicará, por si só, transferência da titularidade dos conteúdos empresariais à CONTRATADA.

Durante o período de retenção aplicável, a CONTRATANTE poderá solicitar a geração de pacote de exportação contendo os dados e documentos de seu ambiente em formatos tecnicamente razoáveis e estruturados, conforme a natureza das informações.

A exportação poderá compreender arquivos originais e formatos como CSV, JSON, PDF ou equivalentes, acompanhados, quando tecnicamente aplicável, de arquivo de manifesto descrevendo a estrutura do pacote.

O pacote não incluirá código-fonte, algoritmos, modelos proprietários, estruturas internas protegidas, segredos comerciais, informações de terceiros ou outros componentes integrantes da propriedade intelectual da CONTRATADA.

A CONTRATADA poderá adotar procedimentos adicionais de autenticação e segurança antes de disponibilizar a exportação.

Decorrido o período contratual de retenção, os dados poderão ser eliminados ou anonimizados, ressalvadas as hipóteses em que sua conservação seja exigida ou permitida pela legislação aplicável.

Eu usaria essa cláusula inclusive comercialmente:

> **“No EIP, sua empresa não fica refém do software. Seus dados empresariais continuam sendo seus e existe um processo definido de exportação.”**

Isso transmite segurança para um diretor de comércio exterior que está avaliando migrar processos críticos para seu SaaS.

---

# 36. Página de confiança do EIP

Eu criaria no site:

```text
eip.com.br/trust
```

ou:

```text
eip.com.br/seguranca
```

Com:

**Segurança**
Criptografia, MFA, isolamento multi-tenant, backups, logs, controle de acesso.

**Privacidade**
LGPD, política de privacidade, tratamento de dados.

**Seus dados**
Portabilidade e exportação.

**Disponibilidade**
Monitoramento e infraestrutura.

**IA responsável**
Como informações são processadas pelas funcionalidades de IA.

**Documentos legais**
Termos, Política de Privacidade e DPA.

Isso será particularmente importante quando você começar a apresentar o EIP para empresas maiores.

---

# 37. Página comercial inicial

Seu site poderia ter esta estrutura:

```text
EIP
────────────────────────────────────
Produto | Soluções | IA | Segurança
Preços | Entrar

      SUA EXPORTAÇÃO.
      UMA ÚNICA PLATAFORMA.

Do contrato ao embarque.
Dos documentos ao câmbio.
Da logística ao compliance.

Tudo integrado.
Tudo acompanhado por IA.

[ COMEÇAR AGORA ]
[ AGENDAR DEMONSTRAÇÃO ]

────────────────────────────────────

Contratos
Exportações
Documentos
Logística
Financeiro
Compliance
IA
BI

────────────────────────────────────

USUÁRIOS ILIMITADOS.

Sua empresa cresce.
Sua mensalidade não cresce
porque você contratou mais pessoas.

────────────────────────────────────

PLANOS

Start        Business        Pro
R$990        R$1.990         R$3.490

────────────────────────────────────

SEUS DADOS SÃO SEUS.

Portabilidade e exportação de dados
previstas desde a arquitetura do EIP.

────────────────────────────────────

[ EXPERIMENTE O EIP ]
```

Aqui começamos a transformar suas características técnicas em **argumentos de venda**.

---

# 38. Domínio e ambientes

Eu separaria:

```text
www.eip.com.br
Site comercial

app.eip.com.br
Aplicação

api.eip.com.br
Backend/API

status.eip.com.br
Status

docs.eip.com.br
Documentação/API

help.eip.com.br
Central de ajuda
```

E ambientes:

```text
DEV
STAGING
PRODUCTION
```

Stripe também deve ter ambientes/testes separados da produção.

---

# 39. Não permitir cadastro duplicado do mesmo CNPJ

Essa regra precisa estar no backend.

Se alguém tentar cadastrar:

```text
12.345.678/0001-90
```

e o tenant já existir:

> **Esta empresa já possui uma conta no EIP.**
>
> Solicite acesso ao administrador da sua organização.
>
> [SOLICITAR ACESSO]

Não crie outro tenant automaticamente.

Isso evita duplicação de dados e assinaturas.

---

# 40. Convite de usuários

Administrador:

```text
Configurações
→ Usuários
→ Convidar usuário
```

Informa:

```text
E-mail
Nome
Perfil
```

O usuário recebe um link temporário.

Aceita → cria senha/MFA → entra no tenant.

E, principalmente:

> **R$ 0,00 por usuário adicional.**

Você pode até mostrar isso no botão:

```text
+ CONVIDAR USUÁRIO
Sem custo adicional
```

Isso reforça constantemente seu posicionamento comercial.

---

# 41. Auditoria

Para um sistema de comércio exterior, eu trataria auditoria como parte central.

Registrar:

```text
AUDIT_LOG

tenant_id
user_id
timestamp
action
resource
resource_id
before_hash
after_hash
ip
user_agent
correlation_id
```

Exemplos:

```text
USER_INVITED
USER_REMOVED
INVOICE_CREATED
INVOICE_CHANGED
EXPORT_CREATED
DOCUMENT_DELETED
PAYMENT_CHANGED
PLAN_CHANGED
DATA_EXPORT_REQUESTED
DATA_EXPORT_DOWNLOADED
ROLE_CHANGED
```

E esses logs **não podem ser alteráveis pelo usuário comum**.

---

# 42. Backups internos ≠ exportação do cliente

Há uma diferença importante.

Você precisa de:

**Backup operacional do EIP**

para desastre/recuperação.

E:

**Data Export**

para entregar dados ao cliente.

São coisas diferentes.

O cliente não precisa receber seu snapshot PostgreSQL inteiro.

Ele recebe:

```text
tenant-export.zip
```

contendo **somente os dados daquele tenant**.

---

# 43. Recuperação de desastre

Eu já colocaria como requisito:

```text
Backup automático
↓
Criptografado
↓
Storage separado
↓
Retenção definida
↓
Restore testado
↓
Registro de testes
```

Porque backup que nunca foi restaurado em teste não deve ser tratado como garantia de recuperação.

Mais adiante você pode formalizar objetivos de RPO/RTO adequados ao nível de serviço contratado.

---

# 44. Arquitetura geral

No final, estamos chegando a algo assim:

```text
                  INTERNET
                     │
             ┌───────▼────────┐
             │   EIP WEBSITE   │
             └───────┬────────┘
                     │
                  SIGNUP
                     │
             ┌───────▼────────┐
             │   EIP AUTH      │
             └───────┬────────┘
                     │
                 TENANT
                     │
       ┌─────────────┼──────────────┐
       │             │              │
       ▼             ▼              ▼
   BILLING       EIP CORE          IAM
       │             │              │
       ▼             ▼              ▼
    STRIPE       EXPORTAÇÃO       RBAC
                 DOCUMENTOS
                 LOGÍSTICA
                 FINANCEIRO
                 COMPLIANCE
                 AI HUB
                     │
                     ▼
              INTEGRATION HUB
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
     SISCOMEX       ERP         BANCOS
        │            │            │
        └────────────┼────────────┘
                     ▼
                AUDIT / SIEM
```

Isso conversa diretamente com a arquitetura multi-tenant, AI Hub, Compliance, Workflow Designer, BI e API Center que você já planejou para o EIP.

---

## 45. Agora temos material suficiente para congelar uma V1 comercial

Eu considero que a **V1 comercial** deveria exigir:

**Site + preços → cadastro → tenant → plano → aceite jurídico → Stripe → cartão → assinatura → onboarding → usuários ilimitados → RBAC → cobrança recorrente → inadimplência → suspensão → reativação → cancelamento → exportação dos dados → auditoria → Super Admin SaaS.**

Não tentaria colocar todas as sofisticações possíveis antes do primeiro cliente.

O objetivo agora é muito claro:

> **uma empresa que nunca falou com você precisa conseguir entrar no site do EIP, entender o produto, contratar uma licença para seu CNPJ, pagar com cartão, aceitar os contratos, acessar imediatamente o sistema, cadastrar sua equipe inteira sem custo por usuário e começar a operar.**

E, do outro lado, **você precisa conseguir administrar tudo sem intervenção manual**.

O próximo bloco que eu faria é ainda mais útil para o desenvolvimento: um **PRD/Master Specification “EIP SaaS Commercialization & Billing v1.0”**, consolidando tudo que definimos em um único documento profissional, com **épicos → histórias de usuário → regras de negócio → telas → banco → APIs → webhooks → segurança → critérios de aceite → testes → ordem de implementação**. Esse passa a ser o documento-mestre que você entrega para a IA/equipe desenvolver sem precisar interpretar toda esta conversa.

Claro. Agora vou entrar no **PRD/Master Specification**, mas ainda em formato de conversa para você ir validando antes de congelarmos a versão final.

# 46. PRD — EIP SaaS Commercialization & Billing v1.0

**Produto:** EIP — Export Integration Platform
**Módulo:** SaaS Commercialization, Licensing & Billing
**Versão:** 1.0
**Modelo:** B2B SaaS Multi-Tenant
**Unidade de licenciamento:** Empresa/CNPJ
**Usuários:** Ilimitados por licença
**Cobrança:** Mensal ou anual recorrente

### Objetivo

Permitir que uma empresa conheça, contrate, pague, ative, administre e cancele o EIP de maneira autônoma, sem intervenção comercial ou administrativa obrigatória.

O fluxo principal será:

```text
VISITANTE
   ↓
CADASTRO
   ↓
EMPRESA / CNPJ
   ↓
PLANO
   ↓
ACEITE CONTRATUAL
   ↓
PAGAMENTO
   ↓
TENANT ATIVADO
   ↓
ONBOARDING
   ↓
USUÁRIOS ILIMITADOS
   ↓
OPERAÇÃO EIP
```

---

# 47. ÉPICO 01 — Catálogo de planos

### US-001

**Como visitante**, quero visualizar os planos do EIP para decidir qual atende minha empresa.

### Requisitos

O backend deve possuir entidades independentes para:

```text
PLAN
PLAN_PRICE
FEATURE
PLAN_FEATURE
PLAN_LIMIT
```

Não devemos deixar preços espalhados pelo frontend.

O administrador EIP deverá futuramente conseguir mudar:

```text
Nome
Descrição
Preço mensal
Preço anual
Features
Franquias
Status
Ordem de apresentação
```

sem alterar código.

### Critério de aceite

Alterar o preço de um plano no ambiente administrativo deve alterar o preço apresentado para **novas contratações**, sem alterar automaticamente contratos existentes.

Isso é muito importante.

---

# 48. Versionamento de preços

Imagine que hoje o Business custa:

**R$ 1.990**

e em 2028 passe para:

**R$ 2.490.**

Não atualize simplesmente:

```text
price = 2490
```

Crie uma nova versão de preço.

```text
BUSINESS
├── PRICE_2026 = R$1.990
└── PRICE_2028 = R$2.490
```

Assim você pode ter clientes antigos em condição histórica e novos clientes no preço novo.

---

# 49. ÉPICO 02 — Cadastro empresarial

### US-002

**Como representante de uma empresa**, quero cadastrar meu CNPJ para criar um ambiente exclusivo no EIP.

Campos:

```text
CNPJ *
Razão Social *
Nome Fantasia
Telefone *
E-mail corporativo *
Site
Segmento
```

O EIP deve validar pelo menos:

**formato → dígitos verificadores → duplicidade interna.**

Quando houver integração cadastral externa, pode preencher razão social automaticamente.

### Regra crítica

```text
UNIQUE(normalized_cnpj)
```

Nunca confie somente na validação do frontend.

---

# 50. ÉPICO 03 — Administrador inicial

Quem cria a empresa passa a ser:

```text
TENANT_OWNER
```

ou:

```text
ORGANIZATION_ADMIN
```

Eu prefiro separar os dois.

**Owner** = responsável máximo pela conta/assinatura.

**Admin** = administra usuários e configurações.

Assim posteriormente o Owner pode conceder administração operacional sem entregar poderes de cancelamento, faturamento ou transferência da conta.

---

# 51. Permissões de faturamento

Criaria permissões específicas:

```text
BILLING_VIEW
BILLING_MANAGE
PLAN_CHANGE
SUBSCRIPTION_CANCEL
PAYMENT_METHOD_CHANGE
DATA_EXPORT_REQUEST
TENANT_CLOSE
OWNERSHIP_TRANSFER
```

Por padrão:

**Owner:** todas.

**Admin:** configurável.

**Financeiro:** Billing View/Manage.

**Demais:** nenhuma.

---

# 52. ÉPICO 04 — Checkout

### US-003

**Como responsável pela contratação**, quero pagar pelo EIP com cartão e ter minha licença ativada automaticamente.

Fluxo:

```text
PLAN_SELECTED
     ↓
CHECKOUT_CREATED
     ↓
PAYMENT_METHOD
     ↓
TERMS_ACCEPTED
     ↓
SUBSCRIPTION_CREATED
     ↓
PAYMENT_CONFIRMED
     ↓
LICENSE_ACTIVE
```

Mas há uma regra arquitetural fundamental:

> **Nunca considere a licença paga simplesmente porque o frontend voltou para `/success`.**

A confirmação definitiva deve ocorrer no backend através do provedor de pagamento/webhook.

---

# 53. Idempotência

Considere que o provedor envie:

```text
invoice.paid
```

três vezes.

Resultado correto:

```text
1 pagamento
1 ativação
1 lançamento
```

e não três.

Tabela:

```text
PROVIDER_EVENT

provider
event_id UNIQUE
event_type
received_at
processed_at
status
payload_hash
error
retry_count
```

Isso precisa estar no PRD como requisito obrigatório.

---

# 54. ÉPICO 05 — Assinatura

A entidade central:

```text
SUBSCRIPTION

id
tenant_id
plan_id
price_id
provider
provider_customer_id
provider_subscription_id

status

billing_cycle
currency

current_period_start
current_period_end

trial_start
trial_end

grace_period_end

cancel_at_period_end
canceled_at
ended_at

created_at
updated_at
```

Status:

```text
INCOMPLETE
TRIALING
ACTIVE
PAST_DUE
GRACE_PERIOD
SUSPENDED
CANCELED
TERMINATED
```

---

# 55. ÉPICO 06 — Entitlements

Esse provavelmente será um dos componentes mais importantes da arquitetura comercial.

O sistema não deve perguntar:

```text
Cliente é Business?
```

Deve perguntar:

```text
Cliente possui AI_OCR?
```

O `Entitlement Engine` resolve isso.

Exemplo:

```text
can(tenant, "AI_OCR")
→ TRUE

can(tenant, "API_ACCESS")
→ FALSE
```

E também:

```text
limit(tenant, "AI_CREDITS")
→ 5000

usage(tenant, "AI_CREDITS")
→ 3920
```

---

# 56. Feature flags comerciais

Cada funcionalidade nova do EIP deverá poder ser associada a um entitlement.

Por exemplo:

```text
AI_ASSISTANT
AI_DOCUMENT_READER
AI_TRANSLATION
AI_NCM
AI_ROUTE_OPTIMIZATION
AI_RISK_ANALYSIS

DU_E
INVOICE
CERTIFICATE
LOGISTICS

COMPLIANCE
AML
KYC
PEP
SANCTIONS

WORKFLOW
BI
API
ERP_INTEGRATION
BANK_INTEGRATION
```

Isso permite vender produtos diferentes sem criar aplicações diferentes.

---

# 57. ÉPICO 07 — Metering

Precisamos medir os recursos que têm custo variável.

Tabela:

```text
USAGE_EVENT

id
tenant_id
feature
quantity
unit
source
resource_id
occurred_at
idempotency_key
```

Exemplos:

```text
AI_TOKENS
OCR_PAGE
DOCUMENT_STORAGE_GB
API_REQUEST
DOCUMENT_PROCESSED
```

Depois:

```text
USAGE_AGGREGATE

tenant_id
feature
period
quantity
```

Isso alimentará tanto faturamento quanto BI.

---

# 58. Eu faria uma mudança no conceito de “créditos de IA”

Para o cliente, eu evitaria mostrar:

> 2.718.392 tokens.

Isso é linguagem técnica.

Mostraria:

> **Uso de IA: 63% da franquia mensal**

Internamente você controla tokens/chamadas/custo real.

Comercialmente você pode utilizar:

**Créditos EIP AI.**

Assim você consegue trocar o modelo de IA no futuro sem alterar toda a comunicação de preços.

---

# 59. ÉPICO 08 — Dunning/inadimplência

Máquina de estados:

```text
ACTIVE
   │
   │ pagamento falhou
   ▼
PAST_DUE
   │
   ▼
GRACE_PERIOD
   │
   ├──── pagamento ────► ACTIVE
   │
   ▼
SUSPENDED
   │
   ├──── pagamento ────► ACTIVE
   │
   ▼
TERMINATED
```

A transição precisa ser auditável.

Nunca:

```text
if payment_failed:
    delete_company()
```

Isso deve ser **proibido arquiteturalmente**.

---

# 60. ÉPICO 09 — Data Lifecycle

Eu criaria uma política formal:

```text
ACTIVE
Dados operacionais disponíveis

SUSPENDED
Dados preservados
Operação bloqueada/read-only

CANCELED
Preservação conforme período contratado

RETENTION
Exportação disponível conforme política

DELETION_PENDING
Fila de eliminação

DELETED/ANONYMIZED
Processo concluído
```

Isso é muito melhor do que misturar cobrança com exclusão.

---

# 61. Direito de saída do cliente

Aqui está um diferencial que eu colocaria inclusive nas apresentações comerciais:

> **NO DATA LOCK-IN**

Ou em português:

> **Seus dados acompanham sua empresa.**

Quando sair, o cliente pode solicitar seu pacote.

Isso combate um medo real de empresas ao adotar SaaS para processos importantes:

**“E se amanhã eu quiser trocar de sistema?”**

Sua resposta comercial passa a ser:

> “Você pode sair. O EIP possui um processo estruturado para exportação dos dados da sua organização.”

---

# 62. ÉPICO 10 — Notificações

Criar um `NotificationService`.

Eventos:

```text
TRIAL_STARTED
TRIAL_ENDING
SUBSCRIPTION_STARTED

PAYMENT_SUCCEEDED
PAYMENT_FAILED
PAYMENT_RETRY

GRACE_PERIOD_STARTED
SUSPENSION_WARNING
ACCOUNT_SUSPENDED

ACCOUNT_REACTIVATED

PLAN_CHANGED
SUBSCRIPTION_CANCELED

DATA_EXPORT_READY
DATA_EXPORT_EXPIRING
```

Canais inicialmente:

```text
IN_APP
EMAIL
```

Posteriormente:

```text
WHATSAPP
SMS
WEBHOOK
```

---

# 63. Templates não devem estar no código

Crie:

```text
NOTIFICATION_TEMPLATE

event
channel
language
subject
body
version
active
```

Isso permitirá alterar:

> “Seu pagamento falhou.”

para uma comunicação melhor sem deploy.

---

# 64. ÉPICO 11 — Super Admin

Você terá um ambiente diferente do administrador do cliente.

```text
/admin
```

ou preferencialmente um domínio/controle administrativo protegido.

Dashboard:

```text
MRR
ARR
ARPA
CUSTOMERS
TRIALS
NEW CUSTOMERS
CHURN
EXPANSION
PAST DUE
RECOVERED REVENUE
AI COST
INFRASTRUCTURE COST
GROSS MARGIN
```

Isso começa a lhe mostrar se o EIP está ganhando dinheiro de verdade.

---

# 65. Unit economics

Esse ponto é importantíssimo porque estamos falando de IA.

Imagine Business:

**Receita: R$1.990**

Mas um cliente pode consumir:

```text
Cloud              R$ 180
IA                  R$ 400
OCR                 R$ 120
E-mail               R$ 10
Observabilidade      R$ 30
Storage              R$ 50
Pagamento             R$ X
```

Seu painel precisa calcular aproximadamente:

```text
Revenue
-
Variable Cost
=
Contribution Margin
```

por tenant.

Então você poderá descobrir:

> Cliente A paga R$1.990 e custa R$240.

> Cliente B paga R$1.990 e custa R$1.400.

Isso será decisivo para reajustar franquias e planos.

---

# 66. ÉPICO 12 — Coupons & Commercial Offers

Desde a V1 eu criaria suporte a:

```text
COUPON
PROMOTION
CUSTOM_PRICE
```

Porque você vai prospectar pessoalmente seus primeiros clientes.

Exemplo:

```text
FOUNDERS2026

Business
R$1.990
↓
R$1.490

Duração:
12 meses
```

Não crie outro plano chamado:

```text
BUSINESS_ALAN_CLIENT_01
```

para cada negociação.

Use descontos/preços comerciais vinculados ao contrato.

---

# 67. Cliente Fundador

Eu formalizaria isso.

### EIP Founders Program

Primeiras **20 empresas**.

Benefícios possíveis:

**Business por R$1.490/mês durante 12 meses**, onboarding assistido, canal prioritário de feedback e participação nas decisões de evolução.

Mas eu não prometeria:

> “Preço vitalício.”

Isso pode se tornar um problema daqui a cinco anos.

---

# 68. ÉPICO 13 — Contrato comercial individual

Mesmo com compra automática, grandes clientes podem negociar.

Portanto:

```text
COMMERCIAL_AGREEMENT

tenant_id
plan
base_price
discount
effective_price
billing_cycle
start_date
end_date
renewal_rule
document_reference
status
```

Assim o Enterprise pode ter:

```text
R$8.900/mês
5 CNPJs
SLA específico
API
SSO
onboarding
suporte
```

sem quebrar seu sistema padrão de planos.

---

# 69. Multi-CNPJ

Eu faria agora a arquitetura já preparada para isso.

Não pense apenas:

```text
TENANT = CNPJ
```

Melhor:

```text
ORGANIZATION
    │
    ├── LEGAL_ENTITY CNPJ A
    ├── LEGAL_ENTITY CNPJ B
    └── LEGAL_ENTITY CNPJ C
```

Para cliente pequeno:

```text
1 Organization
1 CNPJ
```

Para grupo:

```text
1 Organization
8 CNPJs
```

Isso pode evitar uma refatoração enorme quando você conquistar grupos empresariais.

---

# 70. Licenciamento

A licença pode então ficar:

```text
SUBSCRIPTION
      ↓
ORGANIZATION
      ↓
LICENSE
      ↓
LEGAL_ENTITIES
```

Exemplo:

```text
Grupo ABC
EIP Enterprise

CNPJ 1 ✓
CNPJ 2 ✓
CNPJ 3 ✓
```

E você pode cobrar CNPJ adicional.

---

# 71. ÉPICO 14 — Impersonation para suporte

Vai chegar o dia em que o cliente dirá:

> “Alan, aqui não aparece minha Invoice.”

Você precisará investigar.

Mas **nunca peça a senha dele**.

Crie um recurso administrativo controlado:

```text
SUPPORT_SESSION
```

Somente usuários internos autorizados.

Exige:

```text
motivo
ticket
usuário interno
tenant
início
fim
```

E mostra uma faixa:

> **MODO SUPORTE — Você está visualizando Empresa ABC**

Tudo auditado.

Para ações sensíveis, eu bloquearia alterações ou exigiria elevação adicional de privilégio.

---

# 72. ÉPICO 15 — Kill switch

Você também precisa conseguir bloquear um tenant por razões diferentes de pagamento:

```text
BILLING_SUSPENSION
SECURITY_SUSPENSION
LEGAL_SUSPENSION
ABUSE_SUSPENSION
MANUAL_ADMIN_SUSPENSION
```

Nunca use simplesmente:

```text
active = false
```

porque depois ninguém saberá **por que** foi bloqueado.

---

# 73. ÉPICO 16 — Observabilidade

Toda requisição relevante:

```text
request_id
correlation_id
tenant_id
user_id
service
duration
status
```

Nunca registre desnecessariamente conteúdo sensível nos logs.

E:

```text
Payment webhook
→ correlation_id XYZ

Subscription update
→ XYZ

License activation
→ XYZ

Email sent
→ XYZ
```

Se algo der errado, você consegue reconstruir o fluxo.

---

# 74. ÉPICO 17 — Auditoria financeira

Não altere pagamentos históricos.

Use registros imutáveis ou trilhas adequadas.

```text
PAYMENT
INVOICE
CREDIT_NOTE
REFUND
```

Por exemplo, estorno não deve significar:

```text
DELETE payment
```

e sim registrar o evento financeiro correspondente.

---

# 75. ÉPICO 18 — LGPD Operations

No Super Admin:

```text
Privacidade
│
├── Solicitações
├── Incidentes
├── Suboperadores
├── Retenção
├── Exportações
├── Exclusões
└── Documentos legais
```

Uma solicitação:

```text
PRIVACY_REQUEST

type
requester
tenant
subject
received_at
deadline
status
assigned_to
evidence
resolution
```

Isso profissionaliza muito o EIP.

---

# 76. ÉPICO 19 — AI Governance

Como IA estará espalhada pelo EIP, eu criaria desde já:

```text
AI_USAGE_LOG

tenant_id
user_id
feature
provider
model
input_classification
token_usage
cost
latency
success
timestamp
```

Mas com atenção especial para **não despejar prompts/documentos sensíveis integralmente em logs comuns**.

Você precisa saber:

> Quanto cada recurso de IA custa?

sem criar um repositório desnecessário de dados confidenciais.

---

# 77. Controle de envio para IA

Antes de cada integração:

```text
Documento
   ↓
Data Classification
   ↓
Policy Engine
   ↓
Allowed Provider?
   ↓
Minimização
   ↓
IA
```

Isso conversa diretamente com o capítulo de segurança e governança de IA que você já desenhou para o EIP.

---

# 78. ÉPICO 20 — Status Page

No futuro:

```text
status.eip.com.br
```

Exibindo:

```text
EIP Application        Operational
API                    Operational
AI Services            Operational
Document Processing    Operational
Integrations           Operational
```

E histórico de incidentes.

Isso aumenta a confiança do cliente empresarial.

---

# 79. Critérios para colocar o botão “Comprar”

Eu **não liberaria o checkout público** até estes testes passarem:

```text
✓ empresa nova consegue contratar
✓ CNPJ duplicado é impedido
✓ cartão aprovado ativa licença
✓ cartão recusado não ativa
✓ webhook duplicado não duplica pagamento
✓ falha de pagamento inicia régua correta
✓ pagamento posterior reativa automaticamente
✓ cancelamento funciona
✓ downgrade não apaga dados
✓ suspensão não apaga dados
✓ tenant A nunca acessa tenant B
✓ exportação contém somente tenant correto
✓ somente autorizado solicita exportação
✓ termos aceitos ficam registrados
✓ usuário adicional não gera cobrança
✓ mudança de plano respeita preço correto
✓ logs não expõem cartão/senhas/tokens
✓ backup é restaurável
```

Esses são testes de **go/no-go**.

---

# 80. Uma decisão que eu mudaria antes de congelarmos a V1

Depois de desenhar toda a arquitetura, eu **não usaria mais `1 CNPJ = 1 tenant` como regra estrutural**.

Usaria:

> **1 organização = 1 tenant.**

E dentro dela:

> **1 ou mais CNPJs (legal entities).**

Comercialmente você continua anunciando:

> **Plano inclui 1 CNPJ e usuários ilimitados.**

Mas tecnicamente fica preparado para:

**cooperativas, tradings, grupos agroindustriais, holdings e exportadores com múltiplas empresas.**

Isso pode evitar uma migração estrutural enorme no futuro e combina melhor com o tipo de cliente que o EIP pretende atingir.

A estrutura passa a ser:

```text
                    ORGANIZATION
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       CNPJ A          CNPJ B          CNPJ C
          │              │              │
          └──────────────┼──────────────┘
                         │
                      TENANT
                         │
               SUBSCRIPTION/LICENSE
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
     USERS          OPERATIONS          DATA
   ilimitados       exportação        documentos
```

Com isso, estamos praticamente com a **arquitetura comercial completa do EIP**. O próximo bloco deve fechar a especificação com **modelo físico de banco de dados, endpoints com request/response, matriz completa de planos e features, máquina de estados formal, testes de aceite e backlog priorizado P0/P1/P2**. Essa será a parte mais diretamente utilizável por quem está programando o sistema.

Perfeito. Agora vamos para a parte mais técnica do PRD, já no nível em que a equipe/IA de desenvolvimento consegue transformar a especificação em código. Vou também corrigir um detalhe do desenho anterior: **Organization e Tenant não precisam ser duas entidades equivalentes**. Para a V1, eu usaria `tenant = organization`, com vários `legal_entities/CNPJs` dentro dele.

# 81. Modelo de dados definitivo — V1

A raiz de isolamento será:

```text id="z0w7mz"
TENANT / ORGANIZATION
        │
        ├── LEGAL_ENTITY (CNPJ)
        ├── USERS
        ├── SUBSCRIPTION
        ├── EXPORT OPERATIONS
        ├── DOCUMENTS
        ├── FINANCIAL
        ├── COMPLIANCE
        └── AUDIT
```

### `tenant`

```text id="iyz1mv"
id                  UUID PK
name
slug
status
owner_user_id
created_at
updated_at
```

Status:

```text id="v4xmg4"
ACTIVE
READ_ONLY
SUSPENDED
TERMINATED
```

### `legal_entity`

```text id="shuzf9"
id                  UUID PK
tenant_id           UUID FK
cnpj                VARCHAR UNIQUE
razao_social
nome_fantasia
is_primary
status
created_at
updated_at
```

Regra:

```text id="l24v9c"
1 tenant
→ 1..N legal_entities
```

---

# 82. Usuários e memberships

Eu não colocaria simplesmente:

```text id="d5rf06"
user.tenant_id
```

Melhor:

```text id="71f1j2"
USER
+
TENANT_MEMBERSHIP
```

Isso deixa a arquitetura preparada para um consultor autorizado ou profissional que futuramente possa pertencer a mais de uma organização.

```text id="12afsk"
USER

id
name
email
password_hash
mfa_enabled
status
last_login_at
created_at
```

E:

```text id="um75u2"
TENANT_MEMBERSHIP

id
tenant_id
user_id
status
created_at
```

Permissões ficam associadas à membership.

---

# 83. RBAC

```text id="ztl31a"
ROLE
PERMISSION
ROLE_PERMISSION
MEMBERSHIP_ROLE
```

Permissões importantes:

```text id="shw66g"
TENANT_MANAGE
USER_INVITE
USER_REMOVE
ROLE_MANAGE

BILLING_VIEW
BILLING_MANAGE
PLAN_CHANGE
SUBSCRIPTION_CANCEL

EXPORT_CREATE
EXPORT_EDIT
EXPORT_VIEW

FINANCIAL_VIEW
FINANCIAL_EDIT

COMPLIANCE_VIEW
COMPLIANCE_MANAGE

DATA_EXPORT_REQUEST
AUDIT_VIEW
```

E futuramente ABAC complementa isso.

---

# 84. Planos

```text id="s97v83"
PLAN

id
code
name
description
active
display_order
```

```text id="8t9zsv"
PLAN_PRICE

id
plan_id
currency
billing_interval
amount
effective_from
effective_until
provider_price_id
active
```

Dessa forma:

```text id="8fmxgr"
BUSINESS
├── monthly R$1.990
└── annual R$19.900
```

---

# 85. Assinatura

```text id="ktngb0"
SUBSCRIPTION

id
tenant_id
plan_id
plan_price_id

provider
provider_customer_id
provider_subscription_id

status
billing_interval
currency

trial_start
trial_end

current_period_start
current_period_end

grace_period_end

cancel_at_period_end
canceled_at
ended_at

created_at
updated_at
```

Índices:

```text id="dw9l29"
INDEX tenant_id
UNIQUE provider_subscription_id
INDEX status
INDEX current_period_end
```

---

# 86. Licença separada da assinatura

Isso é importante.

`Subscription` responde:

> O que comercialmente foi contratado?

`License` responde:

> O que o EIP permite neste instante?

```text id="1mtt7i"
TENANT_LICENSE

tenant_id
status

access_mode

valid_from
valid_until

suspension_reason

updated_at
```

`access_mode`:

```text id="lyqclb"
FULL
READ_ONLY
BILLING_ONLY
NONE
```

Assim uma indisponibilidade da Stripe não precisa automaticamente derrubar seu cliente.

---

# 87. Entitlements

```text id="2k4mhb"
FEATURE

id
code
name
description
metered
unit
```

```text id="qufq03"
PLAN_FEATURE

plan_id
feature_id
enabled
included_quantity
hard_limit
```

Exemplo:

```text id="jxm3wl"
BUSINESS

EXPORTS
enabled=true
hard_limit=NULL

USERS
enabled=true
hard_limit=NULL

AI_CREDITS
enabled=true
included_quantity=5000

OCR_PAGE
enabled=true
included_quantity=2000

API_ACCESS
enabled=false
```

---

# 88. Override por cliente

Você vai precisar disso.

Imagine:

> Cliente ABC fechou Business, mas você deu API gratuitamente por seis meses.

Não crie outro plano.

```text id="skwm15"
ENTITLEMENT_OVERRIDE

tenant_id
feature_id
enabled_override
limit_override
valid_from
valid_until
reason
created_by
```

Assim:

```text id="4rxsmz"
Business
+
API_ACCESS override
até 31/12/2027
```

---

# 89. Matriz comercial inicial

Eu congelaria a hipótese inicial assim:

| Recurso               |   Start   | Business |    Pro   |
| --------------------- | :-------: | :------: | :------: |
| Usuários              |     ∞     |     ∞    |     ∞    |
| CNPJ incluído         |     1     |     1    |     1    |
| Exportações           | limitada* |     ∞    |     ∞    |
| Produtos              |     ∞     |     ∞    |     ∞    |
| Documentos            |     ✓     |     ✓    |     ✓    |
| IA Assistente         |     ✓     |     ✓    |     ✓    |
| OCR                   |   básico  | avançado | avançado |
| Tradução IA           |  limitada |     ✓    |     ✓    |
| Sugestão NCM          |  limitada |     ✓    |     ✓    |
| Compliance            |   básico  |     ✓    | avançado |
| Workflow              |     —     |     ✓    |     ✓    |
| BI avançado           |     —     |     ✓    |     ✓    |
| API                   |     —     |     —    |     ✓    |
| Integrações avançadas |     —     |     ✓    |     ✓    |
| Auditoria avançada    |     —     |     —    |     ✓    |
| Suporte prioritário   |     —     |     —    |     ✓    |

`*` Eu definiria o número somente depois de medir uso real durante pilotos.

Isso é importante: **não inventaria franquias comerciais definitivas antes de conhecer o consumo dos primeiros clientes.**

---

# 90. CNPJ adicional

Podemos inicialmente trabalhar com:

```text id="fj48qo"
ADDON_LEGAL_ENTITY
```

Preço hipotético:

**R$ 500/mês por CNPJ adicional.**

Mas deixaria configurável:

```text id="6a09kz"
ADDON

code
name
price
billing_interval
feature
```

Assim amanhã teremos:

```text id="5ihm3a"
CNPJ adicional
Pacote IA
Pacote OCR
Storage adicional
API adicional
Onboarding Premium
```

---

# 91. Checkout — API

### Criar sessão

```text id="t8hhb7"
POST /api/v1/checkout/session
```

Request conceitual:

```text id="2pdt6a"
{
  "planCode": "BUSINESS",
  "billingInterval": "MONTHLY",
  "company": {
    "cnpj": "..."
  }
}
```

O backend deve:

```text id="0gdj7b"
1. autenticar usuário
2. validar CNPJ
3. verificar duplicidade
4. buscar preço vigente
5. criar/recuperar customer
6. criar checkout
7. registrar checkout interno
8. retornar sessão segura
```

Nunca permita que o frontend diga:

```text id="75w6ok"
"price": 1990
```

e o backend simplesmente aceite.

O frontend envia:

```text id="ycy0rt"
planCode=BUSINESS
```

e **o servidor determina o preço**.

---

# 92. Webhook

```text id="9spxkx"
POST /api/v1/webhooks/stripe
```

Fluxo:

```text id="m6hjye"
Receber
 ↓
Validar assinatura
 ↓
Persistir event_id
 ↓
Já existe?
 ├─ SIM → HTTP 200
 └─ NÃO
      ↓
Processar
      ↓
Atualizar billing
      ↓
Atualizar license
      ↓
Audit
      ↓
Notification
```

---

# 93. Nunca faça isso no webhook

```text id="e6lwsj"
receive()
→ update database
→ send email
→ generate PDF
→ call 5 APIs
→ recalculate BI
→ ...
```

Ele deve responder rapidamente.

Melhor:

```text id="0idwz5"
Webhook
 ↓
Validate
 ↓
Persist
 ↓
Queue
 ↓
200 OK

Worker
 ↓
Process event
```

Isso reduz falhas e timeout.

---

# 94. Eventos de domínio

Além dos eventos Stripe, crie eventos internos:

```text id="u03c9v"
SubscriptionActivated
PaymentSucceeded
PaymentFailed
GracePeriodStarted
TenantSuspended
TenantReactivated
PlanChanged
SubscriptionCanceled
DataExportRequested
DataExportReady
```

Assim o EIP não fica acoplado ao Stripe.

Amanhã, se você trocar o meio de pagamento, o restante do sistema continua ouvindo:

```text id="agpscb"
PaymentSucceeded
```

em vez de depender de nomes específicos do provedor.

---

# 95. Máquina de estados formal

Eu congelaria assim:

```text id="s1iy47"
              ┌───────────────┐
              │   TRIALING    │
              └───────┬───────┘
                      │
                pagamento
                      ▼
              ┌───────────────┐
              │    ACTIVE     │
              └───────┬───────┘
                      │
                  falhou
                      ▼
              ┌───────────────┐
              │   PAST_DUE    │
              └───────┬───────┘
                      ▼
              ┌───────────────┐
              │ GRACE_PERIOD  │
              └───────┬───────┘
                      │
                 não pagou
                      ▼
              ┌───────────────┐
              │   SUSPENDED   │
              └───────┬───────┘
                      │
            ┌─────────┴─────────┐
            │                   │
          pagou              encerrou
            │                   │
            ▼                   ▼
          ACTIVE            TERMINATED
```

Em qualquer ponto antes de `TERMINATED`, pagamento válido pode levar novamente a `ACTIVE`, conforme as regras contratuais.

---

# 96. Não misturar cancelamento com inadimplência

São coisas diferentes.

### Cancelamento voluntário

```text id="6yg09h"
ACTIVE
↓
CANCEL_AT_PERIOD_END
↓
CANCELED
↓
RETENTION
```

### Inadimplência

```text id="6p33yu"
ACTIVE
↓
PAST_DUE
↓
GRACE
↓
SUSPENDED
↓
TERMINATED
```

Isso precisa ficar separado no código e nas métricas.

---

# 97. Data Export

Endpoint:

```text id="ur1yza"
POST /api/v1/data-exports
```

Permissão:

```text id="2p3zzd"
DATA_EXPORT_REQUEST
```

Mais:

```text id="8ymd5j"
MFA_RECENT = TRUE
```

Eu exigiria autenticação recente.

Worker:

```text id="v2dqoc"
Create export
 ↓
Snapshot logical boundary
 ↓
Extract tenant data
 ↓
Generate files
 ↓
Generate manifest
 ↓
Compress
 ↓
Encrypt
 ↓
Store temporary
 ↓
Generate short-lived access
 ↓
Notify owner
```

---

# 98. Manifest

Exemplo:

```text id="1nd8uo"
{
  "product": "EIP",
  "exportVersion": "1.0",
  "tenant": "...",
  "generatedAt": "...",
  "schemaVersion": "...",
  "files": [
    "company.json",
    "products.csv",
    "customers.csv",
    "exports.csv",
    "documents/..."
  ]
}
```

Isso é muito melhor que simplesmente entregar um `.sql`.

---

# 99. Segurança do download

Nunca:

```text id="77an5v"
https://storage.com/customer-backup.zip
```

eterno e público.

Use URL/autorização temporária.

Por exemplo:

```text id="em3k08"
validade: 15 minutos
```

e o pacote armazenado pode ter expiração própria:

```text id="a7aqdy"
7 dias
```

Depois o arquivo temporário é eliminado, sem alterar a política de retenção dos dados originais.

---

# 100. Terminação de tenant

Esse é um processo crítico.

Não faça:

```text id="v3z7pr"
DELETE FROM tenant
```

Faça workflow:

```text id="84d2gv"
TERMINATION_REQUESTED
↓
RETENTION
↓
LEGAL_HOLD_CHECK
↓
EXPORT_WINDOW_CHECK
↓
DELETION_SCHEDULED
↓
DELETE/ANONYMIZE
↓
VERIFY
↓
DELETION_COMPLETED
```

Tudo auditado.

---

# 101. Legal Hold

Crie desde já:

```text id="7o88n2"
LEGAL_HOLD

tenant_id
reason
created_by
created_at
released_at
```

Se houver uma obrigação legítima de preservação, o mecanismo automático de exclusão não pode simplesmente destruir os dados correspondentes.

A definição jurídica das hipóteses de conservação deve acompanhar a LGPD e outras obrigações aplicáveis. [LGPD — Lei nº 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm?utm_source=chatgpt.com)

---

# 102. Segurança multi-tenant — P0 absoluto

Esse talvez seja o requisito de segurança mais importante de todo o SaaS.

Usuário da:

```text id="dy3t9u"
EMPRESA A
```

**jamais** pode conseguir acessar:

```text id="2i5jss"
EMPRESA B
```

mesmo alterando:

```text id="shlmms"
URL
UUID
request
GraphQL
API
browser storage
```

Todo acesso:

```text id="vql18e"
Authenticated User
      ↓
Membership
      ↓
Tenant Context
      ↓
Authorization
      ↓
Query scoped by tenant
```

---

# 103. Teste automático obrigatório

Exemplo conceitual:

```text id="s4npxn"
Given:
User A belongs Tenant A
Document B belongs Tenant B

When:
User A requests Document B

Then:
403/404
AND
no metadata leaked
AND
security event logged when appropriate
```

Faça isso para:

**documentos, invoices, exportações, financeiro, compliance, usuários, relatórios, IA, anexos e data export.**

---

# 104. Object storage também é multi-tenant

Não adianta proteger PostgreSQL e deixar documentos expostos.

Estrutura:

```text id="w65p6q"
/tenant/{tenant_uuid}/documents/...
```

Mas o caminho sozinho **não é controle de segurança**.

O backend precisa autorizar a solicitação antes de gerar acesso temporário.

---

# 105. Segredos

Nunca:

```text id="dnbwhd"
Stripe key
OpenAI key
database password
JWT secret
```

em código-fonte ou frontend.

Use secret manager apropriado à infraestrutura.

Também estabeleça rotação.

---

# 106. Cartões

A arquitetura deve ser:

```text id="ad5z7w"
EIP Frontend
     ↓
Payment Provider
     ↓
Token/Payment Method ID
     ↓
EIP
```

O EIP conhece algo como:

```text id="sd0vn9"
Mastercard
•••• 1234
exp 09/29
provider_payment_method_id
```

e não precisa possuir número completo/CVV.

---

# 107. Matriz de prioridade

Agora eu classificaria o backlog.

### P0 — obrigatório antes de vender

```text id="wpvqiy"
Tenant isolation
Auth
MFA para ações sensíveis
RBAC
Plan
Price
Subscription
Stripe
Checkout
Webhook
License
Terms acceptance
Billing
Payment failure
Grace period
Suspension
Reactivation
Cancellation
Data export
Audit
Backup
Restore test
Logs
Security monitoring básico
```

### P1 — imediatamente depois

```text id="03a8bg"
Trial
Coupons
Annual plan
CNPJ adicional
Usage metering
AI credits
OCR metering
Upgrade/downgrade
Super Admin metrics
MRR/ARR
Customer Portal
Onboarding
Privacy Operations
```

### P2 — escala

```text id="pvq56f"
Enterprise agreements
SSO/SAML
SCIM
Advanced SLA
Advanced DPA workflows
Support impersonation
Cost allocation
Automated LTV/CAC
Advanced dunning
Status page
Multi-currency
Invoice billing
Purchase orders
Multiple payment providers
```

---

# 108. Eu mudaria uma prioridade: trial não precisa bloquear o lançamento

Você pode começar seus primeiros clientes com:

> **Agende uma demonstração**

e depois enviar:

> **Ativar minha empresa**

Isso pode ser melhor inicialmente porque você vai aprender diretamente com os primeiros exportadores.

Depois que o onboarding estiver validado, habilita:

> **Teste grátis por 14 dias.**

---

# 109. Critérios de aceite — pagamento

### Cenário A

```text id="quav1v"
Given empresa sem assinatura
When pagamento aprovado
Then subscription ACTIVE
And license FULL
And audit created
And notification sent
```

### Cenário B

```text id="e5g9oq"
Given pagamento recusado
When checkout concludes
Then license MUST NOT become ACTIVE
```

### Cenário C

```text id="7l01zo"
Given event already processed
When same webhook arrives
Then no duplicated financial effect
```

---

# 110. Critérios de aceite — inadimplência

```text id="0dnp25"
Given ACTIVE subscription
When renewal fails
Then status PAST_DUE
And customer notified
And data preserved
```

Depois:

```text id="8cn9j7"
Given grace period expired
And payment remains unpaid

Then:
license READ_ONLY
subscription SUSPENDED
data preserved
```

E:

```text id="f6g7un"
Given SUSPENDED
When valid payment confirmed
Then FULL ACCESS restored automatically
```

---

# 111. Critérios de aceite — cancelamento

```text id="ny1lh4"
Given paid through 31/10
When user cancels 16/10
Then:
cancel_at_period_end=true
FULL access until 31/10
No next renewal
```

Isso evita punir o cliente que já pagou pelo período.

---

# 112. Critérios de aceite — usuário ilimitado

Esse teste é importante comercialmente.

```text id="blvlmg"
Given Business active
When Admin creates user 1
And user 10
And user 50
Then:
subscription amount unchanged
```

Mas políticas de segurança e uso razoável continuam aplicáveis.

---

# 113. Testes de caos

Antes de vender, eu testaria também:

```text id="cwlkgp"
Stripe indisponível
IA indisponível
OCR indisponível
Banco reinicia
Queue reinicia
Webhook chega fora de ordem
Webhook chega 20 vezes
E-mail falha
Storage fica temporariamente indisponível
```

O EIP não pode concluir:

> Stripe não respondeu → cliente está inadimplente.

Ausência de confirmação **não é automaticamente inadimplência**.

---

# 114. Plano anual

Eu manteria:

**Start:** R$9.900/ano
**Business:** R$19.900/ano
**Pro:** R$34.900/ano

Mas trataria isso como **hipótese comercial inicial**, não como preço definitivo.

No checkout:

```text id="ynsd9w"
○ Mensal
● Anual

Economize aproximadamente
2 mensalidades
```

---

# 115. Impostos e documento fiscal

Aqui existe uma frente que não devemos esquecer.

**Pagamento recebido não é a mesma coisa que emissão fiscal.**

Você precisará definir com contador/tributarista como a empresa que comercializará o EIP emitirá o documento fiscal correspondente ao SaaS, considerando município, regime tributário e enquadramento efetivo da operação.

Então eu já criaria uma abstração:

```text id="vlqjj4"
FISCAL_DOCUMENT

tenant_id
payment_id
provider
status
document_number
issued_at
document_reference
```

Mesmo que a integração fiscal automática venha posteriormente.

---

# 116. Billing ≠ Accounting ≠ Fiscal

Separar:

```text id="b1bs2j"
BILLING
O que cobrar

PAYMENT
O que foi pago

FISCAL
Documento fiscal

ACCOUNTING
Registro contábil
```

Não misture tudo em `payments`.

Isso vai facilitar bastante quando o EIP crescer.

---

# 117. Dashboard Super Admin

Eu faria a primeira tela assim:

```text id="0brvga"
EIP SaaS Command Center

MRR                    R$ 19.900
ARR                    R$238.800

Clientes ativos              10
Novos este mês                3
Inadimplentes                  1
Cancelamentos                  0

ARPA                    R$1.990

Receita do mês         R$19.900
Custo IA                R$1.430
Cloud                     R$850
Outros custos variáveis   R$420
──────────────────────────────
Margem contribuição     R$17.200
```

No início, alguns custos podem ser estimados.

Depois você melhora a alocação.

---

# 118. Funil comercial

O Command Center também deve mostrar:

```text id="b59mrh"
VISITANTES
     ↓
LEADS
     ↓
DEMO
     ↓
TRIAL
     ↓
CHECKOUT
     ↓
PAID
     ↓
ACTIVATED
     ↓
FIRST EXPORT
     ↓
ACTIVE 30D
```

Porque não basta saber quantos compraram.

Precisamos descobrir **onde estamos perdendo empresas**.

---

# 119. Eventos de produto

Eu criaria desde já:

```text id="1h5l42"
PRODUCT_EVENT

tenant_id
user_id
event
properties
occurred_at
```

Exemplos:

```text id="aok4y5"
SIGNUP_STARTED
SIGNUP_COMPLETED
PLAN_VIEWED
CHECKOUT_STARTED
CHECKOUT_COMPLETED

ONBOARDING_STARTED
PRODUCT_CREATED
CUSTOMER_CREATED
EXPORT_CREATED
FIRST_EXPORT_CREATED
DOCUMENT_GENERATED
AI_USED
```

Isso permitirá analisar adoção sem depender de achismo.

---

# 120. North Star Metric

Para o EIP, eu **não usaria usuários ativos** como principal indicador.

Eu acompanharia algo mais próximo de:

> **Empresas com operações de exportação ativas gerenciadas pelo EIP.**

Porque 200 logins não significam necessariamente valor.

Se 50 empresas estão efetivamente executando exportações pelo EIP, você está inserido no processo crítico delas.

---

# 121. Definição de ativação

Eu definiria um tenant como `ACTIVATED` quando completar, por exemplo:

```text id="bdibm1"
Empresa configurada
+
1 produto cadastrado/importado
+
1 cliente/importador cadastrado
+
1 operação de exportação criada
```

Posteriormente os dados reais dirão se essa definição está correta.

---

# 122. Onboarding progressivo

O EIP deveria mostrar:

```text id="h3swq3"
Configuração da sua empresa
████████░░ 80%

✓ Dados da empresa
✓ Produto
✓ Cliente
✓ Usuários
○ Primeira exportação
```

E o AI Hub pode dizer:

> “Sua configuração está quase concluída. Posso ajudar a criar sua primeira operação de exportação.”

Isso conecta comercialização e IA.

---

# 123. O que eu NÃO faria na V1

Para evitar transformar essa etapa em mais seis meses de desenvolvimento, eu deixaria fora inicialmente:

**Marketplace de planos complexos, billing por usuário, múltiplas moedas, dezenas de gateways, cobrança minuto a minuto de IA, faturamento extremamente granular, SSO Enterprise completo, SCIM e contratos automáticos extremamente customizáveis.**

Primeiro:

> **Venda para 10 empresas.**

Depois os próprios clientes mostrarão o que precisa ser sofisticado.

---

# 124. Definition of Done da V1 comercial

Eu só consideraria essa fase concluída quando for possível executar este teste ponta a ponta:

```text id="5vsytk"
1. Acesso www.eip...
2. Escolho Business
3. Cadastro minha empresa
4. Cadastro administrador
5. Aceito Termos
6. Cadastro cartão
7. Pago
8. EIP recebe confirmação
9. Tenant é ativado
10. Faço onboarding
11. Convido 10 usuários
12. Mensalidade não muda
13. Começo exportação
14. Consulto assinatura
15. Altero cartão
16. Cancelo
17. Continuo até fim período pago
18. Solicito exportação
19. Recebo meus dados
20. Tenant entra em retenção
```

E o fluxo inverso:

```text id="gip0h3"
Pagamento falha
↓
aviso
↓
grace period
↓
read-only
↓
dados permanecem intactos
↓
pagamento efetuado
↓
acesso automaticamente restaurado
```

Se os dois funcionarem corretamente, **o EIP já possui um verdadeiro ciclo de vida SaaS**.

---

## 125. Decisão comercial que eu congelaria para a primeira versão

Eu partiria com:

**EIP Start — R$990/mês**
**EIP Business — R$1.990/mês** ⭐
**EIP Pro — R$3.490/mês**
**Enterprise — personalizado**

Todos com **usuários ilimitados**.

**1 CNPJ incluído**, mas arquitetura preparada para múltiplos CNPJs.

Business seria o plano destacado.

E para prospecção inicial:

> **EIP Founders — Business por R$1.490/mês durante os primeiros 12 meses, limitado aos primeiros 20 clientes selecionados.**

Esses preços ainda devem ser tratados como hipótese até termos entrevistas/pilotos e dados de custo real. Pelo escopo que você vem construindo — IA em praticamente todas as telas, documentos, exportações, logística, financeiro, compliance, workflows, BI e integrações — é especialmente importante não posicionar o EIP como um software barato de gestão genérica.

Na próxima parte, eu fecharia o projeto com algo muito útil: **o prompt mestre de implementação do “EIP SaaS Commercialization & Billing v1.0”**, escrito para você literalmente copiar e colar na IA que está desenvolvendo o EIP, determinando arquitetura, banco, backend, frontend, segurança, Stripe, telas, testes e ordem de execução **sem permitir que ela destrua ou reescreva os módulos que você já construiu**.

Vamos fechar o **prompt mestre de implementação**, com uma preocupação central: acrescentar a camada comercial ao EIP **sem quebrar o que já existe**.

## 126. Antes do prompt: regra principal

Como seu EIP já está avançado, eu não daria para uma IA uma instrução do tipo “implemente tudo”. Primeiro ela deve executar uma fase de **Discovery/Impact Analysis**, identificar stack, autenticação, banco, modelo multi-tenant e módulos existentes e somente então propor migrations incrementais.

O princípio será:

> **Extend, don't rebuild.**

Ou seja: ampliar a arquitetura existente, não reconstruí-la.

---

## 127. Prompt Mestre — EIP SaaS Commercialization & Billing v1.0

Este texto já é reutilizável para passar à IA/equipe que está desenvolvendo o EIP.

# EIP — SAAS COMMERCIALIZATION & BILLING V1.0

## MASTER IMPLEMENTATION SPECIFICATION

Você atuará como arquiteto de software sênior, engenheiro full-stack, especialista em SaaS B2B multi-tenant, segurança, billing e integração de pagamentos para implementar a camada de comercialização, assinatura, licenciamento e faturamento do EIP — Export Integration Platform.

A implementação deverá respeitar integralmente a arquitetura existente do EIP.

## REGRA ABSOLUTA Nº 1 — NÃO RECONSTRUIR O EIP

Antes de escrever código:

1. Analise a estrutura atual do projeto.
2. Identifique frontend, backend, banco de dados, autenticação, autorização, modelo multi-tenant, APIs, filas, storage e infraestrutura.
3. Identifique as entidades e módulos já existentes.
4. Identifique padrões arquiteturais e convenções do projeto.
5. Identifique migrations existentes.
6. Identifique componentes reutilizáveis.
7. Produza uma análise de impacto.

NÃO:

* substitua tecnologias existentes sem necessidade;
* recrie autenticação já existente;
* recrie entidades existentes;
* renomeie tabelas indiscriminadamente;
* remova campos existentes;
* altere contratos de API existentes sem análise;
* faça migrations destrutivas;
* apague dados;
* reescreva módulos funcionais;
* introduza nova arquitetura paralela desnecessária.

Priorize implementação incremental e compatível.

---

# 1. OBJETIVO

Transformar o EIP em um SaaS B2B comercialmente autônomo, permitindo que empresas:

* conheçam os planos;
* cadastrem sua organização;
* contratem o EIP;
* aceitem os documentos legais;
* cadastrem forma de pagamento;
* realizem pagamento recorrente;
* tenham a licença ativada automaticamente;
* convidem usuários ilimitados;
* administrem sua assinatura;
* alterem plano quando permitido;
* atualizem forma de pagamento;
* cancelem a assinatura;
* sejam tratadas adequadamente em caso de inadimplência;
* recuperem acesso automaticamente após pagamento;
* solicitem exportação de seus dados;
* mantenham seus dados preservados conforme política de retenção.

---

# 2. MODELO COMERCIAL

A cobrança NÃO será baseada em quantidade de usuários.

A unidade comercial é a ORGANIZAÇÃO.

Todos os planos terão usuários ilimitados.

Modelo inicial:

START
R$ 990/mês

BUSINESS
R$ 1.990/mês

PRO
R$ 3.490/mês

ENTERPRISE
Preço personalizado.

Plano anual inicial:

START
R$ 9.900/ano

BUSINESS
R$ 19.900/ano

PRO
R$ 34.900/ano

Os preços NÃO deverão ser hardcoded no frontend.

Criar estrutura versionável de preços.

Mudanças futuras de preço não devem alterar automaticamente contratos históricos.

---

# 3. ESTRUTURA ORGANIZACIONAL

Preferencialmente utilizar:

ORGANIZATION/TENANT
↓
LEGAL_ENTITY
↓
CNPJ

Uma organização poderá possuir um ou mais CNPJs.

Na oferta comercial inicial:

1 CNPJ incluído.

Usuários ilimitados.

A arquitetura deverá permitir futuramente CNPJs adicionais mediante addon.

Se o projeto existente já utilizar outra estrutura multi-tenant, NÃO substituí-la automaticamente.

Primeiro mapear a estrutura existente e propor a adaptação mínima necessária.

---

# 4. USUÁRIOS

Usuários não deverão ser diretamente responsáveis pela licença.

A associação deverá ocorrer através da organização/tenant.

Preferencialmente:

USER

TENANT_MEMBERSHIP

ROLE

PERMISSION

MEMBERSHIP_ROLE

ROLE_PERMISSION

Preservar o RBAC/ABAC existente caso já exista.

Criar permissões comerciais específicas quando necessárias:

BILLING_VIEW

BILLING_MANAGE

PLAN_CHANGE

SUBSCRIPTION_CANCEL

PAYMENT_METHOD_CHANGE

DATA_EXPORT_REQUEST

TENANT_CLOSE

OWNERSHIP_TRANSFER

---

# 5. OWNER

Toda organização deverá possuir um responsável principal equivalente a:

ORGANIZATION_OWNER

O Owner terá autoridade sobre:

* assinatura;
* faturamento;
* administradores;
* exportação dos dados;
* cancelamento;
* transferência de propriedade;
* configurações críticas.

Não confundir Owner com administrador operacional.

---

# 6. PLANOS

Criar ou adaptar entidades equivalentes a:

PLAN

PLAN_PRICE

FEATURE

PLAN_FEATURE

PLAN_LIMIT

ADDON

ENTITLEMENT_OVERRIDE

Os nomes físicos poderão ser adaptados aos padrões existentes do projeto.

---

# 7. ENTITLEMENT ENGINE

NÃO condicionar funcionalidades diretamente ao nome do plano.

Evitar:

if plan == "PRO"

Utilizar mecanismo de entitlement:

canUse(tenant, feature)

getLimit(tenant, feature)

getUsage(tenant, feature)

Exemplos de features:

AI_ASSISTANT

AI_OCR

AI_TRANSLATION

AI_NCM

AI_RISK

EXPORT_MANAGEMENT

DOCUMENT_MANAGEMENT

LOGISTICS

FINANCIAL

COMPLIANCE

ADVANCED_COMPLIANCE

WORKFLOW

BI_ADVANCED

API_ACCESS

ERP_INTEGRATION

BANK_INTEGRATION

AUDIT_ADVANCED

---

# 8. ASSINATURA

Criar ou adaptar entidade SUBSCRIPTION contendo conceitualmente:

id

tenant_id

plan_id

plan_price_id

provider

provider_customer_id

provider_subscription_id

status

billing_interval

currency

trial_start

trial_end

current_period_start

current_period_end

grace_period_end

cancel_at_period_end

canceled_at

ended_at

created_at

updated_at

---

# 9. ESTADOS DA ASSINATURA

Implementar máquina de estados equivalente a:

INCOMPLETE

TRIALING

ACTIVE

PAST_DUE

GRACE_PERIOD

SUSPENDED

CANCELED

TERMINATED

Transições deverão ocorrer através de serviços de domínio controlados.

Evitar alterações arbitrárias diretamente no banco.

---

# 10. LICENÇA

Separar estado comercial da assinatura do estado operacional do tenant.

Criar conceito equivalente a:

TENANT_LICENSE

Estados de acesso:

FULL

READ_ONLY

BILLING_ONLY

NONE

Exemplo:

ACTIVE
→ FULL

PAST_DUE
→ inicialmente FULL com alerta

GRACE_PERIOD
→ FULL com alertas

SUSPENDED
→ READ_ONLY

TERMINATED
→ BILLING_ONLY ou política correspondente.

Nunca eliminar dados automaticamente por falha de pagamento.

---

# 11. PAGAMENTOS

Utilizar Stripe inicialmente como Payment Service Provider.

Entretanto, criar abstração para evitar acoplamento excessivo do domínio ao provedor.

Conceitos internos:

BillingProvider

Customer

Subscription

Payment

Invoice

Refund

ProviderEvent

DomainEvent

O restante do EIP deverá reagir preferencialmente a eventos internos como:

PaymentSucceeded

PaymentFailed

SubscriptionActivated

TenantSuspended

TenantReactivated

SubscriptionCanceled

e não diretamente a nomes específicos da Stripe.

---

# 12. SEGURANÇA DE CARTÃO

NUNCA armazenar:

* número completo do cartão;
* CVV;
* dados sensíveis desnecessários.

Utilizar tokenização e componentes seguros fornecidos pelo PSP.

O EIP poderá armazenar referências e informações não sensíveis necessárias à experiência do usuário, conforme permitido e necessário.

---

# 13. CHECKOUT

Criar fluxo:

SELECT PLAN

↓

COMPANY

↓

ADMIN/OWNER

↓

LEGAL ACCEPTANCE

↓

PAYMENT

↓

PAYMENT CONFIRMATION

↓

LICENSE ACTIVATION

↓

ONBOARDING

A página de sucesso no frontend NÃO é prova de pagamento.

A licença somente deverá ser ativada após confirmação confiável do backend/provedor.

---

# 14. WEBHOOK

Criar endpoint seguro equivalente a:

POST /api/v1/webhooks/stripe

Obrigatório:

* validar autenticidade/assinatura;
* idempotência;
* event_id único;
* persistência do evento;
* tratamento de eventos fora de ordem;
* retries;
* observabilidade;
* logs seguros;
* processamento assíncrono quando adequado.

Não executar tarefas longas diretamente no request do webhook.

Preferir:

Webhook
→ Validate
→ Persist
→ Queue
→ HTTP Success

Worker
→ Process
→ Domain Event.

---

# 15. INADIMPLÊNCIA

Implementar régua configurável.

Modelo inicial:

D+0
Pagamento falhou.

D+3
Nova tentativa/notificação.

D+7
Nova tentativa e aviso.

D+15
Suspensão operacional.

Os prazos deverão ser configuráveis, não hardcoded quando possível.

Durante suspensão:

* preservar dados;
* não excluir documentos;
* não excluir operações;
* bloquear criação/alteração conforme política;
* permitir regularização financeira;
* permitir funcionalidades necessárias à saída/exportação conforme política.

---

# 16. REATIVAÇÃO

Quando pagamento válido for confirmado:

SUSPENDED

↓

PaymentSucceeded

↓

Subscription ACTIVE

↓

License FULL

↓

Cache invalidation

↓

Acesso restaurado.

Esse processo deverá ser automático e idempotente.

---

# 17. CANCELAMENTO

Permitir cancelamento pelo usuário autorizado.

Por padrão:

cancel_at_period_end = true

Se o cliente já pagou até determinada data, manter acesso durante o período pago, salvo hipóteses contratuais específicas.

Não confundir cancelamento voluntário com inadimplência.

---

# 18. EXPORTAÇÃO DOS DADOS

Criar serviço DATA_EXPORT.

Usuários autorizados poderão solicitar pacote contendo os dados da organização.

Preferencialmente:

ZIP

contendo:

company/

products/

customers/

suppliers/

exports/

lots/

documents/

invoices/

logistics/

financial/

compliance/

audit/

manifest.json

A estrutura deverá refletir os módulos realmente existentes.

Não exportar dados de outros tenants.

Não exportar código-fonte, segredos, algoritmos ou estruturas proprietárias desnecessárias.

---

# 19. SEGURANÇA DA EXPORTAÇÃO

Solicitação deverá exigir:

* permissão específica;
* autenticação válida;
* MFA recente ou step-up authentication para ações críticas.

O arquivo deverá:

* ser gerado assincronamente;
* permanecer em storage privado;
* utilizar autorização temporária para download;
* possuir expiração;
* ser auditado;
* nunca ser publicamente acessível.

---

# 20. DATA LIFECYCLE

Implementar estados/processos equivalentes a:

ACTIVE

SUSPENDED

CANCELED

RETENTION

DELETION_PENDING

DELETED/ANONYMIZED

A exclusão deverá respeitar:

* política contratual;
* obrigações legais;
* legal hold;
* regras de retenção;
* auditoria.

Nunca vincular diretamente payment_failed a DELETE.

---

# 21. LEGAL DOCUMENTS

Criar versionamento de:

TERMS_OF_USE

PRIVACY_POLICY

DPA

AI_POLICY, quando aplicável.

Registrar:

document_id

version

content_hash

published_at

effective_at

status.

---

# 22. LEGAL ACCEPTANCE

Registrar aceite contendo:

tenant_id

user_id

document_id

version

accepted_at

IP, quando apropriado

user_agent, quando apropriado

content_hash

e demais evidências tecnicamente e juridicamente apropriadas.

O histórico não deverá ser sobrescrito quando uma nova versão for publicada.

---

# 23. USAGE METERING

Criar mecanismo para medir recursos de custo variável:

AI

OCR

STORAGE

API

DOCUMENT PROCESSING

Utilizar:

USAGE_EVENT

e agregações periódicas.

Os eventos deverão possuir idempotency_key quando aplicável.

---

# 24. CRÉDITOS DE IA

Não expor necessariamente tokens técnicos ao cliente.

Criar conceito comercial de:

EIP AI CREDITS.

Internamente registrar consumo e custo real por:

tenant

feature

provider

model

period.

Evitar registrar conteúdo sensível integralmente em logs comuns.

---

# 25. AUDITORIA

Criar ou ampliar AUDIT_LOG.

Registrar eventos críticos:

USER_INVITED

ROLE_CHANGED

PLAN_CHANGED

PAYMENT_SUCCEEDED

PAYMENT_FAILED

SUBSCRIPTION_CANCELED

TENANT_SUSPENDED

TENANT_REACTIVATED

DATA_EXPORT_REQUESTED

DATA_EXPORT_DOWNLOADED

LEGAL_DOCUMENT_ACCEPTED

Não permitir alteração arbitrária do histórico por usuários comuns.

---

# 26. MULTI-TENANT SECURITY

Este requisito é P0.

Usuário pertencente ao Tenant A jamais poderá acessar recursos do Tenant B.

Validar isolamento em:

* APIs;
* queries;
* storage;
* documentos;
* relatórios;
* exportações;
* IA;
* financeiro;
* compliance;
* billing;
* usuários;
* anexos.

Nunca confiar em tenant_id recebido diretamente do frontend para autorização.

Derivar contexto do tenant da identidade autenticada e membership válida.

---

# 27. SUPER ADMIN

Criar área administrativa segura para gestão do SaaS.

Exibir inicialmente:

MRR

ARR

clientes ativos

novos clientes

cancelamentos

inadimplentes

receita

ARPA

plano por cliente

próximas cobranças

falhas de pagamento

tenants suspensos

uso de IA

uso de OCR

storage

data exports.

Separar permissões de Super Admin das permissões dos tenants.

---

# 28. MÉTRICAS

Registrar desde a V1:

MRR

ARR

ARPA

NEW MRR

EXPANSION MRR

CONTRACTION MRR

CHURN MRR

CUSTOMER CHURN

TRIAL TO PAID

TIME TO FIRST VALUE

AI COST PER TENANT

OCR COST PER TENANT

VARIABLE COST PER TENANT

CONTRIBUTION MARGIN.

---

# 29. PRODUCT EVENTS

Criar telemetria apropriada para eventos como:

SIGNUP_STARTED

SIGNUP_COMPLETED

PLAN_VIEWED

CHECKOUT_STARTED

CHECKOUT_COMPLETED

ONBOARDING_STARTED

PRODUCT_CREATED

CUSTOMER_CREATED

EXPORT_CREATED

FIRST_EXPORT_CREATED

AI_USED.

Evitar coleta desnecessária de conteúdo sensível.

---

# 30. ONBOARDING

Após ativação, não direcionar simplesmente para dashboard vazio.

Criar onboarding progressivo:

Empresa

Dados fiscais

Produtos

Clientes

Integrações

Usuários

Primeira exportação.

Mostrar progresso.

Integrar o AI Hub do EIP como assistente de onboarding quando compatível com a arquitetura existente.

---

# 31. FISCAL

Não confundir:

BILLING

PAYMENT

FISCAL_DOCUMENT

ACCOUNTING.

Preparar abstração para futura integração fiscal.

Não implementar regra tributária presumida sem definição contábil/fiscal formal.

---

# 32. BACKUPS

Backup operacional é diferente de Data Export.

Implementar/verificar:

* backups automáticos;
* criptografia;
* retenção;
* segregação;
* monitoramento;
* testes periódicos de restore.

Não considerar backup válido apenas porque o job informa sucesso.

Realizar teste de restauração.

---

# 33. OBSERVABILIDADE

Registrar, conforme apropriado:

request_id

correlation_id

tenant_id

user_id

service

duration

status.

Nunca registrar:

password

CVV

card number

API secrets

access tokens

documentos sensíveis desnecessariamente.

---

# 34. MIGRATIONS

Toda alteração de banco deverá:

1. ser versionada;
2. possuir rollback quando tecnicamente seguro;
3. evitar operações destrutivas;
4. preservar dados existentes;
5. ser testada em staging;
6. considerar tabelas grandes;
7. manter compatibilidade durante rollout quando necessário.

Antes de migration potencialmente destrutiva, PARAR e solicitar aprovação.

---

# 35. TESTES P0

Implementar testes automatizados para:

tenant isolation

successful payment

failed payment

duplicate webhook

out-of-order webhook

subscription activation

grace period

suspension

reactivation

cancel at period end

plan changes

unlimited users

legal acceptance

data export

cross-tenant export attack

authorization

storage authorization

backup/restore.

---

# 36. PROIBIÇÕES

NÃO:

* cobrar por usuário;
* limitar usuários comercialmente;
* armazenar CVV;
* confiar no frontend para preço;
* confiar no frontend para confirmação de pagamento;
* apagar tenant por inadimplência;
* entregar dump global do banco;
* permitir URL pública permanente de backup;
* misturar cancelamento e inadimplência;
* permitir acesso cross-tenant;
* alterar registros financeiros históricos destrutivamente;
* sobrescrever histórico de aceite jurídico;
* hardcodar regras comerciais quando puderem ser configuráveis;
* reconstruir módulos existentes sem necessidade.

---

# 37. ORDEM DE IMPLEMENTAÇÃO

FASE 0
Discovery e Impact Analysis.

FASE 1
Schema/migrations incrementais.

FASE 2
Plans, Prices, Features, Entitlements.

FASE 3
Subscription + License.

FASE 4
Stripe + Checkout + Webhooks.

FASE 5
Billing UI.

FASE 6
Dunning + Suspension + Reactivation.

FASE 7
Legal Acceptance.

FASE 8
Data Export.

FASE 9
Onboarding.

FASE 10
Super Admin + SaaS Metrics.

FASE 11
Security Review.

FASE 12
Staging End-to-End.

FASE 13
Production rollout controlado.

---

# 38. PRIMEIRA RESPOSTA OBRIGATÓRIA

NÃO comece imediatamente a implementar.

Primeiro apresente:

1. arquitetura atual identificada;
2. componentes existentes reutilizáveis;
3. modelo atual de tenant;
4. modelo atual de autenticação/autorização;
5. banco e ORM existentes;
6. riscos de impacto;
7. tabelas novas propostas;
8. tabelas existentes que precisam ser alteradas;
9. endpoints propostos;
10. migrations propostas;
11. dependências;
12. plano de implementação por fases;
13. riscos de segurança;
14. dúvidas bloqueantes.

Somente após essa análise iniciar a implementação, preservando integralmente os módulos existentes sempre que possível.

# RESULTADO ESPERADO

Ao término, uma empresa deverá conseguir:

Visitar EIP
→ escolher plano
→ cadastrar organização/CNPJ
→ criar Owner
→ aceitar documentos legais
→ cadastrar pagamento
→ pagar
→ ter tenant ativado
→ concluir onboarding
→ cadastrar usuários ilimitados
→ utilizar EIP
→ administrar faturamento
→ cancelar
→ exportar dados.

E em inadimplência:

Payment Failed
→ aviso
→ grace period
→ read-only
→ dados preservados
→ regularização
→ acesso automaticamente restaurado.

O resultado deverá transformar o EIP em um SaaS B2B comercialmente autônomo sem comprometer a segurança, arquitetura, dados ou funcionalidades existentes.

## 128. Não mandaria a IA executar tudo de uma vez

Esse ponto é importante. Eu entregaria o prompt mestre, mas a primeira execução seria **somente Fase 0 — Discovery**.

Quando ela devolver algo como:

> “Seu EIP usa React + Java/Spring + PostgreSQL...”
> “A tabela X já representa Tenant...”
> “O RBAC existente pode ser reaproveitado...”
> “Precisamos destas 8 migrations...”

você analisa antes de autorizar alterações.

Isso evita que uma IA veja uma arquitetura complexa e decida “melhorar” 40 arquivos que já estavam funcionando.

## 129. Prompt para iniciar somente a Fase 0

Eu usaria esta instrução logo depois do documento acima:

Execute **exclusivamente a FASE 0 — Discovery & Impact Analysis** da especificação EIP SaaS Commercialization & Billing v1.0.

NÃO implemente código nesta etapa.

NÃO crie migrations.

NÃO altere banco de dados.

NÃO instale dependências.

NÃO altere arquivos.

NÃO refatore componentes existentes.

Analise o projeto atual e apresente:

1. Stack completa identificada.
2. Estrutura frontend.
3. Estrutura backend.
4. Banco de dados e ORM.
5. Sistema atual de autenticação.
6. Sistema atual de autorização/RBAC/ABAC.
7. Implementação multi-tenant existente.
8. Entidades/tabelas relacionadas a empresas, usuários e tenants.
9. Serviços existentes reutilizáveis.
10. Infraestrutura, filas, cache e storage identificados.
11. Arquitetura atual de IA e integrações.
12. Módulos que poderão ser impactados.
13. Riscos de regressão.
14. Riscos de segurança.
15. Novas entidades propostas.
16. Entidades existentes que precisariam de alteração.
17. Migrations que seriam necessárias, sem executá-las.
18. APIs que seriam criadas.
19. Componentes/telas que seriam criados.
20. Dependências adicionais potencialmente necessárias.
21. Estratégia para integração Stripe.
22. Estratégia para preservar compatibilidade.
23. Plano de implementação dividido em commits pequenos e reversíveis.
24. Dúvidas ou decisões que precisam da minha aprovação.

Ao final, apresente uma seção:

**GO / NO-GO PARA FASE 1**

Não avance para a Fase 1 sem minha autorização expressa.

Essa é a instrução que eu utilizaria **primeiro** no ambiente de desenvolvimento.

---

## 130. E existe uma decisão estratégica adicional

Depois de tudo que desenhamos, eu incluiria no EIP uma **camada de Feature Entitlements universal desde agora**, inclusive para funcionalidades que inicialmente estarão disponíveis em todos os planos.

Isso permitirá no futuro lançar, sem reconstruir o produto:

```text id="frznp6"
EIP Start
EIP Business
EIP Pro
EIP Enterprise

+ AI Pack
+ Compliance Pack
+ API Pack
+ Additional CNPJ
+ Storage Pack
+ OCR Pack
```

Ou até planos verticais:

```text id="36ckgb"
EIP Agro
EIP Trading
EIP Industry
EIP Logistics
```

A arquitetura que você já vem construindo — Command Center, AI Hub, Compliance, Workflow Designer, BI, Marketplace e API Center — se presta bastante a esse modelo modular.

## 131. Próxima coisa que eu faria no seu lugar

Agora eu **pararia de aumentar o escopo técnico por alguns momentos**. Já temos arquitetura suficiente.

Faltam duas coisas muito importantes antes de definir que R$ 1.990 é realmente o preço certo:

**modelar financeiramente o SaaS** e **validar o preço contra concorrentes/alternativas reais do mercado brasileiro de comércio exterior**.

Eu faria uma análise de mercado de softwares de gestão de exportação/comércio exterior, ERPs/soluções SaaS comparáveis e construiria uma simulação para **10, 25, 50, 100, 250 e 500 empresas**, incluindo receita recorrente, Stripe, impostos como premissas ajustáveis, cloud, IA/OCR, suporte, margem, MRR e ARR.

Isso vai responder uma questão essencial antes de você publicar os preços: **R$ 990 / R$ 1.990 / R$ 3.490 é uma estrutura economicamente sustentável e comercialmente defensável para o EIP, ou devemos reposicioná-la?**

Pesquisei preços públicos atuais no mercado brasileiro de software de comércio exterior, plataformas com IA e algumas referências internacionais. Minha conclusão é que **há espaço para aumentar os preços do EIP**, principalmente porque o produto que você está construindo pretende ser mais abrangente que várias soluções de entrada: operação de exportação, documentos, logística, financeiro, compliance, workflow, BI, integrações e IA transversal.

## O que encontrei no mercado

Há uma dispersão grande de preços porque os produtos não são equivalentes.

O **Volion COMEX**, por exemplo, publica Basic a **R$ 699/mês**, Professional a **R$ 1.999/mês** e Unlimited sob consulta. O Professional limita a 5 CNPJs e 3 operadores. ([Volion COMEX][1])

O **ComexOS** publica Pro a **R$ 997/mês**, com 50 processos/mês e usuários limitados, e Enterprise a **R$ 1.497/mês**, com 200 processos/mês, 10 usuários + administradores, auditoria, IA, Portal Único e API/integrações. O produto Operations, voltado a operações multicliente, aparece por **R$ 1.997/mês** e inclui franquias de processos e IA. ([Comexos][2])

A **Tradexa** está em outro perfil: Growth custa somente **R$ 289/mês**, mas trabalha com franquias/créditos; o Business, com uso ilimitado e suporte prioritário, aparece por **R$ 3.200/mês**. ([Tradexa][3])

Já o **ComexAgil** mostra como funcionalidades especializadas de IA podem sustentar tickets maiores: o Duimp IA aparece por **R$ 2.200/mês para 1.000 documentos** e **R$ 4.600/mês para 10.000 documentos**. ([ComexAgil][4])

E players corporativos como **Narwal** e **Conexos** apresentam plataformas amplas e normalmente direcionam o cliente para demonstração/proposta em vez de expor uma tabela simples de preços. A Narwal, por exemplo, apresenta IA, gestão de embarques, Siscomex, ERP, financeiro, NPI/DUIMP e outros componentes e afirma atender mais de 1.300 importadores/exportadores ativos. ([Narwal Sistemas][5])

Internacionalmente, suites de Global Trade Management empresariais frequentemente são **quote-based**, com preço dependendo de entidades jurídicas, módulos, transações, integrações e conteúdo regulatório. ([TrustRadius][6])

### Portanto, eu mudaria nossa tabela.

Em vez de:

| Plano anterior |    Preço |
| -------------- | -------: |
| Start          |   R$ 990 |
| Business       | R$ 1.990 |
| Pro            | R$ 3.490 |

Eu lançaria o EIP desta maneira:

| Plano EIP          |        **Novo preço mensal** |    Anual sugerido |
| ------------------ | ---------------------------: | ----------------: |
| **EIP Start**      |             **R$ 1.290/mês** | **R$ 12.900/ano** |
| **EIP Business** ⭐ |             **R$ 2.490/mês** | **R$ 24.900/ano** |
| **EIP Pro**        |             **R$ 4.490/mês** | **R$ 44.900/ano** |
| **EIP Enterprise** | **a partir de R$ 6.990/mês** |          proposta |

Essa é a tabela que eu usaria como **hipótese de lançamento**, sujeita a validação com clientes-piloto.

## Por que considero R$ 2.490 o ponto central interessante

O Business é o plano que eu quero que a maioria dos clientes compre.

Compare:

**Volion Professional:** R$ 1.999/mês, até 3 operadores. ([Volion COMEX][1])

**ComexOS Operations:** R$ 1.997/mês, 250 processos/mês e franquias específicas de IA. ([Comexos][7])

**Tradexa Business:** R$ 3.200/mês. ([Tradexa][3])

**ComexAgil Duimp IA:** R$ 2.200/mês apenas para a oferta Normal do módulo especializado de DUIMP IA. ([ComexAgil][4])

Nesse contexto, **R$ 2.490/mês para o Business não me parece fora da realidade**, desde que o EIP entregue bem o escopo prometido e você consiga demonstrar esse valor na venda.

E você ainda terá um argumento bastante simples:

> **R$ 2.490 é o preço da empresa, não de cada usuário.**

Uma empresa com 20 funcionários usando o EIP continua pagando R$ 2.490.

Isso representa:

**R$ 124,50 por usuário equivalente/mês**, embora você não cobre por usuário.

---

# Eu faria o Start propositalmente menos agressivo

O Start por **R$ 1.290** não deveria ser simplesmente “EIP barato”.

Seria:

**EIP Start — R$ 1.290/mês**

Usuários ilimitados, 1 CNPJ, gestão de exportação, produtos/NCM, clientes, documentos, logística essencial, financeiro essencial, dashboards básicos, AI Assistant e franquia limitada de OCR/IA.

O objetivo é fazer uma pequena exportadora conseguir entrar.

Mas recursos mais sofisticados ficariam no Business.

---

# Business seria o verdadeiro EIP

### EIP Business — R$ 2.490/mês ⭐

Aqui eu colocaria:

**Usuários ilimitados + exportações ilimitadas + 1 CNPJ + AI Hub + OCR + tradução + geração/análise documental + logística + financeiro + compliance + Workflow Designer + BI + integrações padrão + auditoria.**

Com uma franquia generosa de IA/OCR.

No site:

> ### BUSINESS
>
> **R$ 2.490/mês**
>
> Para empresas que querem centralizar sua operação de exportação.
>
> **Usuários ilimitados**
>
> **Mais escolhido**

Esse seria o produto que você realmente quer vender.

---

# Pro passa a R$ 4.490

Aqui é onde começa a operação realmente sofisticada.

### EIP Pro — R$ 4.490/mês

Tudo do Business mais:

**API Center**, integrações avançadas com ERP/bancos, compliance avançado, OFAC/ONU/PEP/AML/KYC quando efetivamente disponibilizados, auditoria avançada, BI avançado, automações avançadas, maior franquia IA/OCR, suporte prioritário e recursos adicionais de segurança/governança.

Para uma empresa que realmente depende do comércio exterior, R$ 4.490 representa aproximadamente **R$ 150 por dia**.

Uma automação que evite retrabalho, erro documental, atraso ou horas de equipe pode justificar economicamente esse valor — mas isso deve ser demonstrado por casos reais, não apenas alegado no marketing.

---

# Enterprise eu não deixaria simplesmente “sob consulta”

Eu faria algo interessante:

### ENTERPRISE

**A partir de R$ 6.990/mês**

Isso cria uma âncora.

Depois:

> Preço personalizado de acordo com CNPJs, integrações, volume, SLA e necessidades da operação.

Um grupo grande poderia acabar em:

**R$ 8 mil, R$ 12 mil, R$ 20 mil/mês ou mais**, dependendo de escopo e implantação.

Não devemos criar um teto artificial para Enterprise.

---

# 132. CNPJ adicional

Também aumentaria ligeiramente nossa proposta anterior.

Em vez de R$500:

### **CNPJ adicional: R$ 690/mês**

Assim:

Business:

```text
Empresa principal     R$ 2.490
+ CNPJ adicional      R$   690
+ CNPJ adicional      R$   690
────────────────────────────
Total                 R$ 3.870/mês
```

Ainda preservando usuários ilimitados.

Para muitos CNPJs, migra para Enterprise.

---

# 133. Pacotes adicionais

Eu também abriria uma segunda fonte de receita:

**EIP AI Pack:** +R$ 390/mês
**EIP AI Pack Plus:** +R$ 790/mês

**OCR adicional:** conforme volume.

**Storage adicional:** futuramente.

**API Pack:** se necessário.

**Onboarding Premium:** cobrança única.

Isso é consistente com o que encontramos no mercado: existem soluções cobrando por franquias, documentos, transações ou módulos, em vez de simplesmente entregar consumo variável ilimitado. ([ComexAgil][4])

---

# 134. Onboarding/implantação

Aqui eu faria outra mudança.

Não daria todo o trabalho de implantação gratuitamente para qualquer cliente.

### Start

Self-service: **R$ 0**

### Business

Onboarding padrão: **incluso**

### Pro

Onboarding assistido: **incluso**

### Implantação personalizada

**a partir de R$ 2.500**

### Integrações customizadas

**sob orçamento**

Para Enterprise, pode existir um **setup/implantação de R$ 5 mil, R$ 10 mil, R$ 20 mil+**, conforme complexidade.

Isso é normal em software B2B complexo; referências internacionais de trade-compliance/GTM indicam que implementação pode ser uma parcela significativa do custo inicial em soluções de maior porte. ([TradeComplianceSoftware.org][8])

---

# 135. Quanto isso pode gerar

Vamos usar o Business de **R$2.490** como referência simples, sem considerar churn, descontos ou mistura de planos:

| Empresas |              MRR |               ARR |
| -------: | ---------------: | ----------------: |
|   **10** |        R$ 24.900 |        R$ 298.800 |
|   **25** |        R$ 62.250 |        R$ 747.000 |
|   **50** |       R$ 124.500 |      R$ 1.494.000 |
|  **100** |   **R$ 249.000** |  **R$ 2.988.000** |
|  **250** |       R$ 622.500 |      R$ 7.470.000 |
|  **500** | **R$ 1.245.000** | **R$ 14.940.000** |

Naturalmente, isso é **receita recorrente bruta teórica**, não lucro.

Mas mostra por que R$500 de diferença no ticket é muito importante.

Com 100 clientes:

**R$1.990 → R$199.000 MRR**

versus

**R$2.490 → R$249.000 MRR**

Diferença:

> **R$50.000/mês ou R$600.000/ano.**

Sem precisar conquistar um único cliente adicional.

---

# 136. E os custos de cartão?

Aqui encontrei algo que merece atenção.

A Stripe publica atualmente no Brasil **3,99% + R$0,50 por cobrança de cartão bem-sucedida** na página do Billing, além de **0,7% do volume no Stripe Billing** para gestão de assinaturas. ([Stripe][9])

Portanto, em uma mensalidade de R$2.490, usando essa estrutura publicada como referência, só esses componentes ficariam aproximadamente em:

**Payments:** ~R$99,85
**Billing:** ~R$17,43
**Total:** ~**R$117,28**

aproximadamente **4,7%** do faturamento, antes de outros custos.

E encontrei algo que merece comparação: o **Asaas** publica cobrança recorrente por cartão e taxas padrão que podem ser menores, dependendo da condição/contrato; sua página atual mostra taxas e informa que as condições efetivas devem ser verificadas na própria conta. ([Asaas][10])

Então eu faria uma pequena mudança no PRD:

> **não acoplar o EIP exclusivamente à Stripe.**

Mantenha:

```text
BillingProvider

StripeProvider
AsaasProvider
```

mesmo que inicialmente você implemente apenas um.

Isso deixa espaço para avaliar qual provedor brasileiro entrega melhor combinação de **recorrência + cartão + Pix + boleto + NFS-e/ecossistema + custo**.

---

# 137. Cliente fundador — agora fica ainda melhor

Como o preço oficial passa para **R$2.490**, eu faria:

> ### Programa EIP Founders
>
> **Business por R$1.790/mês durante 12 meses**
>
> Preço oficial: R$2.490/mês.
>
> Exclusivo para as primeiras 20 empresas participantes do programa.

Eu prefiro **R$1.790**, e não R$1.490.

Porque R$1.490 daria desconto de aproximadamente 40%, que começa a criar uma âncora baixa demais.

R$1.790 representa cerca de 28%.

E você ganha algo em troca:

> reunião mensal de feedback;
> autorização opcional para case após resultados;
> participação no desenvolvimento;
> feedback estruturado;
> depoimento apenas se o cliente estiver satisfeito.

Depois de 12 meses:

**R$2.490/mês**, conforme as condições contratuais aplicáveis.

---

# 138. A tabela que eu congelaria agora

|             |   **START** | **BUSINESS ⭐** |        **PRO** |
| ----------- | ----------: | -------------: | -------------: |
| **Mensal**  | **R$1.290** |    **R$2.490** |    **R$4.490** |
| **Anual**   |    R$12.900 |       R$24.900 |       R$44.900 |
| Usuários    |           ∞ |              ∞ |              ∞ |
| CNPJ        |           1 |              1 |              1 |
| Exportações |   limitadas | **ilimitadas** | **ilimitadas** |
| AI Hub      |      Básico |       Completo |      Completo+ |
| OCR         |    limitado |              ✓ |             ✓✓ |
| Compliance  |      básico |       completo |       avançado |
| Workflow    |           — |              ✓ |              ✓ |
| BI          |      básico |              ✓ |       avançado |
| Integrações |     básicas |         padrão |      avançadas |
| API         |           — |              — |              ✓ |
| Auditoria   |      básica |              ✓ |       avançada |
| Suporte     |      padrão |    prioritário |        premium |

**Enterprise: a partir de R$6.990/mês.**

**CNPJ adicional: R$690/mês.**

**EIP AI Pack: R$390/mês.**

**EIP AI Pack Plus: R$790/mês.**

---

## 139. Uma recomendação importante depois da pesquisa

Eu **não aumentaria além disso antes de conseguir os primeiros clientes**.

R$2.490 coloca o Business acima de várias ofertas públicas de entrada/operacionais que encontrei, mas ainda abaixo ou próximo de ofertas mais amplas/especializadas que chegam a R$3.200, R$4.600 ou entram em negociação empresarial. ([Volion COMEX][1])

O que vai permitir subir depois para algo como:

**Business R$2.990 / Pro R$5.490**

não será simplesmente adicionar mais telas. Serão **resultados comprovados**: redução de horas operacionais, diminuição de retrabalho, menor erro documental, velocidade de processamento, integrações funcionando e clientes usando o EIP como sistema central.

Portanto, eu lançaria oficialmente em **R$1.290 / R$2.490 / R$4.490**, mas já construiria o banco com **versionamento de preços**, exatamente como especificamos anteriormente. Se os primeiros 20 clientes mostrarem boa disposição a pagar e retenção, você cria `PRICE_2027` sem mexer nos contratos históricos.

E eu faria agora a próxima etapa: **modelo financeiro completo do EIP**, usando esses novos preços e simulando **10, 25, 50, 100, 250 e 500 clientes**, com cenários Start/Business/Pro, custo de IA, OCR, cloud, gateway, suporte, impostos como premissa ajustável, margem bruta, MRR, ARR e ponto de equilíbrio. Isso nos dirá não apenas quanto o EIP pode faturar, mas **quanto pode sobrar em cada cenário**.

[1]: https://comex.volion.com.br/?utm_source=chatgpt.com "Início | Volion COMEX"
[2]: https://www.comexos.com.br/?utm_source=chatgpt.com "ComexOS — Inteligência para antecipar riscos nas importações"
[3]: https://www.tradexa.com.br/?utm_source=chatgpt.com "Tradexa — Plataforma de Comércio Exterior"
[4]: https://www.comexagil.com.br/?utm_source=chatgpt.com "ComexAgil — CCTAeasy + DuimpIA | Plataforma de comércio exterior"
[5]: https://www.narwalsistemas.com.br/?utm_source=chatgpt.com "Narwal Sistemas | Software para Comércio Exterior"
[6]: https://www.trustradius.com/categories/global-trade-management?utm_source=chatgpt.com "Best Global Trade Management Software 2026 | TrustRadius"
[7]: https://www.comexos.com.br/operations/?utm_source=chatgpt.com "ComexOS Operations — Gestão para despachantes e assessorias"
[8]: https://tradecompliancesoftware.org/guides/trade-compliance-software-pricing?utm_source=chatgpt.com "Trade Compliance Software Pricing (July 2026): Every Published Number, Sourced | TradeComplianceSoftware.org"
[9]: https://stripe.com/br/billing/pricing?utm_source=chatgpt.com "Stripe Billing | Precificação"
[10]: https://www.asaas.com/cobranca-cartao?utm_source=chatgpt.com "Receber por cartão de crédito e débito sem maquininha | Asaas | Asaas"

Fiz o modelo financeiro usando os **novos preços** e validei custos atuais de pagamento, IA e OCR em fontes oficiais. A estrutura ficou mais confortável do que eu esperava: **R$ 1.290 / R$ 2.490 / R$ 4.490 é defensável financeiramente**, desde que coloquemos controles de consumo de IA e não vendamos processamento externo verdadeiramente ilimitado.

## Modelo financeiro-base do EIP

Vou trabalhar com esta composição inicial da carteira, que considero razoável para simulação:

**20% Start + 60% Business + 20% Pro.**

Isso produz um ticket médio de:

> **ARPA = R$ 2.650 por empresa/mês**

Para não criar uma projeção artificialmente otimista, adotei estas premissas-base:

| Premissa                                  |                        Modelo |
| ----------------------------------------- | ----------------------------: |
| Start                                     |                      R$ 1.290 |
| Business                                  |                      R$ 2.490 |
| Pro                                       |                      R$ 4.490 |
| Mix Start/Business/Pro                    |               20% / 60% / 20% |
| Ticket médio                              |                  **R$ 2.650** |
| Impostos                                  | **10% da receita (premissa)** |
| Gateway + Billing                         |      ~**4,69% + tarifa fixa** |
| IA + OCR + cloud + storage variável médio |        **R$ 348/cliente/mês** |

Os **10% de impostos são propositalmente uma premissa**, e não uma afirmação sobre quanto sua empresa pagará. Isso depende da empresa que comercializará o EIP, regime tributário, atividade, município, faturamento, folha e enquadramento contábil. Antes do lançamento, essa célula deve ser substituída pela projeção do contador.

Para pagamento, a Stripe publica atualmente no Brasil **3,99% + R$0,39 por transação nacional**, enquanto o Stripe Billing acrescenta **0,7% do volume de Billing**. Há preços personalizados para maior volume. ([Stripe][1])

---

# Cenário com 10 empresas

Com o mix acima:

**2 Start + 6 Business + 2 Pro**

Receita:

> **MRR: R$ 26.500**
> **ARR: R$ 318.000**

Estimativa mensal:

| Item                          |         Valor |
| ----------------------------- | ------------: |
| Receita                       | **R$ 26.500** |
| Gateway/Billing               |    - R$ 1.247 |
| Impostos (premissa 10%)       |    - R$ 2.650 |
| IA/OCR/cloud/storage variável |    - R$ 3.480 |
| **Margem de contribuição**    | **R$ 19.123** |
| **Margem**                    |     **72,2%** |

Ainda precisamos pagar daqui desenvolvimento, infraestrutura fixa, contador, comercial, marketing, suporte, ferramentas etc.

Mas já começa saudável.

---

# 25 empresas

Com aproximadamente:

**5 Start + 15 Business + 5 Pro**

temos:

> **MRR: R$ 66.250**
> **ARR: R$ 795.000**

Estimativa:

| Item                       |        Mensal |
| -------------------------- | ------------: |
| Receita                    | **R$ 66.250** |
| Gateway/Billing            |    - R$ 3.117 |
| Impostos                   |    - R$ 6.625 |
| Custos variáveis           |    - R$ 8.700 |
| **Margem de contribuição** | **R$ 47.808** |
| **Margem**                 |     **72,2%** |

Aqui o EIP começa a ter espaço interessante para financiar uma estrutura pequena.

---

# 50 empresas

> **MRR: R$ 132.500**
> **ARR: R$ 1.590.000**

Custos estimados:

| Item                       |         Mensal |
| -------------------------- | -------------: |
| Receita                    | **R$ 132.500** |
| Gateway/Billing            |     - R$ 6.234 |
| Impostos                   |    - R$ 13.250 |
| IA/OCR/cloud/storage       |    - R$ 17.400 |
| **Margem de contribuição** |  **R$ 95.616** |
| **Margem**                 |      **72,2%** |

Aqui já estamos falando de aproximadamente **R$ 1,59 milhão de receita recorrente anualizada**.

---

# 100 empresas

Esse é o primeiro marco que eu colocaria no plano estratégico.

Aproximadamente:

**20 Start + 60 Business + 20 Pro.**

Resultado:

> ## **R$ 265.000 MRR**
>
> ## **R$ 3.180.000 ARR**

Estimativa:

| Item                       |         Mensal |
| -------------------------- | -------------: |
| Receita                    | **R$ 265.000** |
| Gateway/Billing            |    - R$ 12.468 |
| Impostos                   |    - R$ 26.500 |
| IA/OCR/cloud/storage       |    - R$ 34.800 |
| **Margem de contribuição** | **R$ 191.233** |
| **Margem**                 |      **72,2%** |

Isso ainda não é lucro líquido. Mas ter aproximadamente R$191 mil/mês disponíveis depois desses custos diretamente modelados dá espaço para equipe, comercial, desenvolvimento, suporte e estrutura.

---

# 250 empresas

> **MRR: R$ 662.500**
> **ARR: R$ 7.950.000**

Estimativa:

| Item                       |         Mensal |
| -------------------------- | -------------: |
| Receita                    | **R$ 662.500** |
| Gateway/Billing            |    - R$ 31.169 |
| Impostos                   |    - R$ 66.250 |
| IA/OCR/cloud/storage       |    - R$ 87.000 |
| **Margem de contribuição** | **R$ 478.081** |
| **Margem**                 |      **72,2%** |

Nesse volume, eu já negociaria preços diretamente com o processador de pagamentos. A própria Stripe informa que oferece descontos e preços personalizados para empresas com maior volume. ([Stripe][2])

---

# 500 empresas

Aqui o EIP já se torna uma operação SaaS bastante relevante.

> ## **MRR: R$ 1.325.000**
>
> ## **ARR: R$ 15.900.000**

Estimativa:

| Item                       |           Mensal |
| -------------------------- | ---------------: |
| Receita                    | **R$ 1.325.000** |
| Gateway/Billing            |      - R$ 62.338 |
| Impostos                   |     - R$ 132.500 |
| IA/OCR/cloud/storage       |     - R$ 174.000 |
| **Margem de contribuição** |   **R$ 956.163** |
| **Margem**                 |        **72,2%** |

Isso seria aproximadamente:

> **R$15,9 milhões de receita recorrente anualizada.**

E quase R$1 milhão/mês de margem de contribuição no modelo — **antes dos custos fixos e sem considerar churn, inadimplência, descontos, CAC e outros gastos corporativos**.

---

# Consolidando os seis cenários

| Empresas |          **MRR** |         **ARR** | Margem contribuição/mês |
| -------: | ---------------: | --------------: | ----------------------: |
|   **10** |        R$ 26.500 |      R$ 318 mil |               R$ 19.123 |
|   **25** |        R$ 66.250 |      R$ 795 mil |               R$ 47.808 |
|   **50** |       R$ 132.500 |      R$ 1,59 mi |               R$ 95.616 |
|  **100** |   **R$ 265.000** |  **R$ 3,18 mi** |          **R$ 191.233** |
|  **250** |       R$ 662.500 |      R$ 7,95 mi |              R$ 478.081 |
|  **500** | **R$ 1.325.000** | **R$ 15,90 mi** |          **R$ 956.163** |

O ponto interessante é a margem de contribuição simulada em torno de **72%**.

---

# IA não parece ser o problema — se arquitetarmos direito

Aqui encontrei algo importante.

A OpenAI atualmente publica, por exemplo, o **GPT-5.6 Luna a US$0,20 por milhão de tokens de entrada e US$1,20 por milhão de saída**, enquanto modelos mais potentes custam mais; o GPT-5.6 Sol aparece em US$4/US$20 por milhão de tokens de entrada/saída. ([OpenAI][3])

Portanto, eu faria **model routing** no AI Hub:

```text
Tarefa simples
      ↓
modelo econômico

Classificação
Extração
Resumo simples
Tradução simples
      ↓
Luna / modelo econômico

────────────────

Análise complexa
Compliance
Risco
Raciocínio
Documentos complexos
      ↓
modelo mais potente
```

Não precisamos mandar toda tarefa para o modelo mais caro.

Isso pode mudar drasticamente a margem da IA.

---

# OCR também pode ficar muito barato

O Google Document AI publica atualmente o Enterprise Document OCR por **US$1,50 a cada 1.000 páginas** na faixa principal, com as primeiras 1.000 unidades indicadas como gratuitas na tabela; processadores mais sofisticados de extração podem custar mais, como US$30/1.000 páginas para determinados extratores/form parsers. ([Google Cloud][4])

Portanto:

**OCR puro ≠ extração inteligente complexa.**

No EIP devemos rotear:

```text
Preciso somente ler texto?
       ↓
OCR barato

Preciso entender estrutura?
       ↓
Document AI

Preciso raciocinar?
       ↓
LLM
```

Isso pode economizar muito dinheiro.

---

# Uma mudança importante na precificação

Depois dessa análise, **eu manteria os preços que aumentamos**:

### START

**R$ 1.290/mês**

### BUSINESS ⭐

**R$ 2.490/mês**

### PRO

**R$ 4.490/mês**

### ENTERPRISE

**A partir de R$ 6.990/mês**

Mas faria algo ainda mais importante:

> **Não venderia IA e OCR como tecnicamente ilimitados.**

O marketing pode falar:

**“IA integrada ao EIP.”**

Por trás, cada plano recebe uma franquia generosa.

---

# Controle de custo por plano

Por exemplo:

**Start**

```text
EIP AI Credits
████████░░

OCR
██████░░░░
```

**Business**

```text
EIP AI Credits
████████████████

OCR
████████████████
```

**Pro**

```text
EIP AI Credits
████████████████████████
```

Ao atingir, por exemplo, 80%:

> “Sua empresa utilizou 80% da franquia mensal de EIP AI.”

Depois o cliente pode comprar:

**AI Pack + R$390**

ou

**AI Pack Plus + R$790.**

Isso protege a margem.

---

# E encontrei outra oportunidade para melhorar a margem

Não precisamos obrigatoriamente cobrar tudo por cartão.

A Stripe publica atualmente:

**Cartão nacional: 3,99% + R$0,39**

**Pix: 1,19%**

**Boleto: R$3,45.** ([Stripe][5])

Imagine Business R$2.490.

Cartão + Billing, aproximadamente:

**R$116–117.**

Pix + Billing, aproximadamente:

**R$47.**

A diferença começa a ficar relevante em escala.

Portanto, eu ofereceria:

> **Cartão de crédito**
>
> **Pix recorrente/fluxo compatível, quando tecnicamente aplicável**
>
> **Boleto para contratos B2B/Enterprise**

E estudaria condições com PSP brasileiro antes de congelar o gateway.

---

# Ponto de equilíbrio

Agora entra uma variável que depende muito de como você vai estruturar a empresa.

Vamos imaginar que, inicialmente, os custos fixos mensais totais sejam:

**R$30.000/mês**

incluindo desenvolvimento/infra fixa/ferramentas/contador/comercial/suporte etc.

Nossa margem média de contribuição por cliente ficou:

> **R$1.912/mês por empresa.**

Portanto:

**R$30.000 ÷ R$1.912 ≈ 16 clientes.**

Ou seja:

> ### aproximadamente 16 clientes pagantes para cobrir R$30 mil de custos fixos mensais.

Se seus custos fixos forem:

**R$50.000 → ~27 clientes**

**R$100.000 → ~53 clientes**

**R$200.000 → ~105 clientes.**

Essa é uma métrica que eu colocaria diretamente no Command Center.

---

# EIP Command Center deveria mostrar isso em tempo real

```text
FINANCIAL HEALTH

MRR                       R$ 265.000
ARR                     R$ 3.180.000

ARPA                        R$ 2.650

Gross Revenue              R$ 265.000

Payment Fees              -R$ 12.468
Taxes                     -R$ 26.500
AI/OCR/Cloud              -R$ 34.800
                         ─────────────
Contribution Margin        R$191.232

Fixed Costs               -R$ 70.000
                         ─────────────
Operating Contribution    R$121.232

Customers                        100
Break-even Customers              37
```

E ainda:

```text
COST BY TENANT

Agro ABC

Subscription             R$2.490

Payment                    R$117
AI                          R$74
OCR                         R$18
Storage                     R$22
Cloud allocation            R$91
───────────────────────────────
Contribution              R$2.168
```

Isso é extremamente poderoso.

Você conseguirá identificar o cliente que está consumindo recursos demais **antes que ele destrua a margem**.

---

# Minha meta financeira para o EIP

Eu estabeleceria desde o início:

> **Margem de contribuição alvo: ≥ 70%.**

Alerta:

**60–70% → atenção**

**<60% → investigar**

Por tenant:

```text
Tenant Cost Score

GREEN      >70%
YELLOW     60–70%
RED        <60%
```

E o AI Hub administrativo poderia explicar:

> “A margem do Cliente XYZ caiu de 74% para 57% porque o consumo de processamento documental aumentou 312% neste mês.”

Esse é exatamente o tipo de inteligência que vale construir no seu SaaS Command Center.

---

## Minha conclusão depois de colocar números

Eu **não voltaria para R$990 / R$1.990 / R$3.490**.

Ficaria com:

> **R$1.290 / R$2.490 / R$4.490 / Enterprise a partir de R$6.990.**

Com Business como principal produto.

E manteria o **Founders Business a R$1.790 durante 12 meses** para as primeiras 20 empresas selecionadas.

O mais importante é que o modelo de R$2.490 não depende de IA ser quase gratuita para funcionar: na nossa simulação deliberadamente conservadora, reservei em média **R$348 por cliente/mês para IA + OCR + cloud + storage**, além de impostos e gateway, e ainda chegamos a aproximadamente **72% de margem de contribuição**. Os preços oficiais atuais de IA e OCR mostram que, com roteamento eficiente, há possibilidade real de o custo técnico ficar abaixo dessa reserva em muitos clientes. ([OpenAI][3])

O próximo passo que eu faria é transformar **este modelo financeiro em uma planilha profissional do EIP**, com células editáveis para preço Start/Business/Pro, quantidade de clientes, mix dos planos, imposto, Stripe, IA, OCR, cloud, funcionários e marketing; ela calcularia automaticamente **MRR, ARR, margem, lucro operacional, break-even e cenários conservador/base/agressivo**. Isso permitiria mudar qualquer premissa e ver imediatamente o impacto.

[1]: https://stripe.com/br/billing/pricing?utm_source=chatgpt.com "Stripe Billing | Precificação"
[2]: https://stripe.com/br/pricing?utm_source=chatgpt.com "Preços e tarifas"
[3]: https://openai.com/pt-BR/api/?utm_source=chatgpt.com "Plataforma de API | OpenAI"
[4]: https://cloud.google.com/products/document-ai/pricing?hl=pt-BR&utm_source=chatgpt.com "Preços da Document AI | Google Cloud"
[5]: https://stripe.com/br/pricing/local-payment-methods?utm_source=chatgpt.com "Preços das formas de pagamento locais"

Pronto. Criei a **planilha financeira completa do EIP**, com fórmulas editáveis e dashboard.

Ela contém **5 abas**: Dashboard, Premissas, Cenários, Unit Economics e Fontes. Você pode alterar preços, mix Start/Business/Pro, impostos, taxas, descontos, inadimplência, custos de IA/OCR/cloud, marketing, folha e demais custos fixos; os indicadores são recalculados automaticamente.

Também incluí simulações para **10, 25, 50, 100, 250 e 500 clientes**, MRR, ARR, margem de contribuição, resultado após custos fixos, break-even e cenários Conservador/Base/Agressivo. As taxas públicas atuais da Stripe usadas como referência estão documentadas na própria planilha. ([Stripe][1])

**Premissas comerciais atuais:** Start R$1.290, Business R$2.490 e Pro R$4.490. No cenário-base modelado, **100 clientes geram cerca de R$257 mil de MRR líquido e R$3,08 milhões de ARR líquido**, após o desconto médio assumido, antes dos demais efeitos mostrados no modelo.

[**Baixar a planilha — EIP Modelo Financeiro SaaS.xlsx**](sandbox:/mnt/data/EIP_Modelo_Financeiro_SaaS.xlsx)

Eu deixei as premissas editáveis destacadas para que possamos usar essa mesma planilha como **modelo financeiro oficial do EIP** daqui para frente.

[1]: https://stripe.com/br/pricing "Preços e tarifas"

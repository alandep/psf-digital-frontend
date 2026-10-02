# Integração de IA com GCP (Vertex AI) — guia de implantação

Hoje o backend usa um motor de IA simulado (mock). Este guia descreve como, **depois da demo**, trocar esse motor por chamadas reais ao **Vertex AI** da Google Cloud, visando **custo previsível** e **escala** (modelos gerenciados, sem infraestrutura própria de GPU).

O princípio central é simples: **trocar o motor de IA por configuração**, não por reescrita. Toda a troca acontece ativando o profile Spring `cloud`. As telas e a lógica de negócio **não mudam**, porque tudo conversa com a mesma porta de saída (`AiGatewayPort`). O adapter real apenas substitui o mock quando o profile `cloud` está ativo.

> **Isto é roadmap PÓS-DEMO.** A demo de amanhã roda em **mock** (profile padrão `local`). Não é necessário — nem recomendado — ativar o Vertex AI antes da demo.

> ⚠️ **Aviso de segurança:** **nunca commitar credenciais** no repositório. Chaves de service account ficam **somente** no ambiente de execução ou no Secret Manager / Workload Identity. O código **não** manuseia segredos diretamente.

---

## Segurança de credenciais (ler primeiro)

- **Não** colocar chave de service account (`key.json`) no git — nunca, em nenhum branch.
- Usar `GOOGLE_APPLICATION_CREDENTIALS` apontando para um arquivo **fora do repositório** (ex.: `/caminho/seguro/key.json`).
- Em produção, preferir **Secret Manager** ou **Workload Identity** (sem arquivo de chave em disco).
- Adicionar o caminho/arquivo da chave ao `.gitignore` (ex.: `*.json` de credenciais, `key.json`, `credentials/`).
- **Rotacionar chaves** periodicamente e revogar chaves não usadas.
- **Princípio de menor privilégio:** conceder somente os papéis Vertex estritamente necessários (ex.: `roles/aiplatform.user`), nunca `Owner`/`Editor`.

---

## Provisionamento na GCP (passo a passo, executado por você)

> Placeholders genéricos: `PROJECT_ID`, `REGION=us-central1`. Ajuste conforme sua conta.

1. **Criar/selecionar projeto:**
   ```bash
   gcloud projects create PROJECT_ID
   # ou, se já existir:
   gcloud config set project PROJECT_ID
   ```

2. **Habilitar billing** no projeto (via console da GCP → Billing → vincular conta de faturamento ao projeto). O Vertex AI exige billing ativo.

3. **Habilitar as APIs necessárias:**
   ```bash
   gcloud services enable aiplatform.googleapis.com
   ```

4. **Criar a service account:**
   ```bash
   gcloud iam service-accounts create eip-vertex \
     --display-name="EIP Vertex AI"
   ```

5. **Conceder o papel mínimo** (apenas uso do Vertex):
   ```bash
   gcloud projects add-iam-policy-binding PROJECT_ID \
     --member="serviceAccount:eip-vertex@PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

6. **Gerar chave para desenvolvimento** (guardar **FORA** do repositório):
   ```bash
   gcloud iam service-accounts keys create key.json \
     --iam-account="eip-vertex@PROJECT_ID.iam.gserviceaccount.com"
   # mover para um local seguro, ex.: /caminho/seguro/key.json
   ```
   > Em produção use Workload Identity em vez de gerar arquivo de chave.

7. **Exportar as variáveis de ambiente:**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/caminho/seguro/key.json
   export GOOGLE_CLOUD_PROJECT=PROJECT_ID
   export VERTEX_LOCATION=us-central1
   ```
   > No cloud (Workload Identity) o `GOOGLE_APPLICATION_CREDENTIALS` pode ser dispensado — as credenciais vêm do próprio ambiente (ADC).

---

## Dependência Maven (pom.xml) — exemplo

Adicionar a dependência do cliente Vertex AI. **Fixe a versão** (pin) e confira contra o BOM atual do projeto antes de usar — o número abaixo é apenas ilustrativo.

```xml
<!-- EXEMPLO — verificar a versão mais recente/compatível com o BOM do projeto -->
<dependency>
  <groupId>com.google.cloud</groupId>
  <artifactId>google-cloud-vertexai</artifactId>
  <version>1.18.0</version>
</dependency>
```

> Observação: este é um exemplo de documentação. A edição real do `pom.xml` deve ser feita e validada posteriormente, com a versão alinhada ao gerenciamento de dependências já existente.

---

## Configuração Spring (application.yml) — exemplo (profile cloud)

As propriedades são lidas do **ambiente**, nunca com valores sensíveis hard-coded.

```yaml
# EXEMPLO — bloco específico do profile "cloud"
spring:
  config:
    activate:
      on-profile: cloud

eip:
  ai:
    vertex:
      project: ${GOOGLE_CLOUD_PROJECT}
      location: ${VERTEX_LOCATION:us-central1}
```

Para rodar o backend com o profile `cloud`:

```bash
SPRING_PROFILES_ACTIVE=cloud ./mvnw spring-boot:run
```

> As credenciais **não** aparecem no yaml. Elas são resolvidas pelo cliente Google via ADC (`GOOGLE_APPLICATION_CREDENTIALS` ou Workload Identity).

---

## Esqueleto do adapter — VertexAiGatewayAdapter.java (exemplo)

> **Documentação apenas.** Este arquivo **não** está no projeto; o desenvolvedor deve criá-lo depois. O bloco abaixo tem aparência compilável, mas os pontos marcados com `TODO` precisam da implementação real do SDK — **não** copie-cole-execute sem completar.

```java
package com.eip.modules.ai.adapter.out.ai;

import com.eip.modules.ai.domain.model.AiModel;
import com.eip.modules.ai.domain.model.AiRequest;
import com.eip.modules.ai.domain.model.AiResult;
import com.eip.modules.ai.domain.model.AiTask;
import com.eip.modules.ai.domain.port.out.AiGatewayPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Adapter real do Vertex AI. Substitui o MockAiGatewayAdapter (@Profile("!cloud"))
 * somente quando o profile "cloud" está ativo.
 *
 * Credenciais: resolvidas automaticamente pelo cliente Google via ADC
 * (GOOGLE_APPLICATION_CREDENTIALS ou Workload Identity). Este código NÃO
 * manuseia segredos diretamente.
 */
@Component
@Profile("cloud")
public class VertexAiGatewayAdapter implements AiGatewayPort {

    private final String project;
    private final String location;

    public VertexAiGatewayAdapter(
            @Value("${eip.ai.vertex.project}") String project,
            @Value("${eip.ai.vertex.location}") String location) {
        this.project = project;
        this.location = location;
    }

    @Override
    public AiResult run(AiModel model, AiRequest request) {
        // 1) Montar o prompt a partir da tarefa (AiTask) + input.
        String prompt = buildPrompt(request.task(), request.input());

        // 2) Resolver o nome do modelo escolhido pelo router (ex.: "gemini-1.5-flash").
        String modelName = model.model();

        // 3) TODO: chamada real ao Vertex AI SDK.
        //    Exemplo conceitual (ajustar à API/versão do SDK efetivamente usada):
        //
        //    try (VertexAI vertexAI = new VertexAI(project, location)) {
        //        GenerativeModel generativeModel = new GenerativeModel(modelName, vertexAI);
        //        GenerateContentResponse response =
        //            generativeModel.generateContent(prompt);
        //        output = ResponseHandler.getText(response);
        //    }
        //
        //    Enquanto o SDK não está plugado, mantemos um placeholder:
        String output = "TODO: resposta do Vertex AI para o modelo " + modelName;

        // 4) Metering: derivar unidades de entrada/saída do tamanho do texto
        //    (placeholder, no mesmo espírito do mock). Substituir pelos tokens
        //    reais retornados pelo SDK quando disponível.
        long inputUnits = estimateUnits(request.input());
        long outputUnits = estimateUnits(output);
        int ocrPages = 0; // TODO: preencher quando houver OCR/extração de documento.

        return new AiResult(
                output,
                model.provider(),
                model.model(),
                inputUnits,
                outputUnits,
                ocrPages);
    }

    private String buildPrompt(AiTask task, String input) {
        // Mapeia a tarefa para uma instrução adequada ao modelo.
        return switch (task) {
            case NCM_CLASSIFICATION ->
                    "Classifique o NCM do seguinte produto:\n" + input;
            case DOCUMENT_SUMMARY ->
                    "Resuma o documento a seguir:\n" + input;
            case TRANSLATION ->
                    "Traduza o texto a seguir:\n" + input;
            case RISK_ANALYSIS ->
                    "Analise os riscos no conteúdo a seguir:\n" + input;
            case DOCUMENT_EXTRACTION ->
                    "Extraia os dados estruturados do documento a seguir:\n" + input;
            case CHAT ->
                    input;
        };
    }

    private long estimateUnits(String text) {
        // Placeholder de medição: aproxima "unidades" pelo tamanho do texto.
        return text == null ? 0L : text.length();
    }
}
```

> Observe que as credenciais são obtidas **automaticamente** pelo cliente Google via ADC (`GOOGLE_APPLICATION_CREDENTIALS`). O adapter **não** lê nem transporta segredos.

---

## Ativação e rollback

- **Ativar (usar Vertex AI real):** rodar o backend com o profile `cloud`:
  ```bash
  SPRING_PROFILES_ACTIVE=cloud ./mvnw spring-boot:run
  ```
  Ou definir a env `SPRING_PROFILES_ACTIVE=cloud` no `docker-compose.yml` do serviço backend.

- **Rollback (voltar ao mock):** remover o profile `cloud` (não passar `SPRING_PROFILES_ACTIVE=cloud`). O Spring volta a instanciar o `MockAiGatewayAdapter`, que é `@Profile("!cloud")`.

- **Zero mudança de telas:** a troca é 100% por profile. Front-end, rotas e lógica de negócio permanecem idênticos.

---

## Checklist de validação pós-implantação

- [ ] ADC configurado (`GOOGLE_APPLICATION_CREDENTIALS` apontando para chave válida, ou Workload Identity ativo).
- [ ] `gcloud ai models list --region=us-central1` responde sem erro de permissão.
- [ ] Backend sobe com `SPRING_PROFILES_ACTIVE=cloud` sem erro de bean/configuração.
- [ ] Uma chamada de IA real retorna **200** e registra uso (`ai_usage_event`).
- [ ] Custo monitorado no **billing** da GCP (orçamento/alertas configurados).

---

## Observação sobre o prazo

Sendo honesto: **não** é recomendado ativar esta integração **antes da demo de amanhã**. Há riscos reais de boot (configuração/credenciais), latência das chamadas e limites de cota que podem atrapalhar a apresentação. **A demo roda em mock** e está estável. Implemente o Vertex AI **com calma depois**, seguindo este guia e validando pelo checklist acima.

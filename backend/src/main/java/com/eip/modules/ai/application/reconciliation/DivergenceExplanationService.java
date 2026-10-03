package com.eip.modules.ai.application.reconciliation;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.eip.modules.ai.domain.model.AiExecutionPolicy;
import com.eip.modules.ai.domain.model.AiPromptSpec;
import com.eip.modules.ai.domain.model.AiRequest;
import com.eip.modules.ai.domain.model.AiResult;
import com.eip.modules.ai.domain.model.AiTask;
import com.eip.modules.ai.domain.model.AiThinkingLevel;
import com.eip.modules.ai.domain.port.out.AiExecutionPolicyResolver;
import com.eip.modules.ai.domain.port.out.AiGatewayPort;
import com.eip.modules.ai.domain.port.out.AiPriceCatalogPort;
import com.eip.modules.ai.domain.port.out.AiPromptRegistry;
import com.eip.modules.ai.domain.port.out.AiUsageLedgerPort;

import lombok.RequiredArgsConstructor;

/**
 * Etapa <strong>opcional</strong> e <strong>somente-explicativa</strong> da reconciliação de documentos.
 *
 * <p>Executa <em>depois</em> que o {@code DocumentReconciliationService} determinístico já
 * <strong>detectou</strong> as divergências. Este serviço pede à IA apenas para produzir uma
 * <strong>explicação</strong> legível por humanos das divergências já detectadas: a IA
 * <strong>nunca</strong> decide igualdade numérica (Requirement 8.5) — ela apenas explica, em
 * termos de negócio, o que o Java já encontrou (Requirement 8.4).
 *
 * <p>Para minimizar custo, a explicação roda com {@link AiThinkingLevel#LOW} e, quando não há
 * divergências a explicar, retorna uma mensagem fixa sem acionar a IA (sem custo).
 *
 * <p>Este serviço é aditivo e inerte: não está fiado em nenhum controller nem no
 * {@code AiHubService}. Fica disponível para um futuro endpoint de reconciliação.
 */
@Service
@RequiredArgsConstructor
public class DivergenceExplanationService {

    private final AiExecutionPolicyResolver policyResolver;
    private final AiPromptRegistry promptRegistry;
    private final AiGatewayPort gateway;
    private final AiUsageLedgerPort ledger;
    private final AiPriceCatalogPort priceCatalog;

    /**
     * Produz uma explicação em português das divergências <strong>já detectadas</strong> no
     * {@code result}. A IA não decide igualdade numérica (Req 8.4, 8.5); apenas explica.
     *
     * <p>Quando {@code result.ok()} (sem divergências), retorna uma mensagem fixa sem chamar a IA
     * (sem custo quando nada há a explicar). Caso contrário, monta um resumo em texto plano das
     * divergências e pede à IA que as explique em termos de negócio, usando thinking
     * {@link AiThinkingLevel#LOW} para minimizar custo.
     *
     * @param organizationId tenant dono da requisição
     * @param result         resultado da reconciliação determinística já computado
     * @return explicação legível por humanos das divergências detectadas
     */
    public String explain(UUID organizationId, ReconciliationResult result) {
        if (result.ok()) {
            return "Nenhuma divergência detectada.";
        }

        StringBuilder summary = new StringBuilder();
        for (Divergence divergence : result.divergences()) {
            summary.append(divergence.detail()).append('\n');
        }

        String userPrompt = "Explique as seguintes divergências detectadas:\n" + summary;

        // Força thinking LOW: resolve a policy base e cria uma cópia com LOW (record é imutável).
        AiExecutionPolicy base = policyResolver.resolve(AiTask.CHAT);
        AiExecutionPolicy low = new AiExecutionPolicy(
                base.model(),
                AiThinkingLevel.LOW,
                base.maxOutputTokens(),
                base.timeout(),
                base.maxRetries(),
                base.thinkingSupported(),
                base.thinkingBudgetTokens());

        AiPromptSpec promptSpec = new AiPromptSpec(
                "Você explica, em português claro e objetivo, divergências JÁ detectadas entre "
                        + "Pedido, Packing List e Commercial Invoice. NÃO decida se valores são iguais; "
                        + "apenas explique as divergências informadas.",
                userPrompt,
                null,
                "v1-divergence-explanation");

        AiRequest request = new AiRequest(AiTask.CHAT, userPrompt, organizationId, null);

        AiResult aiResult = gateway.run(low.model(), request, low, promptSpec);

        // Mede a chamada à IA no ledger (tokens/latência/custo), igual ao caminho de extração.
        // userId não está disponível neste serviço; o ledger aceita user_id nulo.
        BigDecimal cost = priceCatalog.providerCost(aiResult.provider(), aiResult.model(), aiResult);
        ledger.record(organizationId, null, AiTask.CHAT, aiResult, UUID.randomUUID().toString(), cost);

        return aiResult.output();
    }
}

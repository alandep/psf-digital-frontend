package com.eip.modules.ai.adapter.out.ai;

import java.time.Duration;
import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

import com.eip.modules.ai.domain.error.AiProviderUnavailableException;
import com.eip.modules.ai.domain.error.AiRateLimitedException;
import com.eip.modules.ai.domain.error.AiTimeoutException;
import com.eip.modules.ai.domain.error.AiTransientProviderException;

import io.github.resilience4j.circuitbreaker.CallNotPermittedException;

/**
 * Traduz as exceções de infraestrutura cruas lançadas pelo {@link VertexAiCaller}
 * (Resilience4j / {@code RestClient}) para a taxonomia de erro de domínio em
 * {@code com.eip.modules.ai.domain.error}, no limite do
 * {@link VertexAiGatewayAdapter}.
 *
 * <p>Ativo apenas no profile {@code cloud} — não afeta o caminho mock/default.
 *
 * <p><strong>Mapeamento determinístico:</strong>
 * <ul>
 *   <li>{@link CallNotPermittedException} (circuito OPEN) →
 *       {@link AiProviderUnavailableException} (transitório → 503).</li>
 *   <li>{@link HttpClientErrorException.TooManyRequests} (HTTP 429) →
 *       {@link AiRateLimitedException} (transitório → 429), honrando o header
 *       {@code Retry-After} quando presente.</li>
 *   <li>Demais {@link HttpClientErrorException} (4xx não-429) → <em>não</em>
 *       traduzidas: permanecem como falha funcional, tratada a jusante por
 *       validação/regra de negócio (→ 400/422).</li>
 *   <li>{@link HttpServerErrorException} (HTTP 5xx) →
 *       {@link AiTransientProviderException} (transitório → 503).</li>
 *   <li>{@link ResourceAccessException} (read/connect timeout, encapsula
 *       {@code SocketTimeoutException}) → {@link AiTimeoutException}
 *       (transitório → 504).</li>
 *   <li>Qualquer outra exceção → retornada inalterada.</li>
 * </ul>
 *
 * <p><strong>Redação:</strong> este tradutor nunca lê nem registra o corpo da
 * resposta do provedor nem o bearer token — apenas o status/headers relevantes.
 */
@Component
@Profile("cloud")
public class AiProviderExceptionTranslator {

    /**
     * Converte a exceção crua do caller numa exceção de domínio quando ela
     * representa uma falha de transporte/disponibilidade do provedor. Falhas
     * funcionais (4xx não-429) e exceções desconhecidas são retornadas sem
     * alteração para que o fluxo a jusante as trate.
     *
     * @param raw a exceção crua lançada pelo {@link VertexAiCaller}
     * @return a exceção de domínio correspondente, ou {@code raw} inalterada
     */
    public RuntimeException translate(RuntimeException raw) {
        // Circuito OPEN: o Resilience4j nega a chamada antes de tocar o provedor.
        if (raw instanceof CallNotPermittedException) {
            return new AiProviderUnavailableException(
                    "Circuito de IA aberto: provedor temporariamente indisponivel", raw);
        }

        // 429 (subtipo de HttpClientErrorException) — checar ANTES do 4xx genérico.
        if (raw instanceof HttpClientErrorException.TooManyRequests tooMany) {
            return new AiRateLimitedException(
                    "Limite de taxa do provedor de IA (429)", parseRetryAfter(tooMany), raw);
        }

        // Demais 4xx: falha funcional, não traduzida (segue validação/negócio).
        if (raw instanceof HttpClientErrorException) {
            return raw;
        }

        // 5xx do provedor: transitório.
        if (raw instanceof HttpServerErrorException) {
            return new AiTransientProviderException("Falha do provedor de IA (5xx)", raw);
        }

        // Timeout de leitura/conexão (encapsula SocketTimeoutException).
        if (raw instanceof ResourceAccessException) {
            return new AiTimeoutException("Timeout ao chamar o provedor de IA", raw);
        }

        // Qualquer outra: inalterada.
        return raw;
    }

    /**
     * Lê o header {@code Retry-After} da resposta 429 e o converte em
     * {@link Duration}. Suporta apenas o formato em segundos (inteiro); retorna
     * {@code null} quando o header está ausente, vazio ou não pôde ser
     * interpretado.
     *
     * @param ex a exceção 429 com os headers da resposta
     * @return a duração sugerida de espera, ou {@code null}
     */
    private Duration parseRetryAfter(HttpClientErrorException ex) {
        HttpHeaders headers = ex.getResponseHeaders();
        if (headers == null) {
            return null;
        }
        List<String> values = headers.get(HttpHeaders.RETRY_AFTER);
        if (values == null || values.isEmpty()) {
            return null;
        }
        String raw = values.get(0);
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            long seconds = Long.parseLong(raw.trim());
            if (seconds < 0) {
                return null;
            }
            return Duration.ofSeconds(seconds);
        } catch (NumberFormatException ignored) {
            // Formato HTTP-date não suportado aqui; tratado como ausente.
            return null;
        }
    }
}

package com.eip.platform.billing;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;

/**
 * Medição de uso e franquias (IA, OCR e armazenamento) por organização.
 *
 * <p>A franquia do plano vem de {@code organization_entitlement}, os pacotes avulsos de
 * {@code addon_purchase} (status PAID e ainda dentro do ciclo) e o consumo de
 * {@code ai_usage_event} / {@code document}. Todas as leituras ocorrem em transação
 * somente leitura com o RLS da organização vinculado.
 */
@Service
public class UsageQuotaService {

    static final String FEATURE_AI = "AI";
    static final String FEATURE_OCR = "OCR";
    static final String FEATURE_STORAGE = "STORAGE";

    private static final String KEY_AI = "limit.ai_credits";
    private static final String KEY_OCR = "limit.ocr_pages";
    private static final String KEY_STORAGE = "limit.storage_gb";

    private static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");
    private static final BigDecimal BYTES_PER_GB = BigDecimal.valueOf(1024L * 1024L * 1024L);
    private static final int DEFAULT_STATEMENT_LIMIT = 200;
    private static final int MAX_STATEMENT_LIMIT = 1000;

    /**
     * Filtro dos eventos que consomem franquia: sucesso (ou legado sem desfecho) e sem
     * duplicidade. O fluxo de sucesso grava duas linhas com o mesmo {@code request_id}
     * (record + recordOutcome); a linha SUCCESS é descartada quando a linha legada existe.
     */
    private static final String CONSUMING_EVENTS = """
            (e.outcome IS NULL OR (e.outcome = 'SUCCESS' AND NOT EXISTS (
                SELECT 1 FROM ai_usage_event r
                 WHERE r.organization_id = e.organization_id
                   AND r.request_id = e.request_id
                   AND r.outcome IS NULL
                   AND r.id <> e.id)))
            """;

    private final NamedParameterJdbcTemplate jdbc;

    public UsageQuotaService(JdbcTemplate jdbcTemplate) {
        this.jdbc = new NamedParameterJdbcTemplate(jdbcTemplate);
    }

    // ---------------------------------------------------------------- API pública

    @Transactional(readOnly = true)
    public UsageSnapshot snapshot(UUID organizationId) {
        bind(organizationId);
        return loadSnapshot(organizationId);
    }

    @Transactional(readOnly = true)
    public boolean hasAiRemaining(UUID organizationId) {
        bind(organizationId);
        Period period = resolvePeriod(organizationId);
        Map<String, BigDecimal> limits = planLimits(organizationId);
        Packs packs = packs(organizationId);
        return hasRoom(aiUsed(organizationId, period), include(limits.get(KEY_AI), packs.aiCredits()));
    }

    @Transactional(readOnly = true)
    public boolean hasOcrRemaining(UUID organizationId) {
        bind(organizationId);
        Period period = resolvePeriod(organizationId);
        Map<String, BigDecimal> limits = planLimits(organizationId);
        Packs packs = packs(organizationId);
        return hasRoom(ocrUsed(organizationId, period), include(limits.get(KEY_OCR), packs.ocrPages()));
    }

    @Transactional(readOnly = true)
    public boolean hasStorageFor(UUID organizationId, long extraBytes) {
        bind(organizationId);
        BigDecimal limitGb = planLimits(organizationId).get(KEY_STORAGE);
        if (limitGb == null) {
            return true;
        }
        BigDecimal projected = BigDecimal.valueOf(storageBytes(organizationId))
                .add(BigDecimal.valueOf(Math.max(0L, extraBytes)));
        return projected.compareTo(limitGb.multiply(BYTES_PER_GB)) <= 0;
    }

    /**
     * Extrato do ciclo atual, do mais recente para o mais antigo.
     *
     * @param feature {@code AI} (créditos) ou {@code OCR} (páginas)
     * @param limit   máximo de linhas (1..1000; valores inválidos usam 200)
     */
    @Transactional(readOnly = true)
    public List<UsageEntry> statement(UUID organizationId, String feature, int limit) {
        bind(organizationId);
        boolean ocr = FEATURE_OCR.equalsIgnoreCase(feature);
        if (!ocr && !FEATURE_AI.equalsIgnoreCase(feature)) {
            throw new IllegalArgumentException("Recurso de uso inválido: " + feature);
        }
        int max = limit <= 0 ? DEFAULT_STATEMENT_LIMIT : Math.min(limit, MAX_STATEMENT_LIMIT);
        Period period = resolvePeriod(organizationId);
        String amountColumn = ocr ? "e.ocr_pages" : "e.eip_credits";
        String unit = ocr ? "páginas" : "créditos";
        String sql = "SELECT e.created_at, e.operation, u.name AS user_name, " + amountColumn + " AS amount "
                + "FROM ai_usage_event e LEFT JOIN app_user u ON u.id = e.user_id "
                + "WHERE e.organization_id = :org AND e.created_at >= :start "
                + "AND " + amountColumn + " > 0 AND " + CONSUMING_EVENTS
                + "ORDER BY e.created_at DESC LIMIT :max";
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("org", organizationId)
                .addValue("start", period.start())
                .addValue("max", max);
        return jdbc.query(sql, params, (rs, i) -> {
            String operation = rs.getString("operation");
            return new UsageEntry(
                    rs.getObject("created_at", OffsetDateTime.class),
                    operation,
                    operationLabel(operation),
                    rs.getString("user_name"),
                    normalizeAmount(rs.getBigDecimal("amount")),
                    unit);
        });
    }

    // ---------------------------------------------------------------- funções puras

    /** Franquia total: plano + pacotes; {@code null} quando o plano é ilimitado. */
    static BigDecimal include(BigDecimal fromPlan, BigDecimal fromPacks) {
        if (fromPlan == null) {
            return null;
        }
        return fromPlan.add(fromPacks == null ? BigDecimal.ZERO : fromPacks);
    }

    /** {@code used < included}; {@code included == null} significa ilimitado. */
    static boolean hasRoom(BigDecimal used, BigDecimal included) {
        if (included == null) {
            return true;
        }
        BigDecimal u = used == null ? BigDecimal.ZERO : used;
        return u.compareTo(included) < 0;
    }

    /** Percentual 0..100 (arredondado); 0 quando ilimitado; 100 quando a franquia é zero e há uso. */
    static int percent(BigDecimal used, BigDecimal included) {
        if (included == null) {
            return 0;
        }
        BigDecimal u = used == null ? BigDecimal.ZERO : used;
        if (included.signum() <= 0) {
            return u.signum() > 0 ? 100 : 0;
        }
        int pct = u.multiply(BigDecimal.valueOf(100))
                .divide(included, 0, RoundingMode.HALF_UP)
                .intValue();
        return Math.min(100, Math.max(0, pct));
    }

    static Meter meter(String feature, String label, String unit, BigDecimal used,
                       BigDecimal fromPlan, BigDecimal fromPacks) {
        BigDecimal packs = fromPacks == null ? BigDecimal.ZERO : fromPacks;
        BigDecimal included = include(fromPlan, packs);
        BigDecimal usedValue = used == null ? BigDecimal.ZERO : used;
        return new Meter(feature, label, usedValue, included, fromPlan, packs, unit,
                percent(usedValue, included));
    }

    /** Rótulo em pt-BR da operação registrada no ledger (desconhecidas retornam o valor bruto). */
    static String operationLabel(String operation) {
        if (operation == null) {
            return null;
        }
        return switch (operation) {
            case "NCM_CLASSIFICATION" -> "Classificação NCM";
            case "CHAT" -> "Copiloto / Chat";
            case "RISK_ANALYSIS" -> "Análise de risco";
            case "DOCUMENT_SUMMARY" -> "Resumo de documento";
            case "TRANSLATION" -> "Tradução";
            case "DOCUMENT_EXTRACTION" -> "Extração de documento";
            case "OCR_DOCUMENT" -> "OCR de documento";
            case "TRANSPORT_SIMULATION" -> "Simulação de transporte";
            case "EXPORT_NL_CREATION" -> "Criação de exportação por IA";
            case "RECONCILIATION", "RECONCILIACAO" -> "Conciliação";
            default -> operation;
        };
    }

    /** Remove zeros à direita sem usar notação científica (5.00 -> 5; 100 -> 100). */
    static BigDecimal normalizeAmount(BigDecimal amount) {
        if (amount == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal stripped = amount.stripTrailingZeros();
        return stripped.scale() < 0 ? stripped.setScale(0, RoundingMode.UNNECESSARY) : stripped;
    }

    /** Bytes -> GB com 2 casas decimais. */
    static BigDecimal bytesToGb(long bytes) {
        return BigDecimal.valueOf(Math.max(0L, bytes)).divide(BYTES_PER_GB, 2, RoundingMode.HALF_UP);
    }

    // ---------------------------------------------------------------- consultas

    private UsageSnapshot loadSnapshot(UUID org) {
        Period period = resolvePeriod(org);
        Map<String, BigDecimal> limits = planLimits(org);
        Packs packs = packs(org);

        Meter ai = meter(FEATURE_AI, "Créditos de IA", "créditos", aiUsed(org, period),
                limits.get(KEY_AI), packs.aiCredits());
        Meter ocr = meter(FEATURE_OCR, "Páginas OCR", "páginas", ocrUsed(org, period),
                limits.get(KEY_OCR), packs.ocrPages());
        Meter storage = meter(FEATURE_STORAGE, "Armazenamento", "GB", bytesToGb(storageBytes(org)),
                limits.get(KEY_STORAGE), BigDecimal.ZERO);
        return new UsageSnapshot(period.start(), period.end(), ai, ocr, storage);
    }

    /** Ciclo da assinatura mais recente; sem datas, usa o mês corrente (America/Sao_Paulo). */
    private Period resolvePeriod(UUID org) {
        List<Period> rows = jdbc.query(
                "SELECT current_period_start, current_period_end FROM subscription "
                        + "WHERE organization_id = :org ORDER BY created_at DESC LIMIT 1",
                new MapSqlParameterSource("org", org),
                (rs, i) -> new Period(
                        rs.getObject("current_period_start", OffsetDateTime.class),
                        rs.getObject("current_period_end", OffsetDateTime.class)));
        if (!rows.isEmpty() && rows.get(0).start() != null && rows.get(0).end() != null) {
            return rows.get(0);
        }
        return currentMonth(ZonedDateTime.now(ZONE).toLocalDate());
    }

    static Period currentMonth(LocalDate today) {
        LocalDate first = today.withDayOfMonth(1);
        return new Period(
                first.atStartOfDay(ZONE).toOffsetDateTime(),
                first.plusMonths(1).atStartOfDay(ZONE).toOffsetDateTime());
    }

    /** Limites do plano; chave ausente no mapa (ou valor nulo) = ilimitado. */
    private Map<String, BigDecimal> planLimits(UUID org) {
        Map<String, BigDecimal> limits = new HashMap<>();
        jdbc.query(
                "SELECT feature_key, limit_value FROM organization_entitlement "
                        + "WHERE organization_id = :org AND feature_key IN (:keys)",
                new MapSqlParameterSource("org", org).addValue("keys", List.of(KEY_AI, KEY_OCR, KEY_STORAGE)),
                rs -> {
                    BigDecimal value = rs.getBigDecimal("limit_value");
                    if (value != null) {
                        limits.put(rs.getString("feature_key"), value);
                    }
                });
        return limits;
    }

    private Packs packs(UUID org) {
        return jdbc.queryForObject(
                "SELECT COALESCE(SUM(ai_credits), 0) AS ai, COALESCE(SUM(ocr_pages), 0) AS ocr "
                        + "FROM addon_purchase WHERE organization_id = :org AND status = 'PAID' "
                        + "AND period_end > now()",
                new MapSqlParameterSource("org", org),
                (rs, i) -> new Packs(rs.getBigDecimal("ai"), rs.getBigDecimal("ocr")));
    }

    private BigDecimal aiUsed(UUID org, Period period) {
        return sumEvents("e.eip_credits", org, period);
    }

    private BigDecimal ocrUsed(UUID org, Period period) {
        return sumEvents("e.ocr_pages", org, period);
    }

    private BigDecimal sumEvents(String column, UUID org, Period period) {
        BigDecimal total = jdbc.queryForObject(
                "SELECT COALESCE(SUM(" + column + "), 0) FROM ai_usage_event e "
                        + "WHERE e.organization_id = :org AND e.created_at >= :start AND " + CONSUMING_EVENTS,
                new MapSqlParameterSource("org", org).addValue("start", period.start()),
                BigDecimal.class);
        return total == null ? BigDecimal.ZERO : total;
    }

    private long storageBytes(UUID org) {
        Long bytes = jdbc.queryForObject(
                "SELECT COALESCE(SUM(size_bytes), 0) FROM document WHERE organization_id = :org",
                new MapSqlParameterSource("org", org),
                Long.class);
        return bytes == null ? 0L : bytes;
    }

    /**
     * Garante que a consulta rode para a organização do contexto. Sem contexto na thread,
     * vincula a organização à transação via {@code set_config} (efeito local à transação).
     */
    private void bind(UUID organizationId) {
        if (organizationId == null) {
            throw new IllegalArgumentException("organizationId não pode ser nulo");
        }
        OrganizationContext context = OrganizationContextHolder.currentOrNull();
        if (context != null) {
            if (!organizationId.equals(context.organizationId().value())) {
                throw new IllegalStateException(
                        "A organização informada difere da organização do contexto atual");
            }
            return;
        }
        jdbc.getJdbcOperations().queryForObject(
                "SELECT set_config('app.current_organization', ?, true)",
                String.class, organizationId.toString());
    }

    // ---------------------------------------------------------------- tipos

    record Period(OffsetDateTime start, OffsetDateTime end) {
    }

    private record Packs(BigDecimal aiCredits, BigDecimal ocrPages) {
    }

    public record UsageSnapshot(OffsetDateTime periodStart, OffsetDateTime periodEnd,
                                Meter ai, Meter ocr, Meter storage) {
    }

    public record Meter(String feature, String label, BigDecimal used, BigDecimal included,
                        BigDecimal fromPlan, BigDecimal fromPacks, String unit, int percent) {
    }

    public record UsageEntry(OffsetDateTime occurredAt, String operation, String operationLabel,
                             String userName, BigDecimal amount, String unit) {
    }
}

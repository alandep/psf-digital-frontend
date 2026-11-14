package com.eip.modules.finance.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.eip.modules.finance.domain.model.CambioContrato;
import com.eip.modules.finance.domain.model.CambioStatus;
import com.eip.modules.finance.domain.port.in.GerenciarCambioUseCase.BancoResumo;
import com.eip.modules.finance.domain.port.in.GerenciarCambioUseCase.CambioMetricas;

/**
 * Pure aggregation math over FX contracts (no I/O, no clock access: "today" is
 * always passed in).
 */
public final class CambioAnalytics {

    static final String BANCO_NAO_INFORMADO = "Não informado";

    private CambioAnalytics() {
    }

    /** Computes the indicators of the given contracts as of {@code hoje}. */
    public static CambioMetricas metricas(List<CambioContrato> contratos, LocalDate hoje) {
        long abertos = 0;
        long liquidados = 0;
        long cancelados = 0;
        long vencidos = 0;
        long vencendo30 = 0;
        BigDecimal volTotal = BigDecimal.ZERO;
        BigDecimal volAberto = BigDecimal.ZERO;
        BigDecimal brlUsd = BigDecimal.ZERO;
        BigDecimal foreignUsd = BigDecimal.ZERO;
        LocalDate limite = hoje.plusDays(30);

        for (CambioContrato c : contratos) {
            CambioStatus st = c.status();
            if (st == CambioStatus.CANCELADO) {
                cancelados++;
                continue;
            }
            BigDecimal brl = brl(c);
            volTotal = volTotal.add(brl);
            if ("USD".equalsIgnoreCase(c.moeda())) {
                brlUsd = brlUsd.add(brl);
                foreignUsd = foreignUsd.add(c.valor());
            }
            if (st == CambioStatus.LIQUIDADO) {
                liquidados++;
                continue;
            }
            abertos++;
            volAberto = volAberto.add(brl);
            LocalDate liq = c.dataLiquidacao();
            if (liq != null) {
                if (liq.isBefore(hoje)) {
                    vencidos++;
                } else if (!liq.isAfter(limite)) {
                    vencendo30++;
                }
            }
        }

        BigDecimal taxaUsd = foreignUsd.signum() == 0
                ? null
                : brlUsd.divide(foreignUsd, 6, RoundingMode.HALF_UP);
        return new CambioMetricas(
                contratos.size(),
                abertos,
                liquidados,
                cancelados,
                vencidos,
                volTotal.setScale(2, RoundingMode.HALF_UP),
                volAberto.setScale(2, RoundingMode.HALF_UP),
                taxaUsd,
                vencendo30);
    }

    /**
     * Groups the non-cancelled contracts of {@code moeda} by bank, best weighted
     * average rate first.
     */
    public static List<BancoResumo> bancos(List<CambioContrato> contratos, String moeda) {
        Map<String, List<CambioContrato>> porBanco = new LinkedHashMap<>();
        for (CambioContrato c : contratos) {
            if (c.status() == CambioStatus.CANCELADO || c.moeda() == null
                    || !c.moeda().equalsIgnoreCase(moeda)) {
                continue;
            }
            String banco = c.banco() == null || c.banco().isBlank()
                    ? BANCO_NAO_INFORMADO
                    : c.banco().trim();
            porBanco.computeIfAbsent(banco, k -> new ArrayList<>()).add(c);
        }

        List<BancoResumo> out = new ArrayList<>();
        for (Map.Entry<String, List<CambioContrato>> e : porBanco.entrySet()) {
            BigDecimal brl = BigDecimal.ZERO;
            BigDecimal foreign = BigDecimal.ZERO;
            CambioContrato ultimo = null;
            for (CambioContrato c : e.getValue()) {
                brl = brl.add(brl(c));
                foreign = foreign.add(c.valor());
                if (ultimo == null || data(c).isAfter(data(ultimo))) {
                    ultimo = c;
                }
            }
            BigDecimal media = foreign.signum() == 0
                    ? BigDecimal.ZERO
                    : brl.divide(foreign, 6, RoundingMode.HALF_UP);
            out.add(new BancoResumo(
                    e.getKey(),
                    e.getValue().size(),
                    brl.setScale(2, RoundingMode.HALF_UP),
                    media,
                    ultimo.taxa(),
                    data(ultimo).equals(LocalDate.MIN) ? null : data(ultimo)));
        }
        out.sort(Comparator.comparing(BancoResumo::taxaMediaPonderada).reversed());
        return out;
    }

    private static BigDecimal brl(CambioContrato c) {
        return c.valor().multiply(c.taxa());
    }

    /** Operation date: contracting date, falling back to the creation day. */
    private static LocalDate data(CambioContrato c) {
        if (c.dataContratacao() != null) {
            return c.dataContratacao();
        }
        if (c.createdAt() != null) {
            return c.createdAt().toLocalDate();
        }
        return LocalDate.MIN;
    }
}

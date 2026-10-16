package com.eip.modules.export.domain.model;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Cálculo puro da margem (lucro / receita) do dashboard, com guarda de divisão
 * por zero. Determinístico e sem efeitos colaterais (testável por propriedade).
 */
public final class Margem {

    private Margem() {}

    /**
     * Calcula a margem como lucro/receita. Quando a receita é nula ou zero,
     * retorna {@link BigDecimal#ZERO} (sem lançar divisão por zero — Req 5.4).
     * Caso contrário, retorna lucro/receita arredondado a 6 casas (HALF_UP).
     *
     * @param lucro   lucro agregado (receita - custo); pode ser null (tratado como zero)
     * @param receita receita agregada (SUM total_amount); null/zero ⇒ margem zero
     * @return a margem (fração 0..1 tipicamente), nunca lançando exceção
     */
    public static BigDecimal calcular(BigDecimal lucro, BigDecimal receita) {
        if (receita == null || receita.signum() == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal l = lucro == null ? BigDecimal.ZERO : lucro;
        return l.divide(receita, 6, RoundingMode.HALF_UP);
    }
}

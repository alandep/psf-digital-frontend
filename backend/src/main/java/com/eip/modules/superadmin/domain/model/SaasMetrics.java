package com.eip.modules.superadmin.domain.model;

import java.math.BigDecimal;
import java.util.List;

/**
 * SaaS command-center metrics. Pure domain record.
 *
 * @param mrr             monthly recurring revenue
 * @param arr             annual recurring revenue ({@code mrr * 12})
 * @param arpa            average revenue per active account
 * @param activeCompanies number of active subscriptions
 * @param trials          number of trialing subscriptions
 * @param pastDue         number of past-due subscriptions
 * @param canceled        number of canceled subscriptions
 * @param mrrByPlan       MRR broken down by plan
 */
public record SaasMetrics(
        BigDecimal mrr,
        BigDecimal arr,
        BigDecimal arpa,
        long activeCompanies,
        long trials,
        long pastDue,
        long canceled,
        List<PlanMrr> mrrByPlan) {

    /** MRR contribution of a single plan. */
    public record PlanMrr(String plan, BigDecimal mrr) {
    }
}

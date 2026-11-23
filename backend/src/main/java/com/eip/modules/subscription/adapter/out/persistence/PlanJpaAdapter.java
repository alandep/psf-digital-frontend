package com.eip.modules.subscription.adapter.out.persistence;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.eip.modules.subscription.domain.port.out.PlanRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link PlanRepositoryPort}: plans over JPA,
 * the global {@code plan_feature} catalog (no RLS) over JDBC.
 */
@Component
@RequiredArgsConstructor
public class PlanJpaAdapter implements PlanRepositoryPort {

    private final PlanJpaRepository jpa;
    private final JdbcTemplate jdbc;

    @Override
    public List<PlanData> activePlans() {
        return jpa.findByActiveTrue().stream().map(PlanJpaAdapter::toData).toList();
    }

    @Override
    public Optional<PlanData> byCode(String code) {
        if (code == null) {
            return Optional.empty();
        }
        return jpa.findById(code).map(PlanJpaAdapter::toData);
    }

    @Override
    public List<PlanFeatureData> features(String planCode) {
        return jdbc.query(
                "select feature_key, enabled, limit_value from plan_feature "
                        + "where plan_code = ? order by feature_key",
                (rs, i) -> new PlanFeatureData(rs.getString("feature_key"),
                        rs.getBoolean("enabled"), rs.getBigDecimal("limit_value")),
                planCode);
    }

    private static PlanData toData(PlanEntity e) {
        return new PlanData(e.getCode(), e.getName(), e.getDescription(),
                e.getMonthlyPrice(), e.getAnnualPrice(), e.isHighlighted());
    }
}

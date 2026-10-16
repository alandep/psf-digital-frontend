package com.eip.modules.entitlement.adapter.out.persistence;

import java.io.Serializable;
import java.util.Objects;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Composite key for {@link PlanFeatureEntity}. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlanFeatureId implements Serializable {

    private String planCode;
    private String featureKey;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PlanFeatureId that)) return false;
        return Objects.equals(planCode, that.planCode)
                && Objects.equals(featureKey, that.featureKey);
    }

    @Override
    public int hashCode() {
        return Objects.hash(planCode, featureKey);
    }
}
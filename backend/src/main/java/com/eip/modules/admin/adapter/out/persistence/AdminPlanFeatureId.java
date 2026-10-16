package com.eip.modules.admin.adapter.out.persistence;

import java.io.Serializable;
import java.util.Objects;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Composite key for {@link AdminPlanFeatureEntity}. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminPlanFeatureId implements Serializable {
    private String planCode;
    private String featureKey;

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AdminPlanFeatureId that)) return false;
        return Objects.equals(planCode, that.planCode) && Objects.equals(featureKey, that.featureKey);
    }
    @Override public int hashCode() { return Objects.hash(planCode, featureKey); }
}
package com.eip.modules.entitlement.adapter.out.persistence;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Composite key for {@link OrganizationEntitlementEntity}. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationEntitlementId implements Serializable {

    private UUID organizationId;
    private String featureKey;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OrganizationEntitlementId that)) return false;
        return Objects.equals(organizationId, that.organizationId)
                && Objects.equals(featureKey, that.featureKey);
    }

    @Override
    public int hashCode() {
        return Objects.hash(organizationId, featureKey);
    }
}
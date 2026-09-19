package com.eip.modules.organization.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.organization.domain.model.Membership;
import com.eip.modules.organization.domain.model.Organization;
import com.eip.modules.organization.domain.port.out.OrganizationMembershipRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link OrganizationMembershipRepositoryPort}
 * over JPA. Maps {@link MembershipEntity} / {@link OrganizationEntity} rows to
 * the {@link Membership} / {@link Organization} domain records.
 */
@Component
@RequiredArgsConstructor
public class OrganizationMembershipJpaAdapter implements OrganizationMembershipRepositoryPort {

    private static final String ACTIVE = "ACTIVE";

    private final MembershipJpaRepository membershipRepository;
    private final OrganizationJpaRepository organizationRepository;

    @Override
    public List<Membership> findActiveMemberships(UUID userId) {
        return membershipRepository.findByUserIdAndStatus(userId, ACTIVE).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public boolean isActiveMember(UUID userId, UUID orgId) {
        return membershipRepository
                .existsByUserIdAndOrganizationIdAndStatus(userId, orgId, ACTIVE);
    }

    @Override
    public Optional<Organization> findOrganization(UUID orgId) {
        return organizationRepository.findById(orgId).map(this::toDomain);
    }

    private Membership toDomain(MembershipEntity entity) {
        return new Membership(
                entity.getId(),
                entity.getOrganizationId(),
                entity.getUserId(),
                entity.getRole(),
                entity.getStatus());
    }

    private Organization toDomain(OrganizationEntity entity) {
        return new Organization(
                entity.getId(),
                entity.getName(),
                entity.getStatus());
    }
}

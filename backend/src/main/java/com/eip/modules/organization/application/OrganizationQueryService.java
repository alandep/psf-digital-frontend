package com.eip.modules.organization.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.organization.domain.model.Membership;
import com.eip.modules.organization.domain.port.out.OrganizationMembershipRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Read-side use cases over organizations and memberships. Used by the Identity
 * module to resolve which organizations an authenticated user may select.
 */
@Service
@RequiredArgsConstructor
public class OrganizationQueryService {

    // TODO: derive from legal_entity once linked; fixed masked placeholder for now.
    private static final String CNPJ_MASKED_PLACEHOLDER = "\u2022\u2022.\u2022\u2022\u2022.\u2022\u2022\u2022/0001-\u2022\u2022";

    private final OrganizationMembershipRepositoryPort membershipRepository;

    /**
     * Selectable organization option for the auth flow.
     *
     * @param organizationId the organization id
     * @param razaoSocial    the organization legal / display name
     * @param cnpjMasked     a masked CNPJ placeholder
     * @param role           the role the user holds in this organization
     */
    public record OrganizationOption(UUID organizationId, String razaoSocial,
                                     String cnpjMasked, String role) {
    }

    /**
     * @return the active organizations the given user is a member of, as selectable options.
     */
    @Transactional(readOnly = true)
    public List<OrganizationOption> membershipsOf(UUID userId) {
        return membershipRepository.findActiveMemberships(userId).stream()
                .map(this::toOption)
                .toList();
    }

    /** @return {@code true} if the user has an active membership in the organization. */
    @Transactional(readOnly = true)
    public boolean isMember(UUID userId, UUID organizationId) {
        return membershipRepository.isActiveMember(userId, organizationId);
    }

    private OrganizationOption toOption(Membership membership) {
        String razaoSocial = membershipRepository.findOrganization(membership.organizationId())
                .map(org -> org.name())
                .orElse("Organizacao");
        return new OrganizationOption(
                membership.organizationId(),
                razaoSocial,
                CNPJ_MASKED_PLACEHOLDER,
                membership.role());
    }
}

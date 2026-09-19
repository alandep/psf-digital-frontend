package com.eip.modules.crm.adapter.in.bff;

import com.eip.modules.crm.domain.port.in.GerenciarLeadsUseCase.CriarLeadCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for creating a lead.
 */
public record CriarLeadRequest(
        @NotBlank String name,
        String companyName,
        String email,
        String phone,
        String source,
        String origin) {

    /** Maps this request to the use-case command. */
    public CriarLeadCommand toCommand() {
        return new CriarLeadCommand(name, companyName, email, phone, source, origin);
    }
}

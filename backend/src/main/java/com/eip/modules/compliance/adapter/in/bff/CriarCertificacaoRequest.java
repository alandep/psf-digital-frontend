package com.eip.modules.compliance.adapter.in.bff;

import java.time.LocalDate;

import com.eip.modules.compliance.domain.port.in.ConsultarCertificacoesUseCase.CriarCertificacaoCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for creating a certification.
 */
public record CriarCertificacaoRequest(
        @NotBlank String name,
        String tipo,
        String orgaoEmissor,
        String numero,
        String status,
        LocalDate emitidaEm,
        LocalDate validaAte) {

    /** Maps this request to the use-case command. */
    public CriarCertificacaoCommand toCommand() {
        return new CriarCertificacaoCommand(name, tipo, orgaoEmissor, numero, status, emitidaEm, validaAte);
    }
}

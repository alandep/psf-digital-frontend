package com.eip.modules.export.adapter.in.bff;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.eip.modules.export.domain.port.in.CriarExportacaoUseCase.CriarExportacaoCommand;
import com.eip.modules.export.domain.port.in.CriarExportacaoUseCase.CriarExportacaoCommand.ItemCommand;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * BFF request payload for creating an export.
 */
public record CriarExportacaoRequest(
        @NotNull UUID customerId,
        UUID legalEntityId,
        String destinationCountry,
        String incoterm,
        String currency,
        @NotEmpty @Valid List<ItemRequest> itens) {

    /** Single line item in the request. */
    public record ItemRequest(
            UUID productId,
            String description,
            @NotNull @Positive BigDecimal quantity,
            @NotNull @Positive BigDecimal unitPrice) {
    }

    /** Maps this request to the use-case command. */
    public CriarExportacaoCommand toCommand() {
        List<ItemCommand> itemCommands = itens == null ? List.of() : itens.stream()
                .map(i -> new ItemCommand(
                        i.productId(), i.description(), i.quantity(), i.unitPrice()))
                .toList();
        return new CriarExportacaoCommand(
                customerId, legalEntityId, destinationCountry, incoterm, currency, itemCommands);
    }
}

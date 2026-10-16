package com.eip.modules.export.adapter.in.bff;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.eip.modules.export.domain.port.in.AtualizarExportacaoUseCase.AtualizarExportacaoCommand;
import com.eip.modules.export.domain.port.in.CriarExportacaoUseCase.CriarExportacaoCommand.ItemCommand;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** BFF request payload for editing a draft export. */
public record AtualizarExportacaoRequest(
        String destinationCountry,
        String incoterm,
        String currency,
        @NotEmpty @Valid List<ItemRequest> itens,
        BigDecimal totalCost) {

    public record ItemRequest(
            UUID productId,
            String description,
            @NotNull @Positive BigDecimal quantity,
            @NotNull @Positive BigDecimal unitPrice) {
    }

    public AtualizarExportacaoCommand toCommand() {
        List<ItemCommand> itemCommands = itens == null ? List.of() : itens.stream()
                .map(i -> new ItemCommand(
                        i.productId(), i.description(), i.quantity(), i.unitPrice()))
                .toList();
        return new AtualizarExportacaoCommand(
                destinationCountry, incoterm, currency, itemCommands, totalCost);
    }
}

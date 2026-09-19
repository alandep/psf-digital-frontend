package com.eip.modules.export.domain.port.in;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.eip.modules.export.domain.model.Exportacao;

/**
 * Inbound port: create a new export draft.
 */
public interface CriarExportacaoUseCase {

    ExportacaoView criar(CriarExportacaoCommand cmd);

    /** Command to create an export draft. */
    record CriarExportacaoCommand(
            UUID customerId,
            UUID legalEntityId,
            String destinationCountry,
            String incoterm,
            String currency,
            List<ItemCommand> itens) {

        /** Single line item within a create command. */
        public record ItemCommand(
                UUID productId,
                String description,
                BigDecimal quantity,
                BigDecimal unitPrice) {
        }
    }

    /** Read view of a single export. */
    record ExportacaoView(
            UUID id,
            String reference,
            String status,
            String destinationCountry,
            String incoterm,
            BigDecimal totalAmount,
            String currency,
            int itemCount) {

        public static ExportacaoView from(Exportacao e) {
            return new ExportacaoView(
                    e.id().value(),
                    e.reference(),
                    e.status().name(),
                    e.destinationCountry(),
                    e.incoterm(),
                    e.totalAmount(),
                    e.currency(),
                    e.itens().size());
        }
    }
}

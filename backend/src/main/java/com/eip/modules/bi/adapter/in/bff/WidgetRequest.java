package com.eip.modules.bi.adapter.in.bff;

import java.util.UUID;

import com.eip.modules.bi.domain.port.in.GerenciarDashboardsUseCase.WidgetCommand;

/**
 * BFF request payload for a single dashboard widget.
 */
public record WidgetRequest(
        UUID id,
        String tipo,
        String titulo,
        String config,
        int ordem) {

    /** Maps this request to the use-case command. */
    public WidgetCommand toCommand() {
        return new WidgetCommand(id, tipo, titulo, config, ordem);
    }
}

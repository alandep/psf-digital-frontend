package com.eip.modules.bi.adapter.in.bff;

import java.util.List;

import com.eip.modules.bi.domain.port.in.GerenciarDashboardsUseCase.AtualizarDashboardCommand;
import com.eip.modules.bi.domain.port.in.GerenciarDashboardsUseCase.WidgetCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for updating a dashboard.
 */
public record AtualizarDashboardRequest(
        @NotBlank String name,
        String description,
        String layout,
        List<WidgetRequest> widgets) {

    /** Maps this request to the use-case command. */
    public AtualizarDashboardCommand toCommand() {
        List<WidgetCommand> ws = widgets == null ? List.of()
                : widgets.stream().map(WidgetRequest::toCommand).toList();
        return new AtualizarDashboardCommand(name, description, layout, ws);
    }
}

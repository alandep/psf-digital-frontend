package com.eip.modules.bi.adapter.in.bff;

import java.util.List;

import com.eip.modules.bi.domain.port.in.GerenciarDashboardsUseCase.CriarDashboardCommand;
import com.eip.modules.bi.domain.port.in.GerenciarDashboardsUseCase.WidgetCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for creating a dashboard.
 */
public record CriarDashboardRequest(
        @NotBlank String name,
        String description,
        String layout,
        List<WidgetRequest> widgets) {

    /** Maps this request to the use-case command. */
    public CriarDashboardCommand toCommand() {
        List<WidgetCommand> ws = widgets == null ? List.of()
                : widgets.stream().map(WidgetRequest::toCommand).toList();
        return new CriarDashboardCommand(name, description, layout, ws);
    }
}

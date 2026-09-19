package com.eip.modules.bi.domain.port.in;

import java.util.List;
import java.util.UUID;

import com.eip.modules.bi.domain.model.Dashboard;
import com.eip.modules.bi.domain.model.Widget;

/**
 * Inbound port: manage dashboards and their widgets.
 */
public interface GerenciarDashboardsUseCase {

    List<DashboardView> listar();

    DashboardView porId(UUID id);

    DashboardView criar(CriarDashboardCommand cmd);

    DashboardView atualizar(UUID id, AtualizarDashboardCommand cmd);

    DashboardView definirPadrao(UUID id);

    void remover(UUID id);

    /** Command to create a dashboard. */
    record CriarDashboardCommand(
            String name,
            String description,
            String layout,
            List<WidgetCommand> widgets) {
    }

    /** Command to update a dashboard. */
    record AtualizarDashboardCommand(
            String name,
            String description,
            String layout,
            List<WidgetCommand> widgets) {
    }

    /** Command carrying a single widget definition. */
    record WidgetCommand(
            UUID id,
            String tipo,
            String titulo,
            String config,
            int ordem) {
    }

    /** Read view of a single dashboard, including its widgets. */
    record DashboardView(
            UUID id,
            UUID userId,
            String name,
            String description,
            String layout,
            boolean isDefault,
            long version,
            List<WidgetView> widgets) {

        public static DashboardView from(Dashboard d) {
            List<WidgetView> ws = d.widgets().stream().map(WidgetView::from).toList();
            return new DashboardView(
                    d.id().value(),
                    d.userId(),
                    d.name(),
                    d.description(),
                    d.layout(),
                    d.isDefault(),
                    d.version(),
                    ws);
        }
    }

    /** Read view of a single widget. */
    record WidgetView(
            UUID id,
            String tipo,
            String titulo,
            String config,
            int ordem) {

        public static WidgetView from(Widget w) {
            return new WidgetView(w.id(), w.tipo(), w.titulo(), w.config(), w.ordem());
        }
    }
}

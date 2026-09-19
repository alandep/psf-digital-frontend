package com.eip.modules.bi.domain.port.in;

import java.util.List;
import java.util.UUID;

import com.eip.modules.bi.domain.model.SavedQuery;

/**
 * Inbound port: manage saved data-explorer queries.
 */
public interface GerenciarConsultasUseCase {

    List<SavedQueryView> listar();

    SavedQueryView porId(UUID id);

    SavedQueryView criar(CriarConsultaCommand cmd);

    SavedQueryView atualizar(UUID id, AtualizarConsultaCommand cmd);

    void remover(UUID id);

    /** Command to create a saved query. */
    record CriarConsultaCommand(
            String name,
            String dataset,
            String queryJson) {
    }

    /** Command to update a saved query. */
    record AtualizarConsultaCommand(
            String name,
            String queryJson) {
    }

    /** Read view of a single saved query. */
    record SavedQueryView(
            UUID id,
            UUID userId,
            String name,
            String dataset,
            String queryJson) {

        public static SavedQueryView from(SavedQuery q) {
            return new SavedQueryView(
                    q.id().value(),
                    q.userId(),
                    q.name(),
                    q.dataset(),
                    q.queryJson());
        }
    }
}

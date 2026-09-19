package com.eip.modules.bi.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.bi.domain.model.SavedQuery;

/**
 * Outbound port: persistence for the saved-query aggregate.
 */
public interface SavedQueryRepositoryPort {

    SavedQuery salvar(SavedQuery q);

    Optional<SavedQuery> porId(UUID id, UUID org);

    List<SavedQuery> listar(UUID org);

    void remover(UUID id, UUID org);
}

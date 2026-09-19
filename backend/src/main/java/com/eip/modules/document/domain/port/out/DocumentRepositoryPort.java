package com.eip.modules.document.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.document.domain.model.Document;

/**
 * Outbound port for persisting and querying {@link Document} aggregates.
 */
public interface DocumentRepositoryPort {

    Document salvar(Document d);

    Optional<Document> porId(UUID id, UUID org);

    /**
     * Lists documents for a tenant, optionally filtered.
     *
     * @param type     document type name, or {@code null} for all
     * @param exportId export id, or {@code null} for all
     */
    List<Document> listar(UUID org, String type, UUID exportId);
}

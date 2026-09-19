package com.eip.modules.cms.domain.port.in;

import java.util.List;
import java.util.UUID;

import com.eip.modules.cms.domain.model.OfficialLink;

/**
 * Inbound port: curated official links. Listing active links is public;
 * creating and toggling are admin actions. Content is GLOBAL — no tenant
 * context.
 */
public interface ConsultarLinksOficiaisUseCase {

    List<OfficialLinkView> listar();

    OfficialLinkView criar(CriarLinkCommand cmd);

    OfficialLinkView alternar(UUID id);

    /** Command to create an official link. */
    record CriarLinkCommand(
            String category,
            String name,
            String description,
            String url,
            String country,
            int displayOrder) {
    }

    /** Read view of an official link. */
    record OfficialLinkView(
            UUID id,
            String category,
            String name,
            String description,
            String url,
            String country,
            int displayOrder,
            boolean active) {

        public static OfficialLinkView from(OfficialLink l) {
            return new OfficialLinkView(l.id(), l.category(), l.name(), l.description(),
                    l.url(), l.country(), l.displayOrder(), l.active());
        }
    }
}

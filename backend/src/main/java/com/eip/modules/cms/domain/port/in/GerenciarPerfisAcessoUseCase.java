package com.eip.modules.cms.domain.port.in;

import java.util.List;
import java.util.UUID;

import com.eip.modules.cms.domain.model.AccessProfile;

/**
 * Inbound port: manage tenant access profiles (roles). Tenant-scoped.
 */
public interface GerenciarPerfisAcessoUseCase {

    List<PerfilView> listar();

    PerfilView porId(UUID id);

    PerfilView criar(CriarPerfilCommand cmd);

    PerfilView atualizar(UUID id, AtualizarPerfilCommand cmd);

    void remover(UUID id);

    /** Command to create an access profile. */
    record CriarPerfilCommand(String name, String description, String color, String permissions) {
    }

    /** Command to update an access profile. */
    record AtualizarPerfilCommand(String name, String description, String permissions) {
    }

    /** Read view of an access profile. */
    record PerfilView(
            UUID id,
            String name,
            String description,
            String color,
            boolean isSystem,
            String permissions,
            long version) {

        public static PerfilView from(AccessProfile p) {
            return new PerfilView(p.id(), p.name(), p.description(), p.color(),
                    p.isSystem(), p.permissions(), p.version());
        }
    }
}

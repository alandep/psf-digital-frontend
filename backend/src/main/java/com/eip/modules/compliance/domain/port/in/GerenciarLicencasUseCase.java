package com.eip.modules.compliance.domain.port.in;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.eip.modules.compliance.domain.model.Licenca;

/**
 * Inbound port: manage licenses.
 */
public interface GerenciarLicencasUseCase {

    List<LicencaView> listar(String status);

    LicencaView porId(UUID id);

    LicencaView criar(CriarLicencaCommand cmd);

    LicencaView renovar(UUID id, RenovarCommand cmd);

    LicencaView cancelar(UUID id);

    /** Command to create a license. */
    record CriarLicencaCommand(
            String name,
            String tipo,
            String orgao,
            String numero,
            LocalDate emitidaEm,
            LocalDate validaAte) {
    }

    /** Command to renew a license. */
    record RenovarCommand(LocalDate validaAte) {
    }

    /** Read view of a single license. */
    record LicencaView(
            UUID id,
            String name,
            String tipo,
            String orgao,
            String numero,
            String status,
            LocalDate emitidaEm,
            LocalDate validaAte) {

        public static LicencaView from(Licenca l) {
            return new LicencaView(
                    l.id().value(),
                    l.name(),
                    l.tipo(),
                    l.orgao(),
                    l.numero(),
                    l.status().name(),
                    l.emitidaEm(),
                    l.validaAte());
        }
    }
}

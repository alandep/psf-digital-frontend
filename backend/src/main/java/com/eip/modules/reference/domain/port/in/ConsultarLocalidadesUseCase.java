package com.eip.modules.reference.domain.port.in;

import java.util.List;

/** Inbound port: list Brazilian state (UF) and city reference data. */
public interface ConsultarLocalidadesUseCase {

    List<EstadoView> listarEstados();

    List<CidadeView> listarCidadesPorUf(String uf);

    /** Read view of a Brazilian state (UF) for reusable combos. */
    record EstadoView(String uf, String ibgeCode, String name) {
    }

    /** Read view of a Brazilian municipality for reusable combos. */
    record CidadeView(String ibgeCode, String uf, String name) {
    }
}

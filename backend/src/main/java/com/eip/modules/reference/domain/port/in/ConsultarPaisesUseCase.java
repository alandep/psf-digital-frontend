package com.eip.modules.reference.domain.port.in;

import java.util.List;

/** Inbound port: list the global ISO 3166-1 country reference data. */
public interface ConsultarPaisesUseCase {

    List<PaisView> listar();

    /** Read view of a country for reusable combos. */
    record PaisView(String alpha2, String alpha3, String namePt, String nameEn) {
    }
}

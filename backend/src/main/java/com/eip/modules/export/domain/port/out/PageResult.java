package com.eip.modules.export.domain.port.out;

import java.util.List;

import com.eip.modules.export.domain.model.Exportacao;

/**
 * A page of exports plus the total element count.
 */
public record PageResult(List<Exportacao> content, long total) {
}

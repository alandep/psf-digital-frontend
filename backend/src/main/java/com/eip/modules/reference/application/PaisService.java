package com.eip.modules.reference.application;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.reference.adapter.out.persistence.PaisJpaRepository;
import com.eip.modules.reference.domain.port.in.ConsultarPaisesUseCase;

import lombok.RequiredArgsConstructor;

/** Application service that lists the global country reference data. Pure reference data — no tenant context. */
@Service
@RequiredArgsConstructor
public class PaisService implements ConsultarPaisesUseCase {

    private final PaisJpaRepository repo;

    @Override
    @Transactional(readOnly = true)
    public List<PaisView> listar() {
        return repo.findAllByOrderByNamePtAsc().stream()
                .map(e -> new PaisView(e.getAlpha2(), e.getAlpha3(), e.getNamePt(), e.getNameEn()))
                .toList();
    }
}

package com.eip.modules.cms.adapter.in.bff;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.cms.domain.port.in.ConsultarLinksOficiaisUseCase;
import com.eip.modules.cms.domain.port.in.ConsultarLinksOficiaisUseCase.OfficialLinkView;

import lombok.RequiredArgsConstructor;

/**
 * PUBLIC BFF endpoints for the official links catalog. Reachable without
 * authentication ({@code /bff/public/**} is permitted by SecurityConfig).
 */
@RestController
@RequestMapping("/bff/public/official-links")
@RequiredArgsConstructor
public class PublicLinksBffController {

    private final ConsultarLinksOficiaisUseCase useCase;

    @GetMapping
    public List<OfficialLinkView> listar() {
        return useCase.listar();
    }
}

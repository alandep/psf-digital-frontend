package com.eip.modules.cms.adapter.in.bff;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.cms.domain.port.in.ConsultarConfiguracoesUseCase;
import com.eip.modules.cms.domain.port.in.ConsultarConfiguracoesUseCase.SettingView;

import lombok.RequiredArgsConstructor;

/**
 * PUBLIC BFF endpoints for institutional settings. Reachable without
 * authentication ({@code /bff/public/**} is permitted by SecurityConfig).
 */
@RestController
@RequestMapping("/bff/public/settings")
@RequiredArgsConstructor
public class PublicSettingsBffController {

    private final ConsultarConfiguracoesUseCase useCase;

    @GetMapping
    public List<SettingView> listarPublicas() {
        return useCase.listarPublicas();
    }

    @GetMapping("/{key}")
    public SettingView obter(@PathVariable String key) {
        return useCase.obter(key);
    }
}

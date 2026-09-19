package com.eip.modules.cms.application;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.cms.domain.model.PublicSetting;
import com.eip.modules.cms.domain.port.in.ConsultarConfiguracoesUseCase;
import com.eip.modules.cms.domain.port.out.PublicSettingRepositoryPort;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.error.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

/**
 * Application service for institutional settings.
 *
 * <p>Settings are GLOBAL: this service intentionally does NOT read the tenant
 * organization context, since PUBLIC settings are reachable without auth and
 * {@code public_setting} is not RLS-scoped.
 */
@Service
@RequiredArgsConstructor
public class SettingsService implements ConsultarConfiguracoesUseCase {

    private final PublicSettingRepositoryPort repo;

    @Override
    @Transactional(readOnly = true)
    public List<SettingView> listarPublicas() {
        return repo.findPublic().stream().map(SettingView::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SettingView obter(String key) {
        PublicSetting s = repo.find(key)
                .orElseThrow(() -> new ResourceNotFoundException("Configuracao nao encontrada: " + key));
        return SettingView.from(s);
    }

    @Override
    @Transactional
    public SettingView salvar(SalvarSettingCommand cmd) {
        if (cmd.key() == null || cmd.key().isBlank()) {
            throw new BusinessRuleException("Chave da configuracao e obrigatoria");
        }
        String type = repo.find(cmd.key()).map(PublicSetting::type).orElse("PUBLIC");
        PublicSetting salvo = repo.save(new PublicSetting(cmd.key(), cmd.value(), type));
        return SettingView.from(salvo);
    }
}

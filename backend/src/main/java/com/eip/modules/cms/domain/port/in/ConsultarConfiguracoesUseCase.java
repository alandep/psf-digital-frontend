package com.eip.modules.cms.domain.port.in;

import java.util.List;

import com.eip.modules.cms.domain.model.PublicSetting;

/**
 * Inbound port: institutional public settings. Reads of PUBLIC settings are
 * reachable without auth; saving is an admin action. Content is GLOBAL — no
 * tenant context.
 */
public interface ConsultarConfiguracoesUseCase {

    List<SettingView> listarPublicas();

    SettingView obter(String key);

    SettingView salvar(SalvarSettingCommand cmd);

    /** Command to create/update a setting. */
    record SalvarSettingCommand(String key, String value) {
    }

    /** Read view of a setting. */
    record SettingView(String key, String value, String type) {

        public static SettingView from(PublicSetting s) {
            return new SettingView(s.key(), s.value(), s.type());
        }
    }
}

package com.eip.modules.ai.domain.port.out;

import java.util.UUID;

import com.eip.modules.ai.domain.model.AiResult;
import com.eip.modules.ai.domain.model.AiTask;

/**
 * Outbound port for the authoritative AI usage ledger ({@code ai_usage_event}).
 * Every AI operation records one event feeding the tenant's franquia meters.
 */
public interface AiUsageLedgerPort {

    void record(UUID org, UUID userId, AiTask task, AiResult result, String requestId);
}

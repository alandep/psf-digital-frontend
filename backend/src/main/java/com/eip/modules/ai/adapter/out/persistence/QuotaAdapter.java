package com.eip.modules.ai.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.ai.domain.port.out.QuotaPort;
import com.eip.platform.billing.UsageQuotaService;
import com.eip.platform.billing.UsageQuotaService.Meter;
import com.eip.platform.billing.UsageQuotaService.UsageSnapshot;

import lombok.RequiredArgsConstructor;

/**
 * Quota adapter delegating to the platform {@link UsageQuotaService}, which
 * measures the plan franquia plus purchased packs against the real ledger.
 */
@Component
@RequiredArgsConstructor
public class QuotaAdapter implements QuotaPort {

    private final UsageQuotaService usage;

    @Override
    public List<Quota> forOrg(UUID org) {
        UsageSnapshot snapshot = usage.snapshot(org);
        return List.of(toQuota(snapshot.ai()), toQuota(snapshot.ocr()), toQuota(snapshot.storage()));
    }

    @Override
    public boolean hasRemaining(UUID org, String feature) {
        if ("AI".equalsIgnoreCase(feature)) {
            return usage.hasAiRemaining(org);
        }
        if ("OCR".equalsIgnoreCase(feature)) {
            return usage.hasOcrRemaining(org);
        }
        return true;
    }

    private static Quota toQuota(Meter m) {
        return new Quota(m.feature(), m.label(), m.used(), m.included(), m.unit());
    }
}

package com.eip.modules.finance.adapter.in.bff;

import java.time.OffsetDateTime;

/**
 * Optional body of the settle endpoint; {@code paidAt} defaults to now.
 */
public record PagarRequest(OffsetDateTime paidAt) {
}

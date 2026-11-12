/**
 * Market data module: GLOBAL (not tenant-scoped) reference quotes shared by all
 * organizations, starting with the USD/BRL commercial dollar shown in the app
 * toolbar. Quotes come from free public sources (AwesomeAPI as primary, Banco
 * Central PTAX as fallback) behind an outbound port, are cached server-side so
 * upstream providers are hit at most a couple of times per minute regardless
 * of the number of users, and carry their source + timestamp for transparency.
 *
 * <p>Note: B3 does not offer a free real-time quote API (its market data is a
 * licensed product), so the free commercial-dollar feed is used instead.
 */
@ApplicationModule(displayName = "MarketData")
package com.eip.modules.marketdata;

import org.springframework.modulith.ApplicationModule;
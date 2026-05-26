package com.healthtracker.api.market.api;

import java.math.BigDecimal;
import java.time.Instant;

public final class MarketQuoteDtos {

    private MarketQuoteDtos() {
    }

    public record MarketQuoteResponse(
        String symbol,
        String name,
        String exchangeCode,
        String last,
        BigDecimal price,
        String diff,
        String rate,
        String volume,
        Instant fetchedAt
    ) {
    }
}

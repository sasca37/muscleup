package com.healthtracker.api.market.api;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class MarketQuoteDtos {

    private MarketQuoteDtos() {
    }

    public record MarketQuoteResponse(
        String symbol,
        String name,
        String exchangeCode,
        String last,
        String base,
        BigDecimal price,
        String diff,
        String rate,
        String volume,
        Instant fetchedAt
    ) {
    }

    public record MarketWatchlistRequest(
        List<String> symbols
    ) {
    }

    public record MarketWatchlistResponse(
        List<String> symbols
    ) {
    }
}

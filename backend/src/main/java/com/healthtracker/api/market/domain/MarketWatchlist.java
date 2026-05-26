package com.healthtracker.api.market.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document("market_watchlists")
public class MarketWatchlist {

    @Id
    private String userId;

    private List<String> symbols = new ArrayList<>();

    private Instant createdAt;

    private Instant updatedAt;

    protected MarketWatchlist() {
    }

    private MarketWatchlist(String userId, List<String> symbols, Instant now) {
        this.userId = userId;
        this.symbols = new ArrayList<>(symbols);
        this.createdAt = now;
        this.updatedAt = now;
    }

    public static MarketWatchlist create(String userId, List<String> symbols) {
        return new MarketWatchlist(userId, symbols, Instant.now());
    }

    public void updateSymbols(List<String> nextSymbols) {
        this.symbols = new ArrayList<>(nextSymbols);
        this.updatedAt = Instant.now();
    }

    public String getUserId() {
        return userId;
    }

    public List<String> getSymbols() {
        return symbols;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}

package com.healthtracker.api.market.repository;

import com.healthtracker.api.market.domain.MarketWatchlist;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MarketWatchlistRepository extends MongoRepository<MarketWatchlist, String> {
}

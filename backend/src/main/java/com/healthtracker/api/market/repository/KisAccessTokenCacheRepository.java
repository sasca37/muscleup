package com.healthtracker.api.market.repository;

import com.healthtracker.api.market.domain.KisAccessTokenCache;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface KisAccessTokenCacheRepository extends MongoRepository<KisAccessTokenCache, String> {
}

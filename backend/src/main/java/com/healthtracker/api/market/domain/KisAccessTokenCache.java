package com.healthtracker.api.market.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("kis_access_tokens")
public class KisAccessTokenCache {

    @Id
    private String id;

    private String accessToken;

    private Instant expiresAt;

    private Instant updatedAt;

    protected KisAccessTokenCache() {
    }

    private KisAccessTokenCache(String id, String accessToken, Instant expiresAt, Instant now) {
        this.id = id;
        this.accessToken = accessToken;
        this.expiresAt = expiresAt;
        this.updatedAt = now;
    }

    public static KisAccessTokenCache create(String id, String accessToken, Instant expiresAt) {
        return new KisAccessTokenCache(id, accessToken, expiresAt, Instant.now());
    }

    public boolean isUsable(long refreshBufferSeconds) {
        return accessToken != null
            && !accessToken.isBlank()
            && expiresAt != null
            && Instant.now().plusSeconds(refreshBufferSeconds).isBefore(expiresAt);
    }

    public String getId() {
        return id;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}

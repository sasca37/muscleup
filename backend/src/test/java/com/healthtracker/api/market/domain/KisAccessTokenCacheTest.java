package com.healthtracker.api.market.domain;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class KisAccessTokenCacheTest {

    @Test
    void tokenIsUsableWhenExpiresAfterRefreshBuffer() {
        KisAccessTokenCache cache = KisAccessTokenCache.create(
            "kis:test",
            "access-token",
            Instant.now().plusSeconds(600)
        );

        assertThat(cache.isUsable(300)).isTrue();
    }

    @Test
    void tokenIsNotUsableWhenExpiresWithinRefreshBuffer() {
        KisAccessTokenCache cache = KisAccessTokenCache.create(
            "kis:test",
            "access-token",
            Instant.now().plusSeconds(60)
        );

        assertThat(cache.isUsable(300)).isFalse();
    }

    @Test
    void blankTokenIsNotUsable() {
        KisAccessTokenCache cache = KisAccessTokenCache.create(
            "kis:test",
            " ",
            Instant.now().plusSeconds(600)
        );

        assertThat(cache.isUsable(300)).isFalse();
    }
}

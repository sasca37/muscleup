package com.healthtracker.api.market.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "kis")
public record KisProperties(
    String baseUrl,
    String appKey,
    String appSecret,
    String priceDetailTrId,
    long tokenRefreshBufferSeconds
) {
    public boolean hasCredentials() {
        return appKey != null && !appKey.isBlank()
            && appSecret != null && !appSecret.isBlank();
    }
}

package com.healthtracker.api.market.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.healthtracker.api.market.config.KisProperties;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class KisAccessTokenProvider {

    private static final DateTimeFormatter TOKEN_EXPIRED_FORMATTER =
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final ZoneId KOREA_ZONE = ZoneId.of("Asia/Seoul");

    private final KisProperties properties;
    private final RestClient restClient;

    private CachedAccessToken cachedAccessToken;

    public KisAccessTokenProvider(KisProperties properties, RestClient.Builder restClientBuilder) {
        this.properties = properties;
        this.restClient = restClientBuilder
            .baseUrl(properties.baseUrl())
            .build();
    }

    public synchronized String getAccessToken() {
        if (!properties.hasCredentials()) {
            throw new MarketQuoteException("KIS_APP_KEY와 KIS_APP_SECRET 환경변수가 필요합니다.");
        }

        if (cachedAccessToken != null && !cachedAccessToken.isExpired(properties.tokenRefreshBufferSeconds())) {
            return cachedAccessToken.value();
        }

        KisTokenResponse response = restClient.post()
            .uri("/oauth2/tokenP")
            .contentType(MediaType.APPLICATION_JSON)
            .body(new KisTokenRequest("client_credentials", properties.appKey(), properties.appSecret()))
            .retrieve()
            .body(KisTokenResponse.class);

        if (response == null || response.accessToken() == null || response.accessToken().isBlank()) {
            throw new MarketQuoteException("한국투자증권 access token 발급에 실패했습니다.");
        }

        cachedAccessToken = CachedAccessToken.from(response);
        return cachedAccessToken.value();
    }

    private record KisTokenRequest(
        @JsonProperty("grant_type") String grantType,
        String appkey,
        String appsecret
    ) {
    }

    private record KisTokenResponse(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("access_token_token_expired") String accessTokenExpired,
        @JsonProperty("token_type") String tokenType,
        @JsonProperty("expires_in") long expiresIn
    ) {
    }

    private record CachedAccessToken(
        String value,
        LocalDateTime expiresAt
    ) {
        static CachedAccessToken from(KisTokenResponse response) {
            LocalDateTime expiresAt = LocalDateTime.now(KOREA_ZONE).plusSeconds(response.expiresIn());
            if (response.accessTokenExpired() != null && !response.accessTokenExpired().isBlank()) {
                expiresAt = LocalDateTime.parse(response.accessTokenExpired(), TOKEN_EXPIRED_FORMATTER);
            }
            return new CachedAccessToken(response.accessToken(), expiresAt);
        }

        boolean isExpired(long refreshBufferSeconds) {
            return LocalDateTime.now(KOREA_ZONE).plusSeconds(refreshBufferSeconds).isAfter(expiresAt);
        }
    }
}

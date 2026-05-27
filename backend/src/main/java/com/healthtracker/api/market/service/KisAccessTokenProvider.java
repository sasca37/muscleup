package com.healthtracker.api.market.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.healthtracker.api.market.config.KisProperties;
import com.healthtracker.api.market.domain.KisAccessTokenCache;
import com.healthtracker.api.market.repository.KisAccessTokenCacheRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class KisAccessTokenProvider {

    private static final DateTimeFormatter TOKEN_EXPIRED_FORMATTER =
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final ZoneId KOREA_ZONE = ZoneId.of("Asia/Seoul");

    private final KisProperties properties;
    private final KisAccessTokenCacheRepository accessTokenCacheRepository;
    private final RestClient restClient;

    public KisAccessTokenProvider(
        KisProperties properties,
        KisAccessTokenCacheRepository accessTokenCacheRepository,
        RestClient.Builder restClientBuilder
    ) {
        this.properties = properties;
        this.accessTokenCacheRepository = accessTokenCacheRepository;
        this.restClient = restClientBuilder
            .baseUrl(properties.baseUrl())
            .build();
    }

    public synchronized String getAccessToken() {
        if (!properties.hasCredentials()) {
            throw new MarketQuoteException("KIS_APP_KEY와 KIS_APP_SECRET 환경변수가 필요합니다.");
        }

        String cacheId = createCacheId(properties.appKey());
        return accessTokenCacheRepository.findById(cacheId)
            .filter(cache -> cache.isUsable(properties.tokenRefreshBufferSeconds()))
            .map(KisAccessTokenCache::getAccessToken)
            .orElseGet(() -> issueAndCacheAccessToken(cacheId));
    }

    private String issueAndCacheAccessToken(String cacheId) {
        KisTokenResponse response = restClient.post()
            .uri("/oauth2/tokenP")
            .contentType(MediaType.APPLICATION_JSON)
            .body(new KisTokenRequest("client_credentials", properties.appKey(), properties.appSecret()))
            .retrieve()
            .body(KisTokenResponse.class);

        if (response == null || response.accessToken() == null || response.accessToken().isBlank()) {
            throw new MarketQuoteException("한국투자증권 access token 발급에 실패했습니다.");
        }

        IssuedAccessToken issuedAccessToken = IssuedAccessToken.from(response);
        accessTokenCacheRepository.save(KisAccessTokenCache.create(
            cacheId,
            issuedAccessToken.value(),
            issuedAccessToken.expiresAt()
        ));
        return issuedAccessToken.value();
    }

    private String createCacheId(String appKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashedAppKey = digest.digest(appKey.getBytes(StandardCharsets.UTF_8));
            return "kis:" + HexFormat.of().formatHex(hashedAppKey);
        } catch (NoSuchAlgorithmException exception) {
            throw new MarketQuoteException("KIS access token cache id 생성에 실패했습니다.", exception);
        }
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

    private record IssuedAccessToken(
        String value,
        Instant expiresAt
    ) {
        static IssuedAccessToken from(KisTokenResponse response) {
            Instant expiresAt = Instant.now().plusSeconds(response.expiresIn());
            if (response.accessTokenExpired() != null && !response.accessTokenExpired().isBlank()) {
                expiresAt = LocalDateTime.parse(response.accessTokenExpired(), TOKEN_EXPIRED_FORMATTER)
                    .atZone(KOREA_ZONE)
                    .toInstant();
            }
            return new IssuedAccessToken(response.accessToken(), expiresAt);
        }
    }
}

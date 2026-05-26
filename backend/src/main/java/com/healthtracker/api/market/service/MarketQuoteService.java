package com.healthtracker.api.market.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.healthtracker.api.market.api.MarketQuoteDtos.MarketQuoteResponse;
import com.healthtracker.api.market.config.KisProperties;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class MarketQuoteService {

    private static final ZoneId KOREA_ZONE = ZoneId.of("Asia/Seoul");
    private static final ZoneId NEW_YORK_ZONE = ZoneId.of("America/New_York");
    private static final LocalTime REGULAR_MARKET_OPEN_KST_DST = LocalTime.of(22, 30);
    private static final LocalTime REGULAR_MARKET_CLOSE_KST_DST = LocalTime.of(5, 0);
    private static final LocalTime REGULAR_MARKET_OPEN_KST_STANDARD = LocalTime.of(23, 30);
    private static final LocalTime REGULAR_MARKET_CLOSE_KST_STANDARD = LocalTime.of(6, 0);
    private static final String NASDAQ_REGULAR_EXCHANGE_CODE = "NAS";
    private static final String NASDAQ_DAYTIME_EXCHANGE_CODE = "BAQ";

    private static final Map<String, StockSymbol> KNOWN_US_SYMBOLS = Map.of(
        "INTC", new StockSymbol("INTC", "인텔"),
        "AMD", new StockSymbol("AMD", "AMD"),
        "ARM", new StockSymbol("ARM", "ARM"),
        "MU", new StockSymbol("MU", "마이크론"),
        "SNDK", new StockSymbol("SNDK", "샌디스크")
    );

    private final KisProperties properties;
    private final KisAccessTokenProvider accessTokenProvider;
    private final RestClient restClient;

    public MarketQuoteService(
        KisProperties properties,
        KisAccessTokenProvider accessTokenProvider,
        RestClient.Builder restClientBuilder
    ) {
        this.properties = properties;
        this.accessTokenProvider = accessTokenProvider;
        this.restClient = restClientBuilder
            .baseUrl(properties.baseUrl())
            .build();
    }

    public MarketQuoteResponse getUsStockQuote(String requestedSymbol) {
        StockSymbol stockSymbol = normalizeSymbol(requestedSymbol);
        String exchangeCode = resolveNasdaqExchangeCode();
        String accessToken = accessTokenProvider.getAccessToken();

        try {
            JsonNode response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/uapi/overseas-price/v1/quotations/price-detail")
                    .queryParam("AUTH", "")
                    .queryParam("EXCD", exchangeCode)
                    .queryParam("SYMB", stockSymbol.symbol())
                    .build())
                .header("authorization", "Bearer " + accessToken)
                .header("appkey", properties.appKey())
                .header("appsecret", properties.appSecret())
                .header("tr_id", properties.priceDetailTrId())
                .header("custtype", "P")
                .retrieve()
                .body(JsonNode.class);

            if (response != null && response.has("rt_cd") && !"0".equals(response.path("rt_cd").asText())) {
                String message = response.path("msg1").asText("한국투자증권 현재가 조회가 거절되었습니다.");
                throw new MarketQuoteException(message);
            }

            JsonNode output = Optional.ofNullable(response)
                .map(node -> node.path("output"))
                .orElseThrow(() -> new MarketQuoteException("한국투자증권 현재가 응답이 비어 있습니다."));

            String last = output.path("last").asText("");
            if (last.isBlank()) {
                throw new MarketQuoteException("한국투자증권 현재가 응답에 last 값이 없습니다.");
            }

            return new MarketQuoteResponse(
                stockSymbol.symbol(),
                stockSymbol.name(),
                exchangeCode,
                last,
                output.path("base").asText(null),
                parsePrice(last),
                output.path("diff").asText(null),
                output.path("rate").asText(null),
                output.path("tvol").asText(null),
                Instant.now()
            );
        } catch (RestClientException exception) {
            throw new MarketQuoteException("한국투자증권 현재가 조회에 실패했습니다.", exception);
        }
    }

    private StockSymbol normalizeSymbol(String requestedSymbol) {
        if (requestedSymbol == null || requestedSymbol.isBlank()) {
            throw new MarketQuoteException("조회할 종목 코드가 필요합니다.");
        }

        String normalizedSymbol = requestedSymbol
            .replace("NASDAQ:", "")
            .replace("NAS:", "")
            .replace("NYSE:", "")
            .replace("NYS:", "")
            .trim()
            .toUpperCase();

        return KNOWN_US_SYMBOLS.getOrDefault(
            normalizedSymbol,
            new StockSymbol(normalizedSymbol, normalizedSymbol)
        );
    }

    private String resolveNasdaqExchangeCode() {
        ZonedDateTime nowKorea = ZonedDateTime.now(KOREA_ZONE);
        ZonedDateTime nowNewYork = nowKorea.withZoneSameInstant(NEW_YORK_ZONE);
        boolean daylightSaving = NEW_YORK_ZONE.getRules().isDaylightSavings(nowKorea.toInstant());
        LocalTime marketOpen = daylightSaving ? REGULAR_MARKET_OPEN_KST_DST : REGULAR_MARKET_OPEN_KST_STANDARD;
        LocalTime marketClose = daylightSaving ? REGULAR_MARKET_CLOSE_KST_DST : REGULAR_MARKET_CLOSE_KST_STANDARD;
        DayOfWeek dayOfWeek = nowNewYork.getDayOfWeek();
        boolean weekday = dayOfWeek != DayOfWeek.SATURDAY && dayOfWeek != DayOfWeek.SUNDAY;
        boolean regularHours = isWithinKoreaRegularMarketWindow(nowKorea.toLocalTime(), marketOpen, marketClose);

        return weekday && regularHours ? NASDAQ_REGULAR_EXCHANGE_CODE : NASDAQ_DAYTIME_EXCHANGE_CODE;
    }

    private boolean isWithinKoreaRegularMarketWindow(LocalTime now, LocalTime open, LocalTime close) {
        return !now.isBefore(open) || now.isBefore(close);
    }

    private BigDecimal parsePrice(String price) {
        try {
            return new BigDecimal(price);
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private record StockSymbol(
        String symbol,
        String name
    ) {
    }
}

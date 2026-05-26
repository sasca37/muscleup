package com.healthtracker.api.market.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.healthtracker.api.market.api.MarketQuoteDtos.MarketQuoteResponse;
import com.healthtracker.api.market.config.KisProperties;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class MarketQuoteService {

    private static final Map<String, StockSymbol> SUPPORTED_US_SYMBOLS = Map.of(
        "INTC", new StockSymbol("INTC", "인텔", "NAS"),
        "AMD", new StockSymbol("AMD", "AMD", "NAS"),
        "ARM", new StockSymbol("ARM", "ARM", "NAS"),
        "MU", new StockSymbol("MU", "마이크론", "NAS"),
        "SNDK", new StockSymbol("SNDK", "샌디스크", "NAS")
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
        StockSymbol stockSymbol = findSupportedSymbol(requestedSymbol);
        String accessToken = accessTokenProvider.getAccessToken();

        try {
            JsonNode response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/uapi/overseas-price/v1/quotations/price-detail")
                    .queryParam("AUTH", "")
                    .queryParam("EXCD", stockSymbol.exchangeCode())
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
                stockSymbol.exchangeCode(),
                last,
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

    private StockSymbol findSupportedSymbol(String requestedSymbol) {
        if (requestedSymbol == null || requestedSymbol.isBlank()) {
            throw new MarketQuoteException("조회할 종목 코드가 필요합니다.");
        }

        String normalizedSymbol = requestedSymbol
            .replace("NASDAQ:", "")
            .replace("NAS:", "")
            .trim()
            .toUpperCase();

        StockSymbol stockSymbol = SUPPORTED_US_SYMBOLS.get(normalizedSymbol);
        if (stockSymbol == null) {
            throw new MarketQuoteException("지원하지 않는 미국주식 종목입니다: " + requestedSymbol);
        }
        return stockSymbol;
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
        String name,
        String exchangeCode
    ) {
    }
}

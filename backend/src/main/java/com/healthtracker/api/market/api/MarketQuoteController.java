package com.healthtracker.api.market.api;

import com.healthtracker.api.market.api.MarketQuoteDtos.MarketQuoteResponse;
import com.healthtracker.api.market.service.MarketQuoteService;
import com.healthtracker.api.market.service.MarketWatchlistService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/market")
public class MarketQuoteController {

    private static final String USER_ID_HEADER = "X-User-Id";

    private final MarketQuoteService marketQuoteService;
    private final MarketWatchlistService marketWatchlistService;

    public MarketQuoteController(
        MarketQuoteService marketQuoteService,
        MarketWatchlistService marketWatchlistService
    ) {
        this.marketQuoteService = marketQuoteService;
        this.marketWatchlistService = marketWatchlistService;
    }

    @GetMapping("/us-stocks/{symbol}")
    public MarketQuoteResponse getUsStockQuote(@PathVariable String symbol) {
        return marketQuoteService.getUsStockQuote(symbol);
    }

    @GetMapping("/watchlist")
    public MarketQuoteDtos.MarketWatchlistResponse getWatchlist(@RequestHeader(USER_ID_HEADER) String userId) {
        return new MarketQuoteDtos.MarketWatchlistResponse(
            marketWatchlistService.findOrCreateWatchlist(userId).getSymbols()
        );
    }

    @PutMapping("/watchlist")
    public MarketQuoteDtos.MarketWatchlistResponse updateWatchlist(
        @RequestHeader(USER_ID_HEADER) String userId,
        @RequestBody MarketQuoteDtos.MarketWatchlistRequest request
    ) {
        return new MarketQuoteDtos.MarketWatchlistResponse(
            marketWatchlistService.updateWatchlist(
                userId,
                request == null ? List.of() : request.symbols()
            ).getSymbols()
        );
    }

    @GetMapping("/watchlist/quotes")
    public List<MarketQuoteResponse> getWatchlistQuotes(@RequestHeader(USER_ID_HEADER) String userId) {
        return marketWatchlistService.findWatchlistQuotes(userId);
    }
}

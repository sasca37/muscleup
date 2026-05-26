package com.healthtracker.api.market.api;

import com.healthtracker.api.market.api.MarketQuoteDtos.MarketQuoteResponse;
import com.healthtracker.api.market.service.MarketQuoteService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/market")
public class MarketQuoteController {

    private final MarketQuoteService marketQuoteService;

    public MarketQuoteController(MarketQuoteService marketQuoteService) {
        this.marketQuoteService = marketQuoteService;
    }

    @GetMapping("/us-stocks/{symbol}")
    public MarketQuoteResponse getUsStockQuote(@PathVariable String symbol) {
        return marketQuoteService.getUsStockQuote(symbol);
    }
}

package com.healthtracker.api.market.service;

import com.healthtracker.api.market.api.MarketQuoteDtos.MarketQuoteResponse;
import com.healthtracker.api.market.domain.MarketWatchlist;
import com.healthtracker.api.market.repository.MarketWatchlistRepository;
import com.healthtracker.api.user.repository.UserAccountRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class MarketWatchlistService {

    private static final int MAX_SYMBOL_COUNT = 5;
    private static final Pattern SYMBOL_PATTERN = Pattern.compile("^[A-Z0-9.]{1,10}$");
    private static final List<String> DEFAULT_SYMBOLS = List.of("INTC", "AMD", "ARM", "MU", "SNDK");

    private final MarketWatchlistRepository marketWatchlistRepository;
    private final MarketQuoteService marketQuoteService;
    private final UserAccountRepository userAccountRepository;

    public MarketWatchlistService(
        MarketWatchlistRepository marketWatchlistRepository,
        MarketQuoteService marketQuoteService,
        UserAccountRepository userAccountRepository
    ) {
        this.marketWatchlistRepository = marketWatchlistRepository;
        this.marketQuoteService = marketQuoteService;
        this.userAccountRepository = userAccountRepository;
    }

    public MarketWatchlist findOrCreateWatchlist(String userId) {
        validateUser(userId);
        return marketWatchlistRepository.findById(userId)
            .orElseGet(() -> marketWatchlistRepository.save(MarketWatchlist.create(userId, DEFAULT_SYMBOLS)));
    }

    public MarketWatchlist updateWatchlist(String userId, List<String> symbols) {
        validateUser(userId);
        List<String> normalizedSymbols = normalizeSymbols(symbols);
        MarketWatchlist watchlist = marketWatchlistRepository.findById(userId)
            .orElseGet(() -> MarketWatchlist.create(userId, List.of()));
        watchlist.updateSymbols(normalizedSymbols);
        return marketWatchlistRepository.save(watchlist);
    }

    public List<MarketQuoteResponse> findWatchlistQuotes(String userId) {
        MarketWatchlist watchlist = findOrCreateWatchlist(userId);
        List<MarketQuoteResponse> quotes = new ArrayList<>();
        for (String symbol : watchlist.getSymbols()) {
            try {
                quotes.add(marketQuoteService.getUsStockQuote(symbol));
            } catch (MarketQuoteException exception) {
                // Keep the rest of the watchlist usable when one ticker is rejected by KIS.
            }
        }

        if (!watchlist.getSymbols().isEmpty() && quotes.isEmpty()) {
            throw new MarketQuoteException("현재가 조회에 실패했습니다.");
        }

        return quotes;
    }

    private void validateUser(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new MarketQuoteException("사용자 ID는 필수입니다.");
        }

        if (!userAccountRepository.existsById(userId)) {
            throw new MarketQuoteException("사용자를 찾을 수 없습니다.");
        }
    }

    private List<String> normalizeSymbols(List<String> rawSymbols) {
        if (rawSymbols == null) {
            return List.of();
        }

        Set<String> deduplicatedSymbols = new LinkedHashSet<>();
        for (String rawSymbol : rawSymbols) {
            if (rawSymbol == null || rawSymbol.isBlank()) {
                continue;
            }

            String symbol = rawSymbol
                .replace("NASDAQ:", "")
                .replace("NAS:", "")
                .replace("NYSE:", "")
                .replace("NYS:", "")
                .trim()
                .toUpperCase(Locale.ROOT);
            if (!SYMBOL_PATTERN.matcher(symbol).matches()) {
                throw new MarketQuoteException("티커는 영문/숫자/점(.) 10자 이하로 입력해주세요.");
            }
            deduplicatedSymbols.add(symbol);
        }

        List<String> symbols = new ArrayList<>(deduplicatedSymbols);
        if (symbols.size() > MAX_SYMBOL_COUNT) {
            throw new MarketQuoteException("티커는 최대 " + MAX_SYMBOL_COUNT + "개까지 저장할 수 있습니다.");
        }

        return symbols;
    }
}

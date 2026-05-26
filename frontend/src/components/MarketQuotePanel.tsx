import { Plus, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { MarketQuote } from '../types/domain';

type MarketQuotePanelProps = {
  userId: string;
};

const maxMarketSymbols = 5;
const quoteRefreshMs = 10000;
const watchlistUpdatedEvent = 'repick-market-watchlist-updated';

function parseSignedNumber(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalizedValue = value.replace(/,/g, '').replace('%', '').trim();
  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function formatFetchedTime(value?: string) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value));
}

function calculateRateFromBase(quote: MarketQuote | null) {
  const last = quote?.price ?? parseSignedNumber(quote?.last);
  const base = parseSignedNumber(quote?.base);

  if (last == null || base == null || base === 0) {
    return parseSignedNumber(quote?.rate);
  }

  return ((last - base) / base) * 100;
}

function getQuoteTone(quote: MarketQuote | null) {
  const rateValue = calculateRateFromBase(quote);

  if (rateValue == null || rateValue === 0) {
    return 'flat';
  }

  return rateValue > 0 ? 'up' : 'down';
}

function formatDollarPrice(quote: MarketQuote | null) {
  const price = quote?.price ?? parseSignedNumber(quote?.last);
  if (price == null) {
    return '-';
  }

  return `$${price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatRate(quote: MarketQuote | null) {
  const rate = calculateRateFromBase(quote);
  if (rate == null) {
    return '-';
  }

  return `${rate > 0 ? '+' : ''}${rate.toFixed(2)}%`;
}

function formatVolume(value?: string | null) {
  const volume = parseSignedNumber(value);
  if (volume == null) {
    return '-';
  }

  return Math.trunc(volume).toLocaleString('en-US');
}

function normalizeSymbol(value: string) {
  return value
    .replace('NASDAQ:', '')
    .replace('NAS:', '')
    .replace('NYSE:', '')
    .replace('NYS:', '')
    .trim()
    .toUpperCase();
}

export function MarketQuotePanel({ userId }: MarketQuotePanelProps) {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [symbolInput, setSymbolInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadQuotesForSymbols(targetSymbols: string[]) {
    if (targetSymbols.length === 0) {
      setQuotes([]);
      return;
    }

    const nextQuotes = await Promise.all(
      targetSymbols.map((symbol) =>
        api.getUsStockQuote(symbol)
          .then((quote) => quote)
          .catch(() => null),
      ),
    );
    setQuotes((currentQuotes) => {
      const currentQuoteMap = new Map(currentQuotes.map((quote) => [quote.symbol, quote]));
      nextQuotes.forEach((quote) => {
        if (quote) {
          currentQuoteMap.set(quote.symbol, quote);
        }
      });

      return targetSymbols
        .map((symbol) => currentQuoteMap.get(symbol))
        .filter((quote): quote is MarketQuote => quote != null);
    });
  }

  function applySymbols(nextSymbols: string[]) {
    setSymbols(nextSymbols);
    setQuotes((currentQuotes) =>
      currentQuotes.filter((quote) => nextSymbols.includes(quote.symbol)),
    );
  }

  useEffect(() => {
    let ignore = false;

    async function loadWatchlist() {
      try {
        const watchlist = await api.getMarketWatchlist(userId);
        if (!ignore) {
          applySymbols(watchlist.symbols);
          await loadQuotesForSymbols(watchlist.symbols);
          setError(null);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError instanceof Error ? requestError.message : '티커 목록을 불러오지 못했습니다.');
        }
      }
    }

    loadWatchlist();

    return () => {
      ignore = true;
    };
  }, [userId]);

  useEffect(() => {
    function handleWatchlistUpdated(event: Event) {
      const detail = (event as CustomEvent<{ userId: string; symbols: string[] }>).detail;
      if (detail?.userId !== userId || !Array.isArray(detail.symbols)) {
        return;
      }

      applySymbols(detail.symbols);
      loadQuotesForSymbols(detail.symbols).catch(() => {
        setError('현재가를 불러오지 못했습니다.');
      });
    }

    window.addEventListener(watchlistUpdatedEvent, handleWatchlistUpdated);
    return () => window.removeEventListener(watchlistUpdatedEvent, handleWatchlistUpdated);
  }, [userId]);

  useEffect(() => {
    let ignore = false;

    async function loadQuotes() {
      if (symbols.length === 0) {
        setQuotes([]);
        return;
      }

      setLoading(true);
      try {
        if (!ignore) {
          await loadQuotesForSymbols(symbols);
          setError(null);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError instanceof Error ? requestError.message : '현재가를 불러오지 못했습니다.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadQuotes();
    const intervalId = window.setInterval(loadQuotes, quoteRefreshMs);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [symbols]);

  async function saveSymbols(nextSymbols: string[]) {
    setSaving(true);
    setError(null);
    try {
      const watchlist = await api.updateMarketWatchlist(userId, nextSymbols);
      applySymbols(watchlist.symbols);
      window.dispatchEvent(new CustomEvent(watchlistUpdatedEvent, {
        detail: {
          userId,
          symbols: watchlist.symbols,
        },
      }));
      setSymbolInput('');
      await loadQuotesForSymbols(watchlist.symbols);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '티커 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  function submitSymbol(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const symbol = normalizeSymbol(symbolInput);
    if (!symbol || saving || symbols.includes(symbol) || symbols.length >= maxMarketSymbols) {
      return;
    }

    saveSymbols([...symbols, symbol]);
  }

  function removeSymbol(symbol: string) {
    if (saving) {
      return;
    }

    saveSymbols(symbols.filter((item) => item !== symbol));
  }

  const quoteMap = new Map(quotes.map((quote) => [quote.symbol, quote]));

  return (
    <section className="market-quote-panel" aria-label="미국주식 현재가">
      <form className="market-watchlist-form" onSubmit={submitSymbol}>
        <input
          aria-label="주식 티커"
          maxLength={10}
          placeholder="티커"
          value={symbolInput}
          onChange={(event) => setSymbolInput(event.target.value)}
        />
        <button type="submit" disabled={saving || symbols.length >= maxMarketSymbols || !symbolInput.trim()}>
          <Plus size={15} />
          추가
        </button>
      </form>

      <div className="market-quote-list">
        {symbols.map((symbol) => {
          const quote = quoteMap.get(symbol) ?? null;
          const quoteTone = getQuoteTone(quote);

          return (
            <div className="market-quote-row" key={symbol}>
              <div className="market-quote-cell stock-name">
                <span>주식명</span>
                <strong>{quote?.name ?? symbol}</strong>
                <small>{quote ? `${quote.exchangeCode} · ${formatFetchedTime(quote.fetchedAt)} 조회` : '조회 대기'}</small>
              </div>
              <div className="market-quote-cell">
                <span>현재가</span>
                <strong>{formatDollarPrice(quote)}</strong>
              </div>
              <div className="market-quote-cell">
                <span>등락률</span>
                <strong className={quoteTone}>{formatRate(quote)}</strong>
              </div>
              <div className="market-quote-cell">
                <span>거래량(주)</span>
                <strong>{formatVolume(quote?.volume)}</strong>
              </div>
              <button
                className="market-symbol-remove"
                type="button"
                aria-label={`${symbol} 삭제`}
                onClick={() => removeSymbol(symbol)}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}

        {symbols.length === 0 && (
          <div className="market-quote-empty">
            <strong>등록된 티커가 없습니다</strong>
            <span>최대 {maxMarketSymbols}개까지 추가할 수 있습니다.</span>
          </div>
        )}
      </div>

      {(loading || saving || error) && (
        <div className="market-quote-status">
          {error ?? (saving ? '티커 저장 중' : '현재가 갱신 중')}
        </div>
      )}
    </section>
  );
}

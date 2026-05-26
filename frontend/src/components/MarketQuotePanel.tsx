import { Activity, RefreshCw, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { MarketQuote } from '../types/domain';

type MarketQuotePanelProps = {
  symbol: string;
};

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

export function MarketQuotePanel({ symbol }: MarketQuotePanelProps) {
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadQuote() {
      setLoading(true);
      try {
        const nextQuote = await api.getUsStockQuote(symbol);
        if (!ignore) {
          setQuote(nextQuote);
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

    loadQuote();
    const intervalId = window.setInterval(loadQuote, 5000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [symbol]);

  return (
    <section className="market-quote-panel" aria-label="미국주식 현재가">
      <div className="market-quote-head">
        <span>한국투자증권 현재가</span>
        <strong>{quote?.name ?? symbol}</strong>
        <small>{quote?.exchangeCode ?? 'NAS'} · 5초마다 갱신</small>
      </div>

      <div className="market-price-card">
        <div>
          <span>현재가</span>
          <strong>{quote?.last ?? '-'}</strong>
        </div>
        <TrendingUp size={34} />
      </div>

      <div className="market-quote-grid">
        <article>
          <span>전일대비</span>
          <strong>{quote?.diff ?? '-'}</strong>
        </article>
        <article>
          <span>등락률</span>
          <strong>{quote?.rate ? `${quote.rate}%` : '-'}</strong>
        </article>
        <article>
          <span>거래량</span>
          <strong>{quote?.volume ?? '-'}</strong>
        </article>
        <article>
          <span>조회시각</span>
          <strong>{formatFetchedTime(quote?.fetchedAt)}</strong>
        </article>
      </div>

      <div className="market-quote-status">
        {loading ? <RefreshCw size={15} /> : <Activity size={15} />}
        <span>{error ?? (loading ? '현재가 갱신 중' : '운동 중 보기용 현재가입니다.')}</span>
      </div>
    </section>
  );
}

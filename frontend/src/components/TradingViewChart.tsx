import { useEffect, useRef } from 'react';

type TradingViewChartProps = {
  symbol: string;
};

export function TradingViewChart({ symbol }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    container.appendChild(widgetContainer);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: '5',
      timezone: 'Asia/Seoul',
      theme: 'dark',
      style: '1',
      locale: 'kr',
      backgroundColor: 'rgba(5, 10, 24, 1)',
      gridColor: 'rgba(72, 92, 136, 0.18)',
      hide_top_toolbar: false,
      hide_side_toolbar: true,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [symbol]);

  return <div className="tradingview-widget-container" ref={containerRef} />;
}

import { useId, useState } from 'react';
import { formatChange, formatPrice, type demoQuotes } from './demo-quotes';

import { chartPrices, chartRanges, type ChartRange } from './chart-data';
type Quote = (typeof demoQuotes)[number];

export default function StockDetail({
  quote,
  compact = false,
}: {
  quote: Quote;
  compact?: boolean;
}) {
  const gradient = useId();
  const [hovered, setHovered] = useState<number | null>(null);
  const [range, setRange] = useState<ChartRange>('1D');
  const prices = chartPrices(quote, range);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const padding = (high - low) * 0.25 || 1;
  const y = (price: number) => 160 - ((price - low + padding) / (high - low + padding * 2)) * 140;
  const x = (index: number) => 12 + (index / (prices.length - 1)) * 576;
  const points = prices.map((price, index) => `${x(index)},${y(price)}`).join(' ');
  const previousClose = quote.price / (1 + quote.change / 100);
  const periodChange = ((quote.price - prices[0]) / prices[0]) * 100;
  const direction = periodChange >= 0 ? 'is-up' : 'is-down';
  const focus = hovered ?? prices.length - 1;

  return (
    <section
      className={`stocks-detail ${compact ? 'stocks-detail-peek' : ''}`}
      aria-label={`${quote.company} stock details`}
    >
      <header className="stocks-detail-heading">
        <span className="stocks-company-mark" aria-hidden="true">
          {quote.company[0]}
        </span>
        <div>
          <h2>{quote.company}</h2>
          <span>
            {quote.symbol} <i>·</i> NASDAQ <i>·</i> USD
          </span>
        </div>
        <span className="stocks-session">
          <span /> Demo session
        </span>
      </header>
      <div className="stocks-price-heading">
        <span className="stocks-eyebrow">{hovered === null ? 'LAST PRICE' : 'CHART PRICE'}</span>
        <strong>{formatPrice(prices[focus])}</strong>
        <span className={`stocks-day-change ${direction}`}>
          {periodChange >= 0 ? '↗' : '↘'} {formatPrice(Math.abs(quote.price - prices[0]))} (
          {formatChange(periodChange)})
          <span> {range === '1D' ? 'today' : range === '1W' ? 'this week' : 'this month'}</span>
        </span>
      </div>
      <div className="stocks-range-controls" role="group" aria-label="Chart range">
        {(Object.keys(chartRanges) as ChartRange[]).map((value) => (
          <button
            key={value}
            aria-pressed={range === value}
            onClick={() => {
              setRange(value);
              setHovered(null);
            }}
          >
            {value}
          </button>
        ))}
      </div>
      <div className={`stocks-chart ${direction}`}>
        <div className="stocks-chart-caption">
          <span>{chartRanges[range].title} price movement</span>
          <span>{chartRanges[range].title} · Demo</span>
        </div>
        <svg
          viewBox="0 0 600 190"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${quote.symbol} ${chartRanges[range].title} illustrative price chart`}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity=".2" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[30, 80, 130, 180].map((value) => (
            <line key={value} x1="12" x2="588" y1={value} y2={value} className="stocks-gridline" />
          ))}
          <polygon points={`12,180 ${points} 588,180`} fill={`url(#${gradient})`} />
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {hovered !== null && (
            <line x1={x(focus)} x2={x(focus)} y1="10" y2="180" className="stocks-crosshair" />
          )}
          <circle cx={x(focus)} cy={y(prices[focus])} r="4" fill="currentColor" />
          {prices.map((_, index) => (
            <rect
              key={index}
              x={x(index) - 42}
              y="0"
              width="84"
              height="190"
              fill="transparent"
              onMouseEnter={() => setHovered(index)}
            />
          ))}
        </svg>
        <div className="stocks-chart-times">
          {chartRanges[range].labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
      <label className="stocks-chart-inspection">
        Inspect chart{' '}
        <span aria-live="polite">
          Point {focus + 1} of {prices.length}: {formatPrice(prices[focus])}
        </span>
        <input
          aria-label="Chart price point"
          type="range"
          min="0"
          max={prices.length - 1}
          value={focus}
          aria-valuetext={`Point ${focus + 1}: ${formatPrice(prices[focus])}`}
          onChange={(event) => setHovered(Number(event.target.value))}
        />
      </label>
      {!compact && (
        <dl className="stocks-statistics">
          <div>
            <dt>Previous close</dt>
            <dd>{formatPrice(previousClose)}</dd>
          </div>
          <div>
            <dt>Period open</dt>
            <dd>{formatPrice(prices[0])}</dd>
          </div>
          <div>
            <dt>Period low</dt>
            <dd>{formatPrice(low)}</dd>
          </div>
          <div>
            <dt>Period high</dt>
            <dd>{formatPrice(high)}</dd>
          </div>
        </dl>
      )}
      <p className="stocks-detail-note">
        Illustrative prices and chart · Explore the layout with demo data.
      </p>
    </section>
  );
}

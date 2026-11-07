import { useId, useState } from 'react';
import { formatChange, formatPrice, type demoQuotes } from './demo-quotes';

type Quote = (typeof demoQuotes)[number];

// Convert the illustrative shape into a demo session ending at the displayed price.
function sessionPrices(quote: Quote) {
  const previousClose = quote.price / (1 + quote.change / 100);
  const first = quote.history[0];
  const last = quote.history[quote.history.length - 1];
  return quote.history.map(
    (value) => previousClose + ((value - first) / (last - first)) * (quote.price - previousClose),
  );
}

export default function StockDetail({ quote }: { quote: Quote }) {
  const gradient = useId();
  const [hovered, setHovered] = useState<number | null>(null);
  const prices = sessionPrices(quote);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const padding = (high - low) * 0.25 || 1;
  const y = (price: number) => 160 - ((price - low + padding) / (high - low + padding * 2)) * 140;
  const x = (index: number) => 12 + (index / (prices.length - 1)) * 576;
  const points = prices.map((price, index) => `${x(index)},${y(price)}`).join(' ');
  const previousClose = quote.price / (1 + quote.change / 100);
  const direction = quote.change >= 0 ? 'is-up' : 'is-down';
  const focus = hovered ?? prices.length - 1;

  return (
    <section className="stocks-detail" aria-label={`${quote.company} stock details`}>
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
          {quote.change >= 0 ? '↗' : '↘'} {formatPrice(Math.abs(quote.price - previousClose))} (
          {formatChange(quote.change)})<span> today</span>
        </span>
      </div>
      <div className={`stocks-chart ${direction}`}>
        <div className="stocks-chart-caption">
          <span>Today’s price movement</span>
          <span>1 day · Demo</span>
        </div>
        <svg
          viewBox="0 0 600 190"
          role="img"
          aria-label={`${quote.symbol} illustrative intraday price chart`}
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
          <span>9:30 AM</span>
          <span>12:00 PM</span>
          <span>4:00 PM</span>
        </div>
      </div>
      <dl className="stocks-statistics">
        <div>
          <dt>Previous close</dt>
          <dd>{formatPrice(previousClose)}</dd>
        </div>
        <div>
          <dt>Open</dt>
          <dd>{formatPrice(prices[0])}</dd>
        </div>
        <div>
          <dt>Day low</dt>
          <dd>{formatPrice(low)}</dd>
        </div>
        <div>
          <dt>Day high</dt>
          <dd>{formatPrice(high)}</dd>
        </div>
      </dl>
      <p className="stocks-detail-note">
        Illustrative prices and chart · Explore the layout with demo data.
      </p>
    </section>
  );
}

import StockPicker from './StockPicker';
import { formatChange, formatPrice, isStockSymbol, type StockSymbol } from './demo-quotes';
import type { useWatchlist } from './useWatchlist';

type Props = {
  watchlist: ReturnType<typeof useWatchlist>;
  inline?: boolean;
  manage?: boolean;
  onInspect?(): void;
};

function AddStock({ watchlist }: Pick<Props, 'watchlist'>) {
  return (
    <select
      aria-label="Add stock"
      value=""
      disabled={!watchlist.available.length}
      onChange={(event) => watchlist.add(event.target.value)}
    >
      <option value="">
        {watchlist.available.length ? '+ Add stock' : 'All demo stocks added'}
      </option>
      {watchlist.available.map((quote) => (
        <option key={quote.symbol} value={quote.symbol}>
          {quote.symbol} · {quote.company}
        </option>
      ))}
    </select>
  );
}

function Sparkline({ values }: { values: readonly number[] }) {
  const low = Math.min(...values),
    range = Math.max(...values) - low || 1;
  const points = values
    .map(
      (value, index) =>
        `${(index / (values.length - 1)) * 80},${24 - ((value - low) / range) * 20}`,
    )
    .join(' ');
  return (
    <svg className="stocks-sparkline" viewBox="0 0 80 28" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function StocksView({
  watchlist,
  inline = false,
  manage = false,
  onInspect,
}: Props) {
  if (inline)
    return (
      <div className="stocks-inline">
        {watchlist.active ? (
          <>
            <select
              aria-label="Stock"
              value={watchlist.active.symbol}
              onChange={(event) => watchlist.select(event.target.value as StockSymbol)}
            >
              {watchlist.quotes.map((quote) => (
                <option key={quote.symbol} value={quote.symbol}>
                  {quote.symbol}
                </option>
              ))}
            </select>
            {onInspect ? (
              <button
                className="stocks-inline-price"
                onClick={onInspect}
                aria-label={`Peek ${watchlist.active.symbol}`}
              >
                <strong>{formatPrice(watchlist.active.price)}</strong>
              </button>
            ) : (
              <strong>{formatPrice(watchlist.active.price)}</strong>
            )}
            <span className={`stocks-change ${watchlist.active.change >= 0 ? 'is-up' : 'is-down'}`}>
              {formatChange(watchlist.active.change)}
            </span>
          </>
        ) : (
          <AddStock watchlist={watchlist} />
        )}
        <span className="stocks-demo" title="Fictional example prices, not live quotes">
          Demo
        </span>
        {watchlist.storageError && (
          <span className="sr-only" role="status">
            {watchlist.storageError}
          </span>
        )}
      </div>
    );

  return (
    <div className="stocks-watchlist">
      <header className="stocks-toolbar">
        <span className="stocks-demo">Demo · USD · Not live</span>
        {manage ? <StockPicker watchlist={watchlist} /> : <AddStock watchlist={watchlist} />}
      </header>
      <ul aria-label="Stock watchlist">
        {watchlist.quotes.map((quote) => (
          <li
            key={quote.symbol}
            draggable={manage}
            onDragStart={(event) => event.dataTransfer.setData('text/plain', quote.symbol)}
            onDragOver={(event) => {
              if (manage) event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              const symbol = event.dataTransfer.getData('text/plain');
              if (manage && isStockSymbol(symbol)) watchlist.move(symbol, quote.symbol);
            }}
            onKeyDown={(event) => {
              if (!manage || !event.altKey || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;
              event.preventDefault();
              const index = watchlist.quotes.findIndex((item) => item.symbol === quote.symbol);
              const target = watchlist.quotes[index + (event.key === 'ArrowUp' ? -1 : 1)];
              if (target) {
                if (event.key === 'ArrowDown') watchlist.move(target.symbol, quote.symbol);
                else watchlist.move(quote.symbol, target.symbol);
              }
            }}
            className={quote.symbol === watchlist.active?.symbol ? 'is-selected' : ''}
          >
            <button
              className="stocks-quote"
              onClick={() => {
                watchlist.select(quote.symbol);
                onInspect?.();
              }}
              aria-label={`View ${quote.symbol}`}
              title={manage ? 'Drag to reorder · Alt + ↑ / ↓ to move' : undefined}
              aria-pressed={quote.symbol === watchlist.active?.symbol}
            >
              <span className="stocks-company">
                <strong>{quote.symbol}</strong>
                <small>{quote.company}</small>
              </span>
              <span className={quote.change >= 0 ? 'is-up' : 'is-down'}>
                <Sparkline values={quote.history} />
              </span>
              <span className="stocks-value">
                <strong>{formatPrice(quote.price)}</strong>
                <small className={`stocks-change ${quote.change >= 0 ? 'is-up' : 'is-down'}`}>
                  {formatChange(quote.change)}
                </small>
              </span>
            </button>
            <button
              className="stocks-remove"
              aria-label={`Remove ${quote.symbol}`}
              title={`Remove ${quote.symbol}`}
              onClick={() => watchlist.remove(quote.symbol)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      {!watchlist.quotes.length && (
        <p className="stocks-empty">Add a demo stock to start your watchlist.</p>
      )}
      {watchlist.storageError && (
        <p className="stocks-storage" role="status">
          {watchlist.storageError}
        </p>
      )}
    </div>
  );
}

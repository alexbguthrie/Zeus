import { useEffect, useRef, useState } from 'react';
import type { useWatchlist } from './useWatchlist';

export default function StockPicker({ watchlist }: { watchlist: ReturnType<typeof useWatchlist> }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);
  const matches = watchlist.available.filter((quote) =>
    `${quote.symbol} ${quote.company}`
      .toLowerCase()
      .includes(query.trim().replace(/^\$/, '').toLowerCase()),
  );
  return (
    <div
      className="stocks-picker"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setOpen(false);
          event.stopPropagation();
        }
      }}
    >
      <button className="stocks-action" aria-expanded={open} onClick={() => setOpen(!open)}>
        + Add stock
      </button>
      {open && (
        <div className="stocks-picker-menu" role="region" aria-label="Find a stock">
          <label>
            Find a demo stock
            <input
              ref={input}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Symbol or company"
            />
          </label>
          <div className="stocks-picker-results">
            {matches.map((quote) => (
              <button
                key={quote.symbol}
                aria-label={`Add ${quote.symbol} · ${quote.company}`}
                onClick={() => {
                  watchlist.add(quote.symbol);
                  setQuery('');
                  setOpen(false);
                }}
              >
                <strong>{quote.symbol}</strong>
                <span>{quote.company}</span>
                <span aria-hidden="true">+</span>
              </button>
            ))}
          </div>
          {!matches.length && (
            <p role="status">
              {!watchlist.available.length
                ? 'All demo stocks are in your watchlist.'
                : 'No demo symbol found. Try Apple or MSFT.'}
            </p>
          )}
          <button className="stocks-text-button" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

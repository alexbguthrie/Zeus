import type { useWatchlist } from './useWatchlist';
import type { StockSymbol } from './demo-quotes';

export default function PinSettings({ watchlist }: { watchlist: ReturnType<typeof useWatchlist> }) {
  return (
    <fieldset className="stocks-pin-settings">
      <legend>Pinned workspace</legend>
      <label>
        Show
        <select
          aria-label="Pinned content"
          value={watchlist.preferences.pinMode}
          onChange={(event) =>
            watchlist.configure({ pinMode: event.target.value as 'watchlist' | 'stock' })
          }
        >
          <option value="watchlist">My watchlist</option>
          <option value="stock">One stock</option>
        </select>
      </label>
      {watchlist.preferences.pinMode === 'stock' && (
        <label>
          Stock
          <select
            aria-label="Pinned stock"
            disabled={!watchlist.quotes.length}
            value={watchlist.preferences.pinnedSymbol}
            onChange={(event) =>
              watchlist.configure({ pinnedSymbol: event.target.value as StockSymbol })
            }
          >
            {watchlist.quotes.map((quote) => (
              <option key={quote.symbol}>{quote.symbol}</option>
            ))}
          </select>
        </label>
      )}
      <p>
        {watchlist.preferences.pinMode === 'stock'
          ? 'This ticker stays selected in the pinned view.'
          : 'Switch between your watched stocks in the slim bar.'}
      </p>
    </fieldset>
  );
}

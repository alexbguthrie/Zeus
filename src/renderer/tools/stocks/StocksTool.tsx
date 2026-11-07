import { useEffect, useState } from 'react';
import type { EmbeddedToolProps } from '../embedded';
import ToolSurface from '../ToolSurface';
import StocksView from './StocksView';
import StockDetail from './StockDetail';
import { openStocks } from './launcher';
import { useWatchlist } from './useWatchlist';
import './styles.css';

export default function StocksTool({
  presentation,
  storageScope,
  onSizeChange,
}: EmbeddedToolProps) {
  const watchlist = useWatchlist(storageScope);
  const [peek, setPeek] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    onSizeChange?.('stocks', peek ? 380 : undefined);
    return () => onSizeChange?.('stocks', undefined);
  }, [peek, onSizeChange]);
  const pinned =
    watchlist.quotes.find((quote) => quote.symbol === watchlist.preferences.pinnedSymbol) ??
    watchlist.active;
  const view =
    watchlist.preferences.pinMode === 'stock' && pinned
      ? { ...watchlist, active: pinned, quotes: [pinned], select: () => {} }
      : watchlist;
  return (
    <ToolSurface presentation={presentation}>
      {peek && view.active ? (
        <div className="stocks-peek">
          <div className="stocks-peek-actions">
            <button className="stocks-text-button" onClick={() => setPeek(false)}>
              ← Watchlist
            </button>
            <button
              className="stocks-action"
              onClick={() => {
                void openStocks(view.active?.symbol).catch(() =>
                  setError('Could not open Stocks. Please try again.'),
                );
              }}
            >
              Open Stocks ↗
            </button>
          </div>
          <StockDetail key={view.active.symbol} quote={view.active} compact />
        </div>
      ) : (
        <div className="stocks-pinned-view">
          <StocksView
            watchlist={view}
            inline={presentation === 'inline'}
            onInspect={() => setPeek(true)}
          />
          <button
            className="stocks-peek-button"
            disabled={!view.active}
            onClick={() => setPeek(true)}
            aria-label="Quick peek"
            title="Quick chart peek"
          >
            ↗
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="stocks-storage">
          {error}
        </p>
      )}
    </ToolSurface>
  );
}

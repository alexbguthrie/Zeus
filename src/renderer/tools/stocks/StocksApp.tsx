import { usePreferences } from '../../settings/usePreferences';
import StocksView from './StocksView';
import StockDetail from './StockDetail';
import PinSettings from './PinSettings';
import { useQuoteStatus } from './useQuoteStatus';
import { useWatchlist } from './useWatchlist';

export default function StocksApp() {
  usePreferences();
  const watchlist = useWatchlist();
  const data = useQuoteStatus();
  return (
    <main className="stocks-app">
      <header className="stocks-app-header">
        <div>
          <span className="stocks-eyebrow">
            ZEUS <span>/</span> MARKETS
          </span>
          <h1>Stocks</h1>
          <p>A little perspective on your watchlist.</p>
        </div>
        <label className="stocks-state-picker">
          Demo state
          <select
            aria-label="Demo data state"
            value={data.scenario}
            onChange={(event) => data.setScenario(event.target.value as typeof data.scenario)}
          >
            {['ready', 'loading', 'offline', 'stale', 'unavailable'].map((state) => (
              <option key={state}>{state}</option>
            ))}
          </select>
        </label>
      </header>
      <div className="stocks-dashboard">
        <aside className="stocks-sidebar" aria-label="Watchlist">
          <div className="stocks-sidebar-title">
            <h2>Watchlist</h2>
            <span>{watchlist.quotes.length} symbols</span>
          </div>
          <StocksView watchlist={watchlist} manage />
          <PinSettings watchlist={watchlist} />
        </aside>
        {data.state === 'loading' || data.state === 'unavailable' ? (
          <section
            className="stocks-detail stocks-detail-empty"
            aria-busy={data.state === 'loading'}
          >
            <h2>{data.state === 'loading' ? 'Loading quotes…' : 'Quote unavailable'}</h2>
            <p role="status">{data.message}</p>
            <button className="stocks-action" onClick={data.retry}>
              {data.state === 'loading' ? 'Load demo snapshot' : 'Try again'}
            </button>
          </section>
        ) : watchlist.active ? (
          <StockDetail key={watchlist.active.symbol} quote={watchlist.active} />
        ) : (
          <section className="stocks-detail stocks-detail-empty">
            <span aria-hidden="true">↗</span>
            <h2>Build your watchlist</h2>
            <p>Add a stock from the menu to explore its price and daily movement.</p>
          </section>
        )}
      </div>
      <footer>
        <span role="status">{data.message}</span>
        <span>USD · Fictional prices</span>
      </footer>
    </main>
  );
}

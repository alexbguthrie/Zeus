import '../../styles/base.css';
import { createRoot } from 'react-dom/client';
import { initializeAppearance, usePreferences } from '../../settings/usePreferences';
import StocksView from './StocksView';
import StockDetail from './StockDetail';
import { useWatchlist } from './useWatchlist';
import './styles.css';

function StocksApp() {
  usePreferences();
  const watchlist = useWatchlist();
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
        <span className="stocks-demo-badge">Demo workspace</span>
      </header>
      <div className="stocks-dashboard">
        <aside className="stocks-sidebar" aria-label="Watchlist">
          <div className="stocks-sidebar-title">
            <h2>Watchlist</h2>
            <span>{watchlist.quotes.length} symbols</span>
          </div>
          <StocksView watchlist={watchlist} />
        </aside>
        {watchlist.active ? (
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
        <span>USD · Fictional example prices</span>
        <span>No live market connection</span>
      </footer>
    </main>
  );
}
initializeAppearance();
if (new URLSearchParams(location.search).get('native') === '1')
  document.documentElement.dataset.native = 'true';
createRoot(document.getElementById('root')!).render(<StocksApp />);

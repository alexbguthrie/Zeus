import '../../styles/base.css';
import { createRoot } from 'react-dom/client';
import { initializeAppearance, usePreferences } from '../../settings/usePreferences';
import StocksView from './StocksView';
import { useWatchlist } from './useWatchlist';
import './styles.css';

function StocksApp() {
  usePreferences();
  const watchlist = useWatchlist();
  return (
    <main className="stocks-app">
      <header className="stocks-app-header">
        <div>
          <span className="stocks-eyebrow">ZEUS / EXAMPLE APP</span>
          <h1>Stocks</h1>
          <p>Your watchlist, at a glance.</p>
        </div>
        <span className="stocks-demo">Demo data</span>
      </header>
      <StocksView watchlist={watchlist} />
      <footer>Fictional example prices. No market data connection.</footer>
    </main>
  );
}
initializeAppearance();
if (new URLSearchParams(location.search).get('native') === '1')
  document.documentElement.dataset.native = 'true';
createRoot(document.getElementById('root')!).render(<StocksApp />);

import { applications } from '../../applications/registry';
import type { SearchResult } from '../../launcher/search';
import { demoQuotes, formatChange, formatPrice, type StockSymbol } from './demo-quotes';
import { selectStockForOpening } from './storage';

export function stockSearchResults(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const search = query.trim().replace(/^\$/, '').toLowerCase();
  return demoQuotes
    .filter((quote) => `${quote.symbol} ${quote.company}`.toLowerCase().includes(search))
    .map((quote) => ({
      id: `stock-${quote.symbol}`,
      title: `${quote.symbol} · ${quote.company}`,
      description: `${formatPrice(quote.price)} · ${formatChange(quote.change)} · Demo quote`,
      application: applications.find((app) => app.id === 'stocks')!,
      prepareOpen: () => selectStockForOpening(quote.symbol),
    }));
}
export async function openStocks(symbol?: StockSymbol) {
  if (symbol) selectStockForOpening(symbol);
  if (window.zeusLauncher) await window.zeusLauncher.openApplication('stocks');
  else {
    const popup = window.open(
      new URL('/tools/stocks/index.html', location.href).href,
      'zeus-app-stocks',
      'popup,width=1000,height=720',
    );
    if (!popup) throw new Error('Allow popups to open Stocks, then try again.');
    popup.opener = null;
    popup.focus();
  }
}

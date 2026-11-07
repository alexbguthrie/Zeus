import { defaultWatchlist, isStockSymbol, type StockSymbol } from './demo-quotes';

export const WATCHLIST_KEY = 'zeus.example.stocks.watchlist.v1';
export const STOCKS_EVENT = 'zeus:example-stocks';
export type StockPreferences = {
  selected: StockSymbol;
  pinMode: 'watchlist' | 'stock';
  pinnedSymbol: StockSymbol;
};
export const defaultPreferences: StockPreferences = {
  selected: 'AAPL',
  pinMode: 'watchlist',
  pinnedSymbol: 'AAPL',
};
export function storageKeys(scope?: string) {
  const list = scope ? `${scope}.stocks` : WATCHLIST_KEY;
  return { list, preferences: `${list}.preferences` };
}
export function readSymbols(key: string): StockSymbol[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (Array.isArray(stored)) return [...new Set(stored.filter(isStockSymbol))];
  } catch {
    /* Fall back to demo defaults. */
  }
  return [...defaultWatchlist];
}
export function readPreferences(key: string): StockPreferences {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (value && typeof value === 'object')
      return {
        selected: isStockSymbol(value.selected) ? value.selected : 'AAPL',
        pinMode: value.pinMode === 'stock' ? 'stock' : 'watchlist',
        pinnedSymbol: isStockSymbol(value.pinnedSymbol) ? value.pinnedSymbol : 'AAPL',
      };
  } catch {
    /* Fall back to demo defaults. */
  }
  return { ...defaultPreferences };
}
export function notifyStocks(key: string) {
  window.dispatchEvent(new CustomEvent(STOCKS_EVENT, { detail: key }));
}
// A launcher entry can select a ticker without taking ownership of app state.
export function selectStockForOpening(symbol: StockSymbol) {
  const keys = storageKeys();
  const symbols = readSymbols(keys.list);
  if (!symbols.includes(symbol))
    localStorage.setItem(keys.list, JSON.stringify([...symbols, symbol]));
  localStorage.setItem(
    keys.preferences,
    JSON.stringify({ ...readPreferences(keys.preferences), selected: symbol }),
  );
  notifyStocks(keys.list);
}

import { useEffect, useState } from 'react';
import { demoQuotes, isStockSymbol, type StockSymbol } from './demo-quotes';
import {
  notifyStocks,
  readPreferences,
  readSymbols,
  STOCKS_EVENT,
  storageKeys,
  type StockPreferences,
} from './storage';

export function useWatchlist(storageScope?: string) {
  const keys = storageKeys(storageScope);
  const [symbols, setSymbols] = useState(() => readSymbols(keys.list));
  const [preferences, setPreferences] = useState(() => readPreferences(keys.preferences));
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    const refresh = () => {
      setSymbols(readSymbols(keys.list));
      setPreferences(readPreferences(keys.preferences));
    };
    function onStorage(event: StorageEvent) {
      if (event.key === keys.list || event.key === keys.preferences || event.key === null)
        refresh();
    }
    function onLocal(event: Event) {
      if ((event as CustomEvent<string>).detail === keys.list) refresh();
    }
    refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener(STOCKS_EVENT, onLocal);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(STOCKS_EVENT, onLocal);
      window.removeEventListener('focus', refresh);
    };
  }, [keys.list, keys.preferences]);

  function save(next: StockSymbol[], prefs = preferences) {
    setSymbols(next);
    setPreferences(prefs);
    try {
      localStorage.setItem(keys.list, JSON.stringify(next));
      localStorage.setItem(keys.preferences, JSON.stringify(prefs));
      notifyStocks(keys.list);
      setStorageError('');
    } catch {
      setStorageError('Changes are available for this session only.');
    }
  }
  function configure(next: Partial<StockPreferences>) {
    save(symbols, { ...preferences, ...next });
  }
  function select(symbol: StockSymbol) {
    configure({ selected: symbol });
  }
  function add(value: string) {
    if (!isStockSymbol(value) || symbols.includes(value)) return;
    save([...symbols, value], { ...preferences, selected: value });
  }
  function remove(symbol: StockSymbol) {
    const next = symbols.filter((value) => value !== symbol);
    save(next, {
      ...preferences,
      selected: preferences.selected === symbol ? (next[0] ?? 'AAPL') : preferences.selected,
      pinnedSymbol:
        preferences.pinnedSymbol === symbol ? (next[0] ?? 'AAPL') : preferences.pinnedSymbol,
    });
  }
  function move(symbol: StockSymbol, target: StockSymbol) {
    if (symbol === target || !symbols.includes(symbol) || !symbols.includes(target)) return;
    const next = symbols.filter((value) => value !== symbol);
    next.splice(next.indexOf(target), 0, symbol);
    save(next);
  }
  const quotes = symbols.map((symbol) => demoQuotes.find((quote) => quote.symbol === symbol)!);
  const active = quotes.find((quote) => quote.symbol === preferences.selected) ?? quotes[0];
  return {
    quotes,
    active,
    select,
    add,
    remove,
    move,
    preferences,
    configure,
    storageError,
    available: demoQuotes.filter((quote) => !symbols.includes(quote.symbol)),
  };
}

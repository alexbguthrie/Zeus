import { useEffect, useState } from 'react';
import { defaultWatchlist, demoQuotes, isStockSymbol, type StockSymbol } from './demo-quotes';

const KEY = 'zeus.example.stocks.watchlist.v1';
const EVENT = 'zeus:example-stocks';
function readWatchlist(key: string): StockSymbol[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (Array.isArray(stored)) return [...new Set(stored.filter(isStockSymbol))];
  } catch {
    /* Use the example defaults when storage is unavailable or invalid. */
  }
  return [...defaultWatchlist];
}

export function useWatchlist(storageScope?: string) {
  const key = storageScope ? `${storageScope}.stocks` : KEY;
  const [symbols, setSymbols] = useState(() => readWatchlist(key));
  const [selected, setSelected] = useState<StockSymbol | null>(null);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    const refresh = () => setSymbols(readWatchlist(key));
    function onStorage(event: StorageEvent) {
      if (event.key === key || event.key === null) refresh();
    }
    function onLocal(event: Event) {
      if ((event as CustomEvent<string>).detail === key) refresh();
    }
    window.addEventListener('storage', onStorage);
    window.addEventListener(EVENT, onLocal);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(EVENT, onLocal);
    };
  }, [key]);

  function save(next: StockSymbol[]) {
    setSymbols(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
      setStorageError('');
    } catch {
      setStorageError('Changes are available for this session only.');
    }
  }
  function add(value: string) {
    if (!isStockSymbol(value) || symbols.includes(value)) return;
    save([...symbols, value]);
    setSelected(value);
  }
  function remove(symbol: StockSymbol) {
    save(symbols.filter((value) => value !== symbol));
  }
  const quotes = symbols.map((symbol) => demoQuotes.find((quote) => quote.symbol === symbol)!);
  const active = quotes.find((quote) => quote.symbol === selected) ?? quotes[0];
  return {
    quotes,
    active,
    select: setSelected,
    add,
    remove,
    storageError,
    available: demoQuotes.filter((quote) => !symbols.includes(quote.symbol)),
  };
}

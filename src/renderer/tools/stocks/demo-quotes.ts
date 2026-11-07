// Fictional example prices. This module does not request market data.
export const demoQuotes = [
  {
    symbol: 'AAPL',
    company: 'Apple',
    price: 184.5,
    change: 1.24,
    history: [42, 40, 43, 41, 47, 45, 51, 55],
  },
  {
    symbol: 'MSFT',
    company: 'Microsoft',
    price: 412.8,
    change: 0.82,
    history: [30, 34, 32, 39, 37, 41, 43, 46],
  },
  {
    symbol: 'NVDA',
    company: 'NVIDIA',
    price: 128.65,
    change: -1.36,
    history: [60, 57, 59, 52, 54, 48, 50, 44],
  },
  {
    symbol: 'GOOGL',
    company: 'Alphabet',
    price: 168.2,
    change: 0.45,
    history: [34, 36, 34, 35, 40, 38, 41, 43],
  },
  {
    symbol: 'AMZN',
    company: 'Amazon',
    price: 186.4,
    change: -0.67,
    history: [48, 51, 47, 49, 45, 46, 43, 41],
  },
  {
    symbol: 'TSLA',
    company: 'Tesla',
    price: 224.1,
    change: 2.15,
    history: [22, 30, 27, 36, 32, 44, 41, 53],
  },
] as const;
export type StockSymbol = (typeof demoQuotes)[number]['symbol'];
export const defaultWatchlist: StockSymbol[] = ['AAPL', 'MSFT', 'NVDA'];
export function isStockSymbol(value: unknown): value is StockSymbol {
  return demoQuotes.some((quote) => quote.symbol === value);
}
export const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
export const formatChange = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

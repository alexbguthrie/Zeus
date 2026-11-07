import type { demoQuotes } from './demo-quotes';
export type StockQuote = (typeof demoQuotes)[number];
export const chartRanges = {
  '1D': { title: '1 day', labels: ['9:30 AM', '12:00 PM', '4:00 PM'], multiplier: 1 },
  '1W': { title: '1 week', labels: ['Day 1', 'Day 3', 'Day 5'], multiplier: 3 },
  '1M': { title: '1 month', labels: ['Week 1', 'Week 2', 'Week 4'], multiplier: 7 },
} as const;
export type ChartRange = keyof typeof chartRanges;

// All ranges are illustrative fixtures, ending at the same fictional current quote.
export function chartPrices(quote: StockQuote, range: ChartRange) {
  const previousClose = quote.price / (1 + quote.change / 100);
  const first = quote.history[0];
  const last = quote.history[quote.history.length - 1];
  const count = quote.history.length - 1;
  const amount = (quote.price - previousClose) * chartRanges[range].multiplier;
  return quote.history.map((value, index) => {
    const progress = (value - first) / (last - first);
    const variation =
      range === '1D'
        ? 0
        : Math.sin((index / count) * Math.PI * (range === '1W' ? 2 : 3)) * amount * 0.18;
    return quote.price - amount + progress * amount + variation;
  });
}

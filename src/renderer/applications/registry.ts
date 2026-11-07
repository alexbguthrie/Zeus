// Launcher-facing sample apps. The native process has its own fixed allowlist.
export const applications = [
  {
    id: 'stocks',
    title: 'Stocks',
    description: 'An example watchlist with demo quotes',
    keywords: 'ticker shares market watchlist demo',
    page: 'tools/stocks/index.html',
  },
  {
    id: 'mock-ai',
    title: 'Zeus AI',
    description: 'A sample AI chat app',
    keywords: 'chatgpt mock ai assistant chat demo',
    page: 'applications/mock-ai/index.html',
  },
] as const;

export type SampleApplication = (typeof applications)[number];

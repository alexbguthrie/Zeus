# Stocks example

A removable demo showing one app in three presentations: a standalone watchlist,
a compact pinned list, and an inline ticker for the Slim bar. Prices and charts
are fictional fixtures in `demo-quotes.ts`; there is no API or market connection.

`StocksView` renders the content, `useWatchlist` owns persistence, and `StocksTool`
adapts the view to the generic pinned presentation contract. The app window and
pinned view share a watchlist through localStorage. Preview scopes use separate
storage. Selecting a ticker is local to each view.

## Removing the example

Delete this folder and `tests/renderer/stocks.test.tsx`, then remove the Stocks
entries/imports from:

- `src/renderer/applications/registry.ts` (launcher app)
- `src/renderer/tools/registry.ts`, `embedded.ts`, and `ToolIcon.tsx` (pinned tool)
- `src/main/app-windows.ts` (window descriptor)
- `src/main/ipc.ts` (app ID and read-only preference sender)
- `src/main/preferences.ts` (window background updates)
- `vite.renderer.config.ts` (HTML build entry)
- `tests/main/ipc.test.ts` (Stocks launch-failure case)

No other tool depends on Stocks. Its optional saved data is isolated under
`zeus.example.stocks.watchlist.v1`. The shared toolbar sizing responds to the
registered tool count and can stay in place after removal.

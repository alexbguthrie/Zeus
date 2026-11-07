# Stocks example

A removable demo showing a standalone dashboard, a compact pinned list, and an
inline ticker. All prices and chart ranges are fictional fixtures. There is no
market API, credential, network request, or new dependency.

## Responsibilities

- `StocksApp` composes the dashboard. `main.tsx` only boots the standalone page.
- `StocksView` renders the shared list and inline ticker. `StockPicker` provides
  search, while list rows support drag sorting and Alt + Up/Down keyboard sorting.
- `StockDetail` owns range selection and pointer/keyboard chart inspection.
  `chart-data.ts` generates distinct illustrative day, week, and month series.
- `useWatchlist` and `storage.ts` own watchlist order, selected ticker, and pin
  preferences. They synchronize mounted views and other app windows. Existing
  saved watchlists are retained; preview scopes keep their own storage.
- `PinSettings` selects a full watchlist or a fixed ticker for the pinned tool.
- `StocksTool` adapts to the generic pinned presentation and size contracts. A
  ticker or the peek arrow opens a small chart; Open Stocks opens the full app.
- `launcher.ts` supplies stock search results and selects the requested ticker
  before opening Stocks, including when its window is already open.
- `useQuoteStatus` isolates the demo data adapter. The Demo state menu exercises
  loading, unavailable, stale, and offline states. Browser connectivity also
  triggers offline mode. Retry loads a demo snapshot after a short delay. The
  displayed timestamp identifies when the demo snapshot was loaded, not a trade.

Watchlist data uses `zeus.example.stocks.watchlist.v1`; preferences use the same
key with `.preferences` appended. No other tool's state is touched.

## Removing the example

Delete this folder and `tests/renderer/stocks.test.tsx`, then remove the Stocks
entries/imports from:

- `src/renderer/applications/registry.ts` (launcher app)
- `src/renderer/applications/search-entries.ts` (app-owned search provider)
- `src/renderer/tools/registry.ts`, `embedded.ts`, and `ToolIcon.tsx` (pinned tool)
- `src/main/app-windows.ts` (window descriptor)
- `src/main/ipc.ts` (app ID and read-only preference sender)
- `src/main/preferences.ts` (window background updates)
- `vite.renderer.config.ts` (HTML build entry)
- `tests/main/ipc.test.ts` (Stocks launch-failure case)

The optional application search provider and embedded size contracts can remain.
No other tool depends on Stocks. Toolbar sizing follows the registered tool count.

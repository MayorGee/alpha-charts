# Alpha Charts

A single-page crypto charting UI built with React and D3. It loads historical candlesticks from Binance, streams live kline updates over WebSocket, and overlays indicators (SMA, EMA, RSI, Bollinger Bands, MACD) with drawing tools and a trading-style layout.

## Features

- **Candlestick / line / area** chart styles, grid toggle, and volume pane
- **Live data**: REST for history, WebSocket for the current kline
- **Indicators**: configurable from the toolbar; main-chart overlays vs separate panes (RSI, MACD)
- **Drawings**: global tool state via React context; interact on the main chart
- **Layout**: collapsible watchlist and order panel; responsive chart sizing

## Tech stack

| Area        | Choice                          |
|------------|----------------------------------|
| UI         | React 19, TypeScript             |
| Build      | Vite 8                           |
| Charts     | D3 7                             |
| Styling    | Sass                             |
| Icons      | Lucide React                     |
| Lint       | ESLint 9                         |

## Prerequisites

- **Node.js** 20+ (recommended; matches modern Vite/React tooling)
- **npm** (or use your preferred package manager consistently)

## Getting started

```bash
git clone <repository-url>
cd alpha-charts
npm install
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`).

### Scripts

| Command            | Description                                      |
|-------------------|--------------------------------------------------|
| `npm run dev`     | Start Vite dev server with HMR                   |
| `npm run build`   | Type-check (`tsc -b`) then production build      |
| `npm run preview` | Serve the production build locally               |
| `npm run lint`    | Run ESLint on the project                        |

## Environment variables

Optional **Vite** variables (prefix `VITE_`, read at build time). Create a `.env` or `.env.local` in the project root if needed.

| Variable                 | Purpose                                                                 |
|--------------------------|-------------------------------------------------------------------------|
| `VITE_BINANCE_REST_URL`  | Base URL for REST klines. If unset, requests use `/api/v3/klines` on the dev origin (see proxy below). |
| `VITE_BINANCE_WS_URL`    | WebSocket base URL. Defaults to `wss://stream.binance.com:9443/ws`.     |

Implementation: `src/lib/Environment.ts`.

### Dev server proxy

In development, **without** `VITE_BINANCE_REST_URL`, kline fetches go to `http://localhost:5173/api/v3/klines`, which Vite proxies to `https://api.binance.com` (see `vite.config.ts`). That avoids browser CORS issues for the REST call.

WebSocket connections use the configured `wss://` URL directly from the browser.

## Project structure

```
src/
  App.tsx                 # Screen composition, layout metrics, indicator wiring
  main.tsx                # React root; global styles; DrawingProvider
  types/                  # Shared domain types (candles, symbols, indicators)
  contexts/               # DrawingContext (tools + drawings)
  hooks/                  # useBinanceData (REST + WS merge)
  lib/
    api/binanceRest.ts    # fetchKlines, interval/symbol mapping
    websocket/binanceWs.ts# Singleton WS + subscribers
    indicators/           # Pure indicator math (sma, ema, rsi, …)
  components/
    chart/                # CandlestickChart, VolumeChart, IndicatorPane, MACDPane
    layout/               # Header, Toolbar, Watchlist, OrderPanel, …
  scss/                   # Global styles, variables, layout
```

Path alias: `@/` → `src/` (see `vite.config.ts`).

## Architecture notes

- **No router**: one `App` view; navigation is limited to symbol/timeframe and dialogs.
- **Data flow**: `useBinanceData` loads candles, then subscribes to live updates; `App` derives `indicatorResults` with `useMemo` and passes slices to chart components.
- **Charts**: D3 runs inside React `useEffect`; panes receive `width`/`height` computed from window size and collapsed side panels.
- **Watchlist / header stats**: sample symbols and 24h stats are mocked in `App.tsx`; Binance powers the chart series for the selected symbol.

## Binance and compliance

This app uses **public** Binance market data endpoints only. It does not implement trading or authenticated API keys. Respect [Binance API terms](https://www.binance.com/en/terms) and rate limits if you extend the integration.

## Contributing

1. Run `npm run lint` and `npm run build` before opening a PR.
2. Prefer small, focused changes; match existing patterns in components and Sass.
3. If you add User-facing behavior, document new env vars or proxy changes here.

## License

This repository’s license is set by the project owner; add or update a `LICENSE` file if distributing.

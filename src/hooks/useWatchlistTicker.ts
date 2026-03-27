import { useEffect } from 'react';
import { Environment } from '../lib/Environment';

interface MiniTickerMessage {
    s: string;
    c: string;
    o: string;
    h: string;
    l: string;
    q: string;
}

function toDisplaySymbol(binanceSymbol: string) {
    if (binanceSymbol.endsWith('USDT')) return `${binanceSymbol.slice(0, -4)}/USDT`;
    return binanceSymbol;
}

export function useWatchlistTicker(
    watchlistSymbols: string[],
    onTicker: (symbol: string, ticker: {
        price: number;
        change24h: number;
        high24h: number;
        low24h: number;
        volume24h: number;
    }) => void,
) {
    useEffect(() => {
        if (watchlistSymbols.length === 0) return;

        const ws = new WebSocket(`${Environment.binanceWsBaseUrl}/!miniTicker@arr`);
        const tracked = new Set(watchlistSymbols.map((s) => s.replace('/', '').toUpperCase()));

        ws.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data) as MiniTickerMessage[];
                payload.forEach((t) => {
                    if (!tracked.has(t.s)) return;
                    const close = Number.parseFloat(t.c);
                    const open = Number.parseFloat(t.o);
                    const change24h =
                        Number.isFinite(close) && Number.isFinite(open) && open !== 0
                            ? ((close - open) / open) * 100
                            : 0;
                    onTicker(toDisplaySymbol(t.s), {
                        price: Number.isFinite(close) ? close : 0,
                        change24h,
                        high24h: Number.parseFloat(t.h),
                        low24h: Number.parseFloat(t.l),
                        volume24h: Number.parseFloat(t.q),
                    });
                });
            } catch {
                // Ignore malformed frames to keep stream alive.
            }
        };

        return () => {
            ws.close();
        };
    }, [watchlistSymbols, onTicker]);
}

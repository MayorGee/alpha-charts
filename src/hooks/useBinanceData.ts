import { useCallback, useState, useEffect } from 'react';
import { type Candle } from '../types';
import { fetchKlines } from '../lib/api/binanceRest';
import { binanceWs } from '../lib/websocket/binanceWs';

const MAX_HISTORY_CANDLES = 5000;

export function useBinanceData(symbol: string, timeframe: string, limit = 500) {
    const [candles, setCandles] = useState<Candle[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLive, setIsLive] = useState(false);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);

    // Fetch historical data
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);

        fetchKlines(symbol, timeframe, limit)
            .then((data) => {
                if (mounted) {
                    setCandles(data.slice(-MAX_HISTORY_CANDLES));
                    setLoading(false);
                    setHasMoreHistory(data.length >= limit && data.length < MAX_HISTORY_CANDLES);
                }
            })
            .catch((err) => {
                if (mounted) {
                    setError(err.message);
                    setLoading(false);
                }
            });

        return () => {
            mounted = false;
        };
    }, [symbol, timeframe, limit]);

    const loadOlderHistory = useCallback(async () => {
        if (loading || loadingMoreHistory || !hasMoreHistory || candles.length === 0) return;
        if (candles.length >= MAX_HISTORY_CANDLES) {
            setHasMoreHistory(false);
            return;
        }
        setLoadingMoreHistory(true);
        try {
            const oldest = candles[0].time.getTime();
            const older = await fetchKlines(symbol, timeframe, limit, oldest - 1);
            if (older.length === 0) {
                setHasMoreHistory(false);
                return;
            }

            setCandles((prev) => {
                const existing = new Set(prev.map((c) => c.time.getTime()));
                const uniqueOlder = older.filter((c) => !existing.has(c.time.getTime()));
                const merged = [...uniqueOlder, ...prev];
                return merged.slice(-MAX_HISTORY_CANDLES);
            });

            if (older.length < limit || candles.length >= MAX_HISTORY_CANDLES) {
                setHasMoreHistory(false);
            }
        } catch {
            // Keep existing candles; user can retry by panning to the edge again.
        } finally {
            setLoadingMoreHistory(false);
        }
    }, [candles, hasMoreHistory, limit, loading, loadingMoreHistory, symbol, timeframe]);

    // WebSocket live updates
    useEffect(() => {
        if (candles.length === 0) return;

        const handleLiveCandle = (newCandle: Candle) => {
            setCandles((prev) => {
                if (prev.length === 0) return [newCandle];
                const last = prev[prev.length - 1];
                if (last.time.getTime() === newCandle.time.getTime()) {
                    // Update last candle
                    return [...prev.slice(0, -1), newCandle];
                } else {
                    // New candle – append (keep history for left backfill scroll)
                    const updated = [...prev, newCandle];
                    return updated.length > MAX_HISTORY_CANDLES
                        ? updated.slice(updated.length - MAX_HISTORY_CANDLES)
                        : updated;
                }
            });
        };

        binanceWs.subscribe(handleLiveCandle);
        binanceWs.connect(symbol, timeframe);
        setIsLive(true);

        return () => {
            binanceWs.unsubscribe(handleLiveCandle);
            setIsLive(false);
        };
    }, [symbol, timeframe, limit]);

    return { candles, loading, loadingMoreHistory, hasMoreHistory, loadOlderHistory, error, isLive };
}
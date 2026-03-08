import { useState, useEffect } from 'react';
import { type Candle } from '../types';
import { fetchKlines } from '../lib/api/binanceRest';
import { binanceWs } from '../lib/websocket/binanceWs';

export function useBinanceData(symbol: string, timeframe: string, limit = 500) {
    const [candles, setCandles] = useState<Candle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLive, setIsLive] = useState(false);

    // Fetch historical data
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);

        fetchKlines(symbol, timeframe, limit)
            .then((data) => {
                if (mounted) {
                    setCandles(data);
                    setLoading(false);
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
                    // New candle – append, keep limit
                    const updated = [...prev, newCandle];
                    return updated.length > limit ? updated.slice(updated.length - limit) : updated;
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

    return { candles, loading, error, isLive };
}
import { useMemo } from 'react';
import { calculateSMA } from '../lib/indicators/sma';
import { calculateEMA } from '../lib/indicators/ema';
import { calculateRSI } from '../lib/indicators/rsi';
import { calculateBollingerBands } from '../lib/indicators/bollinger';
import { calculateMACD } from '../lib/indicators/macd';
import type { Candle, Indicator, IndicatorResult } from '../types';

export function useIndicatorResults(candles: Candle[], activeIndicators: Indicator[]) {
    const indicatorResults = useMemo(() => {
        if (!candles.length) return [];
        
        return activeIndicators
            .map((ind) => {
                switch (ind.id) {
                    case 'sma':
                        return {
                            id: ind.id,
                            data: calculateSMA(candles, 20),
                            color: ind.color,
                            pane: 'main' as const,
                        };
                    case 'ema':
                        return {
                            id: ind.id,
                            data: calculateEMA(candles, 12),
                            color: ind.color,
                            pane: 'main' as const,
                        };
                    case 'rsi':
                        return {
                            id: ind.id,
                            data: calculateRSI(candles, 14),
                            color: ind.color,
                            pane: 'separate' as const,
                        };
                    case 'bollinger': {
                        const bands = calculateBollingerBands(candles, 20, 2);
                        return {
                            id: ind.id,
                            data: bands,
                            color: ind.color,
                            pane: 'main' as const,
                        };
                    }
                    case 'macd':
                        return {
                            id: ind.id,
                            data: calculateMACD(candles, 12, 26, 9),
                            color: ind.color,
                            pane: 'separate' as const,
                        };
                    default:
                        return null;
                }
            })
            .filter(Boolean) as IndicatorResult[];
    }, [candles, activeIndicators]);

    const separateIndicators = useMemo(
        () => indicatorResults.filter((ind) => ind.pane === 'separate'),
        [indicatorResults],
    );

    return { indicatorResults, separateIndicators };
}
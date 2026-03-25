import { useMemo } from 'react';
import { calculateSMA } from '../lib/indicators/sma';
import { calculateEMA } from '../lib/indicators/ema';
import { calculateRSI } from '../lib/indicators/rsi';
import { calculateBollingerBands } from '../lib/indicators/bollinger';
import { calculateMACD } from '../lib/indicators/macd';
import {
    type Candle,
    type Indicator,
    type IndicatorResult,
    isMainChartIndicator,
    isSeparateChartIndicator,
} from '../types';

export function useIndicatorResults(candles: Candle[], activeIndicators: Indicator[]) {
    const indicatorResults = useMemo((): IndicatorResult[] => {
        if (!candles.length) return [];

        return activeIndicators.flatMap((ind): IndicatorResult[] => {
            switch (ind.id) {
                case 'sma':
                    return [
                        {
                            id: 'sma',
                            pane: 'main',
                            color: ind.color,
                            data: calculateSMA(candles, 20),
                        },
                    ];
                case 'ema':
                    return [
                        {
                            id: 'ema',
                            pane: 'main',
                            color: ind.color,
                            data: calculateEMA(candles, 12),
                        },
                    ];
                case 'rsi':
                    return [
                        {
                            id: 'rsi',
                            pane: 'separate',
                            color: ind.color,
                            data: calculateRSI(candles, 14),
                        },
                    ];
                case 'bollinger': {
                    const bands = calculateBollingerBands(candles, 20, 2);
                    return [
                        {
                            id: 'bollinger',
                            pane: 'main',
                            color: ind.color,
                            data: bands,
                        },
                    ];
                }
                case 'macd':
                    return [
                        {
                            id: 'macd',
                            pane: 'separate',
                            color: ind.color,
                            data: calculateMACD(candles, 12, 26, 9),
                        },
                    ];
                default: {
                    const _exhaustive: never = ind.id;
                    return _exhaustive;
                }
            }
        });
    }, [candles, activeIndicators]);

    const mainIndicators = useMemo(
        () => indicatorResults.filter(isMainChartIndicator),
        [indicatorResults],
    );

    const separateIndicators = useMemo(
        () => indicatorResults.filter(isSeparateChartIndicator),
        [indicatorResults],
    );

    return { mainIndicators, separateIndicators };
}

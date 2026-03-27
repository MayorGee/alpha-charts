import { useMemo } from 'react';
import { calculateSMA } from '../lib/indicators/sma';
import { calculateEMA } from '../lib/indicators/ema';
import { calculateRSI } from '../lib/indicators/rsi';
import { calculateBollingerBands } from '../lib/indicators/bollinger';
import { calculateMACD } from '../lib/indicators/macd';
import {
    type Candle,
    type Indicator,
    type IndicatorPeriodsConfig,
    type IndicatorResult,
    isMainChartIndicator,
    isSeparateChartIndicator,
} from '../types';

export function useIndicatorResults(
    candles: Candle[],
    activeIndicators: Indicator[],
    periods: IndicatorPeriodsConfig,
) {
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
                            data: calculateSMA(candles, periods.sma),
                        },
                    ];
                case 'ema':
                    return [
                        {
                            id: 'ema',
                            pane: 'main',
                            color: ind.color,
                            data: calculateEMA(candles, periods.ema),
                        },
                    ];
                case 'rsi':
                    return [
                        {
                            id: 'rsi',
                            pane: 'separate',
                            color: ind.color,
                            data: calculateRSI(candles, periods.rsi),
                        },
                    ];
                case 'bollinger': {
                    const bands = calculateBollingerBands(
                        candles,
                        periods.bollingerPeriod,
                        periods.bollingerStdDev,
                    );
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
                            data: calculateMACD(
                                candles,
                                periods.macdFast,
                                periods.macdSlow,
                                periods.macdSignal,
                            ),
                        },
                    ];
                default: {
                    const _exhaustive: never = ind.id;
                    return _exhaustive;
                }
            }
        });
    }, [candles, activeIndicators, periods]);

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
